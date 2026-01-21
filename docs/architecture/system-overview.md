# System Overview

**Purpose**: Provide a high-level architectural overview of the platform.

**Audience**: Engineers, architects, and technical stakeholders.

## Architecture Principles

The platform is built with these architectural principles:

1. **Clean Separation**: Strict boundaries between frontend, backend, and shared code
2. **Type Safety**: Full TypeScript with Zod validation at every boundary
3. **Stateless Execution**: Execution engine is stateless for horizontal scalability
4. **Event-Driven**: Workflow execution is event-driven and resumable
5. **Observable**: Every execution step is logged and traceable

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Workflow Builder (React Flow)                       │   │
│  │  - Visual canvas                                     │   │
│  │  - Node configuration                                │   │
│  │  - Workflow validation                               │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────────────────┐
│                    Backend API Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express REST API                                    │   │
│  │  - Workflow validation                               │   │
│  │  - Workflow compilation                              │   │
│  │  - Workflow execution                                │   │
│  │  - Execution logging                                 │   │
│  └─────┬──────────────┬──────────────┬──────────────────┘   │
└────────┼──────────────┼──────────────┼──────────────────────┘
         │              │              │
    ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
    │Compiler │   │Execution  │  │ Logging │
    │         │   │  Engine   │  │         │
    └─────────┘   └─────┬─────┘  └─────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    ┌────▼────┐                ┌───────▼──────┐
    │   AT    │                │   Session    │
    │ Adapter │                │   Manager    │
    └─────────┘                └──────────────┘
```

## Component Breakdown

### Frontend (`/frontend/workflow-builder`)

**Technology**: React, TypeScript, React Flow, Vite

**Responsibilities**:
- Visual workflow canvas
- Node drag-and-drop
- Node configuration UI
- Workflow validation feedback
- Workflow persistence (future)

**Key Components**:
- `WorkflowBuilder`: Main canvas component
- `CustomNode`: Node rendering component
- `NodeConfigPanel`: Node configuration UI

### Backend (`/backend`)

#### API Server (`/backend/api`)

**Technology**: Express, TypeScript

**Responsibilities**:
- REST API endpoints
- Request validation
- Error handling
- CORS configuration

**Endpoints**:
- `POST /api/workflows/validate` - Validate workflow spec
- `POST /api/workflows/compile` - Compile workflow spec
- `POST /api/workflows/execute` - Execute workflow
- `GET /api/workflows/executions/:id` - Get execution log
- `GET /api/workflows/executions` - Query execution logs

#### Compiler (`/backend/compiler`)

**Responsibilities**:
- Validate workflow specification
- Build execution graph
- Topological sort for execution order
- Detect cycles and unreachable nodes
- Validate node configurations

**Key Functions**:
- `compileWorkflow()`: Main compilation function
- `buildExecutionGraph()`: Convert spec to execution graph
- `validateExecutionGraph()`: Semantic validation

#### Execution Engine (`/backend/execution-engine`)

**Responsibilities**:
- Execute compiled workflows
- Manage execution state
- Handle node execution
- Coordinate retries and error handling
- Template rendering for variable substitution

**Key Classes**:
- `WorkflowExecutionEngine`: Main execution orchestrator
- Node executors: Type-specific execution logic

#### State Management (`/backend/state`)

**Technology**: Redis (planned), in-memory (current)

**Responsibilities**:
- Session state management
- Session lifecycle (create, read, update, delete)
- Session expiration
- Multi-session coordination

**Key Interfaces**:
- `ISessionManager`: Session management interface
- `RedisSessionManager`: Redis-based implementation

#### Logging (`/backend/logging`)

**Responsibilities**:
- Execution logging
- Node-level logging
- Log querying
- Execution replay data

**Key Functions**:
- `logExecutionStart()`: Log workflow start
- `logExecutionEnd()`: Log workflow completion
- `logNodeExecution()`: Log individual node execution
- `getExecutionLog()`: Retrieve execution logs

#### Africa's Talking Adapter (`/backend/adapters/africas-talking`)

**Responsibilities**:
- AT API client abstraction
- Node-specific executors (SMS, USSD, Voice, Payments)
- Error handling and retries
- Rate limiting

**Key Classes**:
- `ATClient`: AT API client
- `SendSMSExecutor`: SMS sending executor
- `SendUSSDResponseExecutor`: USSD response executor
- `InitiateCallExecutor`: Voice call executor
- `RequestPaymentExecutor`: Payment request executor

### Shared (`/shared`)

#### Workflow Specification (`/shared/workflow-spec`)

**Responsibilities**:
- Canonical workflow type definitions
- Workflow validation schemas
- Type guards and utilities

**Key Types**:
- `WorkflowSpec`: Complete workflow specification
- `WorkflowMetadata`: Workflow metadata
- `BaseNode`: Base node interface
- `TriggerNode`: Trigger node types
- `WorkflowEdge`: Edge/connection definition

#### Node Definitions (`/shared/node-definitions`)

**Responsibilities**:
- Node type registry
- Node configuration schemas
- Node metadata (inputs, outputs, requirements)

**Node Categories**:
- **Triggers**: SMS_RECEIVED, USSD_SESSION_START, INCOMING_CALL, etc.
- **Actions**: SEND_SMS, SEND_USSD_RESPONSE, INITIATE_CALL, etc.
- **Logic**: CONDITION, SWITCH, DELAY, RETRY, etc.
- **State**: SESSION_READ, SESSION_WRITE, SESSION_END

## Data Flow

### Workflow Creation Flow

1. User creates workflow in visual builder
2. Frontend generates `WorkflowSpec` JSON
3. Frontend sends spec to `/api/workflows/validate`
4. Backend validates spec structure and node configs
5. Frontend displays validation results
6. User saves workflow (future: persistence)

### Workflow Execution Flow

1. Trigger event occurs (SMS received, USSD session start, etc.)
2. Backend receives trigger payload
3. Backend compiles workflow spec to execution graph
4. Execution engine starts workflow execution
5. Engine executes nodes in topological order
6. Each node executor performs its action
7. Results are logged and passed to next nodes
8. Execution completes or fails
9. Execution log is stored and available for querying

### Session Management Flow

1. USSD/Voice trigger creates session
2. Session manager creates session with unique ID
3. Session state stored in Redis
4. Workflow nodes read/write session data
5. Session persists across multiple interactions
6. Session ends when SESSION_END node executes
7. Session expires after TTL or explicit end

## Technology Stack

### Frontend
- **React 18+**: UI framework
- **TypeScript 5+**: Type safety
- **React Flow**: Visual workflow canvas
- **Vite**: Build tool and dev server

### Backend
- **Node.js 18+**: Runtime
- **Express**: Web framework
- **TypeScript 5+**: Type safety
- **Zod**: Runtime validation
- **Redis**: Session storage (planned)

### Shared
- **TypeScript**: Type definitions
- **Zod**: Validation schemas

## Scalability Considerations

### Current State
- Stateless execution engine (horizontally scalable)
- In-memory session manager (single instance)
- In-memory workflow storage (single instance)

### Production Requirements
- Redis for distributed session management
- Database for workflow persistence
- Message queue for async execution (future)
- Load balancer for API servers
- Distributed tracing (OpenTelemetry)

## Related Documentation

- [Data Flow](data-flow.md) - Detailed data flow diagrams
- [Workflow Execution](workflow-execution.md) - Execution engine details
- [Session Management](session-management.md) - Session handling
- [Backend Services](../backend/services.md) - Backend component details
- [API Design](../backend/api-design.md) - API reference
