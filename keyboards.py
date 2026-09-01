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
                web_app=WebAppInfo(url=settings.WEBAPP_URL + "?v=7.1")
            )
        ])

    buttons.extend([
        [
            KeyboardButton(text="🔍 Наличие сейчас"),
            KeyboardButton(text="🔔 Настройки подписок")
        ],
        [
            KeyboardButton(text="🗺 Все АЗС Волжского"),
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
            web_app=WebAppInfo(url=settings.WEBAPP_URL + "?v=7.1")
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
