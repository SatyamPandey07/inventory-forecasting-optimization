import { Router, Response } from 'express';
import { query } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/recommendations - List active reorder recommendations
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.orgId;
    const result = await query(
      `SELECT r.*, 
              s.name as sku_name, s.sku_code, s.category, s.unit_cost, s.reorder_point as sku_reorder_point,
              COALESCE(i.units_on_hand, 0) as current_stock,
              sup.name as supplier_name, sup.lead_time_days
       FROM inventory_recommendations r
       JOIN skus s ON s.id = r.sku_id
       LEFT JOIN LATERAL (
         SELECT units_on_hand FROM inventory_levels 
         WHERE sku_id = s.id AND org_id = $1 ORDER BY time DESC LIMIT 1
       ) i ON TRUE
       LEFT JOIN supplier_skus ss ON ss.sku_id = s.id AND ss.is_primary = TRUE
       LEFT JOIN suppliers sup ON sup.id = ss.supplier_id
       WHERE r.org_id = $1
       ORDER BY r.created_at DESC`,
      [orgId]
    );

    res.json({ recommendations: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recommendations/:id/action - Accept or Reject recommendation
router.post('/:id/action', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accepted' or 'rejected'
    const orgId = req.orgId;
    const userId = req.userId;

    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accepted or rejected' });
    }

    const recResult = await query(
      `UPDATE inventory_recommendations 
       SET status = $1, accepted_at = NOW() 
       WHERE id = $2 AND org_id = $3 
       RETURNING *`,
      [action, id, orgId]
    );

    if (recResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    const rec = recResult.rows[0];

    // Log decision audit trail
    await query(
      `INSERT INTO decision_history (org_id, sku_id, decision_type, old_value, new_value, reason, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        orgId,
        rec.sku_id,
        `RECOMMENDATION_${action.toUpperCase()}`,
        'pending',
        action,
        rec.reason,
        userId
      ]
    );

    res.json({ success: true, recommendation: rec });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
