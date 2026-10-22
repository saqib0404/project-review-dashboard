# ProjectFlow

A full-stack Project Submission and Review Dashboard.

## Overview

ProjectFlow provides a centralized platform for students
to submit projects and mentors to review submissions.

## Technology Stack

- TypeScript
- Next.js with App Router
- Tailwind CSS and shadcn/ui
- Express.js
- PostgreSQL with Prisma ORM
- JWT-based role-based authorization

## Repository Structure

- `apps/web` - Next.js frontend
- `apps/api` - Express REST API
- `packages/contracts` - Shared TypeScript contracts
- `docs` - Technical documentation

## Prerequisites

- Node.js 24 LTS
- npm
- Git

## Local Development

Install dependencies:

```bash
npm install
```

Start both applications:

```bash
npm run dev
```

Frontend: http://localhost:3000

Backend health: http://localhost:5000/api/v1/health

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Security

Never commit real environment variables or credentials.
Use `.env.example` to document configuration.

## Development Roadmap

1. Repository foundation
2. Database and Prisma
3. Authentication and RBAC
4. Student submission APIs
5. Mentor review APIs
6. Frontend design system and auth
7. Student portal
8. Mentor dashboard
9. Automated testing and CI
10. Deployment and final documentation

## Status

Step 1 of 10: Project foundation.

```

```
