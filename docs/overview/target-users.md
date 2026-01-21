# Target Users

**Purpose**: Define who uses this platform and their needs.

**Audience**: Product managers, engineers, and stakeholders planning features and documentation.

## Primary Users

### 1. Backend Engineers

**Role**: Build and maintain workflow automation systems.

**Needs**:
- API documentation and examples
- Architecture understanding
- Deployment and operations guides
- Extension points for custom nodes

**Documentation Priorities**:
- [API Design](../backend/api-design.md)
- [Architecture Overview](../architecture/system-overview.md)
- [Deployment Guide](../deployment/production-checklist.md)
- [Contribution Guide](../contributing/contribution-guide.md)

### 2. Frontend Engineers

**Role**: Build and maintain the visual workflow builder UI.

**Needs**:
- UI architecture documentation
- Component structure
- State management patterns
- React Flow integration details

**Documentation Priorities**:
- [UI Architecture](../frontend/ui-architecture.md)
- [State Management](../frontend/state-management.md)
- [Contribution Guide](../contributing/contribution-guide.md)

### 3. DevOps Engineers

**Role**: Deploy, monitor, and maintain the platform in production.

**Needs**:
- Deployment procedures
- Environment configuration
- Monitoring and alerting setup
- Scaling strategies

**Documentation Priorities**:
- [Deployment Guide](../deployment/production-checklist.md)
- [Environments](../deployment/environments.md)
- [CI/CD](../deployment/ci-cd.md)
- [Security Best Practices](../security/best-practices.md)

### 4. Product/Business Users

**Role**: Create and manage workflows using the visual builder.

**Needs**:
- Quick start guide
- Workflow creation tutorials
- Node type reference
- Troubleshooting common issues

**Documentation Priorities**:
- [Quick Start Guide](../../README.md#getting-started)
- [Workflow Builder Guide](../frontend/ui-architecture.md)
- [Node Types Reference](../reference/glossary.md)
- [FAQ](../reference/faq.md)

## Secondary Users

### 5. Security Auditors

**Role**: Review platform security and compliance.

**Needs**:
- Security architecture
- Authentication and authorization details
- Secrets management
- Threat model

**Documentation Priorities**:
- [Security Overview](../security/auth.md)
- [Secrets Management](../security/secrets-management.md)
- [Threat Model](../architecture/threat-model.md) (if exists)

### 6. Open Source Contributors

**Role**: Contribute features, fixes, and improvements.

**Needs**:
- Contribution guidelines
- Code style standards
- Development setup
- Testing requirements

**Documentation Priorities**:
- [Contribution Guide](../contributing/contribution-guide.md)
- [Code Style](../contributing/code-style.md)
- [Testing Strategy](../testing/strategy.md)

## User Journey Mapping

### New Engineer Onboarding (< 1 Day Goal)

1. **Hour 1**: Read [Product Vision](product-vision.md) and [System Overview](../architecture/system-overview.md)
2. **Hour 2**: Complete [Quick Start Guide](../../README.md#getting-started)
3. **Hour 3**: Review [Architecture Overview](../architecture/system-overview.md) in detail
4. **Hour 4**: Explore codebase with architecture docs as reference
5. **Hours 5-8**: Build first workflow and review execution logs

### Workflow Creator Journey

1. **Discovery**: Understand what workflows can do ([Product Vision](product-vision.md))
2. **Setup**: Follow [Quick Start Guide](../../README.md#getting-started)
3. **Learning**: Use visual builder with node reference
4. **Creation**: Build first workflow
5. **Testing**: Execute and review logs
6. **Deployment**: Deploy to production (future)

### Platform Operator Journey

1. **Deployment**: Follow [Production Checklist](../deployment/production-checklist.md)
2. **Configuration**: Set up [Environments](../deployment/environments.md)
3. **Monitoring**: Configure observability and alerting
4. **Maintenance**: Handle updates and scaling
5. **Troubleshooting**: Use logs and [FAQ](../reference/faq.md)

## Documentation Accessibility

All documentation is written to be:
- **Discoverable**: Clear navigation and cross-references
- **Scannable**: Headers, lists, and code examples
- **Actionable**: Step-by-step guides with examples
- **Accurate**: Reflects actual implementation
- **Maintainable**: Easy to update as code evolves

## Related Documentation

- [Product Vision](product-vision.md) - What the platform does
- [Problem Statement](problem-statement.md) - Why the platform exists
- [Quick Start Guide](../../README.md#getting-started) - Get started quickly
