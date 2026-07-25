"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/suppliers - List all suppliers for tenant
router.get('/', async (req, res) => {
    try {
        const orgId = req.orgId;
        const result = await (0, db_1.query)(`SELECT sup.*, COUNT(ss.sku_id) as total_skus_supplied
       FROM suppliers sup
       LEFT JOIN supplier_skus ss ON ss.supplier_id = sup.id
       WHERE sup.org_id = $1
       GROUP BY sup.id
       ORDER BY sup.name ASC`, [orgId]);
        res.json({ suppliers: result.rows });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
