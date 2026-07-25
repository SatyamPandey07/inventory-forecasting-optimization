import { Router, Response } from 'express';
import { query } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory/summary - Executive KPI summary metrics
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.orgId;

    // Total SKUs count
    const skuCountRes = await query(`SELECT COUNT(*) FROM skus WHERE org_id = $1`, [orgId]);
    
    // Active recommendations count
    const recCountRes = await query(
      `SELECT COUNT(*) FROM inventory_recommendations WHERE org_id = $1 AND status = 'pending'`,
      [orgId]
    );

    // Stockout risk count (SKUs where current_stock <= reorder_point)
    const stockoutRiskRes = await query(
      `SELECT COUNT(DISTINCT s.id) 
       FROM skus s
       LEFT JOIN LATERAL (
         SELECT units_on_hand FROM inventory_levels 
         WHERE sku_id = s.id AND org_id = $1 ORDER BY time DESC LIMIT 1
       ) i ON TRUE
       WHERE s.org_id = $1 AND COALESCE(i.units_on_hand, 0) <= s.reorder_point`,
      [orgId]
    );

    // 30-Day Demand Projected Total Revenue
    const demandRes = await query(
      `SELECT SUM(revenue) as total_revenue, SUM(units_sold) as total_units 
       FROM demand_history 
       WHERE org_id = $1 AND time >= NOW() - INTERVAL '30 days'`,
      [orgId]
    );

    res.json({
      summary: {
        total_skus: parseInt(skuCountRes.rows[0].count, 10),
        pending_recommendations: parseInt(recCountRes.rows[0].count, 10),
        stockout_risk_count: parseInt(stockoutRiskRes.rows[0].count, 10),
        past_30_days_units_sold: parseInt(demandRes.rows[0].total_units || '0', 10),
        past_30_days_revenue: parseFloat(demandRes.rows[0].total_revenue || '0.0')
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
