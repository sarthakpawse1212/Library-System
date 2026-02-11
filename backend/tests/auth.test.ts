import request from 'supertest';
import { createApp } from '../src/app';
import * as authService from '../src/services/auth.service';
import { mockAdminToken } from './helpers';

// Mock the entire auth service module
jest.mock('../src/services/auth.service');

const app = createApp();
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth API - Unit Tests (Mocked Services)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /auth/register
  test('POST /auth/register - should register user successfully', async () => {
    const mockResponse = {
      user: { 
        id: '123', 
        username: 'newuser', 
        email: 'new@test.com', 
        role: 'user' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    };

    mockedAuthService.registerUser.mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/auth/register')
      .send({ 
        username: 'newuser', 
        email: 'new@test.com', 
        password: 'password123' 
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('newuser');
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(mockedAuthService.registerUser).toHaveBeenCalledWith('newuser', 'new@test.com', 'password123');
  });

  test('POST /auth/register - should return 422 for invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'user', email: 'not-an-email', password: 'pass123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /auth/register - should return 422 for missing password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'user', email: 'test@test.com' });

    expect(res.status).toBe(422);
  });

  // POST /auth/login
  test('POST /auth/login - should login successfully', async () => {
    const mockResponse = {
      user: { 
        id: '123', 
        username: 'testuser', 
        email: 'test@test.com', 
        role: 'user' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    };

    mockedAuthService.loginUser.mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('testuser');
    expect(res.body.data.tokens).toBeDefined();
    expect(mockedAuthService.loginUser).toHaveBeenCalledWith('testuser', 'password123');
  });

  test('POST /auth/login - should return 422 for missing fields', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser' });

    expect(res.status).toBe(422);
  });

  // POST /auth/refresh
  test('POST /auth/refresh - should refresh tokens successfully', async () => {
    const mockTokens = { 
      accessToken: 'new-access-token', 
      refreshToken: 'new-refresh-token' 
    };
    
    mockedAuthService.refreshTokens.mockResolvedValue(mockTokens);

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'old-refresh-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBe('new-access-token');
    expect(mockedAuthService.refreshTokens).toHaveBeenCalledWith('old-refresh-token');
  });

  test('POST /auth/refresh - should return 422 when refreshToken is missing', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({});

    expect(res.status).toBe(422);
  });

  // POST /auth/logout
  test('POST /auth/logout - should logout successfully', async () => {
    mockedAuthService.revokeRefreshToken.mockResolvedValue();

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ refreshToken: 'token-to-revoke' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/logout/i);
  });

  test('POST /auth/logout - should return 401 without auth token', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .send({});

    expect(res.status).toBe(401);
  });
});
