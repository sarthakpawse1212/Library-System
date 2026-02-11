import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { Book, BookFilters, mapBookRow } from '../models/book.model';
import { AppError } from '../utils/response';

export async function getAllBooks(filters: BookFilters = {}): Promise<Book[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.title) {
    conditions.push(`title ILIKE $${paramIndex++}`);
    params.push(`%${filters.title}%`);
  }

  if (filters.author) {
    conditions.push(`author ILIKE $${paramIndex++}`);
    params.push(`%${filters.author}%`);
  }

  if (filters.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(filters.status);
  }

  if (filters.category) {
    conditions.push(`category ILIKE $${paramIndex++}`);
    params.push(`%${filters.category}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM books ${where} ORDER BY created_at DESC`;

  const result = await query<Record<string, unknown>>(sql, params);
  return result.rows.map(mapBookRow);
}

export async function getBookById(id: string): Promise<Book> {
  const result = await query<Record<string, unknown>>(
    'SELECT * FROM books WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Book not found', 404);
  }

  return mapBookRow(result.rows[0]);
}

export async function createBook(data: {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  description?: string;
  status?: string;
}): Promise<Book> {
  // Check ISBN uniqueness
  const existing = await query(
    'SELECT id FROM books WHERE isbn = $1',
    [data.isbn]
  );
  if (existing.rows.length > 0) {
    throw new AppError('A book with this ISBN already exists', 409);
  }

  const id = uuidv4();
  const result = await query<Record<string, unknown>>(
    `INSERT INTO books (id, title, author, isbn, category, status, published_year, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      data.title,
      data.author,
      data.isbn,
      data.category,
      data.status || 'available',
      data.publishedYear,
      data.description || '',
    ]
  );

  return mapBookRow(result.rows[0]);
}

export async function updateBook(
  id: string,
  data: Partial<{
    title: string;
    author: string;
    isbn: string;
    category: string;
    publishedYear: number;
    description: string;
  }>
): Promise<Book> {
  // Verify book exists
  await getBookById(id);

  // Check ISBN uniqueness if changing
  if (data.isbn) {
    const existing = await query(
      'SELECT id FROM books WHERE isbn = $1 AND id != $2',
      [data.isbn, id]
    );
    if (existing.rows.length > 0) {
      throw new AppError('A book with this ISBN already exists', 409);
    }
  }

  // Build dynamic SET clause
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  const fieldMap: Record<string, string> = {
    title: 'title',
    author: 'author',
    isbn: 'isbn',
    category: 'category',
    publishedYear: 'published_year',
    description: 'description',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key as keyof typeof data] !== undefined) {
      updates.push(`${column} = $${paramIndex++}`);
      params.push(data[key as keyof typeof data]);
    }
  }

  if (updates.length === 0) {
    throw new AppError('No fields provided for update', 400);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const result = await query<Record<string, unknown>>(
    `UPDATE books SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  return mapBookRow(result.rows[0]);
}

export async function deleteBook(id: string): Promise<void> {
  const result = await query(
    'DELETE FROM books WHERE id = $1',
    [id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Book not found', 404);
  }
}

export async function updateBookStatus(
  id: string,
  status: 'available' | 'borrowed',
  borrowedBy?: string
): Promise<Book> {
  await getBookById(id);

  const result = await query<Record<string, unknown>>(
    `UPDATE books
     SET status = $1, borrowed_by = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, status === 'borrowed' ? (borrowedBy || null) : null, id]
  );

  return mapBookRow(result.rows[0]);
}
