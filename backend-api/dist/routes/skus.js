"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/skus - List all SKUs for the tenant
router.get('/', async (req, res) => {
    try {
        const orgId = req.orgId;
        const result = await (0, db_1.query)(`SELECT s.*, 
              COALESCE(i.units_on_hand, 0) as current_stock,
              COALESCE(i.units_on_order, 0) as units_on_order,
              sup.name as supplier_name,
              sup.reliability_score as supplier_reliability
       FROM skus s
       LEFT JOIN LATERAL (
         SELECT units_on_hand, units_on_order FROM inventory_levels 
         WHERE sku_id = s.id AND org_id = $1 ORDER BY time DESC LIMIT 1
       ) i ON TRUE
       LEFT JOIN supplier_skus ss ON ss.sku_id = s.id AND ss.is_primary = TRUE
       LEFT JOIN suppliers sup ON sup.id = ss.supplier_id
       WHERE s.org_id = $1
       ORDER BY s.name ASC`, [orgId]);
        res.json({ skus: result.rows });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/skus/:id - Get specific SKU detail with 90-day demand history
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.orgId;
        const skuResult = await (0, db_1.query)(`SELECT s.*, sup.name as supplier_name 
       FROM skus s
       LEFT JOIN supplier_skus ss ON ss.sku_id = s.id AND ss.is_primary = TRUE
       LEFT JOIN suppliers sup ON sup.id = ss.supplier_id
       WHERE s.id = $1 AND s.org_id = $2`, [id, orgId]);
        if (skuResult.rows.length === 0) {
            return res.status(404).json({ error: 'SKU not found' });
        }
        const demandHistory = await (0, db_1.query)(`SELECT time::date as ds, units_sold as y, revenue 
       FROM demand_history 
       WHERE sku_id = $1 AND org_id = $2 
       ORDER BY time ASC`, [id, orgId]);
        res.json({
            sku: skuResult.rows[0],
            demand_history: demandHistory.rows
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
