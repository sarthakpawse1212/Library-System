import { AuthTokens } from '@/types';

// Event emitter for token changes
const tokenChangeCallbacks = new Set<(tokens: AuthTokens | null) => void>();

export const onTokenChange = (callback: (tokens: AuthTokens | null) => void) => {
  tokenChangeCallbacks.add(callback);
  return () => tokenChangeCallbacks.delete(callback);
};

const notifyTokenChange = (tokens: AuthTokens | null) => {
  tokenChangeCallbacks.forEach(cb => cb(tokens));
};

export const getTokens = (): AuthTokens | null => {
  const stored = localStorage.getItem('lms_tokens');
  return stored ? JSON.parse(stored) : null;
};

export const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('lms_tokens', JSON.stringify(tokens));
  notifyTokenChange(tokens);
};

export const clearTokens = (): void => {
  localStorage.removeItem('lms_tokens');
  localStorage.removeItem('lms_user');
  notifyTokenChange(null);
};