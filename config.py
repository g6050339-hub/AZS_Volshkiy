"""
Configuration settings for Volzhsky Fuel Monitor.
"""
from typing import List, Dict
from pydantic_settings import BaseSettings
from pydantic import Field


class FuelType:
    AI92 = "AI92"
    AI95 = "AI95"
    AI95_PREMIUM = "AI95_PREMIUM"
    AI98 = "AI98"
    AI100 = "AI100"
    DIESEL = "DIESEL"
    LPG = "LPG"         # Пропан-бутан
    METHANE = "METHANE" # Метан


FUEL_LABELS: Dict[str, str] = {
    FuelType.AI92: "АИ-92",
    FuelType.AI95: "АИ-95",
    FuelType.AI95_PREMIUM: "АИ-95+ (Экто/Пульсар)",
    FuelType.AI98: "АИ-98",
    FuelType.AI100: "АИ-100",
    FuelType.DIESEL: "Дизель (ДТ)",
    FuelType.LPG: "Газ (Пропан)",
    FuelType.METHANE: "Газ (Метан)",
}

FUEL_EMOJIS: Dict[str, str] = {
    FuelType.AI92: "🟢",
    FuelType.AI95: "🔵",
    FuelType.AI95_PREMIUM: "🔷",
    FuelType.AI98: "🟣",
    FuelType.AI100: "🔴",
    FuelType.DIESEL: "⚫",
    FuelType.LPG: "🟡",
    FuelType.METHANE: "⚪",
}


class Settings(BaseSettings):
    # Telegram Bot Token (получить у @BotFather)
    BOT_TOKEN: str = Field(default="", env="BOT_TOKEN")
    
    # Администратор бота (ID в Telegram)
    ADMIN_ID: int = Field(default=705941333, env="ADMIN_ID")

    # Список разрешенных пользователей (через запятую, например: "705941333")
    ALLOWED_USER_IDS: str = Field(default="705941333", env="ALLOWED_USER_IDS")
    
    # Интервал проверки данных в секундах (по умолчанию 3 минуты = 180 сек)
    CHECK_INTERVAL_SECONDS: int = Field(default=180, env="CHECK_INTERVAL_SECONDS")
    
    # Геолокация Волжского (долгота, широта и охват)
    VOLZHSKY_LON: float = 44.7797
    VOLZHSKY_LAT: float = 48.7858
    VOLZHSKY_SPN_LON: float = 0.28
    VOLZHSKY_SPN_LAT: float = 0.22
    
    # Веб-сервер для Telegram Mini App
    WEB_HOST: str = Field(default="0.0.0.0", env="WEB_HOST")
    WEB_PORT: int = Field(default=8080, env="WEB_PORT")
    WEBAPP_URL: str = Field(default="http://localhost:8080", env="WEBAPP_URL")

    # Путь к базе данных SQLite
    DB_PATH: str = Field(default="fuel_monitor.db", env="DB_PATH")
    
    # Уведомлять ли когда топливо закончилось
    NOTIFY_ON_DEPLETED: bool = Field(default=True, env="NOTIFY_ON_DEPLETED")

    @property
    def allowed_users(self) -> List[int]:
        if not self.ALLOWED_USER_IDS:
            return [self.ADMIN_ID] if self.ADMIN_ID else []
        try:
            return [int(uid.strip()) for uid in self.ALLOWED_USER_IDS.split(",") if uid.strip()]
        except Exception:
            return [self.ADMIN_ID] if self.ADMIN_ID else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
