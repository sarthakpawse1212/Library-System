import { query } from '../config/database';
import { logger } from './logger';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'TOKEN_REFRESH'
  | 'BOOK_CREATE'
  | 'BOOK_UPDATE'
  | 'BOOK_DELETE'
  | 'BOOK_STATUS_CHANGE'
  | 'BOOKS_LIST';

interface AuditEntry {
  userId: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.userId,
        entry.action,
        entry.resource,
        entry.resourceId || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress || null,
      ]
    );
  } catch (err) {
    // Audit log failure should not break the main flow
    logger.error('Failed to write audit log', { error: err, entry });
  }
}
