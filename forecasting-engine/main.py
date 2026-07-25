from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import redis
import uvicorn

from forecaster import ProphetDemandEngine
from optimizer import InventoryOptimizer
from simulator import ScenarioSimulator
from llm_reasoner import LLMReasoningEngine
from weather_events import ExternalDataEnricher

app = FastAPI(
    title="InventoryAI — Forecasting & External Signals Engine",
    description="Python FastAPI service for Prophet demand forecasting, OpenWeatherMap signals, Calendar events, Competitor price tracking, and AI reasoning.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ProphetDemandEngine()
optimizer = InventoryOptimizer()
simulator = ScenarioSimulator()
llm_engine = LLMReasoningEngine()
weather_enricher = ExternalDataEnricher()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.Redis.from_url(REDIS_URL)
except Exception:
    redis_client = None

# --- Schemas ---
class CompetitorPriceEntry(BaseModel):
    sku_id: str = Field(..., example="33333333-3333-3333-3333-333333333333")
    competitor_name: str = Field(..., example="Amazon Retail")
    price: float = Field(..., example=74.99)
    source: Optional[str] = "manual_entry"

# In-memory store fallback for competitor prices
COMPETITOR_PRICES_DB = []

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI Engine"}

# --- External Signals Endpoints ---
@app.get("/signals/weather")
async def get_weather_signal(city: str = Query("New York")):
    """
    GET /signals/weather
    Fetches current weather and 5-day forecast from OpenWeatherMap.
    """
    weather_data = await weather_enricher.get_weather_forecast(city)
    return weather_data

@app.get("/signals/events")
def get_calendar_events(year: int = Query(2026), country: str = Query("US")):
    """
    GET /signals/events
    Returns upcoming public holidays and commercial retail events (Black Friday, Christmas, etc.).
    """
    events = weather_enricher.get_upcoming_events(year, country)
    return {
        "year": year,
        "country": country,
        "total_events": len(events),
        "events": events
    }

@app.get("/signals/competitor")
def get_competitor_prices(sku_id: Optional[str] = None):
    """
    GET /signals/competitor
    Returns recorded competitor pricing for SKUs.
    """
    if sku_id:
        filtered = [c for c in COMPETITOR_PRICES_DB if c.get("sku_id") == sku_id]
        return {"sku_id": sku_id, "prices": filtered}
    return {"total_records": len(COMPETITOR_PRICES_DB), "prices": COMPETITOR_PRICES_DB}

@app.post("/signals/competitor")
def record_competitor_price(entry: CompetitorPriceEntry):
    """
    POST /signals/competitor
    Records competitor pricing per SKU (supports manual entry or web unlocker ingestion).
    """
    record = entry.model_dump()
    record["recorded_at"] = "2026-07-25T17:28:00Z"
    COMPETITOR_PRICES_DB.append(record)
    return {"status": "success", "recorded": record}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
