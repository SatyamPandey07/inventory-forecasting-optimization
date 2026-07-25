import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import client from 'prom-client';

import { authenticateToken } from './middleware/auth';
import skusRouter from './routes/skus';
import recommendationsRouter from './routes/recommendations';
import forecastingRouter from './routes/forecasting';
import simulatorRouter from './routes/simulator';
import suppliersRouter from './routes/suppliers';
import inventoryRouter from './routes/inventory';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Prometheus Default Metrics Registry
client.collectDefaultMetrics({ register: client.register });

// Custom Prometheus Metrics
export const apiLatencyHistogram = new client.Histogram({
  name: 'api_latency_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
});

export const inventoryStockoutsCounter = new client.Counter({
  name: 'inventory_stockouts',
  help: 'Total count of inventory stockout events detected',
  labelNames: ['org_id', 'sku_code']
});

export const recommendationAcceptanceGauge = new client.Gauge({
  name: 'recommendation_acceptance_rate',
  help: 'Percentage of AI reorder recommendations accepted',
  labelNames: ['org_id']
});

recommendationAcceptanceGauge.set({ org_id: '11111111-1111-1111-1111-111111111111' }, 0.85);

app.use(cors());
app.use(express.json());

// Structured JSON Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000.0;
    apiLatencyHistogram.labels(req.method, req.path, res.statusCode.toString()).observe(duration);
    
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

app.use(authenticateToken as express.RequestHandler);

// Health & Metrics Endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'InventoryAI Node.js Express Gateway' });
});

app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// API Routes
app.use('/api/skus', skusRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/forecasting', forecastingRouter);
app.use('/api/simulator', simulatorRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/inventory', inventoryRouter);

app.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'server_start',
    port: PORT,
    message: `🚀 InventoryAI Express Gateway running on port ${PORT}`
  }));
});
