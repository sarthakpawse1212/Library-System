const API_BASE_URL = 'http://localhost:3000';

export const rawRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Request failed');
  }

  return response.json();
};
