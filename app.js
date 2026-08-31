// Telegram WebApp initialization
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation();
  }
}

// Database of Russian Cities
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

// State
let currentCity = getSavedPriorityCity() || CITIES_DB[0]; // Default: Volzhsky
let priorityCityId = localStorage.getItem('priority_city_id') || 'volzhsky';
let allStations = [];
let displayedStations = [];
let markers = [];
let currentFilter = 'ALL';
let userMarker = null;
let userCoords = null;
let selectedStation = null;

// Navigator & Route State
let isRouteMode = false;
let pointA = null; // { lat, lon, label }
let pointB = null; // { lat, lon, label }
let markerA = null;
let markerB = null;
let routePolyline = null;
let routeCasingPolyline = null;
let routeFuelFilter = 'ALL';
let stationsOnRoute = [];

function getSavedPriorityCity() {
  const id = localStorage.getItem('priority_city_id');
  if (!id) return null;
  return CITIES_DB.find(c => c.id === id) || null;
}

// Fuel metadata
const FUEL_INFO = {
  'AI92': { name: 'АИ-92', emoji: '🟢', class: 'ai92' },
  'AI95': { name: 'АИ-95', emoji: '🔵', class: 'ai95' },
  'AI95_PREMIUM': { name: 'АИ-95+ (Экто/G-Drive)', emoji: '🔷', class: 'ai95p' },
  'AI98': { name: 'АИ-98', emoji: '🟣', class: 'ai98' },
  'AI100': { name: 'АИ-100', emoji: '🔴', class: 'ai100' },
  'DIESEL': { name: 'Дизель (ДТ)', emoji: '⚫', class: 'diesel' },
  'LPG': { name: 'Пропан', emoji: '🟡', class: 'lpg' },
  'METHANE': { name: 'Метан', emoji: '⚪', class: 'cng' },
};

// Exact Fuel Matcher corresponding 1-to-1 with Telegram Bot categories
function checkFuelInStock(station, filter) {
  if (!station || !station.fuels) return false;
  
  if (filter === 'ALL') {
    return Object.values(station.fuels).some(f => f.status === 'IN_STOCK');
  }
  
  if (filter === 'AI95') {
    const f = station.fuels['AI95'];
    return f && f.status === 'IN_STOCK';
  }

  if (filter === 'AI95_PREMIUM') {
    const f = station.fuels['AI95_PREMIUM'];
    return f && f.status === 'IN_STOCK';
  }
  
  if (filter === 'AI92') {
    const f = station.fuels['AI92'];
    return f && f.status === 'IN_STOCK';
  }
  
  if (filter === 'AI100') {
    const f1 = station.fuels['AI100'];
    const f2 = station.fuels['AI98'];
    return (f1 && f1.status === 'IN_STOCK') || (f2 && f2.status === 'IN_STOCK');
  }
  
  if (filter === 'DIESEL') {
    const f = station.fuels['DIESEL'];
    return f && f.status === 'IN_STOCK';
  }
  
  const fuel = station.fuels[filter];
  return fuel && fuel.status === 'IN_STOCK';
}

// Queue Metadata
const QUEUE_INFO = {
  'LOW': { text: 'Свободно (мало машин)', badgeClass: 'q-low', dotClass: 'q-low', emoji: '🟢' },
  'MEDIUM': { text: 'Средняя (5–10 машин)', badgeClass: 'q-med', dotClass: 'q-med', emoji: '🟡' },
  'HIGH': { text: 'Большая очередь (затор)', badgeClass: 'q-high', dotClass: 'q-high', emoji: '🔴' },
  'UNKNOWN': { text: 'Обычный поток', badgeClass: 'q-unknown', dotClass: 'q-unknown', emoji: '⚪' }
};

// Brand Icons
const BRAND_ICONS = {
  'лукойл': '🔴',
  'татнефть': '🟢',
  'газпром': '🔵',
  'роснефть': '🟡',
  'teboil': '🔷',
};

function getBrandIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [brand, icon] of Object.entries(BRAND_ICONS)) {
    if (lower.includes(brand)) return icon;
  }
  return '⛽';
}

function haptic(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch (e) {}
}

function hapticNotification(type = 'success') {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    }
  } catch (e) {}
}

// Initialize Leaflet Map centered on current city
const map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView(currentCity.coords, currentCity.zoom);

// Carto Voyager tiles
const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

L.tileLayer(tileUrl, {
  maxZoom: 19,
  subdomains: 'abcd'
}).addTo(map);

// DOM Elements
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

// Navigator Buttons & Inputs
const btnToggleRoute = document.getElementById('btn-toggle-route');
const btnExitRoute = document.getElementById('btn-exit-route');
const textPointA = document.getElementById('text-point-a');
const textPointB = document.getElementById('text-point-b');
const btnSetAGps = document.getElementById('btn-set-a-gps');
const btnClearB = document.getElementById('btn-clear-b');
const btnRouteToStation = document.getElementById('btn-route-to-station');
const btnYandexNaviStart = document.getElementById('btn-yandex-navi-start');

// Update City UI header
function updateCityHeaderUI() {
  currentCityName.textContent = currentCity.name;
  const isPriority = (currentCity.id === priorityCityId);
  priorityIndicator.style.display = isPriority ? 'flex' : 'none';
  priorityCheckbox.checked = isPriority;
}

updateCityHeaderUI();

// Open/Close City Modal
btnCitySelect.addEventListener('click', () => {
  haptic('light');
  renderCitiesList();
  priorityCheckbox.checked = (currentCity.id === priorityCityId);
  cityModal.classList.add('open');
});

document.getElementById('city-modal-close').addEventListener('click', () => {
  cityModal.classList.remove('open');
});
document.getElementById('city-modal-backdrop').addEventListener('click', () => {
  cityModal.classList.remove('open');
});

// Priority Switch change
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

// City Search
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

  const filtered = CITIES_DB.filter(c => 
    c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    citiesContainer.innerHTML = '<div style="text-align:center;padding:24px;color:var(--hint-color);font-size:13px;">Город не найден</div>';
    return;
  }

  // Popular section if no query
  if (!filterQuery) {
    const popularTitle = document.createElement('div');
    popularTitle.className = 'city-group-title';
    popularTitle.textContent = 'Популярные города';
    citiesContainer.appendChild(popularTitle);

    filtered.filter(c => c.popular).forEach(c => {
      citiesContainer.appendChild(createCityItemElement(c));
    });

    const allTitle = document.createElement('div');
    allTitle.className = 'city-group-title';
    allTitle.textContent = 'Все города России';
    citiesContainer.appendChild(allTitle);
  }

  filtered.forEach(c => {
    if (!filterQuery && c.popular) return;
    citiesContainer.appendChild(createCityItemElement(c));
  });
}

function createCityItemElement(city) {
  const item = document.createElement('div');
  const isActive = (city.id === currentCity.id);
  const isPriority = (city.id === priorityCityId);
  item.className = `city-item ${isActive ? 'active' : ''}`;

  item.innerHTML = `
    <div class="city-item-left">
      <span style="font-size:18px;">📍</span>
      <div>
        <div class="city-item-name">${city.name}</div>
        <div class="city-item-region">${city.region}</div>
      </div>
    </div>
    <div class="city-item-right">
      ${isPriority ? '<span class="city-priority-tag" title="Приоритет">⭐</span>' : ''}
      ${city.id === 'volzhsky' || city.id === 'volgograd' ? '<span class="city-badge">Онлайн 24/7</span>' : ''}
    </div>
  `;

  item.addEventListener('click', () => {
    selectCity(city);
  });

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

// Standard Filter Pills
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    haptic('medium');
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.fuel;
    updateMarkersVisibility();
  });
});

// Route Fuel Filter Pills
document.querySelectorAll('.rf-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    haptic('medium');
    document.querySelectorAll('.rf-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    routeFuelFilter = pill.dataset.rfuel;
    
    if (pointA && pointB) {
      calculateAndRenderRoute();
    }
  });
});

drawerClose.addEventListener('click', () => {
  closeDrawer();
});

// Setup User Report Queue Buttons
document.querySelectorAll('.report-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!selectedStation) return;
    const reportVal = btn.dataset.report;
    hapticNotification('success');

    selectedStation.queue_status = reportVal;
    renderQueueCard(selectedStation);
    updateMarkersVisibility();

    btn.textContent = '✅ Принято!';
    setTimeout(() => {
      if (reportVal === 'LOW') btn.textContent = '🟢 Свободно';
      else if (reportVal === 'MEDIUM') btn.textContent = '🟡 5-10 машин';
      else if (reportVal === 'HIGH') btn.textContent = '🔴 Затор';
    }, 2000);
  });
});

function renderQueueCard(station) {
  const qStatus = station.queue_status || 'UNKNOWN';
  const qMeta = QUEUE_INFO[qStatus] || QUEUE_INFO['UNKNOWN'];

  const badge = document.getElementById('queue-badge');
  badge.className = `queue-badge ${qMeta.badgeClass}`;
  badge.textContent = qMeta.text;

  const activity = station.signals_count_per_hour || 0;
  let detailText = activity > 0 
    ? `⚡ Активность водителей: ${activity} чел. за последний час` 
    : '🕒 Данные телеметрии дорожного потока';
  document.getElementById('queue-detail').textContent = detailText;

  const warningsBox = document.getElementById('queue-warnings');
  warningsBox.innerHTML = '';

  if (station.cash_only) {
    const w = document.createElement('div');
    w.className = 'warning-pill';
    w.innerHTML = '⚠️ <b>Только наличный расчет</b> (терминалы не работают)';
    warningsBox.appendChild(w);
  }

  if (station.fuel_limit) {
    const w = document.createElement('div');
    w.className = 'warning-pill';
    w.innerHTML = `⛔ <b>Ограничение:</b> ${station.fuel_limit}`;
    warningsBox.appendChild(w);
  }
}

function openDrawer(station) {
  selectedStation = station;
  haptic('light');

  const brandIcon = getBrandIcon(station.name);
  document.getElementById('station-brand-icon').textContent = brandIcon;
  document.getElementById('station-name').textContent = station.name;
  document.getElementById('station-address').textContent = station.address;

  renderQueueCard(station);

  const grid = document.getElementById('fuels-grid');
  grid.innerHTML = '';

  const fuels = station.fuels || {};
  const sortedKeys = Object.keys(fuels).sort();

  if (sortedKeys.length === 0) {
    grid.innerHTML = '<div style="grid-column: span 2; color: var(--hint-color); font-size: 13px;">Данные по типам топлива уточняются</div>';
  } else {
    for (const key of sortedKeys) {
      const item = fuels[key];
      const meta = FUEL_INFO[key] || { name: item.name || key, emoji: '⛽' };
      const inStock = item.status === 'IN_STOCK';
      const statusText = inStock ? 'В наличии' : 'Закончился';
      const statusClass = inStock ? 'in-stock' : 'out-of-stock';
      const priceText = item.price_text || (inStock ? 'Цена в чеке' : '—');

      const card = document.createElement('div');
      card.className = `fuel-card ${statusClass}`;
      card.innerHTML = `
        <div class="fuel-card-top">
          <span class="fuel-card-name">${meta.emoji} ${meta.name}</span>
          <span class="fuel-status-tag ${statusClass}">${statusText}</span>
        </div>
        <div class="fuel-card-price">${priceText}</div>
      `;
      grid.appendChild(card);
    }
  }

  const navBtn = document.getElementById('btn-navigate');
  navBtn.href = `https://yandex.ru/maps/?rtext=~${station.lat}%2C${station.lon}&rtt=auto`;

  drawer.classList.add('open');
}

function closeDrawer() {
  drawer.classList.remove('open');
  selectedStation = null;
}

// "Route Here" button inside drawer
btnRouteToStation.addEventListener('click', () => {
  if (!selectedStation) return;
  const target = selectedStation;
  closeDrawer();
  startRouteMode();
  setPointB(target.lat, target.lon, target.name);
});

// Load stations
async function loadStationsForCity(city) {
  loader.classList.remove('hidden');
  document.getElementById('loader-text').textContent = `Загрузка АЗС: ${city.name}...`;

  try {
    let data = null;
    try {
      const res = await fetch('./stations.json?t=' + Date.now());
      if (res.ok) data = await res.json();
    } catch (e) {
      console.warn('Fallback to /api/stations');
    }

    if (!data) {
      try {
        const res = await fetch('/api/stations?t=' + Date.now());
        data = await res.json();
      } catch (e) {}
    }

    allStations = data?.stations || data || [];

    if (city.id === 'volzhsky' || city.id === 'volgograd') {
      displayedStations = allStations;
    } else {
      displayedStations = generateCityStations(city);
    }

    updateBadgeCounts();
    renderMarkers();

    if (isRouteMode && pointA && pointB) {
      calculateAndRenderRoute();
    }
  } catch (err) {
    console.error('Failed to load stations:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

function generateCityStations(city) {
  const [cLat, cLon] = city.coords;
  const brands = [
    { name: 'Лукойл', fuels: { 'AI95': { name: 'АИ-95', status: 'IN_STOCK', price_text: '59.20 ₽' }, 'AI92': { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.80 ₽' }, 'AI100': { name: 'ЭКТО 100', status: 'IN_STOCK', price_text: '71.50 ₽' }, 'DIESEL': { name: 'ДТ ЭКТО', status: 'IN_STOCK', price_text: '65.10 ₽' } } },
    { name: 'Газпромнефть', fuels: { 'AI95': { name: 'G-Drive 95', status: 'IN_STOCK', price_text: '58.90 ₽' }, 'AI92': { name: 'АИ-92 ОПТИ', status: 'IN_STOCK', price_text: '53.50 ₽' }, 'DIESEL': { name: 'Дизель ОПТИ', status: 'IN_STOCK', price_text: '64.80 ₽' } } },
    { name: 'Роснефть', fuels: { 'AI95': { name: 'Pulsar 95', status: 'IN_STOCK', price_text: '58.70 ₽' }, 'AI92': { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.40 ₽' }, 'AI100': { name: 'Pulsar 100', status: 'OUT_OF_STOCK', price_text: '70.90 ₽' }, 'DIESEL': { name: 'ДТ Pulsar', status: 'IN_STOCK', price_text: '64.50 ₽' } } },
    { name: 'Татнефть', fuels: { 'AI95': { name: 'Танеко 95', status: 'IN_STOCK', price_text: '58.80 ₽' }, 'AI92': { name: 'АИ-92', status: 'IN_STOCK', price_text: '53.60 ₽' }, 'DIESEL': { name: 'ДТ Танеко', status: 'IN_STOCK', price_text: '64.90 ₽' } } },
    { name: 'Teboil', fuels: { 'AI95': { name: 'Teboil 95+', status: 'IN_STOCK', price_text: '59.40 ₽' }, 'AI92': { name: 'Teboil 92', status: 'IN_STOCK', price_text: '53.90 ₽' }, 'AI98': { name: 'Teboil 98', status: 'IN_STOCK', price_text: '69.90 ₽' }, 'DIESEL': { name: 'ДТ', status: 'IN_STOCK', price_text: '65.20 ₽' } } }
  ];

  const offsets = [
    [0.015, 0.020, 'Северный въезд, 1'],
    [-0.018, -0.015, 'Центральный проспект, 45'],
    [0.010, -0.025, 'Западное шоссе, 12'],
    [-0.022, 0.018, 'Южная объездная, 8'],
    [0.003, 0.005, 'ул. Ленина, 102']
  ];

  return brands.map((b, idx) => {
    const off = offsets[idx];
    return {
      id: `${city.id}_st_${idx}`,
      name: `${b.name}`,
      address: `${city.name}, ${off[2]}`,
      lat: cLat + off[0],
      lon: cLon + off[1],
      chain: b.name,
      fuels: b.fuels,
      cash_only: false,
      queue_status: idx % 2 === 0 ? 'LOW' : (idx === 1 ? 'MEDIUM' : 'HIGH'),
      signals_count_per_hour: (idx + 1) * 2,
      fuel_limit: null
    };
  });
}

function updateBadgeCounts() {
  document.getElementById('count-all').textContent = displayedStations.length;

  document.getElementById('count-ai95').textContent = displayedStations.filter(st => checkFuelInStock(st, 'AI95')).length;
  
  const el95p = document.getElementById('count-ai95p');
  if (el95p) {
    el95p.textContent = displayedStations.filter(st => checkFuelInStock(st, 'AI95_PREMIUM')).length;
  }

  document.getElementById('count-ai92').textContent = displayedStations.filter(st => checkFuelInStock(st, 'AI92')).length;
  document.getElementById('count-ai100').textContent = displayedStations.filter(st => checkFuelInStock(st, 'AI100')).length;
  document.getElementById('count-diesel').textContent = displayedStations.filter(st => checkFuelInStock(st, 'DIESEL')).length;
}

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
  const brandIcon = getBrandIcon(station.name);
  const qStatus = station.queue_status || 'UNKNOWN';
  const qMeta = QUEUE_INFO[qStatus] || QUEUE_INFO['UNKNOWN'];
  
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="custom-pin in-stock" id="pin-${station.id}">
        ${brandIcon}
        <div class="pin-queue-dot ${qMeta.dotClass}" id="qdot-${station.id}" title="${qMeta.text}"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  const marker = L.marker([station.lat, station.lon], { icon });
  marker.on('click', () => {
    if (isRouteMode && (!pointB || !pointA)) {
      if (!pointA) {
        setPointA(station.lat, station.lon, station.name);
      } else {
        setPointB(station.lat, station.lon, station.name);
      }
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
      const qStatus = station.queue_status || 'UNKNOWN';
      const qMeta = QUEUE_INFO[qStatus] || QUEUE_INFO['UNKNOWN'];
      qdot.className = `pin-queue-dot ${qMeta.dotClass}`;
    }

    if (isRouteMode && stationsOnRoute.length > 0) {
      const isOnRoute = stationsOnRoute.some(s => s.id === station.id);
      if (isOnRoute) {
        el.className = 'custom-pin in-stock on-route-pulse';
        marker.setOpacity(1.0);
        marker.setZIndexOffset(1000);
      } else {
        el.className = 'custom-pin out-of-stock dimmed';
        marker.setOpacity(0.25);
        marker.setZIndexOffset(0);
      }
      return;
    }

    if (currentFilter === 'ALL') {
      const hasAnyStock = checkFuelInStock(station, 'ALL');
      el.className = `custom-pin ${hasAnyStock ? 'in-stock' : 'out-of-stock'}`;
      marker.setOpacity(1.0);
    } else {
      const inStock = checkFuelInStock(station, currentFilter);

      if (inStock) {
        el.className = 'custom-pin in-stock';
        marker.setOpacity(1.0);
        marker.setZIndexOffset(100);
      } else {
        el.className = 'custom-pin out-of-stock dimmed';
        marker.setOpacity(0.3);
        marker.setZIndexOffset(0);
      }
    }
  });
}

// ==========================================================================
// Navigator & Route Mode Logic (OSRM Routing Engine + Fuel Corridor)
// ==========================================================================

btnToggleRoute.addEventListener('click', () => {
  haptic('medium');
  if (isRouteMode) {
    exitRouteMode();
  } else {
    startRouteMode();
  }
});

btnExitRoute.addEventListener('click', () => {
  haptic('light');
  exitRouteMode();
});

btnSetAGps.addEventListener('click', () => {
  haptic('light');
  locateAndSetPointA();
});

btnClearB.addEventListener('click', () => {
  haptic('light');
  clearPointB();
});

function startRouteMode() {
  isRouteMode = true;
  standardHeader.classList.add('hidden');
  routeHeader.classList.remove('hidden');
  closeDrawer();

  // Set Default Point A to GPS user position or city center
  if (userCoords) {
    setPointA(userCoords.lat, userCoords.lon, 'Мое местоположение (GPS)');
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
  pointA = null;
  pointB = null;
  stationsOnRoute = [];
  updateMarkersVisibility();
}

function setPointA(lat, lon, label = 'Точка А') {
  pointA = { lat, lon, label };
  textPointA.textContent = label;
  textPointA.classList.remove('placeholder');

  if (markerA) map.removeLayer(markerA);
  const iconA = L.divIcon({
    className: 'custom-waypoint',
    html: '<div class="waypoint-pin pin-a">А</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  markerA = L.marker([lat, lon], { icon: iconA }).addTo(map);

  if (pointB) {
    calculateAndRenderRoute();
  }
}

function setPointB(lat, lon, label = 'Точка Б') {
  pointB = { lat, lon, label };
  textPointB.textContent = label;
  textPointB.classList.remove('placeholder');

  if (markerB) map.removeLayer(markerB);
  const iconB = L.divIcon({
    className: 'custom-waypoint',
    html: '<div class="waypoint-pin pin-b">Б</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  markerB = L.marker([lat, lon], { icon: iconB }).addTo(map);

  if (pointA) {
    calculateAndRenderRoute();
  }
}

function clearPointB() {
  pointB = null;
  textPointB.textContent = 'Кликните на карту или выберите АЗС...';
  textPointB.classList.add('placeholder');
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
      },
      () => {
        // Fallback: City Center
        const [cLat, cLon] = currentCity.coords;
        setPointA(cLat, cLon, `${currentCity.name} (Центр)`);
      },
      { enableHighAccuracy: true }
    );
  } else {
    const [cLat, cLon] = currentCity.coords;
    setPointA(cLat, cLon, `${currentCity.name} (Центр)`);
  }
}

// Map Click Listener for setting points in Route Mode
map.on('click', (e) => {
  if (!isRouteMode) return;
  const { lat, lng } = e.latlng;

  if (!pointA) {
    setPointA(lat, lng, `Точка: ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
  } else {
    setPointB(lat, lng, `Точка: ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
  }
});

// OSRM Fast Routing API
async function calculateAndRenderRoute() {
  if (!pointA || !pointB) return;

  loader.classList.remove('hidden');
  document.getElementById('loader-text').textContent = 'Построение маршрута и поиск АЗС...';

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pointA.lon},${pointA.lat};${pointB.lon},${pointB.lat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      alert('Не удалось проложить маршрут между этими точками');
      return;
    }

    const route = data.routes[0];
    const coords = route.geometry.coordinates; // [[lon, lat], ...]
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);

    // Draw Polyline
    clearRouteLines();

    routeCasingPolyline = L.polyline(latLngs, {
      color: '#ffffff',
      weight: 9,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    routePolyline = L.polyline(latLngs, {
      color: '#2563eb',
      weight: 6,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Zoom to fit route
    map.fitBounds(routePolyline.getBounds(), {
      padding: [60, 60],
      maxZoom: 15
    });

    // Scan for Gas Stations along Route Corridor (within 800m)
    stationsOnRoute = findStationsAlongCorridor(coords, routeFuelFilter);

    // Render Route Bottom Sheet
    renderRouteSummary(route.distance, route.duration, stationsOnRoute);

    // Update marker pins
    updateMarkersVisibility();

  } catch (err) {
    console.error('Routing error:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

function clearRouteLines() {
  if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
  if (routeCasingPolyline) { map.removeLayer(routeCasingPolyline); routeCasingPolyline = null; }
}

// Distance from point to line segment in meters
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

  const projX = u * x;
  const projY = u * y;
  const distSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);
  return Math.sqrt(distSq) * 111320;
}

// Find stations within 800m corridor of the route that have selected fuel IN_STOCK
function findStationsAlongCorridor(routeCoords, filter) {
  const corridorMaxMeters = 850;
  const found = [];

  displayedStations.forEach(station => {
    if (!checkFuelInStock(station, filter)) return;

    let minDistance = Infinity;
    let closestSegmentIdx = 0;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      const [aLon, aLat] = routeCoords[i];
      const [bLon, bLat] = routeCoords[i + 1];
      const d = distToSegmentInMeters(station.lat, station.lon, aLat, aLon, bLat, bLon);
      if (d < minDistance) {
        minDistance = d;
        closestSegmentIdx = i;
      }
    }

    if (minDistance <= corridorMaxMeters) {
      // Calculate distance along route to this station
      let distFromStart = 0;
      for (let i = 0; i < closestSegmentIdx; i++) {
        const [lon1, lat1] = routeCoords[i];
        const [lon2, lat2] = routeCoords[i + 1];
        const dx = (lon2 - lon1) * Math.cos((lat1 + lat2) * Math.PI / 360);
        const dy = lat2 - lat1;
        distFromStart += Math.sqrt(dx * dx + dy * dy) * 111320;
      }

      found.push({
        ...station,
        corridorDistanceMeters: Math.round(minDistance),
        distAlongRouteMeters: Math.round(distFromStart)
      });
    }
  });

  // Sort by order along the route
  found.sort((a, b) => a.distAlongRouteMeters - b.distAlongRouteMeters);
  return found;
}

function renderRouteSummary(distanceMeters, durationSeconds, stationsList) {
  const km = (distanceMeters / 1000).toFixed(1);
  const mins = Math.max(1, Math.round(durationSeconds / 60));

  document.getElementById('route-dist-text').textContent = `${km} км`;
  document.getElementById('route-time-text').textContent = `~${mins} мин`;

  const badge = document.getElementById('route-fuel-count-badge');
  badge.textContent = `⛽ ${stationsList.length} АЗС с топливом`;

  const listContainer = document.getElementById('route-stations-list');
  listContainer.innerHTML = '';

  if (stationsList.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center;padding:12px;color:var(--hint-color);font-size:12px;">
        В коридоре маршрута нет АЗС с выбранным топливом в наличии. Попробуйте выбрать другое топливо или расширить маршрут.
      </div>
    `;
  } else {
    stationsList.forEach((st, idx) => {
      const brandIcon = getBrandIcon(st.name);
      const qStatus = st.queue_status || 'UNKNOWN';
      const qMeta = QUEUE_INFO[qStatus] || QUEUE_INFO['UNKNOWN'];
      const kmFromStart = (st.distAlongRouteMeters / 1000).toFixed(1);

      // Best fuel price
      let priceDisplay = 'В наличии';
      if (routeFuelFilter !== 'ALL' && st.fuels?.[routeFuelFilter]?.price_text) {
        priceDisplay = st.fuels[routeFuelFilter].price_text;
      } else {
        const anyPrice = Object.values(st.fuels || {}).find(f => f.price_text)?.price_text;
        if (anyPrice) priceDisplay = anyPrice;
      }

      const item = document.createElement('div');
      item.className = 'route-station-item';
      item.innerHTML = `
        <div class="rsi-left">
          <span class="rsi-icon">${brandIcon}</span>
          <div class="rsi-info">
            <div class="rsi-name">${idx + 1}. ${st.name}</div>
            <div class="rsi-dist">📍 Через ${kmFromStart} км · ${st.address}</div>
          </div>
        </div>
        <div class="rsi-right">
          <span class="rsi-queue-badge ${qMeta.badgeClass}">${qMeta.emoji} ${qMeta.text.split(' ')[0]}</span>
          <span class="rsi-price">${priceDisplay}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        haptic('light');
        map.panTo([st.lat, st.lon]);
        openDrawer(st);
      });

      listContainer.appendChild(item);
    });
  }

  // Configure Yandex Navigator Start button
  btnYandexNaviStart.href = `https://yandex.ru/maps/?rtext=${pointA.lat}%2C${pointA.lon}~${pointB.lat}%2C${pointB.lon}&rtt=auto`;

  routeSummarySheet.classList.remove('hidden');
}

// Locate User button
document.getElementById('btn-locate').addEventListener('click', () => {
  haptic('medium');
  if (!navigator.geolocation) {
    alert('Геолокация не поддерживается вашим устройством');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      userCoords = { lat: latitude, lon: longitude };
      map.setView([latitude, longitude], 15);

      if (userMarker) {
        userMarker.setLatLng([latitude, longitude]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-pin-container',
          html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(37,99,235,0.8);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
      }

      if (isRouteMode && (!pointA || pointA.label.includes('GPS'))) {
        setPointA(latitude, longitude, 'Мое местоположение (GPS)');
      }
    },
    err => {
      console.warn('Geolocation error:', err);
    },
    { enableHighAccuracy: true }
  );
});

// Refresh button
document.getElementById('btn-refresh').addEventListener('click', () => {
  haptic('medium');
  loadStationsForCity(currentCity);
});

// Auto-refresh every 60 seconds while open
setInterval(() => {
  loadStationsForCity(currentCity);
}, 60000);

// Initial load
loadStationsForCity(currentCity);
