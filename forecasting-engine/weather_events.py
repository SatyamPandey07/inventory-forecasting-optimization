import os
import httpx
from typing import Dict, Any, Optional

class ExternalDataEnricher:
    """
    Integrates external data sources:
    - OpenWeatherMap API for weather temperature & precipitation
    - Holiday calendar events to enrich demand forecasting models
    """

    def __init__(self):
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY", "")

    async def get_weather_forecast(self, city: str = "New York") -> Dict[str, Any]:
        if not self.weather_api_key:
            return {
                "city": city,
                "temp_celsius": 21.5,
                "humidity_pct": 55,
                "precipitation_mm": 0.0,
                "weather_condition": "Clear",
                "source": "fallback_mock"
            }

        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={self.weather_api_key}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "city": data.get("name", city),
                        "temp_celsius": data.get("main", {}).get("temp", 20.0),
                        "humidity_pct": data.get("main", {}).get("humidity", 50),
                        "precipitation_mm": data.get("rain", {}).get("1h", 0.0),
                        "weather_condition": data.get("weather", [{}])[0].get("main", "Clear"),
                        "source": "openweathermap_api"
                    }
        except Exception as e:
            pass

        return {
            "city": city,
            "temp_celsius": 22.0,
            "humidity_pct": 60,
            "precipitation_mm": 0.0,
            "weather_condition": "Mild",
            "source": "fallback_mock"
        }
