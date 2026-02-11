import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

let pool: Pool;

export function createPool(): Pool {
  pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.user,
    password: config.db.password,
    min: config.db.poolMin,
    max: config.db.poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    logger.error('Unexpected database pool error', { error: err.message });
  });

  pool.on('connect', () => {
    logger.debug('New database connection established');
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) throw new Error('Database pool not initialized. Call createPool() first.');
  return pool;
}

// Typed query helper
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await getPool().query<T>(text, params);
  const duration = Date.now() - start;

  logger.debug('Executed query', { text, duration, rows: result.rowCount });
  return result;
}

// Transaction helper
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function connectDatabase(): Promise<void> {
  createPool();
  // Test connection
  const client = await getPool().connect();
  try {
    await client.query('SELECT NOW()');
    logger.info('Database connection established successfully');
  } finally {
    client.release();
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
}
