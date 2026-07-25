import { Router, Response } from 'express';
import { query } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/suppliers - List all suppliers for tenant
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.orgId;
    const result = await query(
      `SELECT sup.*, COUNT(ss.sku_id) as total_skus_supplied
       FROM suppliers sup
       LEFT JOIN supplier_skus ss ON ss.supplier_id = sup.id
       WHERE sup.org_id = $1
       GROUP BY sup.id
       ORDER BY sup.name ASC`,
      [orgId]
    );

    res.json({ suppliers: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
