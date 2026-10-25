# System Architecture

## Overview

ProjectFlow uses a modular TypeScript monorepo.

## Components

### Frontend

Next.js App Router, Tailwind CSS, and shadcn/ui.

### Backend

Express.js REST API with modular business logic.

### Shared Contracts

TypeScript contracts shared between applications.

### Database

PostgreSQL with Prisma ORM.

### Authentication

JWT authentication with role-based authorization.

## Initial Roles

- STUDENT: Submit and manage their own project.
- MENTOR: Review and manage project decisions.
- ADMIN: Seeded privileged account.

## Submission Lifecycle

PENDING -> APPROVED

PENDING -> REJECTED

REJECTED -> PENDING (after revision)

## Deployment Strategy

Separate Vercel projects for frontend and backend.

Neon will provide PostgreSQL storage.

Upstash will provide distributed rate limiting.

