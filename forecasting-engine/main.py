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
    title="InventoryAI — Forecasting & LLM Reasoning Engine",
    description="Python FastAPI service for Prophet forecasting, Claude API reasoning, weather signals, and inventory optimization.",
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
class LLMReasonRequest(BaseModel):
    sku_name: str = Field(..., example="Wireless Ergonomic Keyboard")
    category: str = Field(..., example="Electronics")
    current_stock: int = Field(..., example=38)
    reorder_point: int = Field(..., example=48)
    forecast_30day_units: int = Field(..., example=120)
    weather_signal: Optional[Dict[str, Any]] = None
    calendar_events: Optional[List[Dict[str, Any]]] = None
    competitor_status: Optional[Dict[str, Any]] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI Engine"}

@app.post("/recommendations/reason")
async def generate_recommendation_reasoning(req: LLMReasonRequest):
    """
    POST /recommendations/reason
    Calls Anthropic Claude API (or 1-hour Redis cache / fallback engine) to synthesize
    demand forecasts, weather, events, and competitor signals into structured reorder reasoning.
    """
    try:
        result = await llm_engine.generate_reasoning(
            sku_name=req.sku_name,
            category=req.category,
            current_stock=req.current_stock,
            reorder_point=req.reorder_point,
            forecast_30day_units=req.forecast_30day_units,
            weather_signal=req.weather_signal,
            calendar_events=req.calendar_events,
            competitor_status=req.competitor_status,
            redis_client=redis_client
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
