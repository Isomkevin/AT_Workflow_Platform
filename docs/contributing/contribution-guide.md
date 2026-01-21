# Contribution Guide

**Purpose**: Guide for contributing to the project.

**Audience**: Contributors, open source maintainers.

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Git
- Code editor (VS Code recommended)

### Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make changes
6. Test your changes
7. Submit a pull request

## Development Workflow

### Branch Naming

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation
- `refactor/description`: Code refactoring
- `test/description`: Test additions

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Maintenance tasks

**Example**:
```
feat(compiler): add cycle detection

Detect cycles in workflow graphs during compilation
and return appropriate error messages.
```

### Pull Request Process

1. **Update Documentation**: Update docs for your changes
2. **Add Tests**: Add tests for new features
3. **Run Tests**: Ensure all tests pass
4. **Update CHANGELOG**: Document your changes
5. **Request Review**: Request review from maintainers

## Code Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Use explicit types
- Avoid `any` type

### Code Style

- Follow existing code style
- Use ESLint/Prettier
- Format code before commit
- Keep functions small and focused

### Documentation

- Document public APIs
- Add JSDoc comments
- Update README if needed
- Keep docs up-to-date

## Testing

### Writing Tests

- Write tests for new features
- Test edge cases
- Test error paths
- Keep tests maintainable

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

### Directory Layout

```
/
  /backend          # Backend code
  /frontend         # Frontend code
  /shared           # Shared code
  /docs             # Documentation
  /tests            # Tests
  /examples         # Example workflows
```

### Adding New Features

1. **Design**: Design the feature
2. **Implement**: Implement the feature
3. **Test**: Write tests
4. **Document**: Update documentation
5. **Review**: Request code review

## Code Review

### Review Process

1. Maintainers review PRs
2. Address review comments
3. Update PR based on feedback
4. Maintainers approve and merge

### Review Criteria

- Code quality
- Test coverage
- Documentation
- Performance
- Security

## Reporting Issues

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

### Feature Requests

Include:
- Description of the feature
- Use case
- Proposed implementation (if any)
- Alternatives considered

## Related Documentation

- [Code Style](code-style.md) - Coding standards
- [Testing Strategy](../testing/strategy.md) - Testing approach
