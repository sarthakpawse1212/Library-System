import { authService } from "./api";
import { getTokens } from '../lib/tokenManager';

const API_BASE_URL = 'http://localhost:3000';

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  authRequired = false
): Promise<T> => {

  const makeRequest = async (accessToken?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (authRequired && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  // Get tokens fresh each time (in case they were refreshed by another request)
  let tokens = getTokens();
  let response = await makeRequest(tokens?.accessToken);

  if (response.ok) {
    return response.json();
  }

  // Refresh flow for 401 errors
  if (response.status === 401 && authRequired) {
    // Use a shared promise to prevent multiple simultaneous refreshes
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = authService.refreshAccessToken()
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null; // Clear the promise when done
        });
    }

    try {
      const newAccessToken = await refreshPromise;
      
      // RETRY with FRESH TOKEN
      response = await makeRequest(newAccessToken);

      if (!response.ok) {
        throw new Error('Request failed after token refresh');
      }

      return response.json();
    } catch (refreshError) {
      // If refresh fails, clear tokens and redirect to login
      // (The clearTokens in refreshAccessToken will handle this)
      throw refreshError;
    }
  }

  const error = await response.json();
  throw new Error(error.message || 'Something went wrong');
};