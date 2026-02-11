import { Request, Response, NextFunction } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookStatus,
} from '../services/book.service';
import { sendSuccess } from '../utils/response';
import { createAuditLog } from '../utils/auditLog';
import { BookFilters } from '../models/book.model';

export async function listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: BookFilters = {
      title: req.query.title as string | undefined,
      author: req.query.author as string | undefined,
      status: req.query.status as 'available' | 'borrowed' | undefined,
      category: req.query.category as string | undefined,
    };

    const books = await getAllBooks(filters);

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'BOOKS_LIST',
      resource: 'books',
      ipAddress: req.ip,
    });

    sendSuccess(res, books, 'Books retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await getBookById(req.params.id);
    sendSuccess(res, book, 'Book retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function addBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, author, isbn, category, publishedYear, description, status } = req.body;
    const book = await createBook({ title, author, isbn, category, publishedYear, description, status });

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'BOOK_CREATE',
      resource: 'books',
      resourceId: book.id,
      details: { title, isbn },
      ipAddress: req.ip,
    });

    sendSuccess(res, book, 'Book created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function editBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, author, isbn, category, publishedYear, description } = req.body;
    const book = await updateBook(req.params.id, {
      title,
      author,
      isbn,
      category,
      publishedYear,
      description,
    });

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'BOOK_UPDATE',
      resource: 'books',
      resourceId: req.params.id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });

    sendSuccess(res, book, 'Book updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function removeBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteBook(req.params.id);

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'BOOK_DELETE',
      resource: 'books',
      resourceId: req.params.id,
      ipAddress: req.ip,
    });

    sendSuccess(res, null, 'Book deleted successfully');
  } catch (err) {
    next(err);
  }
}

export async function changeBookStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, borrowedBy } = req.body;
    const book = await updateBookStatus(req.params.id, status, borrowedBy);

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'BOOK_STATUS_CHANGE',
      resource: 'books',
      resourceId: req.params.id,
      details: { status, borrowedBy },
      ipAddress: req.ip,
    });

    sendSuccess(res, book, `Book status updated to '${status}'`);
  } catch (err) {
    next(err);
  }
}
