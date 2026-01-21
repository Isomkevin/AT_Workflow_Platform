# Testing Strategy

**Purpose**: Document testing approach and coverage requirements.

**Audience**: Engineers, QA, and contributors.

## Testing Philosophy

- **Test Early**: Write tests alongside code
- **Test Often**: Run tests frequently
- **Test Comprehensively**: Cover critical paths
- **Test Realistically**: Use realistic test data
- **Test Automatically**: Automate test execution

## Testing Levels

### Unit Tests

**Purpose**: Test individual functions and components in isolation

**Coverage**:
- Business logic functions
- Utility functions
- Node executors
- Compiler functions

**Tools**:
- Vitest (planned)
- Jest (alternative)

**Example**:
```typescript
import { describe, it, expect } from 'vitest';
import { compileWorkflow } from '../compiler';

describe('compileWorkflow', () => {
  it('should compile valid workflow', () => {
    const spec = { /* workflow spec */ };
    const result = compileWorkflow(spec);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

**Purpose**: Test interactions between components

**Coverage**:
- API endpoints
- Database operations
- External service integrations
- Workflow execution

**Tools**:
- Vitest with test database
- Supertest for API testing

**Example**:
```typescript
import request from 'supertest';
import { createApp } from '../api/server';

describe('POST /api/workflows/validate', () => {
  it('should validate workflow', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/workflows/validate')
      .send({ /* workflow spec */ });
    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
  });
});
```

### End-to-End Tests

**Purpose**: Test complete user workflows

**Coverage**:
- Workflow creation
- Workflow execution
- UI interactions
- Complete user journeys

**Tools**:
- Playwright (planned)
- Cypress (alternative)

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('create and execute workflow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Test workflow creation and execution
});
});
```

## Test Structure

### Test Organization

```
/tests
  /unit
    compiler.test.ts
    executor.test.ts
    node-executors.test.ts
  /integration
    api.test.ts
    workflow-execution.test.ts
  /e2e
    workflow-builder.test.ts
```

## Test Coverage

### Target Coverage

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user journeys covered

### Coverage Tools

- **Vitest**: Built-in coverage
- **Istanbul**: Coverage reporting
- **Codecov**: Coverage tracking (CI)

## Testing Workflows

### Workflow Validation Tests

Test workflow validation:
- Valid workflows
- Invalid workflows
- Edge cases
- Error messages

### Workflow Compilation Tests

Test workflow compilation:
- Successful compilation
- Compilation errors
- Graph building
- Cycle detection

### Workflow Execution Tests

Test workflow execution:
- Successful execution
- Error handling
- Retry logic
- Session management

## Mocking

### External Services

Mock external service calls:
- Africa's Talking API
- Database operations
- Redis operations

### Example

```typescript
import { vi } from 'vitest';

vi.mock('../adapters/africas-talking/client', () => ({
  ATClient: vi.fn().mockImplementation(() => ({
    sendSMS: vi.fn().mockResolvedValue({ success: true }),
  })),
}));
```

## Test Data

### Fixtures

Create test fixtures:
- Sample workflows
- Test execution contexts
- Mock API responses

### Example

```typescript
// tests/fixtures/workflows.ts
export const simpleSMSWorkflow = {
  metadata: { /* ... */ },
  trigger: { /* ... */ },
  nodes: [ /* ... */ ],
  edges: [ /* ... */ ],
};
```

## Continuous Testing

### Pre-Commit

Run tests before commit:
- Linting
- Unit tests
- Quick integration tests

### CI Pipeline

Run full test suite in CI:
- All unit tests
- All integration tests
- Coverage reporting
- E2E tests (on main branch)

## Performance Testing

### Load Testing

Test under load:
- API endpoint performance
- Workflow execution performance
- Database query performance

### Tools

- **k6**: Load testing
- **Artillery**: Load testing
- **Apache Bench**: Simple load testing

## Security Testing

### Security Tests

- Input validation
- Authentication/authorization
- SQL injection prevention
- XSS prevention
- CSRF protection

## Test Maintenance

### Best Practices

- Keep tests up-to-date with code
- Remove obsolete tests
- Refactor tests for clarity
- Document test purpose
- Review test coverage regularly

## Related Documentation

- [Test Coverage](test-coverage.md) - Current coverage status
- [Contributing](../contributing/contribution-guide.md) - Contribution guidelines
