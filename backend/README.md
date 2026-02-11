# Library Management System — Backend API

Node.js + TypeScript REST API for the Library Management System. Built with Express, PostgreSQL, JWT authentication, RBAC, refresh token rotation, and audit logging.

---

## Project Structure

```
src/
├── config/
│   ├── database.ts      # PostgreSQL pool, query helper, transaction helper
│   └── env.ts           # Environment config (reads .env, typed constants)
├── controllers/
│   ├── auth.controller.ts   # Login, register, refresh, logout handlers
│   └── book.controller.ts   # CRUD + status handlers
├── db/
│   ├── migrations/
│   │   └── 001_init.sql     # Schema: users, books, refresh_tokens, audit_logs
│   ├── migrate.ts           # Migration runner (tracks applied migrations)
│   └── seed.ts              # Seeds demo users and books (mirrors frontend mock data)
│   └── reset.ts             # reset db data deletion
├── middleware/
│   ├── auth.ts          # JWT Bearer token verification
│   ├── rbac.ts          # Role-based access control (requireAdmin)
│   ├── validate.ts      # express-validator runner (returns 422 with field errors)
│   └── errorHandler.ts  # 404 + global error handler
├── models/
│   ├── user.model.ts    # User interface + DB row mapper
│   └── book.model.ts    # Book interface + DB row mapper + filters type
├── routes/
│   ├── auth.routes.ts   # /auth/* endpoints
│   └── book.routes.ts   # /books/* endpoints
├── services/
│   ├── auth.service.ts  # Auth business logic (login, register, refresh, revoke)
│   └── book.service.ts  # Book CRUD + filters + status management
├── utils/
│   ├── auditLog.ts      # Writes audit entries to DB (fire-and-forget safe)
│   ├── jwt.ts           # sign/verify access + refresh tokens
│   ├── logger.ts        # Winston logger (dev: colorized, prod: JSON)
│   └── response.ts      # Consistent sendSuccess / sendError + AppError
├── app.ts               # Express app factory (all middleware + routes)
└── server.ts            # HTTP server + graceful shutdown
tests/
├── helpers.ts           # Shared setup with mocks
├── auth.test.ts         # Auth route tests
└── books.test.ts        # Books route tests
```

---

## Quick Start (Docker — Recommended)

### Prerequisites
- Node.js 20+ 
- Docker desktop - Running

> Everything runs with a single command. Migration + seed happen automatically.

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd backend

# 2. Start postgres
docker compose up postgres pgadmin

# Access postgres UI here with 
HOST: library_postgres
POSTGRES_DB: library_db
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres

http://localhost:5050/


# 3. install node modules
npm install

# 4. run migrations
-> npm run migrate
-> npm run seed

# 5. start server
-> npm run dev

```

**http://localhost:3000**

**Default seed accounts:**
| Username | Password   | Role  |
|----------|------------|-------|
| admin    | admin123   | admin |
| user     | user123    | user  |

---

---

## Running Tests

```bash
# Set your local then
npm test

# With coverage report
npm run test:coverage
```

---

## API Reference

### Health Check
```
GET /health
```

---

### Authentication — `/auth`

| Method | Endpoint          | Auth Required | Body                                         |
|--------|-------------------|---------------|----------------------------------------------|
| POST   | `/auth/register`  | No            | `{ username, email, password }`              |
| POST   | `/auth/login`     | No            | `{ username, password }`                     |
| POST   | `/auth/refresh`   | No            | `{ refreshToken }`                           |
| POST   | `/auth/logout`    | Bearer token  | `{ refreshToken }` *(optional)*              |

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "username": "admin", "email": "...", "role": "admin" },
    "tokens": {
      "accessToken":  "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

---

### Books — `/books`

All book routes require a valid `Authorization: Bearer <accessToken>` header.

| Method | Endpoint                | Role    | Description                              |
|--------|-------------------------|---------|------------------------------------------|
| GET    | `/books`                | Any     | List all books (supports filters below)  |
| GET    | `/books/:id`            | Any     | Get a single book                        |
| POST   | `/books`                | Admin   | Create a new book                        |
| PUT    | `/books/:id`            | Admin   | Update a book                            |
| DELETE | `/books/:id`            | Admin   | Delete a book                            |
| PATCH  | `/books/:id/status`     | Any     | Borrow or return a book                  |

**Query filters for `GET /books`:**
```
?title=gatsby          # partial, case-insensitive
?author=orwell
?status=available      # or borrowed
?category=Fiction
```

**Create book body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "category": "Technology",
  "publishedYear": 2008,
  "description": "A handbook of agile software craftsmanship."
}
```

**Update status body:**
```json
{ "status": "borrowed", "borrowedBy": "<userId-uuid>" }
{ "status": "available" }
```

---

## Security Features

- **JWT access tokens** (15 min expiry) + **refresh token rotation** (7 day expiry)
- **Refresh tokens stored in DB** — revoked on logout or rotation
- **Bcrypt** password hashing (12 salt rounds)
- **Helmet** security headers
- **CORS** restricted to configured origin
- **Rate limiting** — 100 req/15min globally; 20 req/15min on auth routes
- **Input validation** via `express-validator` with descriptive 422 errors
- **Role-based access** (admin vs user) enforced at route level

---

## Audit Logging

Every significant action is recorded in the `audit_logs` table:

| Action               | Trigger                     |
|----------------------|-----------------------------|
| `USER_LOGIN`         | Successful login            |
| `USER_REGISTER`      | New registration            |
| `USER_LOGOUT`        | Logout                      |
| `TOKEN_REFRESH`      | Access token refreshed      |
| `BOOK_CREATE`        | Book added                  |
| `BOOK_UPDATE`        | Book fields updated         |
| `BOOK_DELETE`        | Book removed                |
| `BOOK_STATUS_CHANGE` | Book borrowed / returned    |
| `BOOKS_LIST`         | Books listing endpoint hit  |

---

## Environment Variables

| Variable                | Default                   | Description                        |
|-------------------------|---------------------------|------------------------------------|
| `PORT`                  | `3000`                    | Server port                        |
| `NODE_ENV`              | `development`             | Environment                        |
| `DB_HOST`               | `localhost`               | PostgreSQL host                    |
| `DB_PORT`               | `5432`                    | PostgreSQL port                    |
| `DB_NAME`               | `library_db`              | Database name                      |
| `DB_USER`               | `postgres`                | Database user                      |
| `DB_PASSWORD`           | `postgres`                | Database password                  |
| `DB_POOL_MIN`           | `2`                       | Min pool connections               |
| `DB_POOL_MAX`           | `10`                      | Max pool connections               |
| `JWT_ACCESS_SECRET`     | —                         | **Change in production!**          |
| `JWT_REFRESH_SECRET`    | —                         | **Change in production!**          |
| `JWT_ACCESS_EXPIRES_IN` | `15m`                     | Access token lifetime              |
| `JWT_REFRESH_EXPIRES_IN`| `7d`                      | Refresh token lifetime             |
| `CORS_ORIGIN`           | `http://localhost:5173`   | Allowed frontend origin            |
| `RATE_LIMIT_WINDOW_MS`  | `900000`                  | Rate limit window (15 min)         |
| `RATE_LIMIT_MAX`        | `100`                     | Max requests per window            |


# Close servers from Docker

docker compose down



---------------------------------- Thanks -------------------------------------