# ProjectFlow Production Deployment

## Hosting Architecture

Frontend: Vercel Next.js project
Backend: Vercel Express project
Database: Neon PostgreSQL
Rate limiting: Upstash Redis

Both Vercel projects are connected to the same
GitHub monorepo.

## Project Roots

Frontend:
apps/web

API:
apps/api

## Build Commands

Frontend:
npm run vercel-build

API:
npm run vercel-build

Shared contracts are built before application builds.

The API build generates Prisma Client.

## Database

Production uses a separate Neon database.

DATABASE_URL:
Pooled PostgreSQL connection string.

DIRECT_URL:
Direct PostgreSQL connection string.

Production migrations:

    npm run db:deploy -w @project/api

Never run prisma migrate dev in production.

The administrator is seeded using an idempotent
database seed script.

## API Environment

NODE_ENV
DATABASE_URL
DIRECT_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ISSUER
JWT_AUDIENCE
WEB_ORIGIN
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

All secrets must be configured through Vercel's
environment settings.

## Frontend Environment

API_INTERNAL_URL

This must point to the actual production API origin.

Browser requests use the same-origin /api/v1 rewrite.

## Authentication

Production JWT cookies must be:

- HTTP-only
- Secure
- SameSite=Lax

WEB_ORIGIN must match the frontend HTTPS origin.

## Deployment Verification

1. API health endpoint returns HTTP 200.
2. Frontend homepage loads over HTTPS.
3. API rewrite forwards correctly.
4. Student registration and login work.
5. Protected role routes work.
6. Project submissions persist in PostgreSQL.
7. Mentor reviews update project status.
8. Rejection feedback and revision work.
9. Logout revokes the session.
10. CSRF checks reject unauthorized origins.
11. Rate limits operate through Upstash.
12. CI checks are green.

## Production Operational Checks

Review Vercel function logs.

Monitor database connectivity.

Check Redis rate-limit failures.

Never log credentials or authentication tokens.

Use separate database credentials for preview and
production environments.

Do not run destructive tests against production.

## Release Verification

[Production frontend URL](https://project-review-dashboard-volj.vercel.app)

[Production API URL](https://project-review-dashboard-chi.vercel.app/api/v1/health)

