import { Router, Response } from 'express';
import axios from 'axios';
import { query } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const FASTAPI_URL = process.env.FASTAPI_ENGINE_URL || 'http://localhost:8000';

// POST /api/forecasting/generate - Generate 30-day forecast for a given SKU
router.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { skuId, horizonDays = 30 } = req.body;
    const orgId = req.orgId;

    if (!skuId) {
      return res.status(400).json({ error: 'skuId is required' });
    }

    // Fetch demand history for the SKU from TimescaleDB
    const demandResult = await query(
      `SELECT time::date as ds, units_sold as y 
       FROM demand_history 
       WHERE sku_id = $1 AND org_id = $2 
       ORDER BY time ASC`,
      [skuId, orgId]
    );

    if (demandResult.rows.length === 0) {
      return res.status(400).json({ error: 'No historical demand data found for this SKU.' });
    }

    // Call Python FastAPI engine
    const response = await axios.post(`${FASTAPI_URL}/api/v1/forecast`, {
      history: demandResult.rows,
      horizon_days: horizonDays
    });

    res.json(response.data);
  } catch (err: any) {
    console.error('Error proxying to FastAPI forecaster:', err.message);
    res.status(500).json({ error: err.response?.data?.detail || err.message });
  }
});

// POST /api/forecasting/optimize - Calculate Safety Stock, ROP, EOQ for a SKU
router.post('/optimize', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { skuId, serviceLevel = 0.95 } = req.body;
    const orgId = req.orgId;

    const skuResult = await query(
      `SELECT s.*, sup.name as supplier_name, sup.lead_time_days 
       FROM skus s
       LEFT JOIN supplier_skus ss ON ss.sku_id = s.id AND ss.is_primary = TRUE
       LEFT JOIN suppliers sup ON sup.id = ss.supplier_id
       WHERE s.id = $1 AND s.org_id = $2`,
      [skuId, orgId]
    );

    if (skuResult.rows.length === 0) {
      return res.status(404).json({ error: 'SKU not found' });
    }

    const sku = skuResult.rows[0];

    // Compute average & standard deviation of demand
    const statsResult = await query(
      `SELECT AVG(units_sold) as avg_demand, STDDEV(units_sold) as std_demand 
       FROM demand_history 
       WHERE sku_id = $1 AND org_id = $2`,
      [skuId, orgId]
    );

    const avgDemand = parseFloat(statsResult.rows[0].avg_demand || '35.0');
    const stdDemand = parseFloat(statsResult.rows[0].std_demand || '8.5');

    const response = await axios.post(`${FASTAPI_URL}/api/v1/optimize`, {
      avg_daily_demand: avgDemand,
      std_daily_demand: stdDemand,
      lead_time_days: sku.lead_time_days || 7,
      unit_cost: parseFloat(sku.unit_cost),
      service_level: serviceLevel
    });

    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
