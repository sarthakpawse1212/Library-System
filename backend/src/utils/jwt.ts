import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtAccessPayload {
  userId: string;
  username: string;
  role: string;
}

export interface JwtRefreshPayload {
  userId: string;
  tokenId: string;
}

export function signAccessToken(payload: JwtAccessPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as SignOptions);
}

export function signRefreshToken(payload: JwtRefreshPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtAccessPayload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtRefreshPayload;
}

// Parse expiry string (e.g., '7d') to seconds for DB storage
export function expiryToMs(expiry: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return parseInt(match[1]) * units[match[2]];
}
