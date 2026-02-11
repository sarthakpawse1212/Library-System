import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { connectDatabase, query, closeDatabase } from '../config/database';
import { logger } from '../utils/logger';

// Matches the frontend mock users (but with secure hashed passwords)
const SEED_USERS = [
  { id: uuidv4(), username: 'admin', email: 'admin@library.com', password: 'admin123', role: 'admin' },
  { id: uuidv4(), username: 'user',  email: 'user@library.com',  password: 'user123',  role: 'user'  },
];

// Matches the frontend INITIAL_BOOKS mock data
const SEED_BOOKS = [
  {
    id: uuidv4(),
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Fiction',
    status: 'available',
    publishedYear: 1925,
    description: 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.',
  },
  {
    id: uuidv4(),
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    category: 'Fiction',
    status: 'available',
    publishedYear: 1960,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town.',
  },
  {
    id: uuidv4(),
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Technology',
    status: 'available',
    publishedYear: 2008,
    description: 'A handbook of agile software craftsmanship.',
  },
  {
    id: uuidv4(),
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    category: 'Fiction',
    status: 'available',
    publishedYear: 1949,
    description: 'A dystopian social science fiction novel and cautionary tale.',
  },
  {
    id: uuidv4(),
    title: 'Design Patterns',
    author: 'Gang of Four',
    isbn: '978-0201633610',
    category: 'Technology',
    status: 'available',
    publishedYear: 1994,
    description: 'Elements of reusable object-oriented software.',
  },
  {
    id: uuidv4(),
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    isbn: '978-0135957059',
    category: 'Technology',
    status: 'available',
    publishedYear: 2019,
    description: 'Your journey to mastery in software development.',
  },
  {
    id: uuidv4(),
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    category: 'Non-Fiction',
    status: 'available',
    publishedYear: 2014,
    description: 'A brief history of humankind.',
  },
  {
    id: uuidv4(),
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '978-0062315007',
    category: 'Fiction',
    status: 'available',
    publishedYear: 1988,
    description: 'A fable about following your dream.',
  },
];

async function seed(): Promise<void> {
  await connectDatabase();

  // Check if already seeded
  const { rows } = await query<{ count: string }>('SELECT COUNT(*) as count FROM users');
  if (parseInt(rows[0].count) > 0) {
    logger.info('Database already seeded, skipping.');
    await closeDatabase();
    return;
  }

  logger.info('Seeding database...');

  // Seed users
  for (const user of SEED_USERS) {
    const hashed = await bcrypt.hash(user.password, 12);
    await query(
      `INSERT INTO users (id, username, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      [user.id, user.username, user.email, hashed, user.role]
    );
    logger.info(`Seeded user: ${user.username} (${user.role})`);
  }

  // Seed books
  for (const book of SEED_BOOKS) {
    await query(
      `INSERT INTO books (id, title, author, isbn, category, status, published_year, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (isbn) DO NOTHING`,
      [
        book.id,
        book.title,
        book.author,
        book.isbn,
        book.category,
        book.status,
        book.publishedYear,
        book.description,
      ]
    );
    logger.info(`Seeded book: ${book.title}`);
  }

  logger.info('Seeding complete!');
  await closeDatabase();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
