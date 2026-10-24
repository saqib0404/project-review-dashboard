# ProjectFlow Security Architecture

## Authentication

Passwords are hashed with Argon2id.

Access tokens are short-lived JWTs.

Refresh sessions are stored in PostgreSQL with hashed
refresh-token values.

Logout revokes the database session.

## Authorization

Express verifies authenticated identities and user roles.

Student project ownership is derived from the session.

Reviewer actions are restricted to MENTOR and ADMIN.

Public registration cannot assign privileged roles.

## CSRF Protection

State-changing requests require:

- An allowed Origin header
- The ProjectFlow custom request header
- Acceptable Fetch Metadata when present

SameSite cookies provide additional protection.

Production proxy configuration must preserve or correctly
forward the required browser headers.

## Rate Limiting

Project writes use distributed Upstash Redis limits.

Authentication attempts also use Redis-backed limits.

Unavailable rate-limit infrastructure causes protected
write requests to fail rather than bypass limits.

## Database Integrity

Unique constraints prevent duplicate submissions.

Review transactions atomically update project status
and insert review history.

Version checks prevent stale review decisions.

## Security Testing

JWT validation tests
CSRF regression tests
RBAC integration tests
Logout revocation tests
Duplicate submission tests
Concurrent review tests

## Known Limitations

Current refresh rotation does not include full token-family
compromise tracking.

Multi-tab refresh behavior requires additional verification.

Public browser CI tests do not exercise the real database.

Production proxy trust and rate-limit IP behavior must
be verified during deployment.

## Production Checklist

Use HTTPS.

Set Secure on authentication cookies.

Restrict configured origins.

Use distinct JWT signing secrets.

Keep all credentials outside source control.

Use separate development and production databases.

Apply migrations through Prisma migrate deploy.

Never expose Prisma Studio publicly.
