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
    description="Python FastAPI service for Prophet demand forecasting, Safety Stock / EOQ optimization, Monte Carlo simulations, and AI reasoning.",
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

# Redis Client
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.Redis.from_url(REDIS_URL)
except Exception:
    redis_client = None

# --- Schemas ---
class DemandHistoryItem(BaseModel):
    ds: str = Field(..., example="2026-04-01")
    y: float = Field(..., example=35.0)

class TrainRequest(BaseModel):
    sku_id: str = Field(..., example="33333333-3333-3333-3333-333333333333")
    org_id: str = Field(..., example="11111111-1111-1111-1111-111111111111")
    demand_history: List[DemandHistoryItem]

class PredictRequest(BaseModel):
    sku_id: str = Field(..., example="33333333-3333-3333-3333-333333333333")
    org_id: str = Field(..., example="11111111-1111-1111-1111-111111111111")
    horizon_days: Optional[int] = 90

class AccuracyRequest(BaseModel):
    actuals: List[float] = Field(..., example=[40, 42, 38, 45])
    predictions: List[float] = Field(..., example=[42, 40, 39, 44])

# --- Endpoints ---
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI Forecasting Engine"}

@app.post("/forecast/train")
def train_forecast_model(req: TrainRequest):
    """
    POST /forecast/train
    Accepts historical demand, trains Prophet model, and stores model artifact in Redis.
    """
    try:
        history_list = [item.model_dump() for item in req.demand_history]
        model_bytes, summary = engine.train(history_list)

        redis_key = f"model:{req.org_id}:{req.sku_id}"
        if redis_client:
            try:
                redis_client.set(redis_key, model_bytes)
            except Exception as e:
                pass

        return {
            "sku_id": req.sku_id,
            "org_id": req.org_id,
            "redis_key": redis_key,
            "training_summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/forecast/predict")
def predict_demand(req: PredictRequest):
    """
    GET /forecast/predict
    Returns 90-day demand predictions with lower_bound, point_estimate, upper_bound.
    """
    try:
        redis_key = f"model:{req.org_id}:{req.sku_id}"
        model_bytes = None

        if redis_client:
            try:
                model_bytes = redis_client.get(redis_key)
            except Exception:
                pass

        if not model_bytes:
            # Fallback mock demand history if model artifact isn't in Redis yet
            mock_history = [
                {"ds": f"2026-01-{(i%30)+1:02d}", "y": 35 + (i % 10)}
                for i in range(60)
            ]
            model_bytes, _ = engine.train(mock_history)

        predictions = engine.predict(model_bytes, horizon_days=req.horizon_days or 90)

        total_predicted = sum(p['point_estimate'] for p in predictions)
        avg_daily = round(total_predicted / len(predictions), 2) if predictions else 0.0

        return {
            "sku_id": req.sku_id,
            "org_id": req.org_id,
            "horizon_days": req.horizon_days or 90,
            "total_predicted_units": total_predicted,
            "avg_daily_predicted": avg_daily,
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/forecast/accuracy")
def calculate_forecast_accuracy(req: AccuracyRequest):
    """
    GET /forecast/accuracy
    Calculates MAPE (Mean Absolute Percentage Error) and MAE (Mean Absolute Error).
    """
    try:
        metrics = engine.calculate_accuracy(req.actuals, req.predictions)
        return {
            "mape": metrics["mape"],
            "mape_percentage": f"{round(metrics['mape'] * 100, 2)}%",
            "mae": metrics["mae"],
            "sample_size": len(req.actuals)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
