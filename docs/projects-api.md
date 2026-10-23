# Student Project API

## Overview

These endpoints allow authenticated students to create,
view, and revise their own project submissions.

All requests use the existing JWT cookie authentication.

## Endpoints

### POST /api/v1/projects

Creates the student's first project.

Role: STUDENT

Request fields:

- name: 3–150 characters
- repositoryUrl: GitHub HTTPS repository URL
- liveUrl: Optional HTTPS URL
- description: 30–5000 characters

Successful response: 201 Created

Initial project status: PENDING

### GET /api/v1/projects/me

Returns the authenticated student's project.

Role: STUDENT

Successful response: 200 OK

Missing project: 404 Not Found

### PATCH /api/v1/projects/me

Revises an existing rejected project.

Role: STUDENT

Successful response: 200 OK

Restrictions:

- Project must already exist.
- Current status must be REJECTED.
- Revision updates the existing project.
- Status becomes PENDING.
- Version increases by one.

## Database Constraints

The following fields are unique:

- Project.studentId
- Project.repositoryKey

These prevent duplicate submissions even under
concurrent requests.

## Repository Normalization

Equivalent GitHub repository URLs receive the same
canonical repository key.

Only direct HTTPS github.com repository URLs
are accepted.

Repository visibility is not checked during submission.

## Rate Limiting

Provider: Upstash Redis

Algorithm: Sliding window

Limit: 5 write attempts per student per 15 minutes

Rate-limit response: 429

Redis unavailable: 503

## Authorization

Project ownership comes from the verified JWT session.

The client cannot submit studentId or project status.

Mentors and administrators cannot use student endpoints.

## Error Codes

401: Authentication required
403: Insufficient permissions
404: Project not found
409: Duplicate or invalid workflow state
422: Invalid project input
429: Rate limit exceeded
503: Rate limiter unavailable

## Verification

Run:

    npm run test -w @project/api

Check actual API responses using curl.

## Future Work

Step 5:

- Mentor review endpoints
- Approval and rejection
- Review history
- Server-side pagination
- Aggregated statistics

Step 7:

- Student submission frontend
- Form validation and feedback
- Submission status UI

```

```
