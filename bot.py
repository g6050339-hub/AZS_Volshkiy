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
    get_webapp_inline_keyboard,
    get_cities_keyboard,
    get_city_by_id,
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


@router.message(F.text == "🏙 Заправки по городам")
@router.message(Command("cities"))
async def handle_cities(message: Message):
    """Shows city selection keyboard."""
    text = (
        "🏙 <b>Выберите город</b>\n\n"
        "Нажмите на город, чтобы получить информацию о наличии топлива "
        "на заправках в этом городе в реальном времени."
    )
    await message.answer(
        text=text,
        parse_mode=ParseMode.HTML,
        reply_markup=get_cities_keyboard(page=0)
    )


@router.callback_query(F.data.startswith("city_page:"))
async def callback_city_page(call: CallbackQuery):
    """Handles city pagination."""
    page = int(call.data.split(":")[1])
    try:
        await call.message.edit_reply_markup(reply_markup=get_cities_keyboard(page=page))
    except Exception:
        pass
    await call.answer()


@router.callback_query(F.data.startswith("city:"))
async def callback_city_select(call: CallbackQuery):
    """Fetches and displays gas stations for the selected city."""
    city_id = call.data.split(":")[1]
    city = get_city_by_id(city_id)
    if not city:
        await call.answer("Город не найден", show_alert=True)
        return

    await call.answer(f"⏳ Загружаю АЗС: {city['name']}...")

    try:
        await call.message.edit_text(
            f"⏳ <i>Опрашиваю заправки в городе {city['emoji']} {city['name']}...</i>",
            parse_mode=ParseMode.HTML
        )
    except Exception:
        pass

    try:
        stations = await fuel_parser.fetch_gas_stations(
            lat=city["lat"], lon=city["lon"], spn_lon=0.15, spn_lat=0.15
        )
    except Exception as e:
        logger.error(f"Failed to fetch stations for {city['name']}: {e}")
        stations = []

    if not stations:
        back_kb = get_cities_keyboard(page=0)
        await call.message.edit_text(
            f"⚠️ <i>Не удалось получить данные АЗС для {city['name']}. Попробуйте позже.</i>",
            parse_mode=ParseMode.HTML,
            reply_markup=back_kb
        )
        return

    text = format_city_stations_report(city, stations)

    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    back_btn = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="◀️ Назад к списку городов", callback_data="city_page:0")]
    ])

    # Split into chunks if too long (Telegram limit ~4096 chars)
    if len(text) > 4000:
        text = text[:3950] + "\n\n<i>... и ещё станции. Откройте карту для полного списка.</i>"

    await call.message.edit_text(
        text=text,
        parse_mode=ParseMode.HTML,
        reply_markup=back_btn,
        disable_web_page_preview=True
    )


def format_city_stations_report(city: dict, stations) -> str:
    """Formats fuel availability report for a specific city."""
    from datetime import datetime
    from config import FUEL_LABELS, FUEL_EMOJIS

    now_str = datetime.now().strftime("%d.%m.%Y %H:%M")

    # Count fuel types in stock
    fuel_counts = {}
    for st in stations:
        for ftype, fitem in st.fuels.items():
            if fitem.status == "IN_STOCK":
                fuel_counts[ftype] = fuel_counts.get(ftype, 0) + 1

    lines = [
        f"{city['emoji']} <b>АЗС в городе {city['name']}</b>",
        f"🕒 <i>Обновлено: {now_str}</i>",
        f"📍 Найдено станций: <b>{len(stations)}</b>\n",
    ]

    # Summary by fuel type
    if fuel_counts:
        lines.append("<b>📊 Наличие по видам топлива:</b>")
        for ftype, count in sorted(fuel_counts.items()):
            label = FUEL_LABELS.get(ftype, ftype)
            emoji = FUEL_EMOJIS.get(ftype, "⛽")
            lines.append(f"  {emoji} {label}: <b>{count}</b> АЗС")
        lines.append("")

    # List stations
    lines.append(f"<b>⛽ Список АЗС ({len(stations)}):</b>")
    for i, st in enumerate(stations, 1):
        in_stock = [f.name for f in st.in_stock_fuels]
        in_stock_str = f" ✅ {', '.join(in_stock)}" if in_stock else " ❌ Нет данных"
        price_parts = []
        for f in st.in_stock_fuels:
            if f.price_text:
                price_parts.append(f"{f.name}: {f.price_text}")
        price_str = f" | 💰 {'; '.join(price_parts)}" if price_parts else ""
        lines.append(f"{i}. <b>{st.name}</b> — {st.address}{in_stock_str}{price_str}")

    lines.append(f"\n💡 <i>Нажмите «📱 Открыть карту» для маршрутов и деталей.</i>")
    return "\n".join(lines)


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
