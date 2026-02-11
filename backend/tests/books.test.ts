import request from 'supertest';
import { createApp } from '../src/app';
import { mockAdminToken, mockUserToken } from './helpers';
import * as bookService from '../src/services/book.service';

// Mock the book service module
jest.mock('../src/services/book.service');

const app = createApp();
const mockedBookService = bookService as jest.Mocked<typeof bookService>;

// Use proper UUID format for test IDs (validators check this)
const MOCK_BOOK_ID = '123e4567-e89b-12d3-a456-426614174000';

const mockBook = {
  id: MOCK_BOOK_ID,
  title: 'Test Book',
  author: 'Test Author',
  isbn: '978-1234567890',
  category: 'Fiction',
  status: 'available' as const,
  publishedYear: 2020,
  description: 'A test book description',
  borrowedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Books API - Unit Tests (Mocked Services)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /books
  test('GET /books - should return books for authenticated user', async () => {
    mockedBookService.getAllBooks.mockResolvedValue([mockBook]);

    const res = await request(app)
      .get('/books')
      .set('Authorization', `Bearer ${mockUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].title).toBe('Test Book');
  });

  test('GET /books - should return 401 without authentication', async () => {
    const res = await request(app).get('/books');
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /books - should apply filters (title query param)', async () => {
    mockedBookService.getAllBooks.mockResolvedValue([mockBook]);

    const res = await request(app)
      .get('/books?title=Test')
      .set('Authorization', `Bearer ${mockUserToken}`);

    expect(res.status).toBe(200);
    expect(mockedBookService.getAllBooks).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test' })
    );
  });

  // POST /books
  test('POST /books - should create book as admin', async () => {
    mockedBookService.createBook.mockResolvedValue(mockBook);

    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({
        title: 'New Book',
        author: 'Author Name',
        isbn: '978-1234567890',
        category: 'Fiction',
        publishedYear: 2020,
        description: 'Book description',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Book');
    expect(mockedBookService.createBook).toHaveBeenCalled();
  });

  test('POST /books - should return 403 for non-admin user', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${mockUserToken}`)
      .send({
        title: 'Book',
        author: 'Author',
        isbn: '978-1234567890',
        category: 'Fiction',
        publishedYear: 2020,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test('POST /books - should return 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ title: 'Incomplete Book' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  // PUT /books/:id 
  test('PUT /books/:id - should update book as admin', async () => {
    const updatedBook = { ...mockBook, title: 'Updated Title' };
    mockedBookService.updateBook.mockResolvedValue(updatedBook);

    const res = await request(app)
      .put(`/books/${MOCK_BOOK_ID}`)
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(mockedBookService.updateBook).toHaveBeenCalledWith(
      MOCK_BOOK_ID,
      expect.objectContaining({ title: 'Updated Title' })
    );
  });

  test('PUT /books/:id - should return 403 for non-admin user', async () => {
    const res = await request(app)
      .put(`/books/${MOCK_BOOK_ID}`)
      .set('Authorization', `Bearer ${mockUserToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
  });

  test('PUT /books/:id - should return 422 for invalid UUID', async () => {
    const res = await request(app)
      .put('/books/not-a-uuid')
      .set('Authorization', `Bearer ${mockAdminToken}`)
      .send({ title: 'Title' });

    expect(res.status).toBe(422);
  });

  // DELETE /books/:id 
  test('DELETE /books/:id - should delete book as admin', async () => {
    mockedBookService.deleteBook.mockResolvedValue();

    const res = await request(app)
      .delete(`/books/${MOCK_BOOK_ID}`)
      .set('Authorization', `Bearer ${mockAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(mockedBookService.deleteBook).toHaveBeenCalledWith(MOCK_BOOK_ID);
  });

  test('DELETE /books/:id - should return 403 for non-admin user', async () => {
    const res = await request(app)
      .delete(`/books/${MOCK_BOOK_ID}`)
      .set('Authorization', `Bearer ${mockUserToken}`);

    expect(res.status).toBe(403);
  });


  test('PATCH /books/:id/status - should update status to available', async () => {
    const availableBook = { ...mockBook, status: 'available' as const, borrowedBy: null };
    mockedBookService.updateBookStatus.mockResolvedValue(availableBook);

    const res = await request(app)
      .patch(`/books/${MOCK_BOOK_ID}/status`)
      .set('Authorization', `Bearer ${mockUserToken}`)
      .send({ status: 'available' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('available');
  });

  test('PATCH /books/:id/status - should return 422 for invalid status', async () => {
    const res = await request(app)
      .patch(`/books/${MOCK_BOOK_ID}/status`)
      .set('Authorization', `Bearer ${mockUserToken}`)
      .send({ status: 'invalid-status' });

    expect(res.status).toBe(422);
  });

  test('PATCH /books/:id/status - should return 401 without auth', async () => {
    const res = await request(app)
      .patch(`/books/${MOCK_BOOK_ID}/status`)
      .send({ status: 'borrowed', borrowedBy: 'user-id' });

    expect(res.status).toBe(401);
  });
});
