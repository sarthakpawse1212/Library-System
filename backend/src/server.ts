import http from 'http';
import { createApp } from './app';
import { connectDatabase, closeDatabase } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  // 1. Connect to database
  await connectDatabase();

  // 2. Create Express app
  const app = createApp();

  // 3. Create HTTP server
  const server = http.createServer(app);

  // 4. Start listening
  server.listen(config.server.port, () => {
    logger.info(`Server started`, {
      port: config.server.port,
      env: config.server.nodeEnv,
    });
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        logger.error('Error closing HTTP server', { error: err.message });
        process.exit(1);
      }

      try {
        // Close database pool
        await closeDatabase();
        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (dbErr) {
        logger.error('Error during database shutdown', { error: dbErr });
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    shutdown('uncaughtException');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
