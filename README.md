# ProjectFlow

### Student Project Submission & Mentor Review Dashboard

A full-stack application for managing student project
submissions, mentor reviews, approval workflows and
project status tracking.

Built with TypeScript, Next.js, Express, PostgreSQL,
Prisma, Tailwind CSS and shadcn/ui.

## Live Application

Frontend:
https://REPLACE-WITH-ACTUAL-FRONTEND-DOMAIN

API Health:
https://REPLACE-WITH-ACTUAL-FRONTEND-DOMAIN/api/v1/health

Screenshots:
See docs/screenshots/.

## Overview

ProjectFlow provides two role-specific workspaces.

Students can:

- Register and sign in securely.
- Submit a project and GitHub repository.
- Include an optional live demo URL.
- Track pending, approved and rejected submissions.
- View mentor rejection feedback.
- Revise and resubmit rejected projects.

Mentors and administrators can:

- Browse project submissions.
- Filter projects by review status.
- Navigate paginated project records.
- View aggregate review statistics.
- Inspect project details and review history.
- Approve or reject pending projects.

## Technology Stack

Frontend:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Lucide React

Backend:

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT authentication
- Argon2id
- Upstash Redis

Testing:

- Vitest
- Supertest
- Playwright
- axe-core
- GitHub Actions

Hosting:

- Vercel (frontend and API)
- Neon PostgreSQL
- Upstash Redis

## Core Features

### Authentication and Authorization

- Student-only public registration
- JWT access and refresh sessions
- HTTP-only secure cookies
- Refresh-token rotation
- Database-backed session revocation
- Student, mentor and admin permissions
- Redis-backed authentication rate limiting

### Student Submission Workflow

- Shared Zod validation
- Canonical GitHub repository URL normalization
- Database-enforced duplicate prevention
- Optional deployed application URL
- Submission status tracking
- Mentor feedback
- Rejected-project revision

### Mentor Review Workflow

- Server-side pagination and filtering
- PostgreSQL aggregate statistics
- Project detail and review history
- Approval/rejection transactions
- Mandatory rejection reasons
- Optimistic concurrency control
- Atomic audit-record creation

## Project Structure

    apps/
      web/                 Next.js application
      api/                 Express application
    packages/
      contracts/           Shared validation and types
    tests/
      e2e/                 Playwright browser tests
    docs/                   Project documentation
    .github/
      workflows/           GitHub Actions CI

## Local Development

Requirements:

- Node.js 24
- npm
- Neon PostgreSQL database
- Upstash Redis database

Clone:

    git clone YOUR_REPOSITORY_URL
    cd project-review-dashboard

Install:

    npm ci

Configure:

- apps/api/.env
- apps/web/.env.local

Never commit real environment files.

Generate Prisma Client:

    npm run db:generate -w @project/api

Build shared contracts:

    npm run build -w @project/contracts

Apply development migrations:

    npm run db:migrate -w @project/api

Seed the admin account:

    npm run db:seed -w @project/api

Start development:

    npm run dev

Frontend:
http://localhost:3000

Express API:
http://localhost:5000

## Validation and Testing

Unit tests:

    npm run test:unit -w @project/api

Database integration tests:

    npm run test:integration -w @project/api

Browser smoke tests:

    npm run test:e2e:smoke

Type checking:

    npm run typecheck

Linting:

    npm run lint

Production build:

    npm run build

Formatting:

    npm run format:check

The GitHub Actions workflow runs the configured
quality checks on pushes and pull requests.

## Security

ProjectFlow includes:

- Argon2id password hashing
- JWT signature and expiry verification
- Database-backed session revocation
- HTTP-only authentication cookies
- Origin and Fetch Metadata checks
- Role-based authorization
- Student ownership restrictions
- PostgreSQL uniqueness constraints
- Distributed rate limiting
- Concurrency-safe review transactions

See docs/security.md for details and limitations.

## API Documentation

Authentication:
docs/authentication.md

Projects:
docs/projects-api.md

Mentor reviews:
docs/reviews-api.md

## Architecture and Deployment

Database:
docs/database.md

Frontend:
docs/frontend.md

Student portal:
docs/student-portal.md

Mentor dashboard:
docs/mentor-dashboard.md

Testing:
docs/testing.md

Deployment:
docs/deployment.md

## Development Roadmap

1. Monorepo foundation
2. Database schema and migrations
3. Secure authentication and RBAC
4. Project submission APIs
5. Mentor review APIs
6. Frontend design and authentication
7. Student portal
8. Mentor dashboard
9. Automated testing and security
10. Production deployment and documentation

## Future Improvements

- More extensive multi-tab session coordination
- Refresh-token-family compromise detection
- Administrative user-management interface
- Search across submissions
- Email notifications
- Additional review analytics

## License

See LICENSE if a license is included in the repository.
Until one is added, standard copyright rules apply.
