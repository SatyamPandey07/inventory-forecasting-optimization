"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
const FASTAPI_URL = process.env.FASTAPI_ENGINE_URL || 'http://localhost:8000';
// POST /api/simulator/run - Run Monte Carlo simulation for supply chain disruption
router.post('/run', async (req, res) => {
    try {
        const { initialStock = 38, reorderPoint = 48, orderQty = 120, baseLeadTimeDays = 5, leadTimeDelayDays = 3, avgDailyDemand = 35, demandSurgePct = 20, unitCost = 35.0, simulationDays = 90 } = req.body;
        const response = await axios_1.default.post(`${FASTAPI_URL}/api/v1/simulate-scenario`, {
            initial_stock: initialStock,
            reorder_point: reorderPoint,
            order_qty: orderQty,
            base_lead_time_days: baseLeadTimeDays,
            lead_time_delay_days: leadTimeDelayDays,
            avg_daily_demand: avgDailyDemand,
            demand_surge_pct: demandSurgePct,
            unit_cost: unitCost,
            simulation_days: simulationDays
        });
        res.json(response.data);
    }
    catch (err) {
        console.error('Simulation proxy error:', err.message);
        res.status(500).json({ error: err.response?.data?.detail || err.message });
    }
});
exports.default = router;
