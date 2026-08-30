// Telegram WebApp initialization
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation();
  }
}

// State
let stations = [];
let markers = [];
let currentFilter = 'ALL';
let userMarker = null;
let selectedStation = null;

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

// Initialize Leaflet Map
// Volzhsky center: [48.7858, 44.7797]
const map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([48.7858, 44.7797], 13);

// Carto Voyager tiles
const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

L.tileLayer(tileUrl, {
  maxZoom: 19,
  subdomains: 'abcd'
}).addTo(map);

// Drawer UI Elements
const drawer = document.getElementById('drawer');
const drawerClose = document.getElementById('drawer-close');
const loader = document.getElementById('loader');

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

function openDrawer(station) {
  selectedStation = station;
  haptic('light');

  const brandIcon = getBrandIcon(station.name);
  document.getElementById('station-brand-icon').textContent = brandIcon;
  document.getElementById('station-name').textContent = station.name;
  document.getElementById('station-address').textContent = station.address;

  // Fuels Grid
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

  // Navigator URL
  const navBtn = document.getElementById('btn-navigate');
  navBtn.href = `https://yandex.ru/maps/?rtext=~${station.lat}%2C${station.lon}&rtt=auto`;

  drawer.classList.add('open');
}

function closeDrawer() {
  drawer.classList.remove('open');
  selectedStation = null;
}

// Fetch Stations Data (Tries API first, then falls back to static stations.json for GitHub Pages)
async function loadStations() {
  loader.classList.remove('hidden');
  try {
    let data = null;
    try {
      const res = await fetch('./stations.json?t=' + Date.now());
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      console.warn('Fallback to /api/stations');
    }

    if (!data) {
      const res = await fetch('/api/stations');
      data = await res.json();
    }

    stations = data.stations || data || [];
    
    updateBadgeCounts();
    renderMarkers();
  } catch (err) {
    console.error('Failed to load stations:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

function updateBadgeCounts() {
  document.getElementById('count-all').textContent = stations.length;

  const countFor = (fuelType) => {
    return stations.filter(st => {
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
  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  stations.forEach(station => {
    if (!station.lat || !station.lon) return;

    const marker = createMarker(station);
    marker.addTo(map);
    markers.push({ marker, station });
  });

  updateMarkersVisibility();
}

function createMarker(station) {
  const brandIcon = getBrandIcon(station.name);
  
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="custom-pin in-stock" id="pin-${station.id}">${brandIcon}</div>`,
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
    if (!el) return;

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
  loadStations();
});

// Initial load
loadStations();
