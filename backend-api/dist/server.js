"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
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
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Global Authentication & Multi-tenancy middleware
app.use(auth_1.authenticateToken);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'InventoryAI Node.js Express Gateway' });
});
// API Routes
app.use('/api/skus', skus_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/forecasting', forecasting_1.default);
app.use('/api/simulator', simulator_1.default);
app.use('/api/suppliers', suppliers_1.default);
app.use('/api/inventory', inventory_1.default);
app.listen(PORT, () => {
    console.log(`🚀 InventoryAI Express Gateway running on port ${PORT}`);
});
