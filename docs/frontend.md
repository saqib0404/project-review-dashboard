# ProjectFlow Frontend

## Technology

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- shadcn/ui with Radix primitives
- React Hook Form
- Zod
- Lucide icons

## Architecture

The browser communicates with Express through the
same-origin Next.js /api/v1 rewrite.

Backend authentication uses HTTP-only JWT cookies.

Protected Next.js layouts fetch the current user
from the Express authentication endpoint.

The Express API remains authoritative for RBAC.

## Pages

/ Public landing page
/login Student and mentor/admin login
/signup Public student registration
/student Protected student workspace
/mentor Protected reviewer workspace
/auth/restore Expired access-token restoration
/forbidden Role restriction page

## User Roles

STUDENT accesses /student.

MENTOR and ADMIN access /mentor.

Only students may register through the public form.

## Session Handling

Access JWT: 15 minutes.

Refresh JWT: 7 days.

Tokens are stored in HTTP-only cookies.

Browser API requests can attempt session refresh once.

Server layouts validate sessions before rendering
protected pages.

Logout revokes the backend database session.

## Environment

API_INTERNAL_URL is the Express API origin
used by the Next.js server.

Local development:

    API_INTERNAL_URL=http://localhost:5000

Never expose JWTs or database credentials to
browser JavaScript.

## Development

Start both applications:

    npm run dev

Frontend:

    http://localhost:3000

API proxy test:

    http://localhost:3000/api/v1/health

## Validation

Test student registration and login.

Test seeded administrator login.

Test student/reviewer route separation.

Verify logout and protected route redirects.

Inspect responsiveness across mobile and desktop.

