import os
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

class ExternalDataEnricher:
    """
    External Signals Enricher:
    - OpenWeatherMap Weather Data (Current & 5-day forecast)
    - Public Holidays & Commercial Events (Black Friday, Cyber Monday, Christmas, Back-to-School)
    - Competitor Price Tracking Stubs & Manual Entry Handlers
    """

    def __init__(self):
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY", "")

    async def get_weather_forecast(self, city: str = "New York") -> Dict[str, Any]:
        """
        Fetches current weather and 5-day forecast from OpenWeatherMap (free tier).
        Falls back to realistic synthetic data if API key is not configured.
        """
        if not self.weather_api_key:
            return {
                "city": city,
                "current": {
                    "temp_celsius": 21.5,
                    "humidity_pct": 55,
                    "precipitation_mm": 0.0,
                    "condition": "Clear"
                },
                "forecast_5day": [
                    {"date": (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d'), "temp_celsius": 20.0 + i, "condition": "Sunny"}
                    for i in range(1, 6)
                ],
                "source": "mock_fallback"
            }

        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={self.weather_api_key}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    city_name = data.get("city", {}).get("name", city)
                    list_items = data.get("list", [])
                    
                    current_item = list_items[0] if list_items else {}
                    forecast_list = []
                    for item in list_items[::8]: # Sample every 24 hours (8 * 3h = 24h)
                        forecast_list.append({
                            "date": item.get("dt_txt", "").split(" ")[0],
                            "temp_celsius": item.get("main", {}).get("temp", 20.0),
                            "humidity_pct": item.get("main", {}).get("humidity", 50),
                            "condition": item.get("weather", [{}])[0].get("main", "Clear")
                        })

                    return {
                        "city": city_name,
                        "current": {
                            "temp_celsius": current_item.get("main", {}).get("temp", 20.0),
                            "humidity_pct": current_item.get("main", {}).get("humidity", 50),
                            "precipitation_mm": current_item.get("rain", {}).get("3h", 0.0),
                            "condition": current_item.get("weather", [{}])[0].get("main", "Clear")
                        },
                        "forecast_5day": forecast_list,
                        "source": "openweathermap_api"
                    }
        except Exception:
            pass

        return {
            "city": city,
            "current": {"temp_celsius": 22.0, "humidity_pct": 60, "precipitation_mm": 0.0, "condition": "Mild"},
            "forecast_5day": [],
            "source": "mock_fallback"
        }

    def get_upcoming_events(self, year: int = 2026, country_code: str = "US") -> List[Dict[str, Any]]:
        """
        Returns major public holidays and commercial retail events for a given year.
        """
        events = [
            {"event_date": f"{year}-01-01", "event_name": "New Year's Day", "category": "public_holiday"},
            {"event_date": f"{year}-07-04", "event_name": "Independence Day", "category": "public_holiday"},
            {"event_date": f"{year}-08-15", "event_name": "Back-to-School Season Start", "category": "commercial_event"},
            {"event_date": f"{year}-11-27", "event_name": "Black Friday", "category": "commercial_event"},
            {"event_date": f"{year}-11-30", "event_name": "Cyber Monday", "category": "commercial_event"},
            {"event_date": f"{year}-12-25", "event_name": "Christmas Day", "category": "public_holiday"}
        ]
        return events
