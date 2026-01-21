# FAQ

**Purpose**: Frequently asked questions and answers.

**Audience**: All users of the platform.

## General

### What is this platform?

A workflow automation platform specifically designed for Africa's Talking services (SMS, USSD, Voice, Payments). It provides a visual workflow builder and execution engine.

### Who is this for?

- Developers building automation workflows
- Businesses automating customer interactions
- Operators managing workflow execution

### How does it compare to Zapier/n8n?

This platform is specifically optimized for Africa's Talking and African telecom workflows, with native support for USSD, session management, and AT-specific features.

## Getting Started

### How do I get started?

See the [Quick Start Guide](../../README.md#getting-started) for installation and setup instructions.

### What are the prerequisites?

- Node.js 18+
- TypeScript 5+
- Redis (for session management, planned)
- Africa's Talking account

### How do I create my first workflow?

1. Start the development servers
2. Open the workflow builder UI
3. Drag nodes onto the canvas
4. Connect nodes with edges
5. Configure each node
6. Save the workflow

## Workflows

### What is a workflow?

A workflow is a visual representation of a business process consisting of nodes (steps) and edges (connections). Workflows are executable, not just diagrams.

### How do I execute a workflow?

Use the API endpoint `POST /api/workflows/execute` with the workflow spec and trigger payload.

### Can I save workflows?

Currently, workflows are stored in-memory. Database persistence is planned.

### How do I debug a workflow?

Check execution logs via `GET /api/workflows/executions/:id` to see detailed node-by-node execution results.

## Nodes

### What node types are available?

See the [Glossary](glossary.md) for a complete list of node types.

### How do I use variables in node configs?

Use `{{variable}}` syntax:
- `{{msisdn}}`: Phone number from trigger
- `{{session.data.key}}`: Session data
- `{{node_<id>.output}}`: Previous node output

### How do I handle errors?

Use RETRY nodes for transient failures. Configure retry logic with max attempts and backoff.

## Sessions

### What are sessions?

Sessions maintain state across multiple interactions (USSD menus, Voice calls). They store data that persists between workflow executions.

### When do I need sessions?

Sessions are required for:
- USSD workflows (multi-step menus)
- Voice/IVR workflows (multi-step interactions)

### How do I end a session?

Use the SESSION_END node to explicitly end a session.

## Africa's Talking

### How do I configure AT credentials?

Set environment variables:
```env
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox
```

### Can I test without real AT charges?

Yes, use the sandbox environment for testing.

### How do I handle AT API errors?

AT API errors are automatically categorized and retried if transient. Check execution logs for error details.

## API

### What API endpoints are available?

See [API Design](../backend/api-design.md) for complete API documentation.

### How do I authenticate?

Currently, no authentication is required (development only). JWT authentication is planned.

### Is there rate limiting?

Currently, no rate limiting (development only). Rate limiting is planned.

## Deployment

### How do I deploy to production?

See [Production Checklist](../deployment/production-checklist.md) for deployment requirements.

### What infrastructure do I need?

- Node.js runtime
- Database (PostgreSQL planned)
- Redis (for sessions)
- Load balancer (for scaling)

### How do I monitor the platform?

Set up monitoring for:
- Application metrics
- Database performance
- Redis performance
- Error rates
- Execution logs

## Troubleshooting

### Workflow won't compile

Check validation errors via `POST /api/workflows/validate`. Common issues:
- Invalid node types
- Missing required fields
- Invalid node connections
- Cycles in workflow graph

### Execution fails

Check execution logs for error details. Common issues:
- Invalid AT credentials
- Network errors
- Invalid node configuration
- Session not found

### Frontend won't load

- Ensure backend is running
- Check browser console for errors
- Verify Vite dev server is running
- Check CORS configuration

## Related Documentation

- [Glossary](glossary.md) - Terminology
- [Quick Start Guide](../../README.md#getting-started) - Getting started
- [API Design](../backend/api-design.md) - API reference
