# Africa's Talking Workflow Automation Platform

A production-ready workflow automation platform for Africa's Talking services. Build, deploy, and manage complex automation workflows with a visual builder and powerful execution engine.

## What Is This?

A workflow orchestration system specifically designed for African telecom workflows. Unlike generic automation tools, this platform provides:

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **Executable Workflows**: Real orchestration, not just diagrams
- **Native AT Integration**: SMS, USSD, Voice/IVR, and Payments
- **Session Management**: Stateful workflows for USSD and Voice sessions
- **Full Observability**: Complete execution logging and replay

## Quick Start

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Redis (for session management - planned)

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend/workflow-builder && npm install && cd ../..

# Install landing page dependencies
cd landing && npm install && cd ..
```

### Development

**Start all services:**
```bash
npm run dev:all
```

This starts:
- **Backend API**: http://localhost:3001
- **Workflow Builder**: http://localhost:5173
- **Landing Page**: http://localhost:3000

**Or run services separately:**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Landing
npm run dev:landing
```

### Configuration

Create a `.env` file in the root:

```env
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox
```

## Architecture Snapshot

```
Frontend (React Flow) → Backend API → Execution Engine
                                    ↓
                          Compiler | Session Manager | AT Adapter
```

The platform uses clean architecture with strict separation:
- **Frontend**: Visual workflow builder UI
- **Backend**: REST API, compiler, execution engine
- **Shared**: Type definitions and node definitions

## Key Features

- **Visual Builder**: Drag-and-drop workflow creation
- **Node Types**: Triggers, Actions, Logic, State operations
- **Session Support**: USSD and Voice session state management
- **Error Handling**: Configurable retries with exponential backoff
- **Observability**: Per-node execution logs and replay
- **Type Safety**: Full TypeScript with Zod validation

## Documentation

**📚 [Complete Documentation →](docs/README.md)**

The documentation is organized into:

- **[Overview](docs/overview/)** - Product vision, problem statement, target users
- **[Architecture](docs/architecture/)** - System design, data flow, execution engine
- **[Backend](docs/backend/)** - Services, API design, database
- **[Frontend](docs/frontend/)** - UI architecture, state management
- **[Integrations](docs/integrations/)** - Africa's Talking, third-party APIs, webhooks
- **[Security](docs/security/)** - Authentication, secrets management, best practices
- **[Deployment](docs/deployment/)** - Environments, CI/CD, production checklist
- **[Testing](docs/testing/)** - Testing strategy and coverage
- **[Contributing](docs/contributing/)** - Contribution guide and code style
- **[Reference](docs/reference/)** - Glossary and FAQ

## Deployment

For production deployment, see the [Production Checklist](docs/deployment/production-checklist.md).

**Before deploying:**
- Replace in-memory storage with Redis/PostgreSQL
- Add authentication and authorization
- Implement rate limiting
- Set up monitoring and alerting
- Configure webhook signature verification

## Security

Security is a priority. See [Security Best Practices](docs/security/best-practices.md) for guidelines.

**Current state**: Development mode (no authentication)
**Planned**: JWT authentication, RBAC, secrets management

## License

MIT

## Contributing

Contributions are welcome! See the [Contribution Guide](docs/contributing/contribution-guide.md) for details.

---

**Need help?** Check the [FAQ](docs/reference/faq.md) or [documentation index](docs/README.md).
