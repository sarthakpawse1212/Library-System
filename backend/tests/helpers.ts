import jwt from 'jsonwebtoken';

// Mock the audit log utility to prevent DB writes during tests
jest.mock('../src/utils/auditLog', () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

// Generate a valid JWT for testing without hitting the database
export function generateMockToken(userId: string, username: string, role: string): string {
  const secret = process.env.JWT_ACCESS_SECRET || 'test-secret-key-at-least-32-chars';
  return jwt.sign(
    { userId, username, role },
    secret,
    { expiresIn: '1h' }
  );
}

// Pre-generated tokens for common test scenarios
export const mockAdminToken = generateMockToken('admin-id-123', 'admin', 'admin');
export const mockUserToken = generateMockToken('user-id-456', 'user', 'user');
