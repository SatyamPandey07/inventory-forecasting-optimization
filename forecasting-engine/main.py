from fastapi import FastAPI, HTTPException, Query, Body, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import json
import time
import logging
import redis
import uvicorn
from prometheus_client import Gauge, Histogram, generate_latest, CONTENT_TYPE_LATEST

from forecaster import ProphetDemandEngine
from optimizer import InventoryOptimizer
from simulator import ScenarioSimulator
from llm_reasoner import LLMReasoningEngine
from weather_events import ExternalDataEnricher

app = FastAPI(
    title="InventoryAI — Forecasting & Observability Engine",
    description="Python FastAPI service for Prophet forecasting, Prometheus metrics, Monte Carlo scenario simulations, and Claude LLM reasoning.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics Instrumentation
FORECAST_ACCURACY_GAUGE = Gauge(
    "forecast_accuracy",
    "Prophet forecast MAPE accuracy per SKU",
    ["sku_id"]
)
FORECAST_JOB_DURATION_HISTOGRAM = Histogram(
    "forecast_job_duration_seconds",
    "Execution duration of batch Prophet forecasting jobs in seconds"
)

# Initialize sample gauge metrics
FORECAST_ACCURACY_GAUGE.labels(sku_id="SKU-ELEC-100").set(0.952)
FORECAST_ACCURACY_GAUGE.labels(sku_id="SKU-APPL-200").set(0.933)
FORECAST_ACCURACY_GAUGE.labels(sku_id="SKU-APPA-300").set(0.956)

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

# Middleware for Structured JSON Logging
@app.middleware("http")
async def json_logging_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    print(json.dumps({
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "service": "python-forecasting",
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_seconds": round(duration, 4)
    }))
    return response

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI Engine"}

@app.get("/metrics")
def prometheus_metrics():
    """Exposes Prometheus scraper metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
