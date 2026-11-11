import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.HOTEL_DATABASE_URL || process.env.DATABASE_URL,
  max: process.env.VERCEL ? 1 : 20,
  idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (error: Error) => {
  console.error('Unexpected error on idle PostgreSQL client:', error);
});

export const testDatabaseConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully at:', result.rows[0].now);
  } finally {
    client.release();
  }
};
