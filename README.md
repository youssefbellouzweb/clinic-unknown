# Multi-Tenant Clinic Management SaaS (MVP)

A production-ready, multi-tenant SaaS backend for clinic management, built with Express.js and SQLite3.

## Features

- **Multi-Tenancy**: Row-level isolation using `clinic_id`.
- **Authentication**: JWT access tokens + HTTP-only refresh cookies.
- **RBAC**: Role-based access control (Owner, Doctor, Nurse, Reception, Patient, Super Admin).
- **Security**: Helmet headers, Rate limiting, Input validation (Zod), XSS sanitization.
- **Logging**: Structured JSON logging with Pino.
- **Audit Trails**: Comprehensive audit logging for all mutations.
- **Public Directory**: SEO-friendly clinic search and profiles.

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: SQLite3 (using `better-sqlite3` for performance)
- **Validation**: Zod
- **Logging**: Pino
- **Documentation**: OpenAPI v3 + Swagger UI

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
4. Initialize Database:
   ```bash
   npm run seed
   ```
   *This creates `clinic.db` and populates it with sample data.*

### Running the Server

- **Development**:
  ```bash
  npm run dev
  ```
  Server runs on `http://localhost:5000`.

- **Production**:
  ```bash
  npm start
  ```

### Docker

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## API Documentation

Interactive API documentation is available at:
`http://localhost:5000/docs`

## Architecture

### Directory Structure

```
backend/
├── config/         # Database and schema configuration
├── controllers/    # Request handlers
├── middleware/     # Auth, RBAC, Logging, Security
├── routes/         # API route definitions
├── services/       # Business logic
├── utils/          # Helpers (Logger, Validators)
├── tests/          # Unit and Integration tests
└── server.js       # Entry point
```

### Database Migration

The MVP uses SQLite for simplicity. To migrate to PostgreSQL for scale:

1. Replace `better-sqlite3` with `pg` or an ORM like Prisma/Knex.
2. Update `config/db.js` to connect to Postgres.
3. Convert `config/schema.sql` to Postgres syntax (mostly compatible, change `INTEGER PRIMARY KEY AUTOINCREMENT` to `SERIAL PRIMARY KEY`).
4. Use a migration tool (e.g., `db-migrate`) instead of raw SQL execution.

## Security

- **JWT**: Short-lived access tokens (15m).
- **Refresh Tokens**: Long-lived (30d), rotated on use, stored as HTTP-only secure cookies.
- **Rate Limiting**: Applied globally and stricter on auth endpoints.
- **Headers**: Helmet sets secure headers (HSTS, CSP, etc.).

## Testing

Run unit tests:
```bash
npm test
```
