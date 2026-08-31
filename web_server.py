"""
Embedded web server for serving Telegram Mini App and REST API.
"""
import os
import logging
from aiohttp import web
from typing import Dict, Any

from config import settings
from parser import VolzhskyFuelParser

logger = logging.getLogger(__name__)

parser = VolzhskyFuelParser()
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))


async def handle_index(request: web.Request) -> web.Response:
    """Serves the main index.html for Telegram Mini App."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if not os.path.exists(index_path):
        return web.Response(text="<h1>Mini App HTML not found</h1>", content_type="text/html", status=404)
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()
    return web.Response(text=html, content_type="text/html", charset="utf-8")


async def handle_api_stations(request: web.Request) -> web.Response:
    """Returns the current list of gas stations and their live fuel availability."""
    try:
        # Extract optional coordinates from query string
        lat_str = request.rel_url.query.get('lat')
        lon_str = request.rel_url.query.get('lon')
        spn_str = request.rel_url.query.get('spn', '0.28')
        
        lat = float(lat_str) if lat_str else None
        lon = float(lon_str) if lon_str else None
        spn = float(spn_str)
        
        stations = await parser.fetch_gas_stations(lat=lat, lon=lon, spn_lon=spn, spn_lat=spn)
        stations_data = [st.to_dict() for st in stations]
        
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
        
        return web.json_response({
            "status": "ok",
            "count": len(stations_data),
            "stations": stations_data
        }, headers=headers)
    except Exception as e:
        logger.error(f"Error handling /api/stations: {e}", exc_info=True)
        return web.json_response({"status": "error", "message": str(e)}, status=500, headers={"Access-Control-Allow-Origin": "*"})


async def handle_api_summary(request: web.Request) -> web.Response:
    """Returns quick count summary by fuel types."""
    try:
        stations = await parser.fetch_gas_stations()
        summary: Dict[str, int] = {}
        for st in stations:
            for ftype, item in st.fuels.items():
                if item.status == "IN_STOCK":
                    summary[ftype] = summary.get(ftype, 0) + 1

        headers = {"Access-Control-Allow-Origin": "*"}
        return web.json_response({
            "status": "ok",
            "total_stations": len(stations),
            "available_by_fuel": summary
        }, headers=headers)
    except Exception as e:
        logger.error(f"Error handling /api/summary: {e}", exc_info=True)
        return web.json_response({"status": "error", "message": str(e)}, status=500, headers={"Access-Control-Allow-Origin": "*"})

async def handle_cors_options(request: web.Request) -> web.Response:
    return web.Response(headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    })


def create_web_app() -> web.Application:
    """Creates and configures the aiohttp web application."""
    app = web.Application()
    app.router.add_get("/", handle_index)
    app.router.add_options("/api/stations", handle_cors_options)
    app.router.add_get("/api/stations", handle_api_stations)
    app.router.add_options("/api/summary", handle_cors_options)
    app.router.add_get("/api/summary", handle_api_summary)
    app.router.add_static("/static/", path=STATIC_DIR, name="static")
    return app


async def start_web_server(host: str = None, port: int = None) -> web.AppRunner:
    """Starts the web server in background runner mode."""
    host = host or settings.WEB_HOST
    port = port or settings.WEB_PORT

    app = create_web_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host, port, reuse_address=True)
    await site.start()
    logger.info(f"Telegram Mini App Web Server running on http://{host}:{port}")
    return runner
