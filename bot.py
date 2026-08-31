"""
Telegram bot handlers and routing.
"""
import logging
from aiogram import Router, F, BaseMiddleware
from aiogram.types import Message, CallbackQuery, TelegramObject
from aiogram.filters import CommandStart, Command
from aiogram.enums import ParseMode

from database import db
from parser import VolzhskyFuelParser
from keyboards import (
    get_main_keyboard,
    get_subscriptions_keyboard,
    get_webapp_inline_keyboard
)
from notifier import (
    format_current_availability,
    format_all_stations_list
)
from config import settings

logger = logging.getLogger(__name__)

router = Router()
fuel_parser = VolzhskyFuelParser()


class AccessControlMiddleware(BaseMiddleware):
    """Restricts bot usage exclusively to authorized user IDs."""
    async def __call__(self, handler, event: TelegramObject, data: dict):
        user = getattr(event, "from_user", None)
        if not user:
            return None

        allowed = settings.allowed_users
        if allowed and user.id not in allowed:
            logger.warning(f"Unauthorized access attempt from user_id={user.id} (@{user.username})")
            if isinstance(event, Message):
                await event.answer(
                    "⛔ <b>Доступ ограничен.</b>\nЭтот бот настроен в приватном режиме исключительно для своего владельца.",
                    parse_mode=ParseMode.HTML
                )
            elif isinstance(event, CallbackQuery):
                await event.answer("⛔ Доступ ограничен для вашего аккаунта.", show_alert=True)
            return None

        return await handler(event, data)


# Register access control for all messages and buttons
router.message.middleware(AccessControlMiddleware())
router.callback_query.middleware(AccessControlMiddleware())


@router.message(CommandStart())
async def cmd_start(message: Message):
    """Handles /start command."""
    user = message.from_user
    if not user:
        return

    profile = await db.get_or_create_user(
        user_id=user.id,
        chat_id=message.chat.id,
        username=user.username,
        first_name=user.first_name
    )

    welcome_text = (
        f"👋 <b>Привет, {user.first_name or 'водитель'}!</b>\n\n"
        f"⛽ Этот бот непрерывно отслеживает наличие бензина и дизеля на всех АЗС <b>г. Волжский</b> "
        f"(Лукойл, Татнефть, Газпром, Teboil, Роснефть и др.).\n\n"
        f"⚡ <b>Как это работает:</b>\n"
        f"• Бот проверяет остатки топлива каждые {settings.CHECK_INTERVAL_SECONDS // 60} мин.\n"
        f"• Как только нужный бензин появляется на АЗС — вы мгновенно получаете push-уведомление с адресом и ссылкой на навигатор.\n\n"
        f"👇 <b>Выберите действие в меню ниже:</b>"
    )

    await message.answer(
        text=welcome_text,
        parse_mode=ParseMode.HTML,
        reply_markup=get_main_keyboard()
    )


@router.message(F.text == "📱 Открыть карту (Mini App)")
@router.message(Command("map"))
async def handle_open_map(message: Message):
    """Sends interactive WebApp link / button."""
    
    text = (
        "🗺 <b>Интерактивная карта АЗС г. Волжский</b>\n\n"
        "• Метки всех заправок с цветовой индикацией\n"
        "• Быстрые фильтры по маркам (АИ-92, 95, 100, ДТ)\n"
        "• Карточки станций, остатки, цены и навигация\n\n"
        "Нажмите кнопку ниже, чтобы открыть карту:"
    )
    await message.answer(
        text=text,
        parse_mode=ParseMode.HTML,
        reply_markup=get_webapp_inline_keyboard()
    )


@router.message(F.text == "🔍 Наличие сейчас")
async def handle_check_now(message: Message):
    """Fetches and sends live fuel availability."""
    user = message.from_user
    if not user:
        return

    wait_msg = await message.answer("⏳ <i>Опрашиваю заправки Волжского в реальном времени...</i>", parse_mode=ParseMode.HTML)

    user_profile = await db.get_user(user.id)
    subscribed_fuels = user_profile.get("subscribed_fuels", []) if user_profile else None

    stations = await fuel_parser.fetch_gas_stations()
    if not stations:
        await wait_msg.edit_text("⚠️ <i>Не удалось получить данные с сервера. Попробуйте через минуту.</i>", parse_mode=ParseMode.HTML)
        return

    report = format_current_availability(stations, user_fuels=subscribed_fuels)
    await wait_msg.edit_text(report, parse_mode=ParseMode.HTML)


@router.message(F.text == "🔔 Настройки подписок")
async def handle_settings(message: Message):
    """Shows user subscription settings with inline toggles."""
    user = message.from_user
    if not user:
        return

    profile = await db.get_or_create_user(
        user_id=user.id,
        chat_id=message.chat.id,
        username=user.username,
        first_name=user.first_name
    )

    text = (
        "⚙️ <b>Настройки уведомлений и подписок</b>\n\n"
        "Нажимайте на кнопки, чтобы выбрать марки топлива, которые вам нужны.\n"
        "Когда на любой АЗС Волжского появится выбранное топливо, бот пришлет уведомление."
    )

    keyboard = get_subscriptions_keyboard(
        subscribed_fuels=profile["subscribed_fuels"],
        notifications_enabled=profile["notifications_enabled"]
    )

    await message.answer(text=text, parse_mode=ParseMode.HTML, reply_markup=keyboard)


@router.message(F.text == "🗺 Все АЗС Волжского")
async def handle_all_stations(message: Message):
    """Shows the full list of tracked gas stations."""
    wait_msg = await message.answer("⏳ <i>Загружаю список АЗС...</i>", parse_mode=ParseMode.HTML)
    stations = await fuel_parser.fetch_gas_stations()
    if not stations:
        await wait_msg.edit_text("⚠️ <i>Не удалось загрузить список АЗС.</i>", parse_mode=ParseMode.HTML)
        return

    text = format_all_stations_list(stations)
    await wait_msg.edit_text(text, parse_mode=ParseMode.HTML)


@router.message(F.text == "ℹ️ О боте")
@router.message(Command("help"))
async def handle_about(message: Message):
    """Shows help and about info."""
    about_text = (
        "ℹ️ <b>О сервисе мониторинга топлива в Волжском</b>\n\n"
        "📍 <b>Охват:</b> весь город Волжский, о. Зеленый, п. Металлург, Средняя Ахтуба, ГЭС.\n"
        "🔄 <b>Период опроса:</b> каждые 3 минуты.\n"
        "📊 <b>Источники:</b> гео-сервисы и партнерские телеметрические сети АЗС.\n\n"
        "<b>Команды бота:</b>\n"
        "/start — Перезапуск и главное меню\n"
        "/status — Быстрая сводка наличия топлива\n"
        "/settings — Настройка подписок на марки\n"
        "/help — Справка"
    )
    await message.answer(about_text, parse_mode=ParseMode.HTML)


@router.message(Command("status"))
async def cmd_status(message: Message):
    """Quick command for fuel status."""
    await handle_check_now(message)


@router.message(Command("settings"))
async def cmd_settings(message: Message):
    """Quick command for settings."""
    await handle_settings(message)


# ---------------- Inline Callback Handlers ---------------- #

@router.callback_query(F.data.startswith("sub_toggle:"))
async def callback_toggle_fuel(call: CallbackQuery):
    """Toggles fuel subscription for user."""
    user = call.from_user
    fuel_type = call.data.split(":")[1]

    new_fuels = await db.toggle_fuel_subscription(user.id, fuel_type)
    profile = await db.get_user(user.id)
    notif_enabled = profile["notifications_enabled"] if profile else True

    new_keyboard = get_subscriptions_keyboard(
        subscribed_fuels=new_fuels,
        notifications_enabled=notif_enabled
    )

    try:
        await call.message.edit_reply_markup(reply_markup=new_keyboard)
    except Exception:
        pass
    await call.answer()


@router.callback_query(F.data.startswith("notif_toggle:"))
async def callback_toggle_notif(call: CallbackQuery):
    """Toggles notifications ON/OFF for user."""
    user = call.from_user
    action = call.data.split(":")[1]
    enable = (action == "on")

    await db.set_user_notifications(user.id, enable)
    profile = await db.get_user(user.id)
    fuels = profile["subscribed_fuels"] if profile else []

    new_keyboard = get_subscriptions_keyboard(
        subscribed_fuels=fuels,
        notifications_enabled=enable
    )

    try:
        await call.message.edit_reply_markup(reply_markup=new_keyboard)
    except Exception:
        pass
    
    status_msg = "Уведомления включены 🔔" if enable else "Уведомления отключены 🔕"
    await call.answer(status_msg)


@router.callback_query(F.data == "sub_refresh")
async def callback_refresh(call: CallbackQuery):
    """Refreshes the subscriptions keyboard."""
    user = call.from_user
    profile = await db.get_user(user.id)
    if profile:
        new_keyboard = get_subscriptions_keyboard(
            subscribed_fuels=profile["subscribed_fuels"],
            notifications_enabled=profile["notifications_enabled"]
        )
        try:
            await call.message.edit_reply_markup(reply_markup=new_keyboard)
        except Exception:
            pass
    await call.answer("Обновлено 🔄")
