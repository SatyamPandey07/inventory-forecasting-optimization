import math
import numpy as np
from typing import Dict, Any

class InventoryOptimizer:
    """
    Inventory Optimization Engine:
    Calculates Safety Stock (SS), Reorder Point (ROP), Economic Order Quantity (EOQ),
    and Total Cost of Inventory for targeted service levels.
    """

    SERVICE_LEVEL_Z = {
        0.90: 1.28,
        0.95: 1.645,
        0.98: 2.05,
        0.99: 2.33,
        0.999: 3.09
    }

    def optimize_sku(
        self,
        avg_daily_demand: float,
        std_daily_demand: float,
        lead_time_days: int,
        std_lead_time_days: float = 1.0,
        unit_cost: float = 50.0,
        holding_cost_annual_pct: float = 0.20, # 20% annual holding cost
        order_cost: float = 100.0,            # $100 per reorder
        stockout_penalty_per_unit: float = 25.0,
        service_level: float = 0.95
    ) -> Dict[str, Any]:
        """
        Calculates optimal inventory metrics for a given SKU and target service level.
        """
        Z = self.SERVICE_LEVEL_Z.get(service_level, 1.645)
        
        # 1. Safety Stock Calculation (considering both demand & lead time variance)
        # SS = Z * sqrt( (L * sigma_D^2) + (D^2 * sigma_L^2) )
        var_demand = std_daily_demand ** 2
        var_lead_time = std_lead_time_days ** 2
        
        safety_stock = Z * math.sqrt(
            (lead_time_days * var_demand) + ((avg_daily_demand ** 2) * var_lead_time)
        )
        safety_stock = int(math.ceil(safety_stock))

        # 2. Reorder Point (ROP) = (Average Daily Demand * Lead Time) + Safety Stock
        reorder_point = int(math.ceil((avg_daily_demand * lead_time_days) + safety_stock))

        # 3. Annual Demand (D_annual) = avg_daily_demand * 365
        annual_demand = avg_daily_demand * 365
        holding_cost_per_unit_annual = unit_cost * holding_cost_annual_pct

        # 4. Economic Order Quantity (EOQ) = sqrt((2 * D_annual * OrderCost) / HoldingCostPerUnit)
        if holding_cost_per_unit_annual > 0:
            eoq = math.sqrt((2 * annual_demand * order_cost) / holding_cost_per_unit_annual)
            eoq = int(math.ceil(eoq))
        else:
            eoq = int(math.ceil(avg_daily_demand * 30))

        # 5. Annual Cost Analysis
        annual_ordering_cost = (annual_demand / max(eoq, 1)) * order_cost
        annual_holding_cost = ((eoq / 2.0) + safety_stock) * holding_cost_per_unit_annual
        
        # Estimated stockout probability & risk cost
        stockout_prob = 1.0 - service_level
        annual_stockout_risk_cost = annual_demand * stockout_prob * stockout_penalty_per_unit
        total_annual_inventory_cost = annual_ordering_cost + annual_holding_cost + annual_stockout_risk_cost

        return {
            "service_level": service_level,
            "z_score": Z,
            "safety_stock": safety_stock,
            "reorder_point": reorder_point,
            "economic_order_quantity": eoq,
            "avg_daily_demand": round(avg_daily_demand, 2),
            "annual_demand_projected": int(round(annual_demand)),
            "cost_breakdown": {
                "annual_ordering_cost": round(annual_ordering_cost, 2),
                "annual_holding_cost": round(annual_holding_cost, 2),
                "annual_stockout_risk_cost": round(annual_stockout_risk_cost, 2),
                "total_annual_cost": round(total_annual_inventory_cost, 2)
            }
        }
