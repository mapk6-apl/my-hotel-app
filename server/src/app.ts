import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import { validateProductionEnvironment } from './config/env.js';
import bookingRoutes from './routes/bookingRoutes.js';
import favouriteRoutes from './routes/favouriteRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';

declare module 'node:http' {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

dotenv.config();

const app: Express = express();
const production = process.env.NODE_ENV === 'production';
app.set('trust proxy', production ? 1 : false);

const configuredOrigins = process.env.CLIENT_URL || (production ? '' : 'http://localhost:5173');
const allowedClientOrigins = new Set(
  configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => new URL(origin).origin)
);
if (!production) allowedClientOrigins.add('http://127.0.0.1:5173');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedClientOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Request origin is not allowed by the CORS policy.'));
  },
  credentials: true,
}));
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  },
}));

app.get('/', (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    message: 'Welcome to Break-Away Hotels & Resorts API',
    status: 'online',
    endpoints: {
      hotels: `${baseUrl}/api/hotels`,
      auth: `${baseUrl}/api/auth`,
      bookings: `${baseUrl}/api/bookings`,
      favorites: `${baseUrl}/api/favorites`,
      health: `${baseUrl}/health`,
    },
  });
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check could not reach PostgreSQL:', error);
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check could not reach PostgreSQL:', error);
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.use('/api/hotels', hotelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favouriteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error.message === 'Request origin is not allowed by the CORS policy.') {
    res.status(403).json({ error: 'Request origin is not allowed.' });
    return;
  }
  console.error('Unhandled server error:', error.stack || error.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred.',
  });
});

export const validateAppEnvironment = (): void => {
  if (production) validateProductionEnvironment();
};

export default app;
