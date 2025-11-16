import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pool from './db';

// Import routes
import vehiclesRouter from './routes/vehicles';
import bookingsRouter from './routes/bookings';
import clientsRouter from './routes/clients';
import depotsRouter from './routes/depots';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app: Express = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API routes
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/depots', depotsRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'ROAVER Booking API',
    endpoints: [
      'GET /health',
      'GET /api/vehicles/search',
      'GET /api/vehicles/:id',
      'POST /api/bookings',
      'GET /api/bookings/:id',
      'GET /api/clients/:clientId/config',
      'GET /api/depots',
      'GET /api/depots/city/:city'
    ]
  });
});

export default app;