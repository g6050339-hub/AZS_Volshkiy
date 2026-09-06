"""
Embedded web server for serving Telegram Mini App and REST API.
"""
import os
import logging
from aiohttp import web
from typing import Dict, Any

from config import settings
from parser import VolzhskyFuelParser
from database import db

logger = logging.getLogger(__name__)

parser = VolzhskyFuelParser()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def _serve_file(filename: str, content_type: str) -> web.Response:
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        return web.Response(text="Not Found", status=404, headers=CORS_HEADERS)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    return web.Response(text=content, content_type=content_type, charset="utf-8", headers=CORS_HEADERS)


async def handle_index(request: web.Request) -> web.Response:
    """Serves the main index.html for Telegram Mini App."""
    return _serve_file("index.html", "text/html")


async def handle_style(request: web.Request) -> web.Response:
    """Serves style.css."""
    return _serve_file("style.css", "text/css")


async def handle_app_js(request: web.Request) -> web.Response:
    """Serves app.js."""
    return _serve_file("app.js", "application/javascript")


async def handle_stations_json(request: web.Request) -> web.Response:
    """Serves stations.json snapshot."""
    return _serve_file("stations.json", "application/json")


async def handle_tunnel_url_json(request: web.Request) -> web.Response:
    """Serves tunnel_url.json."""
    return _serve_file("tunnel_url.json", "application/json")


async def handle_cors_options(request: web.Request) -> web.Response:
    return web.Response(headers=CORS_HEADERS)


async def handle_api_stations(request: web.Request) -> web.Response:
    """Returns the current list of gas stations and their live fuel availability."""
    try:
        # Extract optional coordinates from query string
        lat_str = request.rel_url.query.get('lat')
        lon_str = request.rel_url.query.get('lon')
        spn_str = request.rel_url.query.get('spn', '0.28')

        lat = None
        lon = None
        spn = 0.28

        if lat_str or lon_str:
            if not (lat_str and lon_str):
                return web.json_response(
                    {"status": "error", "code": "INVALID_QUERY", "message": "Both lat and lon must be provided"},
                    status=400,
                    headers=CORS_HEADERS
                )
            try:
                lat = float(lat_str)
                lon = float(lon_str)
                if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                    return web.json_response(
                        {"status": "error", "code": "INVALID_QUERY", "message": "Coordinates out of bounds"},
                        status=400,
                        headers=CORS_HEADERS
                    )
            except ValueError:
                return web.json_response(
                    {"status": "error", "code": "INVALID_QUERY", "message": "lat and lon must be numbers"},
                    status=400,
                    headers=CORS_HEADERS
                )

        if spn_str:
            try:
                spn = float(spn_str)
                if not (0.01 <= spn <= 1.0):
                    spn = 0.28
            except ValueError:
                spn = 0.28

        stations = await parser.fetch_gas_stations(lat=lat, lon=lon, spn_lon=spn, spn_lat=spn)
        user_queues = await db.get_active_queue_summaries(window_seconds=3600)
        stations_data = []
        for st in stations:
            d = st.to_dict()
            d["user_queue"] = user_queues.get(st.id)
            stations_data.append(d)

        return web.json_response({
            "status": "ok",
            "count": len(stations_data),
            "stations": stations_data
        }, headers=CORS_HEADERS)
    except Exception as e:
        logger.error(f"Error handling /api/stations: {e}", exc_info=True)
        return web.json_response(
            {"status": "error", "code": "UPSTREAM_UNAVAILABLE", "message": "Fuel data temporarily unavailable"},
            status=503,
            headers=CORS_HEADERS
        )


async def handle_api_summary(request: web.Request) -> web.Response:
    """Returns quick count summary by fuel types."""
    try:
        stations = await parser.fetch_gas_stations()
        summary: Dict[str, int] = {}
        for st in stations:
            for ftype, item in st.fuels.items():
                if item.status == "IN_STOCK":
                    summary[ftype] = summary.get(ftype, 0) + 1

        return web.json_response({
            "status": "ok",
            "total_stations": len(stations),
            "available_by_fuel": summary
        }, headers=CORS_HEADERS)
    except Exception as e:
        logger.error(f"Error handling /api/summary: {e}", exc_info=True)
        return web.json_response(
            {"status": "error", "code": "UPSTREAM_UNAVAILABLE", "message": "Fuel summary temporarily unavailable"},
            status=503,
            headers=CORS_HEADERS
        )


async def handle_api_queue_report(request: web.Request) -> web.Response:
    """Accepts crowd-sourced queue reports from Mini App users."""
    try:
        data = await request.json()
        station_id = data.get("station_id")
        queue_status = data.get("queue_status")

        user_id = data.get("user_id")

        if not station_id or queue_status not in ("LOW", "MEDIUM", "HIGH"):
            return web.json_response(
                {"status": "error", "code": "INVALID_REPORT", "message": "Invalid station_id or queue_status"},
                status=400,
                headers=CORS_HEADERS
            )

        saved = await db.add_queue_report(station_id, queue_status, user_id=user_id)
        logger.info(f"[QUEUE REPORT] Station {station_id}: status {queue_status} (saved={saved})")
        return web.json_response({"status": "ok", "message": "Report received", "saved": saved}, headers=CORS_HEADERS)
    except Exception as e:
        logger.error(f"Error handling /api/queue-reports: {e}", exc_info=True)
        return web.json_response(
            {"status": "error", "code": "BAD_REQUEST", "message": str(e)},
            status=400,
            headers=CORS_HEADERS
        )


def create_web_app() -> web.Application:
    """Creates and configures the aiohttp web application with safe allowlist routes."""
    app = web.Application()

    # Mini App frontend routes (safe allowlist only)
    app.router.add_get("/", handle_index)
    app.router.add_get("/index.html", handle_index)
    app.router.add_get("/style.css", handle_style)
    app.router.add_get("/app.js", handle_app_js)
    app.router.add_get("/stations.json", handle_stations_json)
    app.router.add_get("/tunnel_url.json", handle_tunnel_url_json)

    # API routes
    app.router.add_options("/api/stations", handle_cors_options)
    app.router.add_get("/api/stations", handle_api_stations)

    app.router.add_options("/api/summary", handle_cors_options)
    app.router.add_get("/api/summary", handle_api_summary)

    app.router.add_options("/api/queue-reports", handle_cors_options)
    app.router.add_post("/api/queue-reports", handle_api_queue_report)

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
