"""
Parser module for fetching real-time fuel availability, prices, and queue telemetry from gas stations in Volzhsky.
"""
import re
import json
import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field, asdict
import httpx

from config import settings, FuelType

logger = logging.getLogger(__name__)


@dataclass
class FuelItem:
    fuel_type: str            # e.g. AI95, AI92, DIESEL
    name: str                 # e.g. "АИ-95", "92"
    status: str               # "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN"
    price_text: Optional[str] = None  # e.g. "58.40 ₽"
    price_value: Optional[float] = None


@dataclass
class GasStation:
    id: str
    name: str
    address: str
    lat: float
    lon: float
    chain: Optional[str] = None
    yandex_url: Optional[str] = None
    fuels: Dict[str, FuelItem] = field(default_factory=dict)
    cash_only: bool = False
    queue_status: str = "UNKNOWN"              # "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"
    signals_count_per_hour: int = 0            # Driver activity count
    fuel_limit: Optional[str] = None           # e.g. "Лимит 30 л"
    last_signal_timestamp: Optional[int] = None

    @property
    def navigator_url(self) -> str:
        return f"https://yandex.ru/maps/?rtext=~{self.lat}%2C{self.lon}&rtt=auto"

    @property
    def in_stock_fuels(self) -> List[FuelItem]:
        return [f for f in self.fuels.values() if f.status == "IN_STOCK"]

    @property
    def out_of_stock_fuels(self) -> List[FuelItem]:
        return [f for f in self.fuels.values() if f.status == "OUT_OF_STOCK"]

    @property
    def queue_label(self) -> str:
        if self.queue_status == "HIGH":
            return "🔴 Большая очередь"
        elif self.queue_status == "MEDIUM":
            return "🟡 Средняя очередь"
        elif self.queue_status == "LOW":
            return "🟢 Свободно"
        return "⚪ Обычный поток"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "lat": self.lat,
            "lon": self.lon,
            "chain": self.chain,
            "yandex_url": self.yandex_url,
            "cash_only": self.cash_only,
            "queue_status": self.queue_status,
            "queue_label": self.queue_label,
            "signals_count_per_hour": self.signals_count_per_hour,
            "fuel_limit": self.fuel_limit,
            "last_signal_timestamp": self.last_signal_timestamp,
            "fuels": {k: asdict(v) for k, v in self.fuels.items()}
        }


class VolzhskyFuelParser:
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    }

    # Map raw fuelType strings to standardized FuelType
    FUEL_MAPPING = {
        'ai92': FuelType.AI92,
        '92': FuelType.AI92,
        'аи92': FuelType.AI92,
        'аи-92': FuelType.AI92,
        
        'ai95': FuelType.AI95,
        '95': FuelType.AI95,
        'аи95': FuelType.AI95,
        'аи-95': FuelType.AI95,
        
        'ai95_premium': FuelType.AI95_PREMIUM,
        '95+': FuelType.AI95_PREMIUM,
        'аи95+': FuelType.AI95_PREMIUM,
        'аи-95+': FuelType.AI95_PREMIUM,
        'аи 95+': FuelType.AI95_PREMIUM,
        'аи-95 экто': FuelType.AI95_PREMIUM,
        
        'ai98': FuelType.AI98,
        '98': FuelType.AI98,
        'аи98': FuelType.AI98,
        'аи-98': FuelType.AI98,
        
        'ai100': FuelType.AI100,
        '100': FuelType.AI100,
        'аи100': FuelType.AI100,
        'аи-100': FuelType.AI100,
        
        'diesel': FuelType.DIESEL,
        'дт': FuelType.DIESEL,
        'дт+': FuelType.DIESEL,
        'дизель': FuelType.DIESEL,
        'diesel_premium': FuelType.DIESEL,
        
        'lpg': FuelType.LPG,
        'пропан': FuelType.LPG,
        'газ': FuelType.LPG,
        
        'methane': FuelType.METHANE,
        'метан': FuelType.METHANE,
        'cng': FuelType.METHANE,
    }

    def __init__(self):
        pass

    def _build_url(self, lon: float, lat: float, spn_lon: float = 0.28, spn_lat: float = 0.22) -> str:
        """Build Yandex Maps search URL for given coordinates."""
        return (
            f"https://yandex.ru/maps/?ll={lon}%2C{lat}"
            f"&sll={lon}%2C{lat}"
            f"&sspn={spn_lon}%2C{spn_lat}"
            f"&text=%D0%90%D0%97%D0%A1&z=12"
        )

    def _normalize_fuel_key(self, raw_key: str) -> Optional[str]:
        if not raw_key:
            return None
        cleaned = raw_key.strip().lower()
        if cleaned in self.FUEL_MAPPING:
            return self.FUEL_MAPPING[cleaned]
        for k, v in sorted(self.FUEL_MAPPING.items(), key=lambda x: len(x[0]), reverse=True):
            if k in cleaned:
                return v
        return None

    async def fetch_gas_stations(self, lat: float = None, lon: float = None, 
                                  spn_lon: float = 0.28, spn_lat: float = 0.22) -> List[GasStation]:
        """
        Fetches gas stations with availability, prices, and queues.
        If lat/lon not provided, defaults to Volzhsky coordinates.
        """
        use_lat = lat if lat is not None else settings.VOLZHSKY_LAT
        use_lon = lon if lon is not None else settings.VOLZHSKY_LON
        url = self._build_url(use_lon, use_lat, spn_lon, spn_lat)
        
        async with httpx.AsyncClient(headers=self.HEADERS, follow_redirects=True, timeout=20.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                html = response.text
            except Exception as e:
                logger.error(f"Error fetching Yandex Maps data for ({use_lat}, {use_lon}): {e}")
                return []

        match = re.search(r'class="state-view"[^>]*>([^<]+)', html)
        if not match:
            logger.warning("state-view not found in Yandex Maps response")
            return []

        try:
            data = json.loads(match.group(1))
        except Exception as e:
            logger.error(f"Error parsing state-view JSON: {e}")
            return []

        items = data.get("stack", [{}])[0].get("results", {}).get("items", [])
        stations: List[GasStation] = []

        for item in items:
            station_id = str(item.get("id") or item.get("logId") or "")
            name = (
                item.get("shortTitle") or 
                item.get("titleAndSubtitle", {}).get("title") or 
                item.get("title") or 
                item.get("name") or 
                "АЗС"
            )
            address = item.get("address") or item.get("fullAddress") or "Волжский"
            coords = item.get("coordinates") or [0.0, 0.0]
            lon, lat = coords[0], coords[1]
            
            if not station_id:
                station_id = f"st_{lat}_{lon}".replace(".", "_")

            chain_data = item.get("chain")
            chain_name = chain_data.get("name") if isinstance(chain_data, dict) else None

            # Prices from fuelInfo (MultiGo / partner feed)
            prices: Dict[str, Dict[str, Any]] = {}
            fuel_info = item.get("fuelInfo", {})
            if isinstance(fuel_info, dict):
                for p_item in fuel_info.get("items", []):
                    p_name = p_item.get("name", "")
                    norm_key = self._normalize_fuel_key(p_name)
                    if norm_key:
                        price_obj = p_item.get("price", {})
                        prices[norm_key] = {
                            "text": price_obj.get("text"),
                            "value": price_obj.get("value")
                        }

            # Availability & Queue from fuelAvailability
            fuel_dict: Dict[str, FuelItem] = {}
            fuel_avail = item.get("fuelAvailability", {})
            cash_only = False
            queue_status = "UNKNOWN"
            signals_count = 0
            fuel_limit = None
            last_ts = None

            if isinstance(fuel_avail, dict):
                cash_only = bool(fuel_avail.get("cashOnly", False))
                queue_status = str(fuel_avail.get("queueStatus") or "UNKNOWN").upper()
                signals_count = int(fuel_avail.get("signalsCountPerHour") or 0)
                fuel_limit = fuel_avail.get("localizedFuelLimit") or None
                last_ts = fuel_avail.get("lastSignalTimestamp")
                raw_fuels = fuel_avail.get("fuel", [])
                
                for f in raw_fuels:
                    raw_type = f.get("fuelType", "")
                    loc_name = f.get("localizedName") or raw_type
                    status = f.get("status", "UNKNOWN")
                    norm_key = self._normalize_fuel_key(raw_type) or self._normalize_fuel_key(loc_name)
                    
                    if norm_key:
                        price_data = prices.get(norm_key, {})
                        fuel_dict[norm_key] = FuelItem(
                            fuel_type=norm_key,
                            name=loc_name,
                            status=status,
                            price_text=price_data.get("text"),
                            price_value=price_data.get("value")
                        )

            # If no fuelAvailability object, check features list for supported fuels
            if not fuel_dict:
                for feat in item.get("features", []):
                    if feat.get("id") in ["fuel", "fuel_type", "fuel_types"]:
                        val = feat.get("value")
                        if isinstance(val, list):
                            for v in val:
                                v_id = v.get("id", "")
                                v_name = v.get("name", "")
                                norm_key = self._normalize_fuel_key(v_id) or self._normalize_fuel_key(v_name)
                                if norm_key and norm_key not in fuel_dict:
                                    price_data = prices.get(norm_key, {})
                                    fuel_dict[norm_key] = FuelItem(
                                        fuel_type=norm_key,
                                        name=v_name or norm_key,
                                        status="UNKNOWN",
                                        price_text=price_data.get("text"),
                                        price_value=price_data.get("value")
                                    )

            station = GasStation(
                id=station_id,
                name=name,
                address=address,
                lat=lat,
                lon=lon,
                chain=chain_name,
                yandex_url=f"https://yandex.ru/maps/org/{station_id}" if station_id.isdigit() else None,
                fuels=fuel_dict,
                cash_only=cash_only,
                queue_status=queue_status,
                signals_count_per_hour=signals_count,
                fuel_limit=fuel_limit,
                last_signal_timestamp=last_ts
            )
            stations.append(station)

        return stations
