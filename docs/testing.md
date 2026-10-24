# ProjectFlow Testing Strategy

## Testing Levels

### Unit Tests

Vitest checks validation schemas, JWT operations,
repository normalization and security middleware.

Command:
npm run test:unit -w @project/api

### Integration Tests

Supertest exercises Express routes against a separate
Neon test database.

Command:
npm run test:integration -w @project/api

Never run integration tests against production data.

### Browser Tests

Playwright tests public navigation, forms and
responsive behavior.

Command:
npm run test:e2e:smoke

### Authenticated End-to-End Tests

The student-review test uses a real student account,
reviewer account and database.

It requires an isolated environment and E2E credentials.

Command:
npx playwright test student-review.spec.ts

### Accessibility

axe-core scans public pages for automated WCAG violations.

Manual keyboard, focus and screen-reader checks are
also required.

## Continuous Integration

GitHub Actions runs:

- npm ci
- Prisma client generation
- Shared contracts build
- TypeScript checks
- ESLint
- Unit tests
- Production builds
- Formatting
- Playwright browser smoke tests
- Automated accessibility checks

Database-backed integration tests are currently run
outside the default CI workflow.

## Test Data

Use a dedicated disposable PostgreSQL database.

Use non-production administrator credentials.

Never upload authentication cookies, database passwords
or JWT signing keys as test artifacts.

## Release Gates

Before deployment:

- All unit tests pass
- Integration tests pass against test database
- Browser smoke tests pass
- Accessibility checks pass
- Builds pass
- Critical security regressions pass

Production verification occurs in Step 10.
