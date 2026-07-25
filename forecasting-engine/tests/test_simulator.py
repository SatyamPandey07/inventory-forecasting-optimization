import pytest
from simulator import ScenarioSimulator

def test_scenario_simulator_monte_carlo():
    sim = ScenarioSimulator()
    result = sim.run_simulation(
        scenario_name="Supplier Delay Test",
        initial_stock=38,
        reorder_point=48,
        order_qty=120,
        base_lead_time_days=5,
        lead_time_delay_days=7,
        avg_daily_demand=35.0,
        demand_surge_pct=25.0,
        num_trials=100
    )

    assert result["scenario_name"] == "Supplier Delay Test"
    assert result["num_trials"] == 100
    metrics = result["summary_metrics"]

    assert "min_cost" in metrics
    assert "max_cost" in metrics
    assert "average_cost" in metrics
    assert metrics["min_cost"] <= metrics["average_cost"] <= metrics["max_cost"]

    percentiles = metrics["percentiles"]
    assert percentiles["p10"] <= percentiles["p50"] <= percentiles["p90"] <= percentiles["p95"]

    histogram = result["histogram"]
    assert len(histogram) == 10
    total_count = sum(b["count"] for b in histogram)
    assert total_count == 100
