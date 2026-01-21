# Code Style

**Purpose**: Coding standards and conventions for the project.

**Audience**: All contributors.

## General Principles

- **Consistency**: Follow existing code style
- **Readability**: Write code that's easy to read
- **Maintainability**: Write code that's easy to maintain
- **Type Safety**: Use TypeScript types effectively

## TypeScript

### Type Definitions

- Use explicit types
- Avoid `any` type
- Use interfaces for object shapes
- Use types for unions/intersections

### Example

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`
- **Files**: `kebab-case.ts`

### Example

```typescript
const userName = 'John';
const MAX_RETRIES = 3;

class WorkflowExecutor {
  // ...
}

interface WorkflowSpec {
  // ...
}
```

## Code Organization

### Imports

- Group imports: external, internal, relative
- Sort imports alphabetically
- Use absolute imports when possible

### Example

```typescript
// External
import express from 'express';
import { z } from 'zod';

// Internal
import { WorkflowSpec } from '../../shared/workflow-spec/types';
import { compileWorkflow } from '../compiler';

// Relative
import { logger } from './logger';
```

### File Structure

- One main export per file
- Group related functions
- Keep files focused
- Maximum ~300 lines per file

## Functions

### Function Design

- Keep functions small and focused
- Single responsibility
- Descriptive names
- Document complex logic

### Example

```typescript
// Good
function validateWorkflowSpec(spec: WorkflowSpec): ValidationResult {
  // ...
}

// Bad
function validate(spec: any): any {
  // ...
}
```

### Async Functions

- Use `async/await` for async code
- Handle errors appropriately
- Return promises explicitly when needed

### Example

```typescript
// Good
async function executeWorkflow(spec: WorkflowSpec): Promise<ExecutionResult> {
  try {
    const result = await engine.execute(spec);
    return result;
  } catch (error) {
    logger.error('Execution failed', { error });
    throw error;
  }
}
```

## Error Handling

### Error Types

- Use custom error types
- Include error codes
- Provide helpful messages
- Include context

### Example

```typescript
class WorkflowError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}
```

## Comments

### When to Comment

- Complex algorithms
- Non-obvious code
- Public APIs
- TODO/FIXME items

### Comment Style

- Use JSDoc for functions
- Use inline comments sparingly
- Keep comments up-to-date
- Write self-documenting code

### Example

```typescript
/**
 * Compiles a workflow specification into an execution graph.
 * 
 * @param spec - Workflow specification to compile
 * @returns Compilation result with graph or errors
 */
export function compileWorkflow(spec: WorkflowSpec): CompilationResult {
  // ...
}
```

## Formatting

### ESLint/Prettier

- Use ESLint for linting
- Use Prettier for formatting
- Run before commit
- Configure in editor

### Configuration

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    // Project-specific rules
  }
}
```

## Testing

### Test Structure

- One test file per source file
- Descriptive test names
- Arrange-Act-Assert pattern
- Test edge cases

### Example

```typescript
describe('compileWorkflow', () => {
  it('should compile valid workflow', () => {
    // Arrange
    const spec = createValidWorkflowSpec();
    
    // Act
    const result = compileWorkflow(spec);
    
    // Assert
    expect(result.success).toBe(true);
  });
});
```

## Related Documentation

- [Contribution Guide](contribution-guide.md) - Contribution process
- [Testing Strategy](../testing/strategy.md) - Testing approach
