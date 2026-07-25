"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationAcceptanceGauge = exports.inventoryStockoutsCounter = exports.apiLatencyHistogram = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prom_client_1 = __importDefault(require("prom-client"));
const auth_1 = require("./middleware/auth");
const skus_1 = __importDefault(require("./routes/skus"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const forecasting_1 = __importDefault(require("./routes/forecasting"));
const simulator_1 = __importDefault(require("./routes/simulator"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const inventory_1 = __importDefault(require("./routes/inventory"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Initialize Prometheus Default Metrics Registry
prom_client_1.default.collectDefaultMetrics({ register: prom_client_1.default.register });
// Custom Prometheus Metrics
exports.apiLatencyHistogram = new prom_client_1.default.Histogram({
    name: 'api_latency_seconds',
    help: 'HTTP request latency in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
});
exports.inventoryStockoutsCounter = new prom_client_1.default.Counter({
    name: 'inventory_stockouts',
    help: 'Total count of inventory stockout events detected',
    labelNames: ['org_id', 'sku_code']
});
exports.recommendationAcceptanceGauge = new prom_client_1.default.Gauge({
    name: 'recommendation_acceptance_rate',
    help: 'Percentage of AI reorder recommendations accepted',
    labelNames: ['org_id']
});
exports.recommendationAcceptanceGauge.set({ org_id: '11111111-1111-1111-1111-111111111111' }, 0.85);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Structured JSON Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000.0;
        exports.apiLatencyHistogram.labels(req.method, req.path, res.statusCode.toString()).observe(duration);
        // Structured JSON log stdout
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            service: 'backend-api',
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationSeconds: duration
        }));
    });
    next();
});
app.use(auth_1.authenticateToken);
// Health & Metrics Endpoints
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'InventoryAI Node.js Express Gateway' });
});
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', prom_client_1.default.register.contentType);
    res.end(await prom_client_1.default.register.metrics());
});
// API Routes
app.use('/api/skus', skus_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/forecasting', forecasting_1.default);
app.use('/api/simulator', simulator_1.default);
app.use('/api/suppliers', suppliers_1.default);
app.use('/api/inventory', inventory_1.default);
app.listen(PORT, () => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'server_start',
        port: PORT,
        message: `🚀 InventoryAI Express Gateway running on port ${PORT}`
    }));
});
