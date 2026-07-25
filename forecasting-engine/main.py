from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn

from forecaster import DemandForecaster
from optimizer import InventoryOptimizer
from simulator import ScenarioSimulator
from llm_reasoner import LLMReasoningEngine
from weather_events import ExternalDataEnricher

app = FastAPI(
    title="InventoryAI — Forecasting & Optimization Engine",
    description="Python FastAPI engine for Prophet demand forecasting, Safety Stock / EOQ optimization, Monte Carlo simulations, and AI reasoning.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

forecaster = DemandForecaster(use_prophet=True)
optimizer = InventoryOptimizer()
simulator = ScenarioSimulator()
llm_engine = LLMReasoningEngine()
weather_enricher = ExternalDataEnricher()

# --- Request / Response Models ---
class DemandHistoryItem(BaseModel):
    ds: str = Field(..., example="2026-04-01")
    y: float = Field(..., example=35.0)

class ForecastRequest(BaseModel):
    history: List[DemandHistoryItem]
    horizon_days: Optional[int] = 30

class OptimizeRequest(BaseModel):
    avg_daily_demand: float = Field(..., example=35.0)
    std_daily_demand: float = Field(..., example=8.5)
    lead_time_days: int = Field(..., example=5)
    std_lead_time_days: Optional[float] = 1.0
    unit_cost: float = Field(..., example=35.0)
    holding_cost_annual_pct: Optional[float] = 0.20
    order_cost: Optional[float] = 100.0
    service_level: Optional[float] = 0.95

class SimulateRequest(BaseModel):
    initial_stock: int = Field(..., example=38)
    reorder_point: int = Field(..., example=48)
    order_qty: int = Field(..., example=120)
    base_lead_time_days: int = Field(..., example=5)
    lead_time_delay_days: int = Field(..., example=3)
    avg_daily_demand: float = Field(..., example=35.0)
    demand_surge_pct: float = Field(..., example=20.0)
    unit_cost: float = Field(..., example=35.0)
    simulation_days: Optional[int] = 90

class ExplainRequest(BaseModel):
    sku_name: str
    category: str
    current_stock: int
    reorder_point: int
    recommended_qty: int
    safety_stock: int
    lead_time_days: int
    supplier_name: str
    scenario_name: Optional[str] = "base_case"

# --- API Endpoints ---
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FastAPI Forecasting Engine"}

@app.post("/api/v1/forecast")
def generate_forecast(req: ForecastRequest):
    try:
        history_dicts = [item.model_dump() for item in req.history]
        result = forecaster.forecast(history_dicts, horizon_days=req.horizon_days)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/optimize")
def optimize_inventory(req: OptimizeRequest):
    try:
        result = optimizer.optimize_sku(
            avg_daily_demand=req.avg_daily_demand,
            std_daily_demand=req.std_daily_demand,
            lead_time_days=req.lead_time_days,
            std_lead_time_days=req.std_lead_time_days or 1.0,
            unit_cost=req.unit_cost,
            holding_cost_annual_pct=req.holding_cost_annual_pct or 0.20,
            order_cost=req.order_cost or 100.0,
            service_level=req.service_level or 0.95
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/simulate-scenario")
def run_scenario_simulation(req: SimulateRequest):
    try:
        result = simulator.run_simulation(
            initial_stock=req.initial_stock,
            reorder_point=req.reorder_point,
            order_qty=req.order_qty,
            base_lead_time_days=req.base_lead_time_days,
            lead_time_delay_days=req.lead_time_delay_days,
            avg_daily_demand=req.avg_daily_demand,
            demand_surge_pct=req.demand_surge_pct,
            unit_cost=req.unit_cost,
            simulation_days=req.simulation_days or 90
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/explain-recommendation")
async def explain_recommendation(req: ExplainRequest):
    try:
        explanation = await llm_engine.explain_recommendation(
            sku_name=req.sku_name,
            category=req.category,
            current_stock=req.current_stock,
            reorder_point=req.reorder_point,
            recommended_qty=req.recommended_qty,
            safety_stock=req.safety_stock,
            lead_time_days=req.lead_time_days,
            supplier_name=req.supplier_name,
            scenario_name=req.scenario_name or "base_case"
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v1/weather")
async def get_weather(city: str = Query("New York")):
    weather = await weather_enricher.get_weather_forecast(city)
    return weather

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
