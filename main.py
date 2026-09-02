"""
Main entry point for Volzhsky Fuel Monitor.
Runs the Telegram Bot and background monitoring worker with real-time 3-minute auto-sync.
"""
import sys
import time
import json
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from config import settings
from database import db
from parser import VolzhskyFuelParser
from notifier import broadcast_event
from bot import router
from web_server import start_web_server

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("VolzhskyFuelMonitor")


async def sync_stations_json(stations):
    """Saves stations.json locally and syncs to GitHub repository."""
    try:
        data_dict = {
            "status": "ok",
            "count": len(stations),
            "updated_at": int(time.time()),
            "stations": [s.to_dict() for s in stations]
        }
        with open("stations.json", "w", encoding="utf-8") as f:
            json.dump(data_dict, f, ensure_ascii=False, indent=2)
        
        # Async git push
        proc = await asyncio.create_subprocess_shell(
            "git add stations.json && git diff --staged --quiet || (git commit -m 'Auto-sync live fuel [3m]' && git push origin main)",
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL
        )
        await asyncio.wait_for(proc.communicate(), timeout=20.0)
    except Exception as e:
        logger.debug(f"Sync stations info: {e}")


async def check_city(bot: Bot, parser, city_id: str, get_city_by_id_fn):
    """Checks one city for fuel changes and broadcasts events."""
    try:
        city = get_city_by_id_fn(city_id)
        if city:
            stations = await parser.fetch_gas_stations(
                lat=city["lat"], lon=city["lon"],
                spn_lon=0.15, spn_lat=0.15
            )
            city_name = city["name"]
        else:
            stations = await parser.fetch_gas_stations()
            city_name = "Волжский"

        if not stations:
            logger.warning(f"No stations for {city_name}, skipping.")
            return

        # For Volzhsky — also sync stations.json (used by web)
        if city_id == "volzhsky":
            await sync_stations_json(stations)

        # Detect changes
        events = await db.process_stations_snapshot(stations)

        if events:
            logger.info(f"[{city_name}] {len(events)} fuel changes detected!")
            for ev in events:
                logger.info(f"  {ev['event_type']}: {ev['fuel_type']} @ {ev['station'].name}")
                await broadcast_event(bot, ev, city_id=city_id, city_name=city_name)
        else:
            logger.debug(f"[{city_name}] No changes.")

    except Exception as e:
        logger.error(f"Error monitoring city {city_id}: {e}")


async def fuel_monitor_loop(bot: Bot):
    """
    Background worker — checks all user-selected cities in PARALLEL every 30 seconds.
    Fast notifications: fuel change detected within ~35 seconds of it appearing.
    """
    parser = VolzhskyFuelParser()
    logger.info(f"Starting fuel monitor loop. Check interval: {settings.CHECK_INTERVAL_SECONDS}s")

    from keyboards import get_city_by_id

    # Initial run for Volzhsky to populate database (no alerts)
    try:
        initial_stations = await parser.fetch_gas_stations()
        if initial_stations:
            logger.info(f"Initial scan: {len(initial_stations)} stations in Volzhsky.")
            await db.process_stations_snapshot(initial_stations)
            await sync_stations_json(initial_stations)
    except Exception as e:
        logger.error(f"Error during initial fuel scan: {e}")

    while True:
        try:
            await asyncio.sleep(settings.CHECK_INTERVAL_SECONDS)

            # Get all unique cities users are watching
            cities = await db.get_unique_cities()
            if not cities:
                cities = ["volzhsky"]

            logger.info(f"[MONITOR] Checking {len(cities)} cities in parallel: {', '.join(cities)}")

            # Run ALL cities simultaneously — no 5s delay between them
            await asyncio.gather(
                *[check_city(bot, parser, city_id, get_city_by_id) for city_id in cities],
                return_exceptions=True
            )

        except asyncio.CancelledError:
            logger.info("Fuel monitor loop cancelled.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in fuel monitor loop: {e}", exc_info=True)


async def main():
    if not settings.BOT_TOKEN or settings.BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        logger.error("BOT_TOKEN is not configured! Please provide your bot token in .env file.")
        return

    # Initialize SQLite database
    await db.init_db()

    # Start Telegram Mini App Web Server
    web_runner = await start_web_server()

    # Initialize Bot & Dispatcher
    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    dp = Dispatcher()
    dp.include_router(router)

    # Set Telegram Menu Button to open Mini App directly
    if settings.WEBAPP_URL.startswith("https://"):
        try:
            from aiogram.types import MenuButtonWebApp, WebAppInfo
            await bot.set_chat_menu_button(
                menu_button=MenuButtonWebApp(
                    text="Карта АЗС 🗺",
                    web_app=WebAppInfo(url=settings.WEBAPP_URL)
                )
            )
            logger.info("Configured Telegram MenuButtonWebApp successfully.")
        except Exception as e:
            logger.warning(f"Failed to set menu button: {e}")

    # Launch background monitor task
    monitor_task = asyncio.create_task(fuel_monitor_loop(bot))

    try:
        logger.info("Starting Telegram Bot polling...")
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        logger.info("Shutting down...")
        monitor_task.cancel()
        await asyncio.gather(monitor_task, return_exceptions=True)
        await web_runner.cleanup()
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Process terminated.")
