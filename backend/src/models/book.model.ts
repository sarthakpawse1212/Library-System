export type BookStatus = 'available' | 'borrowed';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: BookStatus;
  publishedYear: number;
  description: string;
  borrowedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookFilters {
  title?: string;
  author?: string;
  status?: BookStatus;
  category?: string;
}

// DB row snake_case -> camelCase
export function mapBookRow(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    isbn: row.isbn as string,
    category: row.category as string,
    status: row.status as BookStatus,
    publishedYear: row.published_year as number,
    description: row.description as string,
    borrowedBy: (row.borrowed_by as string) || null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}
