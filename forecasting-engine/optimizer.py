import math
import numpy as np
from typing import Dict, Any, Optional
from scipy.optimize import minimize_scalar

class InventoryOptimizer:
    """
    Multi-Objective Inventory Optimization Engine:
    Finds the optimal Economic Order Quantity (EOQ) and safety stock buffer
    minimizing Total Cost = Carrying Cost + Ordering Cost + Expected Stockout Cost,
    while accounting for supplier lead time reliability, forecast confidence,
    and supplier min_order_qty constraints.
    """

    SERVICE_LEVEL_Z = {
        0.90: 1.28,
        0.95: 1.645,
        0.98: 2.05,
        0.99: 2.33
    }

    def optimize_inventory_multi_objective(
        self,
        unit_cost: float,
        reorder_point: int,
        current_stock: int,
        predicted_daily_demand: float,
        demand_std_dev: float,
        forecast_horizon_days: int = 30,
        supplier_lead_time_days: int = 7,
        supplier_reliability_score: float = 0.95,
        supplier_min_order_qty: int = 1,
        carrying_cost_per_unit_month: float = 2.50,
        stockout_penalty_per_unit: float = 30.0,
        service_level: float = 0.95
    ) -> Dict[str, Any]:
        """
        Multi-objective optimization returning optimal reorder quantity and cost breakdown.
        """
        # 1. Supplier Reliability & Effective Lead Time Adjustment
        # Less reliable suppliers effectively extend expected lead time variability
        effective_lead_time = supplier_lead_time_days * (1.0 + (1.0 - supplier_reliability_score))
        
        # 2. Safety Stock & Reorder Point Calculation
        Z = self.SERVICE_LEVEL_Z.get(service_level, 1.645)
        var_demand = max(1.0, demand_std_dev ** 2)
        var_lead_time = (supplier_lead_time_days * (1.0 - supplier_reliability_score)) ** 2
        
        safety_stock = int(math.ceil(Z * math.sqrt(
            (effective_lead_time * var_demand) + ((predicted_daily_demand ** 2) * var_lead_time)
        )))

        calculated_rop = int(math.ceil((predicted_daily_demand * effective_lead_time) + safety_stock))

        # 3. Multi-Objective Cost Objective Function
        # Total Cost(Q) = Annual Holding Cost + Annual Order Setup Cost + Expected Stockout Cost
        annual_demand = predicted_daily_demand * 365.0
        annual_carrying_cost_per_unit = carrying_cost_per_unit_month * 12.0
        order_setup_cost = 100.0

        def cost_objective(Q):
            if Q <= 0:
                return 1e9
            annual_holding = ((Q / 2.0) + safety_stock) * annual_carrying_cost_per_unit
            annual_ordering = (annual_demand / Q) * order_setup_cost
            stockout_prob = 1.0 - service_level
            annual_stockout_cost = annual_demand * stockout_prob * stockout_penalty_per_unit
            return annual_holding + annual_ordering + annual_stockout_cost

        # Numerical Optimization
        res = minimize_scalar(cost_objective, bounds=(10, max(500, int(annual_demand * 0.5))), method='bounded')
        raw_optimal_q = int(math.ceil(res.x)) if res.success else int(math.ceil(math.sqrt((2 * annual_demand * order_setup_cost) / annual_carrying_cost_per_unit)))

        # 4. Supplier Constraint Evaluation (min_order_qty & lead time urgency)
        recommended_q = raw_optimal_q
        constraint_notes = []

        if supplier_min_order_qty > 1 and raw_optimal_q < supplier_min_order_qty:
            recommended_q = supplier_min_order_qty
            constraint_notes.append(
                f"Calculated optimal quantity ({raw_optimal_q} units) was below supplier minimum order quantity "
                f"({supplier_min_order_qty} units). Adjusted order quantity to {supplier_min_order_qty} units. "
                f"Consider evaluating alternative suppliers if holding cost is prohibitive."
            )

        # Lead Time Urgency Check
        reorder_urgency = "STANDARD"
        if supplier_lead_time_days >= 14 and current_stock <= calculated_rop:
            reorder_urgency = "URGENT_IMMEDIATE"
            constraint_notes.append(
                f"Supplier lead time is extended ({supplier_lead_time_days} days). "
                f"Current stock ({current_stock} units) is below calculated ROP ({calculated_rop} units). Reorder immediately today."
            )
        elif current_stock <= calculated_rop:
            reorder_urgency = "RECOMMENDED"

        # 5. Cost Breakdown
        monthly_carrying_cost = round(((recommended_q / 2.0) + safety_stock) * carrying_cost_per_unit_month, 2)
        stockout_prob = 1.0 - service_level
        expected_monthly_stockout_cost = round((predicted_daily_demand * 30.0) * stockout_prob * stockout_penalty_per_unit, 2)
        total_monthly_cost = round(monthly_carrying_cost + expected_monthly_stockout_cost, 2)

        # Confidence Interval based on demand variance
        ci_margin = int(math.ceil(1.96 * demand_std_dev * math.sqrt(forecast_horizon_days)))
        total_forecast_horizon_demand = int(round(predicted_daily_demand * forecast_horizon_days))

        return {
            "recommended_order_quantity": recommended_q,
            "raw_calculated_eoq": raw_optimal_q,
            "safety_stock": safety_stock,
            "reorder_point": calculated_rop,
            "reorder_urgency": reorder_urgency,
            "expected_carrying_cost_monthly": monthly_carrying_cost,
            "expected_stockout_cost_monthly": expected_monthly_stockout_cost,
            "total_monthly_cost": total_monthly_cost,
            "confidence_interval_horizon_demand": {
                "lower_bound": max(0, total_forecast_horizon_demand - ci_margin),
                "point_estimate": total_forecast_horizon_demand,
                "upper_bound": total_forecast_horizon_demand + ci_margin
            },
            "supplier_constraints": {
                "min_order_qty": supplier_min_order_qty,
                "effective_lead_time_days": round(effective_lead_time, 1),
                "reliability_score": supplier_reliability_score,
                "constraint_notes": " ".join(constraint_notes) if constraint_notes else "Optimal order satisfies all supplier constraints."
            }
        }
