# Database Architecture

## Technology

- PostgreSQL hosted on Neon
- Prisma ORM 7
- PostgreSQL driver adapter
- TypeScript

## Models

### User

Stores account identity, password hashes and roles.

### Project

Stores one project submission per student.

### Review

Stores historical approval and rejection decisions.

### RefreshSession

Stores hashed refresh-token identifiers and expiration
information for revocable authentication sessions.

## Database Constraints

- User email must be unique.
- Project student ID must be unique.
- Project repository key must be unique.
- Refresh session token hash must be unique.
- Foreign keys protect data integrity.

## Environment Variables

DATABASE_URL: Pooled application connection.

DIRECT_URL: Direct migration connection.

ADMIN_NAME: Initial administrator name.

ADMIN_EMAIL: Initial administrator email.

ADMIN_PASSWORD: Initial administrator password.

Never commit real environment variable values.

## Local Commands

Validate the schema:

    npm run db:validate -w @project/api

Create development migrations:

    npm run db:migrate -w @project/api -- --name change_name

Apply existing production migrations:

    npm run db:deploy -w @project/api

Seed the administrator:

    npm run db:seed -w @project/api

Verify connectivity and records:

    npm run db:verify -w @project/api

Verify duplicate protection:

    npm run db:test-constraints -w @project/api

Inspect records:

    npm run db:studio -w @project/api

## Migration Policy

Commit migration SQL files alongside the Prisma schema.

Never run destructive reset commands against production data.

Use prisma migrate deploy during deployment.

## Security

Database credentials must remain in environment variables.

Passwords must be hashed before storage.

Database-specific error details must not be exposed
through public API responses.
