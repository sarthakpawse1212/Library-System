import { connectDatabase, query, closeDatabase } from '../config/database';
import { logger } from '../utils/logger';

async function resetDatabase(): Promise<void> {
  logger.warn('⚠️  RESETTING DATABASE (ALL DATA WILL BE LOST)');

  await connectDatabase();

  // Drop and recreate public schema
  await query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
  `);

  logger.info('Database schema reset successfully');

  await closeDatabase();
}

resetDatabase().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
