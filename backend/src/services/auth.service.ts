import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { User, mapUserRow, toPublicUser, PublicUser } from '../models/user.model';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiryToMs,
} from '../utils/jwt';
import { AppError } from '../utils/response';
import { config } from '../config/env';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query<Record<string, unknown>>(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

async function findUserById(id: string): Promise<User | null> {
  const result = await query<Record<string, unknown>>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

async function generateTokenPair(user: User): Promise<AuthTokens> {
  const tokenId = uuidv4();

  const accessToken = signAccessToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    tokenId,
  });

  // Store refresh token in DB
  const expiresAt = new Date(Date.now() + expiryToMs(config.jwt.refreshExpiresIn));
  await query(
    `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [tokenId, user.id, refreshToken, expiresAt]
  );

  return { accessToken, refreshToken };
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  const user = await findUserByUsername(username);
  if (!user) {
    throw new AppError('Invalid username or password', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError('Invalid username or password', 401);
  }

  const tokens = await generateTokenPair(user);
  return { user: toPublicUser(user), tokens };
}

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<AuthResult> {
  // Check username uniqueness
  const existingByUsername = await findUserByUsername(username);
  if (existingByUsername) {
    throw new AppError('Username already exists', 409);
  }

  // Check email uniqueness
  const existingByEmail = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existingByEmail.rows.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = uuidv4();

  const result = await query<Record<string, unknown>>(
    `INSERT INTO users (id, username, email, password, role)
     VALUES ($1, $2, $3, $4, 'user')
     RETURNING *`,
    [id, username, email, hashedPassword]
  );

  const newUser = mapUserRow(result.rows[0]);
  const tokens = await generateTokenPair(newUser);

  return { user: toPublicUser(newUser), tokens };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Check token exists in DB and is not revoked
  const storedToken = await query<Record<string, unknown>>(
    `SELECT * FROM refresh_tokens
     WHERE id = $1 AND token = $2 AND expires_at > NOW() AND revoked = false`,
    [payload.tokenId, refreshToken]
  );

  console.log('Stored token query result:', storedToken);

  if (storedToken.rows.length === 0) {
    throw new AppError('Refresh token has been revoked or does not exist', 401);
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  // Revoke old token (rotate)
  await query(
    'UPDATE refresh_tokens SET revoked = true WHERE id = $1',
    [payload.tokenId]
  );

  // Issue new token pair
  return generateTokenPair(user);
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await query(
    'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
    [refreshToken]
  );
}
