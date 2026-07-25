import numpy as np
from typing import Dict, Any, List, Optional

class ScenarioSimulator:
    """
    Monte Carlo Discrete Event Simulator for Supply Chain Inventory & Scenario Analysis:
    Simulates daily inventory stock levels, stockout probabilities, carrying costs, and total cost outcomes
    under demand shocks, weather shifts, competitor stockouts, and supplier lead time delays across N trials.
    """

    def run_simulation(
        self,
        scenario_name: str = "Base Case",
        initial_stock: int = 38,
        reorder_point: int = 48,
        order_qty: int = 120,
        base_lead_time_days: int = 5,
        lead_time_delay_days: int = 0,
        avg_daily_demand: float = 35.0,
        demand_surge_pct: float = 0.0,
        unit_cost: float = 35.0,
        holding_cost_annual_pct: float = 0.20,
        stockout_penalty_per_unit: float = 30.0,
        simulation_days: int = 90,
        num_trials: int = 1000
    ) -> Dict[str, Any]:
        """
        Runs Monte Carlo simulation across N trials over M days.
        Returns outcome distribution, percentiles (p10, p50, p90, p95), and histogram visualization bins.
        """
        effective_lead_time = max(1, base_lead_time_days + lead_time_delay_days)
        effective_demand_mean = max(1.0, avg_daily_demand * (1.0 + (demand_surge_pct / 100.0)))
        demand_std = max(2.0, effective_demand_mean * 0.25)
        daily_holding_cost_per_unit = (unit_cost * holding_cost_annual_pct) / 365.0

        trial_stockouts = []
        trial_stockout_units = []
        trial_carrying_costs = []
        trial_stockout_costs = []
        trial_total_costs = []

        for _ in range(num_trials):
            stock = initial_stock
            pipeline_orders = [] # list of (arrival_day, qty)
            total_stockout_units = 0
            total_carrying_units = 0

            for day in range(1, simulation_days + 1):
                # Arrive orders
                arrived_qty = sum(qty for arrival_day, qty in pipeline_orders if arrival_day == day)
                stock += arrived_qty
                pipeline_orders = [(arr, qty) for arr, qty in pipeline_orders if arr > day]

                # Sample daily demand from normal distribution
                daily_demand = max(0, int(np.random.normal(effective_demand_mean, demand_std)))

                # Fulfill demand
                if stock >= daily_demand:
                    stock -= daily_demand
                else:
                    unfulfilled = daily_demand - stock
                    total_stockout_units += unfulfilled
                    stock = 0

                total_carrying_units += stock

                # Check reorder trigger
                pending_units = sum(qty for _, qty in pipeline_orders)
                if (stock + pending_units) <= reorder_point:
                    actual_lead_time = max(1, int(np.random.normal(effective_lead_time, 1.2)))
                    pipeline_orders.append((day + actual_lead_time, order_qty))

            carrying_cost = total_carrying_units * daily_holding_cost_per_unit
            stockout_cost = total_stockout_units * stockout_penalty_per_unit
            total_cost = carrying_cost + stockout_cost

            trial_stockouts.append(1 if total_stockout_units > 0 else 0)
            trial_stockout_units.append(total_stockout_units)
            trial_carrying_costs.append(carrying_cost)
            trial_stockout_costs.append(stockout_cost)
            trial_total_costs.append(total_cost)

        costs_arr = np.array(trial_total_costs)

        # Percentile calculations
        min_cost = float(np.min(costs_arr))
        max_cost = float(np.max(costs_arr))
        avg_cost = float(np.mean(costs_arr))
        p10_cost = float(np.percentile(costs_arr, 10))
        p50_cost = float(np.percentile(costs_arr, 50))
        p90_cost = float(np.percentile(costs_arr, 90))
        p95_cost = float(np.percentile(costs_arr, 95))

        # Build Histogram Bins (10 frequency bins for frontend plotting)
        counts, bin_edges = np.histogram(costs_arr, bins=10)
        bin_centers = [(bin_edges[i] + bin_edges[i+1]) / 2.0 for i in range(len(counts))]
        histogram_bins = [
            {
                "bin_start": round(float(bin_edges[i]), 2),
                "bin_end": round(float(bin_edges[i+1]), 2),
                "bin_center": round(float(bin_centers[i]), 2),
                "count": int(counts[i])
            }
            for i in range(len(counts))
        ]

        return {
            "scenario_name": scenario_name,
            "simulation_days": simulation_days,
            "num_trials": num_trials,
            "parameters": {
                "initial_stock": initial_stock,
                "reorder_point": reorder_point,
                "order_qty": order_qty,
                "effective_lead_time_days": effective_lead_time,
                "effective_avg_demand": round(effective_demand_mean, 2),
                "demand_surge_pct": demand_surge_pct,
                "lead_time_delay_days": lead_time_delay_days
            },
            "summary_metrics": {
                "stockout_probability": round(float(np.mean(trial_stockouts)), 4),
                "avg_stockout_units": round(float(np.mean(trial_stockout_units)), 1),
                "avg_carrying_cost": round(float(np.mean(trial_carrying_costs)), 2),
                "avg_stockout_cost": round(float(np.mean(trial_stockout_costs)), 2),
                "min_cost": round(min_cost, 2),
                "max_cost": round(max_cost, 2),
                "average_cost": round(avg_cost, 2),
                "percentiles": {
                    "p10": round(p10_cost, 2),
                    "p50": round(p50_cost, 2), # Median cost
                    "p90": round(p90_cost, 2),
                    "p95": round(p95_cost, 2)  # Worst case 95%
                }
            },
            "histogram": histogram_bins
        }
