import { Router } from 'express';
import {
  listBooks,
  getBook,
  addBook,
  editBook,
  removeBook,
  changeBookStatus,
} from '../controllers/book.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createBookValidator,
  updateBookValidator,
  bookIdValidator,
  updateStatusValidator,
  bookQueryValidator,
} from '../validators/book.validator';

const router = Router();

// All book routes require authentication
router.use(authenticate);

// GET /books  — any authenticated user
router.get('/', validate(bookQueryValidator), listBooks);

// GET /books/:id — any authenticated user
router.get('/:id', validate(bookIdValidator), getBook);

// POST /books — admin only
router.post('/', requireAdmin, validate(createBookValidator), addBook);

// PUT /books/:id — admin only
router.put('/:id', requireAdmin, validate(updateBookValidator), editBook);

// DELETE /books/:id — admin only
router.delete('/:id', requireAdmin, validate(bookIdValidator), removeBook);

// PATCH /books/:id/status — any authenticated user (borrow/return)
router.patch('/:id/status', validate(updateStatusValidator), changeBookStatus);

export default router;
