"""
Keyboards and UI elements for Telegram Bot.
"""
from typing import List
from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo
)
from config import FUEL_LABELS, FUEL_EMOJIS, FuelType, settings


def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Main persistent keyboard with WebApp button."""
    buttons = []
    if settings.WEBAPP_URL.startswith("https://"):
        buttons.append([
            KeyboardButton(
                text="📱 Открыть карту (Mini App)",
                web_app=WebAppInfo(url=settings.WEBAPP_URL + "?v=8.0")
            )
        ])

    buttons.extend([
        [
            KeyboardButton(text="🔍 Наличие сейчас"),
            KeyboardButton(text="🔔 Настройки подписок")
        ],
        [
            KeyboardButton(text="🏙 Заправки по городам"),
            KeyboardButton(text="🗺 Все АЗС Волжского")
        ],
        [
            KeyboardButton(text="ℹ️ О боте")
        ]
    ])
    return ReplyKeyboardMarkup(
        keyboard=buttons,
        resize_keyboard=True,
        persistent=True
    )


def get_webapp_inline_keyboard() -> InlineKeyboardMarkup:
    """Inline button to launch the WebApp."""
    if settings.WEBAPP_URL.startswith("https://"):
        btn = InlineKeyboardButton(
            text="🗺 Открыть интерактивную карту",
            web_app=WebAppInfo(url=settings.WEBAPP_URL + "?v=8.0")
        )
        return InlineKeyboardMarkup(inline_keyboard=[[btn]])
    else:
        # Fallback to Yandex Maps search link for Volzhsky gas stations
        yandex_map_url = f"https://yandex.ru/maps/?ll={settings.VOLZHSKY_LON}%2C{settings.VOLZHSKY_LAT}&z=13&text=%D0%90%D0%97%D0%A1"
        btn = InlineKeyboardButton(
            text="🗺 Открыть карту в Яндекс.Картах",
            url=yandex_map_url
        )
        return InlineKeyboardMarkup(inline_keyboard=[[btn]])


def get_subscriptions_keyboard(subscribed_fuels: List[str], notifications_enabled: bool) -> InlineKeyboardMarkup:
    """Inline keyboard for managing fuel subscriptions and notifications."""
    buttons = []
    
    # Fuels toggle rows
    all_fuels = [
        FuelType.AI92,
        FuelType.AI95,
        FuelType.AI95_PREMIUM,
        FuelType.AI98,
        FuelType.AI100,
        FuelType.DIESEL,
        FuelType.LPG,
        FuelType.METHANE,
    ]
    
    # 2 fuels per row
    row = []
    for ftype in all_fuels:
        label = FUEL_LABELS.get(ftype, ftype)
        emoji = FUEL_EMOJIS.get(ftype, "⛽")
        is_active = ftype in subscribed_fuels
        status_icon = "✅" if is_active else "❌"
        
        btn_text = f"{status_icon} {emoji} {label}"
        callback_data = f"sub_toggle:{ftype}"
        row.append(InlineKeyboardButton(text=btn_text, callback_data=callback_data))
        
        if len(row) == 2:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)

    # Notifications toggle button
    notif_text = "🔔 Уведомления: ВКЛЮЧЕНЫ" if notifications_enabled else "🔕 Уведомления: ВЫКЛЮЧЕНЫ"
    notif_cb = "notif_toggle:off" if notifications_enabled else "notif_toggle:on"
    buttons.append([InlineKeyboardButton(text=notif_text, callback_data=notif_cb)])

    # Refresh button
    buttons.append([InlineKeyboardButton(text="🔄 Обновить меню", callback_data="sub_refresh")])

    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_station_link_keyboard(navigator_url: str, yandex_url: str = None) -> InlineKeyboardMarkup:
    """Buttons attached to station notification."""
    row = [InlineKeyboardButton(text="🗺 Поехать (Навигатор)", url=navigator_url)]
    if yandex_url:
        row.append(InlineKeyboardButton(text="ℹ️ Карточка АЗС", url=yandex_url))
    return InlineKeyboardMarkup(inline_keyboard=[row])


# ============================================================
# CITY SELECTION FOR BOT
# ============================================================
CITIES_BOT = [
    {"id": "volzhsky", "name": "Волжский", "lat": 48.7858, "lon": 44.7797, "emoji": "🏠"},
    {"id": "volgograd", "name": "Волгоград", "lat": 48.7080, "lon": 44.5133, "emoji": "🌉"},
    {"id": "moscow", "name": "Москва", "lat": 55.7558, "lon": 37.6173, "emoji": "🏙"},
    {"id": "spb", "name": "С.-Петербург", "lat": 59.9343, "lon": 30.3351, "emoji": "⚓"},
    {"id": "krasnodar", "name": "Краснодар", "lat": 45.0355, "lon": 38.9753, "emoji": "🌻"},
    {"id": "rostov", "name": "Ростов-на-Дону", "lat": 47.2357, "lon": 39.7015, "emoji": "🏛"},
    {"id": "saratov", "name": "Саратов", "lat": 51.5406, "lon": 46.0086, "emoji": "🌾"},
    {"id": "samara", "name": "Самара", "lat": 53.2415, "lon": 50.2212, "emoji": "🚀"},
    {"id": "kazan", "name": "Казань", "lat": 55.8304, "lon": 49.0661, "emoji": "🕌"},
    {"id": "voronezh", "name": "Воронеж", "lat": 51.6755, "lon": 39.2089, "emoji": "🛡"},
    {"id": "astrakhan", "name": "Астрахань", "lat": 46.3497, "lon": 48.0408, "emoji": "🐟"},
    {"id": "ekaterinburg", "name": "Екатеринбург", "lat": 56.8389, "lon": 60.6057, "emoji": "⛏"},
    {"id": "nizhny", "name": "Н. Новгород", "lat": 56.2965, "lon": 43.9361, "emoji": "🏰"},
    {"id": "ufa", "name": "Уфа", "lat": 54.7388, "lon": 55.9721, "emoji": "🐝"},
    {"id": "chelyabinsk", "name": "Челябинск", "lat": 55.1644, "lon": 61.4368, "emoji": "☄"},
    {"id": "novosibirsk", "name": "Новосибирск", "lat": 55.0084, "lon": 82.9357, "emoji": "🌲"},
    {"id": "perm", "name": "Пермь", "lat": 58.0105, "lon": 56.2502, "emoji": "🐻"},
    {"id": "sochi", "name": "Сочи", "lat": 43.6028, "lon": 39.7342, "emoji": "🏖"},
    {"id": "kamyshin", "name": "Камышин", "lat": 50.0983, "lon": 45.3994, "emoji": "🏭"},
    {"id": "stavropol", "name": "Ставрополь", "lat": 45.0428, "lon": 41.9734, "emoji": "⛰"},
]


def get_cities_keyboard(page: int = 0) -> InlineKeyboardMarkup:
    """Inline keyboard with city buttons for fuel lookup."""
    per_page = 12
    start = page * per_page
    end = start + per_page
    cities_page = CITIES_BOT[start:end]

    buttons = []
    row = []
    for city in cities_page:
        row.append(InlineKeyboardButton(
            text=f"{city['emoji']} {city['name']}",
            callback_data=f"city:{city['id']}"
        ))
        if len(row) == 2:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)

    # Pagination
    nav_row = []
    if page > 0:
        nav_row.append(InlineKeyboardButton(text="◀️ Назад", callback_data=f"city_page:{page-1}"))
    if end < len(CITIES_BOT):
        nav_row.append(InlineKeyboardButton(text="Ещё ▶️", callback_data=f"city_page:{page+1}"))
    if nav_row:
        buttons.append(nav_row)

    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_city_by_id(city_id: str) -> dict | None:
    """Find city dict by its id."""
    return next((c for c in CITIES_BOT if c["id"] == city_id), None)
