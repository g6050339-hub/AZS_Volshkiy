"""
Database management for users, subscriptions, and station snapshots.
"""
import json
import logging
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
import aiosqlite

from config import settings, FuelType
from parser import GasStation

logger = logging.getLogger(__name__)

DEFAULT_FUELS = [FuelType.AI92, FuelType.AI95, FuelType.AI100, FuelType.DIESEL]


class Database:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.DB_PATH

    async def init_db(self):
        """Creates tables if they do not exist."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY,
                    chat_id INTEGER NOT NULL,
                    username TEXT,
                    first_name TEXT,
                    subscribed_fuels TEXT NOT NULL,
                    notifications_enabled INTEGER NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            await db.execute("""
                CREATE TABLE IF NOT EXISTS station_snapshots (
                    station_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    address TEXT,
                    lat REAL,
                    lon REAL,
                    fuels_json TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            await db.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_id TEXT NOT NULL,
                    station_name TEXT NOT NULL,
                    address TEXT,
                    fuel_type TEXT NOT NULL,
                    old_status TEXT NOT NULL,
                    new_status TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            await db.commit()
            logger.info("Database initialized successfully.")

    async def get_or_create_user(self, user_id: int, chat_id: int, username: Optional[str], first_name: Optional[str]) -> Dict[str, Any]:
        """Gets user profile or creates a new one with default subscriptions."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
            user = await cursor.fetchone()

            if user:
                return {
                    "user_id": user["user_id"],
                    "chat_id": user["chat_id"],
                    "username": user["username"],
                    "first_name": user["first_name"],
                    "subscribed_fuels": user["subscribed_fuels"].split(",") if user["subscribed_fuels"] else [],
                    "notifications_enabled": bool(user["notifications_enabled"]),
                }

            # Create new user
            default_sub = ",".join(DEFAULT_FUELS)
            await db.execute(
                """
                INSERT INTO users (user_id, chat_id, username, first_name, subscribed_fuels, notifications_enabled)
                VALUES (?, ?, ?, ?, ?, 1)
                """,
                (user_id, chat_id, username, first_name, default_sub)
            )
            await db.commit()

            return {
                "user_id": user_id,
                "chat_id": chat_id,
                "username": username,
                "first_name": first_name,
                "subscribed_fuels": DEFAULT_FUELS.copy(),
                "notifications_enabled": True,
            }

    async def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
            user = await cursor.fetchone()
            if not user:
                return None
            return {
                "user_id": user["user_id"],
                "chat_id": user["chat_id"],
                "username": user["username"],
                "first_name": user["first_name"],
                "subscribed_fuels": user["subscribed_fuels"].split(",") if user["subscribed_fuels"] else [],
                "notifications_enabled": bool(user["notifications_enabled"]),
            }

    async def toggle_fuel_subscription(self, user_id: int, fuel_type: str) -> List[str]:
        """Toggles subscription for a specific fuel type."""
        user = await self.get_user(user_id)
        if not user:
            return []

        fuels = user["subscribed_fuels"]
        if fuel_type in fuels:
            fuels.remove(fuel_type)
        else:
            fuels.append(fuel_type)

        fuels_str = ",".join(fuels)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE users SET subscribed_fuels = ? WHERE user_id = ?",
                (fuels_str, user_id)
            )
            await db.commit()

        return fuels

    async def set_user_notifications(self, user_id: int, enabled: bool) -> bool:
        """Enables or disables notifications for a user."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE users SET notifications_enabled = ? WHERE user_id = ?",
                (1 if enabled else 0, user_id)
            )
            await db.commit()
        return enabled

    async def get_subscribed_users(self, fuel_type: str) -> List[Dict[str, Any]]:
        """Returns all users who have enabled notifications, subscribed to this fuel type, and are authorized."""
        allowed = settings.allowed_users
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM users WHERE notifications_enabled = 1")
            rows = await cursor.fetchall()
            
            results = []
            for row in rows:
                uid = row["user_id"]
                if allowed and uid not in allowed:
                    continue
                subscribed = row["subscribed_fuels"].split(",") if row["subscribed_fuels"] else []
                if fuel_type in subscribed:
                    results.append({
                        "user_id": uid,
                        "chat_id": row["chat_id"],
                        "username": row["username"],
                        "first_name": row["first_name"]
                    })
            return results

    async def get_all_active_users(self) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM users")
            rows = await cursor.fetchall()
            return [{
                "user_id": r["user_id"],
                "chat_id": r["chat_id"],
                "username": r["username"],
                "first_name": r["first_name"],
                "subscribed_fuels": r["subscribed_fuels"].split(",") if r["subscribed_fuels"] else [],
                "notifications_enabled": bool(r["notifications_enabled"])
            } for r in rows]

    async def process_stations_snapshot(self, stations: List[GasStation]) -> List[Dict[str, Any]]:
        """
        Compares new station states with the previous snapshot in SQLite.
        Returns a list of detected events:
        - "APPEARED" (OUT_OF_STOCK -> IN_STOCK)
        - "DEPLETED" (IN_STOCK -> OUT_OF_STOCK)
        """
        events: List[Dict[str, Any]] = []

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row

            for station in stations:
                cursor = await db.execute(
                    "SELECT fuels_json FROM station_snapshots WHERE station_id = ?",
                    (station.id,)
                )
                prev_row = await cursor.fetchone()

                current_fuels_dict = {
                    k: {
                        "name": v.name,
                        "status": v.status,
                        "price_text": v.price_text
                    }
                    for k, v in station.fuels.items()
                }
                current_fuels_json = json.dumps(current_fuels_dict, ensure_ascii=False)

                if prev_row:
                    try:
                        prev_fuels_dict = json.loads(prev_row["fuels_json"])
                    except Exception:
                        prev_fuels_dict = {}

                    # Check for status changes
                    for fuel_type, curr_item in current_fuels_dict.items():
                        curr_status = curr_item["status"]
                        prev_item = prev_fuels_dict.get(fuel_type, {})
                        prev_status = prev_item.get("status", "UNKNOWN")

                        if (prev_status == "OUT_OF_STOCK" and curr_status == "IN_STOCK"):
                            event_type = "APPEARED"
                        elif (prev_status == "IN_STOCK" and curr_status == "OUT_OF_STOCK"):
                            event_type = "DEPLETED"
                        else:
                            event_type = None

                        if event_type:
                            event_data = {
                                "event_type": event_type,
                                "station": station,
                                "fuel_type": fuel_type,
                                "fuel_name": curr_item["name"],
                                "price_text": curr_item.get("price_text"),
                                "old_status": prev_status,
                                "new_status": curr_status
                            }
                            events.append(event_data)
                            await db.execute(
                                """
                                INSERT INTO events (station_id, station_name, address, fuel_type, old_status, new_status)
                                VALUES (?, ?, ?, ?, ?, ?)
                                """,
                                (station.id, station.name, station.address, fuel_type, prev_status, curr_status)
                            )

                    # Update snapshot
                    await db.execute(
                        """
                        UPDATE station_snapshots
                        SET name = ?, address = ?, lat = ?, lon = ?, fuels_json = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE station_id = ?
                        """,
                        (station.name, station.address, station.lat, station.lon, current_fuels_json, station.id)
                    )
                else:
                    # First time seeing this station, just save initial snapshot
                    await db.execute(
                        """
                        INSERT INTO station_snapshots (station_id, name, address, lat, lon, fuels_json)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (station.id, station.name, station.address, station.lat, station.lon, current_fuels_json)
                    )

            await db.commit()

        return events


db = Database()
