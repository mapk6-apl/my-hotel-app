import { pool, testDatabaseConnection } from './config/db.js';
import { validateProductionEnvironment } from './config/env.js';
import app from './app.js';

const port = Number(process.env.PORT || 5001);

const startServer = async (): Promise<void> => {
  validateProductionEnvironment();
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }
  await testDatabaseConnection();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Hotel API server is listening on port ${port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received; closing the HTTP server and PostgreSQL pool.`);
    server.close((error) => {
      if (error) {
        console.error('Error closing HTTP server:', error);
        process.exitCode = 1;
      }
      void pool.end().catch((poolError: unknown) => {
        console.error('Error closing PostgreSQL pool:', poolError);
        process.exitCode = 1;
      });
    });
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch(async (error: unknown) => {
  console.error('Unable to start the API server:', error);
  process.exitCode = 1;
  await pool.end().catch((poolError: unknown) => {
    console.error('Unable to close PostgreSQL pool after startup failure:', poolError);
  });
});
