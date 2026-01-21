# Test Coverage

**Purpose**: Document current test coverage status and gaps.

**Audience**: Engineers and QA.

## Current Status

**Unit Tests**: Not implemented (planned)

**Integration Tests**: Not implemented (planned)

**E2E Tests**: Not implemented (planned)

## Coverage Goals

### Phase 1: Core Functionality

- [ ] Workflow validation (80%+)
- [ ] Workflow compilation (80%+)
- [ ] Node executors (80%+)
- [ ] API endpoints (80%+)

### Phase 2: Advanced Features

- [ ] Session management (80%+)
- [ ] Error handling (80%+)
- [ ] Retry logic (80%+)
- [ ] Template rendering (80%+)

### Phase 3: Integration

- [ ] AT API integration (critical paths)
- [ ] Database operations (critical paths)
- [ ] Redis operations (critical paths)

## Coverage by Component

### Compiler

**Target**: 80%+

**Critical Paths**:
- Workflow validation
- Graph building
- Cycle detection
- Topological sorting

### Execution Engine

**Target**: 80%+

**Critical Paths**:
- Workflow execution
- Node execution
- Error handling
- Retry logic

### API

**Target**: 80%+

**Critical Paths**:
- All endpoints
- Error handling
- Authentication (when implemented)
- Rate limiting (when implemented)

### Node Executors

**Target**: 80%+

**Critical Paths**:
- All node types
- Error handling
- Variable substitution
- AT API calls

## Coverage Reporting

### Tools

- Vitest coverage
- Istanbul/nyc
- Codecov (CI integration)

### Reports

Generate coverage reports:
```bash
npm run test:coverage
```

View coverage:
- HTML report: `coverage/index.html`
- Terminal output
- CI integration

## Coverage Gaps

### Known Gaps

- No tests currently implemented
- Need to add tests for all components
- Need integration test setup
- Need E2E test setup

### Priority

1. **High**: Core functionality (compiler, executor)
2. **Medium**: API endpoints
3. **Low**: Utility functions

## Improving Coverage

### Steps

1. Set up test framework
2. Write tests for critical paths
3. Increase coverage gradually
4. Maintain coverage threshold
5. Review coverage regularly

### Guidelines

- Write tests alongside code
- Test edge cases
- Test error paths
- Keep tests maintainable
- Document test purpose

## Related Documentation

- [Testing Strategy](strategy.md) - Testing approach
- [Contributing](../contributing/contribution-guide.md) - Contribution guidelines
