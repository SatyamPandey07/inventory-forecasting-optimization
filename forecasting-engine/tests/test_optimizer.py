import pytest
from optimizer import InventoryOptimizer

def test_multi_objective_optimization_basic():
    optimizer = InventoryOptimizer()
    result = optimizer.optimize_inventory_multi_objective(
        unit_cost=35.0,
        reorder_point=48,
        current_stock=38,
        predicted_daily_demand=35.0,
        demand_std_dev=8.5,
        supplier_lead_time_days=7,
        supplier_reliability_score=0.95,
        supplier_min_order_qty=1
    )

    assert "recommended_order_quantity" in result
    assert result["recommended_order_quantity"] > 0
    assert result["expected_carrying_cost_monthly"] > 0
    assert result["expected_stockout_cost_monthly"] > 0
    assert result["total_monthly_cost"] > 0
    assert result["confidence_interval_horizon_demand"]["lower_bound"] <= result["confidence_interval_horizon_demand"]["upper_bound"]

def test_supplier_min_order_qty_constraint():
    optimizer = InventoryOptimizer()
    # Calculated optimal Q is ~60, but supplier requires min_order_qty = 150
    result = optimizer.optimize_inventory_multi_objective(
        unit_cost=20.0,
        reorder_point=30,
        current_stock=25,
        predicted_daily_demand=10.0,
        demand_std_dev=2.0,
        supplier_min_order_qty=150
    )

    assert result["recommended_order_quantity"] == 150
    assert "was below supplier minimum order quantity" in result["supplier_constraints"]["constraint_notes"]

def test_extended_lead_time_urgency():
    optimizer = InventoryOptimizer()
    # Supplier lead time is 14 days, current stock (30) is below ROP
    result = optimizer.optimize_inventory_multi_objective(
        unit_cost=50.0,
        reorder_point=60,
        current_stock=30,
        predicted_daily_demand=20.0,
        demand_std_dev=5.0,
        supplier_lead_time_days=14
    )

    assert result["reorder_urgency"] == "URGENT_IMMEDIATE"
    assert "Reorder immediately today" in result["supplier_constraints"]["constraint_notes"]
