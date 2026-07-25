import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

app.use(cors());
app.use(express.json());

// Global Authentication & Multi-tenancy middleware
app.use(authenticateToken as express.RequestHandler);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'InventoryAI Node.js Express Gateway' });
});

// API Routes
app.use('/api/skus', skusRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/forecasting', forecastingRouter);
app.use('/api/simulator', simulatorRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/inventory', inventoryRouter);

app.listen(PORT, () => {
  console.log(`🚀 InventoryAI Express Gateway running on port ${PORT}`);
});
