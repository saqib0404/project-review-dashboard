# Authentication and Authorization

## Authentication Model

ProjectFlow uses short-lived JWT access tokens and
rotating JWT refresh tokens.

Access token lifetime: 15 minutes.
Refresh token lifetime: 7 days.

Tokens are delivered using HTTP-only cookies.

## Session Security

Refresh tokens are hashed using SHA-256 before storage.

Each refresh rotates the session and invalidates
the previous refresh token.

Logout revokes the active database session.

Protected requests verify both:

1. JWT validity.
2. Database session and user active status.

## Roles

STUDENT:

- Submit their own project.
- View their own submission.
- Revise rejected submissions.

MENTOR:

- View submissions.
- Approve or reject projects.
- View aggregated statistics.

ADMIN:

- May access mentor review functionality.
- Is seeded directly into the database.

Public signup always creates STUDENT accounts.

## Routes

POST /api/v1/auth/signup

POST /api/v1/auth/login

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

GET /api/v1/auth/me

## Security Decisions

- Argon2id password hashing.
- Separate JWT signing secrets.
- HTTP-only cookies.
- Secure cookies in production.
- SameSite=Lax cookies.
- Origin and custom-header request checks.
- Database-backed session revocation.
- No public role assignment during signup.

## Production Considerations

Use an HTTPS deployment.

Configure the exact frontend origin.

Use a same-origin API proxy.

Replace local rate limiting with distributed Redis.

Do not expose signing keys, tokens or credentials.

Review CSRF controls and secure proxy configuration.

## Testing

Run:

    npm run test -w @project/api

Manual API verification includes signup, login,
profile access, role checks, refresh rotation,
old-token replay and logout.

