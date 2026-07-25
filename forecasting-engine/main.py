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
    title="InventoryAI — Forecasting & Scenario Planning Engine",
    description="Python FastAPI service for Prophet forecasting, Monte Carlo scenario simulations, Claude LLM reasoning, and weather signals.",
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
class ScenarioSimulateRequest(BaseModel):
    scenario_name: Optional[str] = Field("50% demand increase", example="50% demand increase")
    demand_surge_pct: Optional[float] = Field(50.0, example=50.0)
    lead_time_delay_days: Optional[int] = Field(0, example=5)
    num_trials: Optional[int] = Field(1000, example=1000)
    initial_stock: Optional[int] = Field(38, example=38)
    reorder_point: Optional[int] = Field(48, example=48)
    order_qty: Optional[int] = Field(120, example=120)
    base_lead_time_days: Optional[int] = Field(5, example=5)
    avg_daily_demand: Optional[float] = Field(35.0, example=35.0)
    unit_cost: Optional[float] = Field(35.0, example=35.0)
    simulation_days: Optional[int] = Field(90, example=90)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI Engine"}

@app.post("/scenarios/simulate")
def run_scenario_simulation(req: ScenarioSimulateRequest):
    """
    POST /scenarios/simulate
    Executes N Monte Carlo trials (default 1,000) sampling daily demand uncertainty,
    outputting total cost outcome distributions (min, max, average, p10, p50, p90, p95)
    and frequency histogram bins for UI plotting.
    Supports preset scenarios:
    - Weather scenario ("What if it rains next Saturday?")
    - Competitor scenario ("What if competitor goes out of stock?")
    - Supplier scenario ("What if supplier delays 1 week?")
    - Demand scenario ("What if demand spikes 50%?")
    """
    try:
        result = simulator.run_simulation(
            scenario_name=req.scenario_name or "Custom Scenario",
            initial_stock=req.initial_stock or 38,
            reorder_point=req.reorder_point or 48,
            order_qty=req.order_qty or 120,
            base_lead_time_days=req.base_lead_time_days or 5,
            lead_time_delay_days=req.lead_time_delay_days or 0,
            avg_daily_demand=req.avg_daily_demand or 35.0,
            demand_surge_pct=req.demand_surge_pct or 0.0,
            unit_cost=req.unit_cost or 35.0,
            simulation_days=req.simulation_days or 90,
            num_trials=req.num_trials or 1000
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
