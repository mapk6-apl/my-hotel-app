import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

dotenv.config();

const migrationDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [741920261109]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const files = (await fs.readdir(migrationDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort((left, right) => left.localeCompare(right));

    for (const filename of files) {
      const applied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [filename]
      );
      if (applied.rowCount) continue;

      const sql = await fs.readFile(path.join(migrationDirectory, filename), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`Applied database migration ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [741920261109]);
    } finally {
      client.release();
      await pool.end();
    }
  }
};

runMigrations().catch((error: unknown) => {
  console.error('Database migrations failed:', error);
  process.exitCode = 1;
});
