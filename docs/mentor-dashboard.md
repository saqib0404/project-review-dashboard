# Mentor Review Dashboard

## Overview

The Mentor Review Dashboard allows authorized
mentors and administrators to review student submissions.

## Features

- Live aggregated statistics
- Server-side status filters
- Server-side pagination
- Project and student details
- Review history
- Approval confirmation
- Rejection with mandatory reason
- Optimistic concurrency protection
- Loading and error states
- Responsive data table

## Authorization

Allowed roles:

- MENTOR
- ADMIN

STUDENT users cannot access review endpoints.

All permissions are enforced by Express.

## API Endpoints

GET /api/v1/reviews/projects

Query:

- page
- limit
- status

GET /api/v1/reviews/stats

GET /api/v1/reviews/projects/:id

GET /api/v1/reviews/projects/:id/history

PATCH /api/v1/reviews/projects/:id/decision

## Decision Rules

Only PENDING projects can be reviewed.

APPROVED decisions need no reason.

REJECTED decisions require a reason.

Every decision includes expectedVersion.

The backend checks status and version atomically.

Review history is written in the same database transaction.

## Error Handling

401: Authentication required
403: Access denied
404: Project not found
409: Stale or conflicting review
422: Invalid decision or reason
500: Server error

## Testing

Verify statistics and filters against real data.

Verify pagination parameters through Network tools.

Verify approval and rejection.

Verify that stale decisions cannot overwrite reviews.

Verify student access restrictions.

## Remaining Milestones

Step 9:

- Automated browser tests
- Security hardening
- CI quality gates

Step 10:

- Production deployment
- Live verification
- Final documentation

```

```
