export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'password'>;

// DB row snake_case -> camelCase
export function mapUserRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    email: row.email as string,
    password: row.password as string,
    role: row.role as UserRole,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export function toPublicUser(user: User): PublicUser {
  const { password: _, ...publicUser } = user;
  return publicUser;
}
