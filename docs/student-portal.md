# ProjectFlow Student Portal

## Overview

The student portal provides the complete project
submission and revision experience.

## Features

- Student-only protected dashboard
- Project submission form
- Shared Zod validation
- GitHub repository URL verification
- Optional HTTPS live demo URL
- Real-time submission feedback
- Pending, approved and rejected states
- Mentor rejection feedback
- Revision and resubmission
- Responsive layout and loading states

## Authentication

The dashboard uses the existing JWT session
and server-side role protection.

All project requests use the authenticated
student identity.

## API Integration

GET /api/v1/projects/me

Returns the student's current project
or 404 if no project exists.

POST /api/v1/projects

Creates a project with initial status PENDING.

PATCH /api/v1/projects/me

Revises an existing REJECTED project.

## Business Rules

A student may own only one project.

A GitHub repository cannot be submitted twice
using equivalent canonical URLs.

Pending and approved projects cannot be edited.

Rejected projects can be revised.

Revisions update the existing project and
increment its version.

## Error Handling

401: Invalid or expired authentication
403: Insufficient permissions
404: No submission found
409: Duplicate submission or state conflict
422: Invalid input
429: Rate limit exceeded
503: Service unavailable

## Design

Frontend: Next.js App Router
Styling: Tailwind CSS
Components: shadcn/ui Base UI
Forms: React Hook Form
Validation: Zod
Icons: Lucide React

## Security

- No tokens stored in localStorage
- HTTP-only session cookies
- Student identity comes from the backend
- Database uniqueness constraints
- Server-enforced submission ownership
- Server-side status transitions
- HTTPS project link validation

## Testing

Unit and contract tests:

    npm run test:unit -w @project/api

Production build:

    npm run build

Manual verification:

1. Create student account
2. Submit a valid project
3. Verify duplicate protection
4. Reject through mentor API
5. View rejection feedback
6. Revise and resubmit
7. Approve through mentor API
8. Confirm editing is disabled

