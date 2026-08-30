"""
Notifier module for creating alerts and broadcasting messages to Telegram users.
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from aiogram import Bot
from aiogram.enums import ParseMode

from config import FUEL_LABELS, FUEL_EMOJIS, settings
from database import db
from parser import GasStation
from keyboards import get_station_link_keyboard

logger = logging.getLogger(__name__)


def format_appeared_alert(event: Dict[str, Any]) -> str:
    """Formats alert when fuel becomes IN_STOCK with queue information."""
    station: GasStation = event["station"]
    fuel_type = event["fuel_type"]
    fuel_label = FUEL_LABELS.get(fuel_type, event.get("fuel_name", fuel_type))
    emoji = FUEL_EMOJIS.get(fuel_type, "⛽")
    price_text = event.get("price_text")
    price_info = f" ({price_text})" if price_text else ""

    now_str = datetime.now().strftime("%H:%M")
    queue_str = f"\n🚗 <b>Очередь:</b> {station.queue_label}"
    limit_str = f"\n⛔ <b>Лимит на руки:</b> {station.fuel_limit}" if station.fuel_limit else ""
    cash_str = "\n⚠️ <b>Оплата:</b> Только наличные!" if station.cash_only else ""

    text = (
        f"⚡ <b>ТОПЛИВО ПОЯВИЛОСЬ НА АЗС!</b>\n\n"
        f"⛽ <b>{station.name}</b>\n"
        f"📍 <b>Адрес:</b> {station.address}\n"
        f"{emoji} <b>В наличии:</b> {fuel_label}{price_info}"
        f"{queue_str}"
        f"{limit_str}"
        f"{cash_str}\n\n"
        f"🕒 <i>Время: {now_str}</i>"
    )
    return text


def format_depleted_alert(event: Dict[str, Any]) -> str:
    """Formats alert when fuel becomes OUT_OF_STOCK."""
    station: GasStation = event["station"]
    fuel_type = event["fuel_type"]
    fuel_label = FUEL_LABELS.get(fuel_type, event.get("fuel_name", fuel_type))
    emoji = FUEL_EMOJIS.get(fuel_type, "⛽")

    now_str = datetime.now().strftime("%H:%M")

    text = (
        f"⚠️ <b>ТОПЛИВО ЗАКОНЧИЛОСЬ</b>\n\n"
        f"⛽ <b>{station.name}</b>\n"
        f"📍 <b>Адрес:</b> {station.address}\n"
        f"❌ <b>Закончилось:</b> {emoji} {fuel_label}\n\n"
        f"🕒 <i>Время: {now_str}</i>"
    )
    return text


def format_current_availability(stations: List[GasStation], user_fuels: Optional[List[str]] = None) -> str:
    """Formats current summary of all available fuels in Volzhsky with queue badges."""
    now_str = datetime.now().strftime("%d.%m.%Y %H:%M")
    
    # Group available stations by fuel type
    by_fuel: Dict[str, List[GasStation]] = {}
    
    for st in stations:
        for ftype, fitem in st.fuels.items():
            if fitem.status == "IN_STOCK":
                if user_fuels and ftype not in user_fuels:
                    continue
                if ftype not in by_fuel:
                    by_fuel[ftype] = []
                by_fuel[ftype].append(st)

    if not by_fuel:
        return (
            f"📊 <b>Сводка по наличию топлива в Волжском</b>\n"
            f"<i>По состоянию на: {now_str}</i>\n\n"
            f"❌ К сожалению, по выбранным категориям активного топлива в наличии не найдено."
        )

    lines = [
        f"📊 <b>Наличие топлива в Волжском</b>",
        f"🕒 <i>Обновлено: {now_str}</i>\n"
    ]

    for ftype, st_list in sorted(by_fuel.items()):
        label = FUEL_LABELS.get(ftype, ftype)
        emoji = FUEL_EMOJIS.get(ftype, "⛽")
        lines.append(f"<b>{emoji} {label} ({len(st_list)} АЗС):</b>")
        
        for st in st_list:
            fitem = st.fuels.get(ftype)
            price = f" — <i>{fitem.price_text}</i>" if fitem and fitem.price_text else ""
            q_badge = f" | {st.queue_label}" if st.queue_status in ["LOW", "MEDIUM", "HIGH"] else ""
            lines.append(f"  • <b>{st.name}</b>, {st.address}{price}{q_badge}")
        lines.append("")

    lines.append("💡 <i>Нажмите «📱 Открыть карту», чтобы увидеть очереди и маршруты.</i>")
    return "\n".join(lines)


def format_all_stations_list(stations: List[GasStation]) -> str:
    """Formats a concise list of all tracked gas stations in Volzhsky."""
    lines = [
        f"🗺 <b>Список всех отслеживаемых АЗС г. Волжский ({len(stations)} шт.):</b>\n"
    ]
    for i, st in enumerate(stations, 1):
        in_stock = [f.name for f in st.in_stock_fuels]
        in_stock_str = f" [✅ {', '.join(in_stock)}]" if in_stock else " [❌ Нет в наличии]"
        q_str = f" | {st.queue_label}" if st.queue_status != "UNKNOWN" else ""
        lines.append(f"{i}. <b>{st.name}</b> — {st.address}{in_stock_str}{q_str}")
    
    return "\n".join(lines)


async def broadcast_event(bot: Bot, event: Dict[str, Any]):
    """Sends event notification to all relevant subscribers."""
    event_type = event["event_type"]
    fuel_type = event["fuel_type"]
    station: GasStation = event["station"]

    if event_type == "DEPLETED" and not settings.NOTIFY_ON_DEPLETED:
        return

    subscribers = await db.get_subscribed_users(fuel_type)
    if not subscribers:
        logger.info(f"No subscribers found for fuel {fuel_type}")
        return

    if event_type == "APPEARED":
        text = format_appeared_alert(event)
    else:
        text = format_depleted_alert(event)

    reply_markup = get_station_link_keyboard(station.navigator_url, station.yandex_url)

    sent_count = 0
    for sub in subscribers:
        chat_id = sub["chat_id"]
        try:
            await bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode=ParseMode.HTML,
                reply_markup=reply_markup,
                disable_web_page_preview=True
            )
            sent_count += 1
        except Exception as e:
            logger.error(f"Failed to send alert to user {chat_id}: {e}")

    logger.info(f"Broadcasted {event_type} for {fuel_type} on {station.name} to {sent_count} users.")
