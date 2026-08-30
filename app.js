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
let selectedStation = null;

function getSavedPriorityCity() {
  const id = localStorage.getItem('priority_city_id');
  if (!id) return null;
  return CITIES_DB.find(c => c.id === id) || null;
}

// Fuel metadata
const FUEL_INFO = {
  'AI92': { name: 'АИ-92', emoji: '🟢', class: 'ai92' },
  'AI95': { name: 'АИ-95', emoji: '🔵', class: 'ai95' },
  'AI95_PREMIUM': { name: 'АИ-95+', emoji: '🔷', class: 'ai95p' },
  'AI98': { name: 'АИ-98', emoji: '🟣', class: 'ai98' },
  'AI100': { name: 'АИ-100', emoji: '🔴', class: 'ai100' },
  'DIESEL': { name: 'Дизель', emoji: '⚫', class: 'diesel' },
  'LPG': { name: 'Пропан', emoji: '🟡', class: 'lpg' },
  'METHANE': { name: 'Метан', emoji: '⚪', class: 'cng' },
};

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

// Drawer & Modal Elements
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
    if (!filterQuery && c.popular) return; // already shown in popular
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

  // Smooth fly to city
  map.flyTo(city.coords, city.zoom, { duration: 1.2 });

  loadStationsForCity(city);
}

// Filter Pills
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    haptic('medium');
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.fuel;
    updateMarkersVisibility();
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

// Load stations with smart fallback
async function loadStationsForCity(city) {
  loader.classList.remove('hidden');
  document.getElementById('loader-text').textContent = `Загрузка АЗС: ${city.name}...`;

  try {
    if (allStations.length === 0) {
      let data = null;
      try {
        const res = await fetch('./stations.json?t=' + Date.now());
        if (res.ok) data = await res.json();
      } catch (e) {
        console.warn('Fallback to /api/stations');
      }

      if (!data) {
        const res = await fetch('/api/stations');
        data = await res.json();
      }

      allStations = data.stations || data || [];
    }

    if (city.id === 'volzhsky' || city.id === 'volgograd') {
      displayedStations = allStations;
    } else {
      // Generate standard representative stations for selected Russian city
      displayedStations = generateCityStations(city);
    }

    updateBadgeCounts();
    renderMarkers();
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

  const countFor = (fuelType) => {
    return displayedStations.filter(st => {
      const f = st.fuels?.[fuelType];
      return f && f.status === 'IN_STOCK';
    }).length;
  };

  document.getElementById('count-ai95').textContent = countFor('AI95');
  document.getElementById('count-ai92').textContent = countFor('AI92');
  document.getElementById('count-ai100').textContent = countFor('AI100');
  document.getElementById('count-diesel').textContent = countFor('DIESEL');
  document.getElementById('count-ai98').textContent = countFor('AI98');
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

    if (currentFilter === 'ALL') {
      const hasAnyStock = Object.values(station.fuels || {}).some(f => f.status === 'IN_STOCK');
      el.className = `custom-pin ${hasAnyStock ? 'in-stock' : 'out-of-stock'}`;
      marker.setOpacity(1.0);
    } else {
      const fuelItem = station.fuels?.[currentFilter];
      const inStock = fuelItem && fuelItem.status === 'IN_STOCK';

      if (inStock) {
        el.className = 'custom-pin in-stock';
        marker.setOpacity(1.0);
        marker.setZIndexOffset(100);
      } else {
        el.className = 'custom-pin out-of-stock dimmed';
        marker.setOpacity(0.4);
        marker.setZIndexOffset(0);
      }
    }
  });
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

// Initial load
loadStationsForCity(currentCity);
