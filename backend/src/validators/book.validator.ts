import { body, param, query } from 'express-validator';

const CURRENT_YEAR = new Date().getFullYear();

export const createBookValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),

  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ max: 255 }).withMessage('Author must not exceed 255 characters'),

  body('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required')
    .isLength({ max: 20 }).withMessage('ISBN must not exceed 20 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),

  body('publishedYear')
    .notEmpty().withMessage('Published year is required')
    .isInt({ min: 1000, max: CURRENT_YEAR }).withMessage(`Published year must be between 1000 and ${CURRENT_YEAR}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(['available', 'borrowed']).withMessage("Status must be 'available' or 'borrowed'"),
];

export const updateBookValidator = [
  param('id')
    .isUUID().withMessage('Invalid book ID format'),

  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),

  body('author')
    .optional()
    .trim()
    .notEmpty().withMessage('Author cannot be empty')
    .isLength({ max: 255 }).withMessage('Author must not exceed 255 characters'),

  body('isbn')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('ISBN must not exceed 20 characters'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),

  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: CURRENT_YEAR }).withMessage(`Published year must be between 1000 and ${CURRENT_YEAR}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
];

export const bookIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid book ID format'),
];

export const updateStatusValidator = [
  param('id')
    .isUUID().withMessage('Invalid book ID format'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['available', 'borrowed']).withMessage("Status must be 'available' or 'borrowed'"),

  body('borrowedBy')
    .if(body('status').equals('borrowed'))
    .notEmpty().withMessage('borrowedBy is required when status is borrowed')
    .isUUID().withMessage('borrowedBy must be a valid UUID'),
];

export const bookQueryValidator = [
  query('title').optional().trim().isLength({ max: 100 }),
  query('author').optional().trim().isLength({ max: 100 }),
  query('status').optional().isIn(['available', 'borrowed']).withMessage("Status must be 'available' or 'borrowed'"),
  query('category').optional().trim().isLength({ max: 100 }),
];
