# Mentor Review API

## Purpose

Provides secure review operations for mentors and admins.

## Authorization

All endpoints require:

- Valid JWT access token
- Active database session
- MENTOR or ADMIN role

Students cannot use these endpoints.

## Endpoints

### GET /api/v1/reviews/projects

Returns a paginated project list.

Query parameters:

| Parameter | Default | Allowed                          |
| --------- | ------- | -------------------------------- |
| page      | 1       | 1–100000                         |
| limit     | 10      | 1–50                             |
| status    | ALL     | ALL, PENDING, APPROVED, REJECTED |

Sort order:

- createdAt descending
- id descending

Pagination and filtering are performed by PostgreSQL.

### GET /api/v1/reviews/stats

Returns:

- total
- pending
- approved
- rejected

Statistics are calculated using database aggregation.

### GET /api/v1/reviews/projects/:id

Returns project details and student information.

### PATCH /api/v1/reviews/projects/:id/decision

Approves or rejects a pending project.

Request example:

    {
      "decision": "REJECTED",
      "expectedVersion": 1,
      "reason": "Documentation needs improvement."
    }

Rules:

- Only pending projects can be reviewed.
- The provided version must match the database.
- Rejection requires a meaningful reason.
- The authenticated reviewer ID is used.
- Project version increases after a decision.
- A corresponding Review record is created atomically.

### GET /api/v1/reviews/projects/:id/history

Returns historical review decisions, with reviewer
identity, timestamp, decision, reason and version.

## Concurrency Safety

Optimistic concurrency control uses Project.version.

A conditional database update ensures that only
one competing decision can succeed.

Project state changes and audit history entries
occur in the same Prisma transaction.

Conflicting requests return HTTP 409.

## Review Lifecycle

PENDING -> APPROVED

PENDING -> REJECTED

REJECTED -> PENDING (student revision)

The project keeps its original ID and review history.

## Error Responses

401 - Authentication required
403 - Insufficient permissions
404 - Project not found
409 - Invalid state or concurrent update
422 - Invalid request
500 - Unexpected server error

## Testing

Validation:

    npm exec -w @project/api -- vitest run tests/reviews.validation.test.ts

Integration:

    npm exec -w @project/api -- vitest run tests/reviews.integration.test.ts

Run integration tests only against a disposable test database.

## Future Frontend Integration

Step 8 will consume these endpoints for:

- Statistics cards
- Server-paginated data table
- Status filters
- Project detail screen
- Approval/rejection dialogs
- Review history

```

```
