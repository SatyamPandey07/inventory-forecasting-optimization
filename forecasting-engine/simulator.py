import numpy as np
from typing import Dict, Any, List

class ScenarioSimulator:
    """
    Monte Carlo Discrete Event Simulator for Supply Chain Inventory:
    Simulates daily stock levels, stockout risks, carrying costs, and total cost impact
    under various supply disruption and demand shock scenarios.
    """

    def run_simulation(
        self,
        initial_stock: int,
        reorder_point: int,
        order_qty: int,
        base_lead_time_days: int,
        lead_time_delay_days: int,
        avg_daily_demand: float,
        demand_surge_pct: float,
        unit_cost: float,
        holding_cost_annual_pct: float = 0.20,
        stockout_penalty_per_unit: float = 30.0,
        simulation_days: int = 90,
        num_trials: int = 1000
    ) -> Dict[str, Any]:
        """
        Runs Monte Carlo simulation across N trials over M days.
        """
        effective_lead_time = base_lead_time_days + lead_time_delay_days
        effective_demand_mean = avg_daily_demand * (1.0 + (demand_surge_pct / 100.0))
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
                # Check for arriving orders
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

                # Check if reorder trigger is hit
                pending_units = sum(qty for _, qty in pipeline_orders)
                if (stock + pending_units) <= reorder_point:
                    # Place order with simulated lead time variability
                    actual_lead_time = max(1, int(np.random.normal(effective_lead_time, 1.5)))
                    pipeline_orders.append((day + actual_lead_time, order_qty))

            carrying_cost = total_carrying_units * daily_holding_cost_per_unit
            stockout_cost = total_stockout_units * stockout_penalty_per_unit
            total_cost = carrying_cost + stockout_cost

            trial_stockouts.append(1 if total_stockout_units > 0 else 0)
            trial_stockout_units.append(total_stockout_units)
            trial_carrying_costs.append(carrying_cost)
            trial_stockout_costs.append(stockout_cost)
            trial_total_costs.append(total_cost)

        stockout_probability = float(np.mean(trial_stockouts))
        avg_stockout_units = float(np.mean(trial_stockout_units))
        avg_carrying_cost = float(np.mean(trial_carrying_costs))
        avg_stockout_cost = float(np.mean(trial_stockout_costs))
        avg_total_cost = float(np.mean(trial_total_costs))
        p95_total_cost = float(np.percentile(trial_total_costs, 95))

        return {
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
            "results": {
                "stockout_probability": round(stockout_probability, 4),
                "avg_stockout_units": round(avg_stockout_units, 1),
                "avg_carrying_cost": round(avg_carrying_cost, 2),
                "avg_stockout_cost": round(avg_stockout_cost, 2),
                "avg_total_cost": round(avg_total_cost, 2),
                "p95_worst_case_total_cost": round(p95_total_cost, 2)
            }
        }
