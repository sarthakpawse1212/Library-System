import fs from 'fs';
import path from 'path';
import { connectDatabase, query, closeDatabase } from '../config/database';
import { logger } from '../utils/logger';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  await connectDatabase();

  // Create migrations tracking table if it doesn't exist
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      run_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

  // Get already-run migrations
  const { rows: completedRows } = await query<{ name: string }>(
    'SELECT name FROM _migrations ORDER BY name'
  );
  const completed = new Set(completedRows.map((r) => r.name));

  // Read migration files sorted
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (completed.has(file)) {
      logger.info(`Skipping migration (already applied): ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    logger.info(`Running migration: ${file}`);

    await query(sql);
    await query('INSERT INTO _migrations (name) VALUES ($1)', [file]);

    logger.info(`Migration applied: ${file}`);
    ran++;
  }

  if (ran === 0) {
    logger.info('No new migrations to run');
  } else {
    logger.info(`Successfully ran ${ran} migration(s)`);
  }

  await closeDatabase();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
