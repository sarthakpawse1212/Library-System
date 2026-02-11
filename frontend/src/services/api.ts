import { Book, User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types';
import { apiRequest } from './helper';
import { getTokens, setTokens, clearTokens } from '../lib/tokenManager';
import { rawRequest } from './rawApi';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {

     const res = await apiRequest<{
      success: boolean;
      data: { user: User; tokens: AuthTokens };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!res.success) throw new Error('Invalid username or password');
    
    const { ...user } = res.data.user;
    return {
      user,
      tokens: res.data.tokens,
    };
  },

  async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {

    const res = await apiRequest<{
      success: boolean;
      data: { user: User; tokens: AuthTokens };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (!res.success) throw new Error('Registration failed');

    return {
      user: res.data.user,
      tokens: res.data.tokens,
    };
  },

  async refreshAccessToken(): Promise<string> {
    const tokens = getTokens();

    if (!tokens?.refreshToken) {
      throw new Error('No refresh token');
    }

    try {
      const res = await rawRequest<{
        success: boolean;
        data: {
          tokens: { // Backend returns tokens object
            accessToken: string;
            refreshToken: string;
          };
        };
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      });

      if (!res.success) throw new Error('Refresh failed');

      // Update BOTH tokens (backend uses rotation)
      const newTokens = res.data.tokens;
      setTokens(newTokens); // This updates localStorage AND notifies Context

      return newTokens.accessToken;
    } catch (err) {
      clearTokens(); // This clears localStorage AND notifies Context
      throw err;
    }
  }
};

export const bookService = {
  async getBooks(): Promise<Book[]> {

    const res = await apiRequest<{
      success: boolean;
      data: Book[];
    }>('/books', {}, true);
    if (!res.success) throw new Error('Failed to fetch books');
    return res.data;
  },

  async addBook(book: Omit<Book, 'id'>): Promise<Book> {

    const res = await apiRequest<{
      success: boolean;
      data: Book;
    }>(
      '/books',
      {
        method: 'POST',
        body: JSON.stringify(book),
      },
      true
    );
    if (!res.success) throw new Error('Failed to add book');
    return res.data;
  },

  async updateBook(id: string, data: Partial<Book>): Promise<Book> {

    const res = await apiRequest<{
      success: boolean;
      data: Book;
    }>(
      `/books/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      true
    );

    if (!res.success) throw new Error('Failed to update book');
    return res.data;
  },

  async deleteBook(id: string): Promise<void> {
    await apiRequest(
      `/books/${id}`,
      {
        method: 'DELETE',
      },
      true
    );
  },

  async toggleBorrow(id: string, status: 'borrowed' | 'available', userId: string): Promise<Book> {

    const res = await apiRequest<{
    success: boolean;
    data: Book;
  }>(
    `/books/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        borrowedBy: status === 'borrowed' ? userId : null,
      }),
    },
    true
  );

  return res.data;
  },
};



