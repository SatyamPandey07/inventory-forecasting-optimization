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
    title="InventoryAI — Forecasting & Optimization Engine",
    description="Python FastAPI service for Prophet forecasting, multi-objective inventory optimization, Claude LLM reasoning, and weather signals.",
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
class MultiObjectiveOptimizeRequest(BaseModel):
    unit_cost: float = Field(..., example=35.0)
    reorder_point: int = Field(..., example=48)
    current_stock: int = Field(..., example=38)
    predicted_daily_demand: float = Field(..., example=35.0)
    demand_std_dev: float = Field(..., example=8.5)
    forecast_horizon_days: Optional[int] = 30
    supplier_lead_time_days: Optional[int] = 7
    supplier_reliability_score: Optional[float] = 0.95
    supplier_min_order_qty: Optional[int] = 1
    carrying_cost_per_unit_month: Optional[float] = 2.50
    stockout_penalty_per_unit: Optional[float] = 30.0
    service_level: Optional[float] = 0.95

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI Engine"}

@app.post("/optimize/inventory")
def optimize_inventory_multi_objective(req: MultiObjectiveOptimizeRequest):
    """
    POST /optimize/inventory
    Multi-objective numerical optimization minimizing total costs (carrying cost + stockout cost)
    considering supplier lead time reliability, forecast confidence, and min_order_qty constraints.
    """
    try:
        result = optimizer.optimize_inventory_multi_objective(
            unit_cost=req.unit_cost,
            reorder_point=req.reorder_point,
            current_stock=req.current_stock,
            predicted_daily_demand=req.predicted_daily_demand,
            demand_std_dev=req.demand_std_dev,
            forecast_horizon_days=req.forecast_horizon_days or 30,
            supplier_lead_time_days=req.supplier_lead_time_days or 7,
            supplier_reliability_score=req.supplier_reliability_score or 0.95,
            supplier_min_order_qty=req.supplier_min_order_qty or 1,
            carrying_cost_per_unit_month=req.carrying_cost_per_unit_month or 2.50,
            stockout_penalty_per_unit=req.stockout_penalty_per_unit or 30.0,
            service_level=req.service_level or 0.95
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
