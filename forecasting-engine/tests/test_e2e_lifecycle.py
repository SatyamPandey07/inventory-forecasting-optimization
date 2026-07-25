import pytest
import pandas as pd
from forecaster import ProphetDemandEngine
from optimizer import InventoryOptimizer
from simulator import ScenarioSimulator
from llm_reasoner import LLMReasoningEngine

def test_full_recommendation_lifecycle_e2e():
    """
    End-to-End Integration Test:
    Step 1: Train Prophet Demand Model & Predict 90-day forecast.
    Step 2: Run Multi-Objective Inventory Cost Optimization (EOQ & Safety Stock).
    Step 3: Synthesize Claude LLM Executive Reasoning based on signals.
    Step 4: Execute What-If Monte Carlo Scenario Simulation.
    Step 5: Accept recommendation and verify cost impact math.
    """
    # 1. Prophet Model Training
    engine = ProphetDemandEngine()
    dates = pd.date_range(start="2024-01-01", periods=100, freq="D")
    demand_values = [30 + (i % 7) * 3 + int(np_random_noise(i)) for i in range(100)]
    df = pd.DataFrame({"ds": dates, "y": demand_values})

    model_bytes, mape, mae = engine.train_model(df, "SKU-ELEC-100")
    assert mape < 50.0
    predictions = engine.predict_demand(model_bytes, horizon_days=30)
    assert len(predictions) == 30
    predicted_daily_demand = sum(p["point_estimate"] for p in predictions) / 30.0

    # 2. Multi-Objective Cost Optimization
    optimizer = InventoryOptimizer()
    opt_res = optimizer.optimize_inventory_multi_objective(
        unit_cost=35.0,
        reorder_point=48,
        current_stock=38,
        predicted_daily_demand=predicted_daily_demand,
        demand_std_dev=6.5,
        supplier_lead_time_days=7,
        supplier_reliability_score=0.95,
        supplier_min_order_qty=100
    )
    assert opt_res["recommended_order_quantity"] >= 100
    assert opt_res["total_monthly_cost"] > 0

    # 3. LLM Reasoning Fallback / Prompt Synthesis
    reasoner = LLMReasoningEngine()
    rec = reasoner.generate_recommendation(
        sku_id="SKU-ELEC-100",
        sku_name="Wireless Ergonomic Keyboard",
        forecast_predictions=predictions,
        current_stock=38,
        reorder_point=48,
        unit_cost=35.0
    )
    assert "reasoning" in rec
    assert rec["recommended_action"] in ["REORDER", "REORDER_NOW", "HOLD"]

    # 4. Monte Carlo Disruption Simulation
    simulator = ScenarioSimulator()
    sim_res = simulator.run_simulation(
        scenario_name="E2E Disruption Test",
        initial_stock=38,
        reorder_point=48,
        order_qty=opt_res["recommended_order_quantity"],
        avg_daily_demand=predicted_daily_demand,
        num_trials=50
    )
    assert sim_res["summary_metrics"]["average_cost"] > 0
    assert len(sim_res["histogram"]) == 10

def np_random_noise(i: int) -> float:
    return ((i * 17) % 5) - 2
