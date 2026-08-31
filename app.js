// ============================================================
// АЗС Монитор — app.js v5.0
// Тёмная карта + Навигатор с текстовым поиском (Nominatim)
// ============================================================

// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
}

// ============================================================
// CITIES DATABASE
// ============================================================
const CITIES_DB = [
  { id: 'volzhsky', name: 'Волжский', region: 'Волгоградская обл.', coords: [48.7858, 44.7797], zoom: 13, popular: true },
  { id: 'volgograd', name: 'Волгоград', region: 'Волгоградская обл.', coords: [48.7080, 44.5133], zoom: 12, popular: true },
  { id: 'kamyshin', name: 'Камышин', region: 'Волгоградская обл.', coords: [50.0983, 45.3994], zoom: 13, popular: true },
  { id: 'mikhaylovka', name: 'Михайловка', region: 'Волгоградская обл.', coords: [50.0600, 43.2378], zoom: 13 },
  { id: 'moscow', name: 'Москва', region: 'Московская обл.', coords: [55.7558, 37.6173], zoom: 11, popular: true },
  { id: 'spb', name: 'Санкт-Петербург', region: 'Ленинградская обл.', coords: [59.9343, 30.3351], zoom: 11, popular: true },
  { id: 'krasnodar', name: 'Краснодар', region: 'Краснодарский край', coords: [45.0355, 38.9753], zoom: 12, popular: true },
  { id: 'rostov', name: 'Ростов-на-Дону', region: 'Ростовская обл.', coords: [47.2357, 39.7015], zoom: 12, popular: true },
  { id: 'sochi', name: 'Сочи', region: 'Краснодарский край', coords: [43.6028, 39.7342], zoom: 12, popular: true },
  { id: 'saratov', name: 'Саратов', region: 'Саратовская обл.', coords: [51.5406, 46.0086], zoom: 12, popular: true },
  { id: 'samara', name: 'Самара', region: 'Самарская обл.', coords: [53.2415, 50.2212], zoom: 12, popular: true },
  { id: 'tolyatti', name: 'Тольятти', region: 'Самарская обл.', coords: [53.5087, 49.4192], zoom: 12 },
  { id: 'kazan', name: 'Казань', region: 'Республика Татарстан', coords: [55.8304, 49.0661], zoom: 12, popular: true },
  { id: 'naberezhnye_chelny', name: 'Набережные Челны', region: 'Республика Татарстан', coords: [55.7437, 52.4093], zoom: 12 },
  { id: 'voronezh', name: 'Воронеж', region: 'Воронежская обл.', coords: [51.6755, 39.2089], zoom: 12, popular: true },
  { id: 'astrakhan', name: 'Астрахань', region: 'Астраханская обл.', coords: [46.3497, 48.0408], zoom: 12, popular: true },
  { id: 'stavropol', name: 'Ставрополь', region: 'Ставропольский край', coords: [45.0428, 41.9734], zoom: 12 },
  { id: 'ekaterinburg', name: 'Екатеринбург', region: 'Свердловская обл.', coords: [56.8389, 60.6057], zoom: 12, popular: true },
  { id: 'nizhny_novgorod', name: 'Нижний Новгород', region: 'Нижегородская обл.', coords: [56.2965, 43.9361], zoom: 12, popular: true },
  { id: 'ufa', name: 'Уфа', region: 'Республика Башкортостан', coords: [54.7388, 55.9721], zoom: 12, popular: true },
  { id: 'chelyabinsk', name: 'Челябинск', region: 'Челябинская обл.', coords: [55.1644, 61.4368], zoom: 12, popular: true },
  { id: 'novosibirsk', name: 'Новосибирск', region: 'Новосибирская обл.', coords: [55.0084, 82.9357], zoom: 12, popular: true },
  { id: 'perm', name: 'Пермь', region: 'Пермский край', coords: [58.0105, 56.2502], zoom: 12 },
  { id: 'tyumen', name: 'Тюмень', region: 'Тюменская обл.', coords: [57.1530, 65.5343], zoom: 12 },
  { id: 'omsk', name: 'Омск', region: 'Омская обл.', coords: [54.9885, 73.3242], zoom: 12 },
  { id: 'krasnoyarsk', name: 'Красноярск', region: 'Красноярский край', coords: [56.0153, 92.8932], zoom: 12 },
  { id: 'irkutsk', name: 'Иркутск', region: 'Иркутская обл.', coords: [52.2871, 104.3050], zoom: 12 },
  { id: 'khabarovsk', name: 'Хабаровск', region: 'Хабаровский край', coords: [48.4827, 135.0840], zoom: 12 },
  { id: 'vladivostok', name: 'Владивосток', region: 'Приморский край', coords: [43.1155, 131.8855], zoom: 12 },
  { id: 'kaliningrad', name: 'Калининград', region: 'Калининградская обл.', coords: [54.7104, 20.4522], zoom: 12 },
  { id: 'yaroslavl', name: 'Ярославль', region: 'Ярославская обл.', coords: [57.6261, 39.8845], zoom: 12 },
  { id: 'ryazan', name: 'Рязань', region: 'Рязанская обл.', coords: [54.6292, 39.7344], zoom: 12 },
  { id: 'penza', name: 'Пенза', region: 'Пензенская обл.', coords: [53.1959, 45.0183], zoom: 12 },
  { id: 'lipetsk', name: 'Липецк', region: 'Липецкая обл.', coords: [52.6031, 39.5708], zoom: 12 },
  { id: 'tula', name: 'Тула', region: 'Тульская обл.', coords: [54.1961, 37.6182], zoom: 12 },
  { id: 'kursk', name: 'Курск', region: 'Курская обл.', coords: [51.7304, 36.1927], zoom: 12 },
  { id: 'belgorod', name: 'Белгород', region: 'Белгородская обл.', coords: [50.5997, 36.5983], zoom: 12 }
];

// ============================================================
// STATE
// ============================================================
function getSavedPriorityCity() {
  const id = localStorage.getItem('priority_city_id');
  return id ? CITIES_DB.find(c => c.id === id) || null : null;
}

let currentCity = getSavedPriorityCity() || CITIES_DB[0];
let priorityCityId = localStorage.getItem('priority_city_id') || 'volzhsky';
let allStations = [];
let displayedStations = [];
let markers = [];
let currentFilter = 'ALL';
let userMarker = null;
let userCoords = null;
let selectedStation = null;

// Navigator state
let isRouteMode = false;
let pointA = null;
let pointB = null;
let markerA = null;
let markerB = null;
let routePolyline = null;
let routeCasingPolyline = null;
let routeFuelFilter = 'ALL';
let stationsOnRoute = [];

// Nominatim debounce timers
let debounceTimerA = null;
let debounceTimerB = null;

// ============================================================
// FUEL & QUEUE METADATA
// ============================================================
const FUEL_INFO = {
  'AI92': { name: 'АИ-92', emoji: '🟢' },
  'AI95': { name: 'АИ-95', emoji: '🔵' },
  'AI95_PREMIUM': { name: 'АИ-95+ (Экто/G-Drive)', emoji: '🔷' },
  'AI98': { name: 'АИ-98', emoji: '🟣' },
  'AI100': { name: 'АИ-100', emoji: '🔴' },
  'DIESEL': { name: 'Дизель (ДТ)', emoji: '⚫' },
  'LPG': { name: 'Пропан', emoji: '🟡' },
  'METHANE': { name: 'Метан', emoji: '⚪' },
};

function checkFuelInStock(station, filter) {
  if (!station?.fuels) return false;
  if (filter === 'ALL') return Object.values(station.fuels).some(f => f.status === 'IN_STOCK');
  if (filter === 'AI100') {
    return ['AI100', 'AI98'].some(k => station.fuels[k]?.status === 'IN_STOCK');
  }
  return station.fuels[filter]?.status === 'IN_STOCK';
}

const QUEUE_INFO = {
  'LOW': { text: 'Свободно', badgeClass: 'q-low', dotClass: 'q-low', emoji: '🟢' },
  'MEDIUM': { text: 'Средняя', badgeClass: 'q-med', dotClass: 'q-med', emoji: '🟡' },
  'HIGH': { text: 'Большая очередь', badgeClass: 'q-high', dotClass: 'q-high', emoji: '🔴' },
  'UNKNOWN': { text: 'Обычный поток', badgeClass: 'q-unknown', dotClass: 'q-unknown', emoji: '⚪' }
};

const BRAND_ICONS = { 'лукойл': '🔴', 'татнефть': '🟢', 'газпром': '🔵', 'роснефть': '🟡', 'teboil': '🔷' };
function getBrandIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [brand, icon] of Object.entries(BRAND_ICONS)) {
    if (lower.includes(brand)) return icon;
  }
  return '⛽';
}

function haptic(type = 'light') {
  try { tg?.HapticFeedback?.impactOccurred(type); } catch {}
}
function hapticNotification(type = 'success') {
  try { tg?.HapticFeedback?.notificationOccurred(type); } catch {}
}

// ============================================================
// LEAFLET MAP — DARK TILES
// ============================================================
const map = L.map('map', { zoomControl: false, attributionControl: false })
  .setView(currentCity.coords, currentCity.zoom);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  subdomains: 'abcd'
}).addTo(map);

// ============================================================
// DOM ELEMENTS
// ============================================================
const standardHeader = document.getElementById('standard-header');
const routeHeader = document.getElementById('route-header');
const routeSummarySheet = document.getElementById('route-summary-sheet');
const drawer = document.getElementById('drawer');
const drawerClose = document.getElementById('drawer-close');
const loader = document.getElementById('loader');
const cityModal = document.getElementById('city-modal');
const btnCitySelect = document.getElementById('btn-city-select');
const currentCityName = document.getElementById('current-city-name');
const priorityIndicator = document.getElementById('priority-indicator');
const priorityCheckbox = document.getElementById('priority-city-checkbox');
const citySearchInput = document.getElementById('city-search-input');
const citySearchClear = document.getElementById('city-search-clear');
const citiesContainer = document.getElementById('cities-container');

// Navigator elements
const btnToggleRoute = document.getElementById('btn-toggle-route');
const btnExitRoute = document.getElementById('btn-exit-route');
const inputPointA = document.getElementById('input-point-a');
const inputPointB = document.getElementById('input-point-b');
const suggestionsA = document.getElementById('suggestions-a');
const suggestionsB = document.getElementById('suggestions-b');
const btnSetAGps = document.getElementById('btn-set-a-gps');
const btnClearB = document.getElementById('btn-clear-b');
const btnRouteToStation = document.getElementById('btn-route-to-station');
const btnYandexNaviStart = document.getElementById('btn-yandex-navi-start');

// ============================================================
// CITY HEADER & MODAL
// ============================================================
function updateCityHeaderUI() {
  currentCityName.textContent = currentCity.name;
  const isPriority = currentCity.id === priorityCityId;
  priorityIndicator.style.display = isPriority ? 'flex' : 'none';
  priorityCheckbox.checked = isPriority;
}
updateCityHeaderUI();

btnCitySelect.addEventListener('click', () => {
  haptic('light');
  renderCitiesList();
  priorityCheckbox.checked = currentCity.id === priorityCityId;
  cityModal.classList.add('open');
});
document.getElementById('city-modal-close').addEventListener('click', () => cityModal.classList.remove('open'));
document.getElementById('city-modal-backdrop').addEventListener('click', () => cityModal.classList.remove('open'));

priorityCheckbox.addEventListener('change', () => {
  hapticNotification('success');
  if (priorityCheckbox.checked) {
    priorityCityId = currentCity.id;
    localStorage.setItem('priority_city_id', currentCity.id);
  } else {
    priorityCityId = '';
    localStorage.removeItem('priority_city_id');
  }
  updateCityHeaderUI();
  renderCitiesList();
});

citySearchInput.addEventListener('input', () => {
  const val = citySearchInput.value.trim();
  citySearchClear.classList.toggle('hidden', !val);
  renderCitiesList(val);
});
citySearchClear.addEventListener('click', () => {
  citySearchInput.value = '';
  citySearchClear.classList.add('hidden');
  renderCitiesList();
});

function renderCitiesList(filterQuery = '') {
  citiesContainer.innerHTML = '';
  const q = filterQuery.toLowerCase();
  const filtered = CITIES_DB.filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
  if (!filtered.length) {
    citiesContainer.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-dim);font-size:13px;">Город не найден</div>';
    return;
  }
  if (!filterQuery) {
    const h1 = document.createElement('div');
    h1.className = 'city-group-title';
    h1.textContent = 'Популярные города';
    citiesContainer.appendChild(h1);
    filtered.filter(c => c.popular).forEach(c => citiesContainer.appendChild(createCityItem(c)));
    const h2 = document.createElement('div');
    h2.className = 'city-group-title';
    h2.textContent = 'Все города';
    citiesContainer.appendChild(h2);
  }
  filtered.forEach(c => {
    if (!filterQuery && c.popular) return;
    citiesContainer.appendChild(createCityItem(c));
  });
}

function createCityItem(city) {
  const item = document.createElement('div');
  item.className = `city-item ${city.id === currentCity.id ? 'active' : ''}`;
  item.innerHTML = `
    <div class="city-item-left">
      <span style="font-size:18px;">📍</span>
      <div>
        <div class="city-item-name">${city.name}</div>
        <div class="city-item-region">${city.region}</div>
      </div>
    </div>
    <div class="city-item-right">
      ${city.id === priorityCityId ? '<span class="city-priority-tag">⭐</span>' : ''}
      ${['volzhsky', 'volgograd'].includes(city.id) ? '<span class="city-badge">Онлайн 24/7</span>' : ''}
    </div>`;
  item.addEventListener('click', () => selectCity(city));
  return item;
}

function selectCity(city) {
  haptic('medium');
  currentCity = city;
  updateCityHeaderUI();
  cityModal.classList.remove('open');
  map.flyTo(city.coords, city.zoom, { duration: 1.2 });
  loadStationsForCity(city);
}

// ============================================================
// FILTER PILLS
// ============================================================
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    haptic('medium');
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.fuel;
    updateMarkersVisibility();
  });
});

document.querySelectorAll('.rf-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    haptic('medium');
    document.querySelectorAll('.rf-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    routeFuelFilter = pill.dataset.rfuel;
    if (pointA && pointB) calculateAndRenderRoute();
  });
});

// ============================================================
// DRAWER (Station Details)
// ============================================================
drawerClose.addEventListener('click', () => closeDrawer());

document.querySelectorAll('.report-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!selectedStation) return;
    const val = btn.dataset.report;
    hapticNotification('success');
    selectedStation.queue_status = val;
    renderQueueCard(selectedStation);
    updateMarkersVisibility();
    btn.textContent = '✅ Принято!';
    setTimeout(() => {
      btn.textContent = val === 'LOW' ? '🟢 Свободно' : val === 'MEDIUM' ? '🟡 5-10 машин' : '🔴 Затор';
    }, 2000);
  });
});

function renderQueueCard(station) {
  const q = QUEUE_INFO[station.queue_status || 'UNKNOWN'] || QUEUE_INFO.UNKNOWN;
  const badge = document.getElementById('queue-badge');
  badge.className = `queue-badge ${q.badgeClass}`;
  badge.textContent = q.text;
  const activity = station.signals_count_per_hour || 0;
  document.getElementById('queue-detail').textContent = activity > 0
    ? `⚡ Активность водителей: ${activity} чел./час`
    : '🕒 Данные телеметрии дорожного потока';
  const warnings = document.getElementById('queue-warnings');
  warnings.innerHTML = '';
  if (station.cash_only) {
    warnings.innerHTML += '<div class="warning-pill">⚠️ <b>Только наличный расчет</b></div>';
  }
  if (station.fuel_limit) {
    warnings.innerHTML += `<div class="warning-pill">⛔ <b>Ограничение:</b> ${station.fuel_limit}</div>`;
  }
}

function openDrawer(station) {
  selectedStation = station;
  haptic('light');
  document.getElementById('station-brand-icon').textContent = getBrandIcon(station.name);
  document.getElementById('station-name').textContent = station.name;
  document.getElementById('station-address').textContent = station.address;
  renderQueueCard(station);
  const grid = document.getElementById('fuels-grid');
  grid.innerHTML = '';
  const fuels = station.fuels || {};
  const keys = Object.keys(fuels).sort();
  if (!keys.length) {
    grid.innerHTML = '<div style="grid-column:span 2;color:var(--text-dim);font-size:13px;">Данные по типам топлива уточняются</div>';
  } else {
    keys.forEach(key => {
      const item = fuels[key];
      const meta = FUEL_INFO[key] || { name: item.name || key, emoji: '⛽' };
      const inStock = item.status === 'IN_STOCK';
      const card = document.createElement('div');
      card.className = `fuel-card ${inStock ? 'in-stock' : 'out-of-stock'}`;
      card.innerHTML = `
        <div class="fuel-card-top">
          <span class="fuel-card-name">${meta.emoji} ${meta.name}</span>
          <span class="fuel-status-tag ${inStock ? 'in-stock' : 'out-of-stock'}">${inStock ? 'В наличии' : 'Нет'}</span>
        </div>
        <div class="fuel-card-price">${item.price_text || (inStock ? 'Цена в чеке' : '—')}</div>`;
      grid.appendChild(card);
    });
  }
  document.getElementById('btn-navigate').href = `https://yandex.ru/maps/?rtext=~${station.lat}%2C${station.lon}&rtt=auto`;
  drawer.classList.add('open');
}

function closeDrawer() {
  drawer.classList.remove('open');
  selectedStation = null;
}

btnRouteToStation.addEventListener('click', () => {
  if (!selectedStation) return;
  const st = selectedStation;
  closeDrawer();
  startRouteMode();
  setPointB(st.lat, st.lon, st.name);
  inputPointB.value = st.name;
});

// ============================================================
// STATIONS LOADER
// ============================================================
async function loadStationsForCity(city) {
  loader.classList.remove('hidden');
  document.getElementById('loader-text').textContent = `Загрузка АЗС: ${city.name}...`;
  console.log('[LOAD] Loading city:', city.id, city.name);
  try {
    let data = null;
    try { const r = await fetch('./stations.json?t=' + Date.now()); if (r.ok) data = await r.json(); } catch {}
    if (!data) { try { const r = await fetch('/api/stations?t=' + Date.now()); data = await r.json(); } catch {} }
    allStations = data?.stations || data || [];
    console.log('[LOAD] allStations count:', allStations.length);
    
    if (['volzhsky', 'volgograd'].includes(city.id)) {
      displayedStations = allStations;
      console.log('[LOAD] Using real stations for', city.id);
    } else {
      displayedStations = generateCityStations(city);
      console.log('[LOAD] Generated', displayedStations.length, 'stations for', city.name);
      console.log('[LOAD] First station:', displayedStations[0]?.name, displayedStations[0]?.lat, displayedStations[0]?.lon);
    }
    
    updateBadgeCounts();
    renderMarkers();
    console.log('[LOAD] Rendered', markers.length, 'markers on map');
    if (isRouteMode && pointA && pointB) calculateAndRenderRoute();
  } catch (err) {
    console.error('[LOAD] Failed:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

function generateCityStations(city) {
  const [cLat, cLon] = city.coords;
  const brands = [
    { name: 'Лукойл', fuels: { AI95: { name: 'АИ-95', status: 'IN_STOCK', price_text: '59.20 ₽' }, AI92: { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.80 ₽' }, AI100: { name: 'ЭКТО 100', status: 'IN_STOCK', price_text: '71.50 ₽' }, DIESEL: { name: 'ДТ', status: 'IN_STOCK', price_text: '65.10 ₽' } } },
    { name: 'Газпромнефть', fuels: { AI95: { name: 'G-Drive 95', status: 'IN_STOCK', price_text: '58.90 ₽' }, AI92: { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.50 ₽' }, DIESEL: { name: 'ДТ', status: 'IN_STOCK', price_text: '64.80 ₽' } } },
    { name: 'Роснефть', fuels: { AI95: { name: 'Pulsar 95', status: 'IN_STOCK', price_text: '58.70 ₽' }, AI92: { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.40 ₽' }, DIESEL: { name: 'ДТ', status: 'IN_STOCK', price_text: '64.50 ₽' } } },
    { name: 'Татнефть', fuels: { AI95: { name: 'Танеко 95', status: 'IN_STOCK', price_text: '58.80 ₽' }, AI92: { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.60 ₽' }, DIESEL: { name: 'ДТ', status: 'IN_STOCK', price_text: '64.90 ₽' } } },
    { name: 'Teboil', fuels: { AI95: { name: 'Teboil 95+', status: 'IN_STOCK', price_text: '59.40 ₽' }, AI92: { name: 'Teboil 92', status: 'IN_STOCK', price_text: '53.90 ₽' }, DIESEL: { name: 'ДТ', status: 'IN_STOCK', price_text: '65.20 ₽' } } }
  ];
  const offsets = [[0.015,0.020,'Северный въезд, 1'],[-0.018,-0.015,'Центральный пр., 45'],[0.010,-0.025,'Западное шоссе, 12'],[-0.022,0.018,'Южная объездная, 8'],[0.003,0.005,'ул. Ленина, 102']];
  return brands.map((b, i) => ({
    id: `${city.id}_st_${i}`, name: b.name, address: `${city.name}, ${offsets[i][2]}`,
    lat: cLat + offsets[i][0], lon: cLon + offsets[i][1], chain: b.name, fuels: b.fuels,
    cash_only: false, queue_status: i % 2 === 0 ? 'LOW' : i === 1 ? 'MEDIUM' : 'HIGH',
    signals_count_per_hour: (i + 1) * 2, fuel_limit: null
  }));
}

function updateBadgeCounts() {
  document.getElementById('count-all').textContent = displayedStations.length;
  document.getElementById('count-ai95').textContent = displayedStations.filter(s => checkFuelInStock(s, 'AI95')).length;
  const el95p = document.getElementById('count-ai95p');
  if (el95p) el95p.textContent = displayedStations.filter(s => checkFuelInStock(s, 'AI95_PREMIUM')).length;
  document.getElementById('count-ai92').textContent = displayedStations.filter(s => checkFuelInStock(s, 'AI92')).length;
  document.getElementById('count-ai100').textContent = displayedStations.filter(s => checkFuelInStock(s, 'AI100')).length;
  document.getElementById('count-diesel').textContent = displayedStations.filter(s => checkFuelInStock(s, 'DIESEL')).length;
}

// ============================================================
// MAP MARKERS
// ============================================================
function renderMarkers() {
  markers.forEach(m => map.removeLayer(m.marker));
  markers = [];
  displayedStations.forEach(station => {
    if (!station.lat || !station.lon) return;
    const marker = createMarker(station);
    marker.addTo(map);
    markers.push({ marker, station });
  });
  updateMarkersVisibility();
}

function createMarker(station) {
  const brand = getBrandIcon(station.name);
  const q = QUEUE_INFO[station.queue_status || 'UNKNOWN'] || QUEUE_INFO.UNKNOWN;
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="custom-pin in-stock" id="pin-${station.id}">${brand}<div class="pin-queue-dot ${q.dotClass}" id="qdot-${station.id}"></div></div>`,
    iconSize: [34, 34], iconAnchor: [17, 17]
  });
  const marker = L.marker([station.lat, station.lon], { icon });
  marker.on('click', () => {
    if (isRouteMode && !pointB) {
      setPointB(station.lat, station.lon, station.name);
      inputPointB.value = station.name;
      return;
    }
    map.panTo([station.lat, station.lon]);
    openDrawer(station);
  });
  return marker;
}

function updateMarkersVisibility() {
  markers.forEach(({ marker, station }) => {
    const el = document.getElementById(`pin-${station.id}`);
    const qdot = document.getElementById(`qdot-${station.id}`);
    if (!el) return;
    if (qdot) {
      const q = QUEUE_INFO[station.queue_status || 'UNKNOWN'] || QUEUE_INFO.UNKNOWN;
      qdot.className = `pin-queue-dot ${q.dotClass}`;
    }
    if (isRouteMode && stationsOnRoute.length > 0) {
      const onRoute = stationsOnRoute.some(s => s.id === station.id);
      el.className = onRoute ? 'custom-pin in-stock on-route-pulse' : 'custom-pin out-of-stock dimmed';
      marker.setOpacity(onRoute ? 1.0 : 0.2);
      marker.setZIndexOffset(onRoute ? 1000 : 0);
      return;
    }
    if (currentFilter === 'ALL') {
      el.className = `custom-pin ${checkFuelInStock(station, 'ALL') ? 'in-stock' : 'out-of-stock'}`;
      marker.setOpacity(1.0);
    } else {
      const inStock = checkFuelInStock(station, currentFilter);
      el.className = inStock ? 'custom-pin in-stock' : 'custom-pin out-of-stock dimmed';
      marker.setOpacity(inStock ? 1.0 : 0.25);
      marker.setZIndexOffset(inStock ? 100 : 0);
    }
  });
}

// ============================================================
// NOMINATIM GEOCODING (OpenStreetMap)
// ============================================================
async function searchNominatim(query) {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ru&accept-language=ru`;
    const res = await fetch(url, { headers: { 'User-Agent': 'AZS-Volzhsky-MiniApp/1.0' } });
    return await res.json();
  } catch {
    return [];
  }
}

function renderSuggestions(container, results, onSelect) {
  container.innerHTML = '';
  if (!results.length) {
    container.innerHTML = '<div class="suggestion-loading">Ничего не найдено</div>';
    container.classList.add('visible');
    return;
  }
  results.forEach(r => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    const parts = (r.display_name || '').split(',');
    item.innerHTML = `<div class="suggestion-main">${parts[0]}</div><div class="suggestion-sub">${parts.slice(1, 3).join(',').trim()}</div>`;
    item.addEventListener('click', () => {
      onSelect(parseFloat(r.lat), parseFloat(r.lon), parts[0]);
      container.classList.remove('visible');
    });
    container.appendChild(item);
  });
  container.classList.add('visible');
}

function hideSuggestions(container) {
  container.classList.remove('visible');
}

// Input A — geocoding with debounce
inputPointA.addEventListener('input', () => {
  clearTimeout(debounceTimerA);
  const q = inputPointA.value.trim();
  if (q.length < 2) { hideSuggestions(suggestionsA); return; }
  suggestionsA.innerHTML = '<div class="suggestion-loading">Поиск...</div>';
  suggestionsA.classList.add('visible');
  debounceTimerA = setTimeout(async () => {
    const results = await searchNominatim(q);
    renderSuggestions(suggestionsA, results, (lat, lon, label) => {
      setPointA(lat, lon, label);
      inputPointA.value = label;
    });
  }, 400);
});

// Input B — geocoding with debounce
inputPointB.addEventListener('input', () => {
  clearTimeout(debounceTimerB);
  const q = inputPointB.value.trim();
  if (q.length < 2) { hideSuggestions(suggestionsB); return; }
  suggestionsB.innerHTML = '<div class="suggestion-loading">Поиск...</div>';
  suggestionsB.classList.add('visible');
  debounceTimerB = setTimeout(async () => {
    const results = await searchNominatim(q);
    renderSuggestions(suggestionsB, results, (lat, lon, label) => {
      setPointB(lat, lon, label);
      inputPointB.value = label;
    });
  }, 400);
});

// Hide suggestions on blur (delayed to allow click)
inputPointA.addEventListener('blur', () => setTimeout(() => hideSuggestions(suggestionsA), 200));
inputPointB.addEventListener('blur', () => setTimeout(() => hideSuggestions(suggestionsB), 200));

// ============================================================
// ROUTE MODE
// ============================================================
btnToggleRoute.addEventListener('click', () => {
  haptic('medium');
  isRouteMode ? exitRouteMode() : startRouteMode();
});
btnExitRoute.addEventListener('click', () => { haptic('light'); exitRouteMode(); });
btnSetAGps.addEventListener('click', () => { haptic('light'); locateAndSetPointA(); });
btnClearB.addEventListener('click', () => { haptic('light'); clearPointB(); });

function startRouteMode() {
  isRouteMode = true;
  standardHeader.classList.add('hidden');
  routeHeader.classList.remove('hidden');
  closeDrawer();
  if (userCoords) {
    setPointA(userCoords.lat, userCoords.lon, 'Мое местоположение (GPS)');
    inputPointA.value = 'Мое местоположение (GPS)';
  } else {
    locateAndSetPointA();
  }
}

function exitRouteMode() {
  isRouteMode = false;
  routeHeader.classList.add('hidden');
  standardHeader.classList.remove('hidden');
  routeSummarySheet.classList.add('hidden');
  clearRouteLines();
  if (markerA) { map.removeLayer(markerA); markerA = null; }
  if (markerB) { map.removeLayer(markerB); markerB = null; }
  // Remove route-only extra city markers
  routeExtraMarkers.forEach(m => {
    map.removeLayer(m.marker);
    const idx = markers.findIndex(x => x.station.id === m.station.id);
    if (idx !== -1) markers.splice(idx, 1);
  });
  routeExtraMarkers = [];
  pointA = null; pointB = null;
  inputPointA.value = '';
  inputPointB.value = '';
  stationsOnRoute = [];
  updateMarkersVisibility();
}

function setPointA(lat, lon, label = 'Точка А') {
  pointA = { lat, lon, label };
  if (markerA) map.removeLayer(markerA);
  markerA = L.marker([lat, lon], {
    icon: L.divIcon({ className: 'custom-waypoint', html: '<div class="waypoint-pin pin-a">А</div>', iconSize: [28, 28], iconAnchor: [14, 14] })
  }).addTo(map);
  if (pointB) calculateAndRenderRoute();
}

function setPointB(lat, lon, label = 'Точка Б') {
  pointB = { lat, lon, label };
  if (markerB) map.removeLayer(markerB);
  markerB = L.marker([lat, lon], {
    icon: L.divIcon({ className: 'custom-waypoint', html: '<div class="waypoint-pin pin-b">Б</div>', iconSize: [28, 28], iconAnchor: [14, 14] })
  }).addTo(map);
  if (pointA) calculateAndRenderRoute();
}

function clearPointB() {
  pointB = null;
  inputPointB.value = '';
  if (markerB) { map.removeLayer(markerB); markerB = null; }
  clearRouteLines();
  routeSummarySheet.classList.add('hidden');
  stationsOnRoute = [];
  updateMarkersVisibility();
}

function locateAndSetPointA() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setPointA(userCoords.lat, userCoords.lon, 'Мое местоположение (GPS)');
        inputPointA.value = 'Мое местоположение (GPS)';
      },
      () => {
        const [lat, lon] = currentCity.coords;
        setPointA(lat, lon, `${currentCity.name} (Центр)`);
        inputPointA.value = `${currentCity.name} (Центр)`;
      },
      { enableHighAccuracy: true }
    );
  } else {
    const [lat, lon] = currentCity.coords;
    setPointA(lat, lon, `${currentCity.name} (Центр)`);
    inputPointA.value = `${currentCity.name} (Центр)`;
  }
}

// Map click → set route point
map.on('click', e => {
  if (!isRouteMode) return;
  const { lat, lng } = e.latlng;
  const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  if (!pointA) {
    setPointA(lat, lng, label);
    inputPointA.value = label;
  } else {
    setPointB(lat, lng, label);
    inputPointB.value = label;
  }
});

// ============================================================
// OSRM ROUTING + CORRIDOR SCANNER
// ============================================================
async function calculateAndRenderRoute() {
  if (!pointA || !pointB) return;
  loader.classList.remove('hidden');
  document.getElementById('loader-text').textContent = 'Построение маршрута...';
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pointA.lon},${pointA.lat};${pointB.lon},${pointB.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.length) { alert('Не удалось проложить маршрут'); return; }
    const route = data.routes[0];
    const coords = route.geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
    clearRouteLines();
    routeCasingPolyline = L.polyline(latLngs, { color: '#ffffff', weight: 8, opacity: 0.25, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    routePolyline = L.polyline(latLngs, { color: '#2ea043', weight: 5, opacity: 1.0, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    map.fitBounds(routePolyline.getBounds(), { padding: [60, 60], maxZoom: 15 });

    // Collect stations from ALL cities along the route (within 30km corridor)
    document.getElementById('loader-text').textContent = 'Поиск АЗС по маршруту...';
    const routeStationsPool = collectStationsAlongRoute(coords);

    // Add route station markers to the map (that aren't already displayed)
    addRouteStationMarkers(routeStationsPool);

    stationsOnRoute = findStationsAlongCorridor(coords, routeFuelFilter, routeStationsPool);
    renderRouteSummary(route.distance, route.duration, stationsOnRoute);
    updateMarkersVisibility();
  } catch (err) {
    console.error('Routing error:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

// Find all cities within ~30km of the route and collect their stations
let routeExtraMarkers = [];

function collectStationsAlongRoute(routeCoords) {
  const corridorKm = 30; // 30km from route to city center
  const allRouteStations = [...displayedStations]; // Start with current city
  const addedCityIds = new Set([currentCity.id]);

  // Sample route points every ~50 segments for efficiency
  const step = Math.max(1, Math.floor(routeCoords.length / 200));

  CITIES_DB.forEach(city => {
    if (addedCityIds.has(city.id)) return;
    const [cLat, cLon] = city.coords;

    // Check if city is near any route point
    for (let i = 0; i < routeCoords.length; i += step) {
      const [rLon, rLat] = routeCoords[i];
      const dx = (rLon - cLon) * Math.cos((rLat + cLat) * Math.PI / 360);
      const dy = rLat - cLat;
      const distKm = Math.sqrt(dx * dx + dy * dy) * 111.32;
      if (distKm <= corridorKm) {
        // City is near the route — generate stations for it
        const cityStations = ['volzhsky', 'volgograd'].includes(city.id)
          ? allStations // Use real data for home cities
          : generateCityStations(city);
        cityStations.forEach(s => {
          if (!allRouteStations.some(existing => existing.id === s.id)) {
            allRouteStations.push(s);
          }
        });
        addedCityIds.add(city.id);
        break;
      }
    }
  });

  return allRouteStations;
}

function addRouteStationMarkers(stationsPool) {
  // Remove previously added route-only markers
  routeExtraMarkers.forEach(m => map.removeLayer(m.marker));
  routeExtraMarkers = [];

  stationsPool.forEach(station => {
    // Skip if already displayed as a regular marker
    if (markers.some(m => m.station.id === station.id)) return;
    if (!station.lat || !station.lon) return;

    const marker = createMarker(station);
    marker.addTo(map);
    markers.push({ marker, station });
    routeExtraMarkers.push({ marker, station });
  });
}

function clearRouteLines() {
  if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
  if (routeCasingPolyline) { map.removeLayer(routeCasingPolyline); routeCasingPolyline = null; }
}

function distToSegmentInMeters(pLat, pLon, aLat, aLon, bLat, bLon) {
  const x = (bLon - aLon) * Math.cos((aLat + bLat) * Math.PI / 360);
  const y = bLat - aLat;
  const lenSq = x * x + y * y;
  if (lenSq === 0) {
    const dx = (pLon - aLon) * Math.cos((aLat + pLat) * Math.PI / 360);
    const dy = pLat - aLat;
    return Math.sqrt(dx * dx + dy * dy) * 111320;
  }
  const px = (pLon - aLon) * Math.cos((aLat + pLat) * Math.PI / 360);
  const py = pLat - aLat;
  const u = Math.max(0, Math.min(1, (px * x + py * y) / lenSq));
  const dx = px - u * x, dy = py - u * y;
  return Math.sqrt(dx * dx + dy * dy) * 111320;
}

function findStationsAlongCorridor(routeCoords, filter, stationsPool) {
  const maxDist = 850;
  const found = [];
  const searchPool = stationsPool || displayedStations;
  searchPool.forEach(station => {
    if (!checkFuelInStock(station, filter)) return;
    let minD = Infinity, segIdx = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const d = distToSegmentInMeters(station.lat, station.lon, routeCoords[i][1], routeCoords[i][0], routeCoords[i+1][1], routeCoords[i+1][0]);
      if (d < minD) { minD = d; segIdx = i; }
    }
    if (minD <= maxDist) {
      let dist = 0;
      for (let i = 0; i < segIdx; i++) {
        const dx = (routeCoords[i+1][0] - routeCoords[i][0]) * Math.cos((routeCoords[i][1] + routeCoords[i+1][1]) * Math.PI / 360);
        const dy = routeCoords[i+1][1] - routeCoords[i][1];
        dist += Math.sqrt(dx * dx + dy * dy) * 111320;
      }
      found.push({ ...station, corridorDistanceMeters: Math.round(minD), distAlongRouteMeters: Math.round(dist) });
    }
  });
  return found.sort((a, b) => a.distAlongRouteMeters - b.distAlongRouteMeters);
}

function renderRouteSummary(distM, durS, list) {
  const km = (distM / 1000).toFixed(1);
  const mins = Math.max(1, Math.round(durS / 60));
  document.getElementById('route-dist-text').textContent = `${km} км`;
  document.getElementById('route-time-text').textContent = `~${mins} мин`;
  document.getElementById('route-fuel-count-badge').textContent = `⛽ ${list.length} АЗС с топливом`;
  const container = document.getElementById('route-stations-list');
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-dim);font-size:12px;">Нет АЗС с выбранным топливом по маршруту</div>';
  } else {
    list.forEach((st, idx) => {
      const q = QUEUE_INFO[st.queue_status || 'UNKNOWN'] || QUEUE_INFO.UNKNOWN;
      const kmFrom = (st.distAlongRouteMeters / 1000).toFixed(1);
      let price = 'В наличии';
      if (routeFuelFilter !== 'ALL' && st.fuels?.[routeFuelFilter]?.price_text) price = st.fuels[routeFuelFilter].price_text;
      else { const p = Object.values(st.fuels || {}).find(f => f.price_text)?.price_text; if (p) price = p; }
      const item = document.createElement('div');
      item.className = 'route-station-item';
      item.innerHTML = `
        <div class="rsi-left">
          <span class="rsi-icon">${getBrandIcon(st.name)}</span>
          <div class="rsi-info">
            <div class="rsi-name">${idx + 1}. ${st.name}</div>
            <div class="rsi-dist">📍 Через ${kmFrom} км</div>
          </div>
        </div>
        <div class="rsi-right">
          <span class="rsi-queue-badge ${q.badgeClass}">${q.emoji} ${q.text.split(' ')[0]}</span>
          <span class="rsi-price">${price}</span>
        </div>`;
      item.addEventListener('click', () => { haptic('light'); map.panTo([st.lat, st.lon]); openDrawer(st); });
      container.appendChild(item);
    });
  }
  btnYandexNaviStart.href = `https://yandex.ru/maps/?rtext=${pointA.lat}%2C${pointA.lon}~${pointB.lat}%2C${pointB.lon}&rtt=auto`;
  routeSummarySheet.classList.remove('hidden');
}

// ============================================================
// LOCATE & REFRESH
// ============================================================
document.getElementById('btn-locate').addEventListener('click', () => {
  haptic('medium');
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    userCoords = { lat, lon };
    map.setView([lat, lon], 15);
    if (userMarker) userMarker.setLatLng([lat, lon]);
    else {
      userMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'user-pin',
          html: '<div style="width:14px;height:14px;background:#2ea043;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(46,160,67,0.8);"></div>',
          iconSize: [14, 14], iconAnchor: [7, 7]
        })
      }).addTo(map);
    }
    if (isRouteMode && (!pointA || pointA.label.includes('GPS'))) {
      setPointA(lat, lon, 'Мое местоположение (GPS)');
      inputPointA.value = 'Мое местоположение (GPS)';
    }
  }, () => {}, { enableHighAccuracy: true });
});

document.getElementById('btn-refresh').addEventListener('click', () => {
  haptic('medium');
  loadStationsForCity(currentCity);
});

// Auto-refresh every 60s
setInterval(() => loadStationsForCity(currentCity), 60000);

// Initial load
loadStationsForCity(currentCity);
