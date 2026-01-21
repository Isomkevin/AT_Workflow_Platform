# Africa's Talking Workflow Automation Platform

A world-class, production-ready workflow automation platform comparable to Zapier, n8n, and Twilio Studio — but deeply optimized for Africa's Talking (AT) and African telecom workflows.

## Architecture

The platform is built with clean architecture principles and strict separation of concerns:

```
/shared
  /workflow-spec      # Canonical workflow specification types
  /node-definitions   # All node type definitions (triggers, actions, logic, state)

/backend
  /compiler          # Workflow compiler (validates & transforms specs)
  /execution-engine     # Event-driven workflow execution engine
  /adapters/africas-talking  # AT API abstraction layer
  /state                # Session state management (Redis)
  /logging              # Observability & execution logging
  /api                  # REST API server

/frontend
  /workflow-builder    # React Flow-based visual workflow builder
```

## Features

### Core Capabilities

- **Visual Workflow Builder**: React Flow-based canvas with drag-and-drop node creation
- **Executable Workflows**: Not just diagrams — real, executable orchestration
- **Native AT Integration**: SMS, USSD, Voice/IVR, Payments
- **Session Management**: Stateful workflows for USSD and Voice sessions
- **Full Observability**: Per-workflow and per-node execution logs
- **Validation & Compilation**: Strong type checking and graph validation
- **Retry & Error Handling**: Configurable retries with exponential backoff
- **Execution Replay**: Visual playback of workflow executions

### Node Types

**Triggers:**
- SMS_RECEIVED
- USSD_SESSION_START
- INCOMING_CALL
- PAYMENT_CALLBACK
- SCHEDULED (cron)
- HTTP_WEBHOOK

**Actions:**
- SEND_SMS
- SEND_USSD_RESPONSE
- INITIATE_CALL
- PLAY_IVR
- COLLECT_DTMF
- REQUEST_PAYMENT
- REFUND_PAYMENT
- HTTP_REQUEST

**Logic:**
- CONDITION
- SWITCH
- DELAY
- RETRY
- RATE_LIMIT
- MERGE

**State:**
- SESSION_READ
- SESSION_WRITE
- SESSION_END

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Redis (for session management)

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend/workflow-builder
npm install
```

### Development

**Option 1: Run all services together (recommended)**
```bash
# Install concurrently if not already installed
npm install

# Start backend, frontend, and landing page together
npm run dev:all
```

**Option 2: Run services separately**
```bash
# Terminal 1: Start backend API server
npm run dev

# Terminal 2: Start workflow builder frontend
npm run dev:frontend

# Terminal 3: Start landing page
npm run dev:landing
```

**Access the applications:**
- **Landing Page**: http://localhost:3000 (Next.js)
- **Workflow Builder**: http://localhost:5173 (Vite/React)
- **Backend API**: http://localhost:3001 (Express)

### Configuration

Create a `.env` file for Africa's Talking credentials:

```env
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox
```

## Usage

### Creating a Workflow

1. Open the workflow builder UI
2. Drag nodes from the sidebar onto the canvas
3. Connect nodes by dragging from output handles to input handles
4. Configure each node by clicking on it
5. Save the workflow

### Workflow Specification

Workflows are defined as JSON following the canonical `WorkflowSpec` format:

```typescript
{
  metadata: {
    workflowId: "uuid",
    version: 1,
    name: "My Workflow",
    createdBy: "user",
    createdAt: "2024-01-01T00:00:00Z"
  },
  trigger: {
    id: "trigger-1",
    type: "SMS_RECEIVED",
    label: "SMS Received",
    config: { ... }
  },
  nodes: [ ... ],
  edges: [ ... ]
}
```

### API Endpoints

- `POST /api/workflows/validate` - Validate a workflow spec
- `POST /api/workflows/compile` - Compile a workflow spec
- `POST /api/workflows/execute` - Execute a workflow
- `GET /api/workflows/executions/:id` - Get execution log
- `GET /api/workflows/executions` - Query execution logs

## Architecture Decisions

### Why This Architecture?

1. **Clean Separation**: Frontend, backend, and shared code are strictly separated
2. **Type Safety**: Full TypeScript with Zod validation
3. **Scalability**: Stateless execution engine can scale horizontally
4. **Observability**: Every step is logged and traceable
5. **Resumability**: Execution can be paused and resumed
6. **AI-Ready**: Machine-interpretable workflow spec for future AI features

### Tradeoffs

- **In-Memory State**: Current session manager uses in-memory Map (replace with Redis in production)
- **Simple Expression Parser**: Basic expression evaluation (use expr-eval library for production)
- **No Database**: Workflows are stored in-memory (add PostgreSQL/MongoDB for persistence)

## Production Considerations

Before deploying to production:

1. **Replace in-memory storage** with Redis/PostgreSQL
2. **Add authentication** and authorization
3. **Implement rate limiting** at API level
4. **Add distributed tracing** (OpenTelemetry)
5. **Implement workflow versioning** and migration
6. **Add webhook signature verification** for AT callbacks
7. **Set up monitoring** and alerting
8. **Add database migrations** for workflow storage

## License

MIT

## Contributing

This is a production-grade foundation. Contributions should maintain the same quality bar:
- Strong typing
- Clean architecture
- Comprehensive error handling
- Full observability
