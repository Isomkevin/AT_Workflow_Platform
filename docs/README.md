# Documentation Index

**Audience**: Engineers, architects, maintainers, and operators working with the Africa's Talking Workflow Automation Platform.

This documentation system provides comprehensive technical documentation for understanding, deploying, extending, and operating the platform.

## Quick Navigation

### Getting Started
- [Product Overview](overview/product-vision.md) - What this platform is and why it exists
- [Quick Start Guide](../README.md#getting-started) - Get up and running in minutes
- [Architecture Overview](architecture/system-overview.md) - High-level system design

### Core Documentation

#### Overview
- [Product Vision](overview/product-vision.md) - Platform purpose and goals
- [Problem Statement](overview/problem-statement.md) - Problems this platform solves
- [Target Users](overview/target-users.md) - Who uses this platform

#### Architecture
- [System Overview](architecture/system-overview.md) - High-level architecture
- [Data Flow](architecture/data-flow.md) - How data moves through the system
- [Workflow Execution](architecture/workflow-execution.md) - Execution engine design
- [Session Management](architecture/session-management.md) - Stateful workflow handling

#### Backend
- [Services](backend/services.md) - Backend service architecture
- [API Design](backend/api-design.md) - REST API reference
- [Database](backend/database.md) - Data persistence (current and planned)

#### Frontend
- [UI Architecture](frontend/ui-architecture.md) - React Flow-based workflow builder
- [State Management](frontend/state-management.md) - Frontend state handling

#### Integrations
- [Africa's Talking Integration](integrations/africas-talking.md) - AT API integration
- [Third-Party APIs](integrations/third-party-apis.md) - External service integrations
- [Webhooks](integrations/webhooks.md) - Webhook handling

#### Security
- [Authentication & Authorization](security/auth.md) - Auth system (current and planned)
- [Secrets Management](security/secrets-management.md) - Credential handling
- [Security Best Practices](security/best-practices.md) - Security guidelines

#### Deployment
- [Environments](deployment/environments.md) - Development, staging, production
- [CI/CD](deployment/ci-cd.md) - Continuous integration and deployment
- [Production Checklist](deployment/production-checklist.md) - Pre-deployment requirements

#### Testing
- [Testing Strategy](testing/strategy.md) - Testing approach and coverage
- [Test Coverage](testing/test-coverage.md) - Current test coverage status

#### Contributing
- [Contribution Guide](contributing/contribution-guide.md) - How to contribute
- [Code Style](contributing/code-style.md) - Coding standards and conventions

#### Reference
- [Glossary](reference/glossary.md) - Terminology and definitions
- [FAQ](reference/faq.md) - Frequently asked questions
- [API Reference](backend/api-design.md) - Complete API documentation

## Documentation Principles

This documentation follows these principles:

1. **Single Source of Truth**: Each concept is documented once in the most appropriate location
2. **Progressive Disclosure**: Start with high-level concepts, drill down to details
3. **Code-First**: Documentation reflects actual implementation, not aspirations
4. **Maintainability**: Clear structure makes updates straightforward
5. **Discoverability**: Logical organization and cross-references

## Finding What You Need

- **New to the project?** Start with [Product Overview](overview/product-vision.md) and [System Overview](architecture/system-overview.md)
- **Setting up locally?** See the [Quick Start Guide](../README.md#getting-started)
- **Deploying to production?** Review [Production Checklist](deployment/production-checklist.md)
- **Adding a feature?** Read [Contribution Guide](contributing/contribution-guide.md) and relevant architecture docs
- **Troubleshooting?** Check [FAQ](reference/faq.md) and [Testing Strategy](testing/strategy.md)

## Contributing to Documentation

Documentation improvements are welcome. See [Contribution Guide](contributing/contribution-guide.md) for guidelines.

When updating documentation:
- Keep it accurate and up-to-date with code changes
- Use clear, professional language
- Include code examples where helpful
- Cross-reference related documentation
- Update this index if adding new sections
