# Backend Services

**Purpose**: Document the backend service architecture and components.

**Audience**: Backend engineers, system architects, and operators.

## Service Overview

The backend is organized into focused services with clear responsibilities:

```
/backend
  /api              # REST API server
  /compiler         # Workflow compilation
  /execution-engine # Workflow execution
  /state            # Session management
  /logging          # Execution logging
  /adapters         # External service adapters
```

## API Server

**Location**: `backend/api/`

**Technology**: Express, TypeScript

**Responsibilities**:
- HTTP request handling
- Route definition
- Request validation
- Error handling
- CORS configuration

### Server Setup

```typescript
// backend/api/server.ts
export function createApp(atConfig?: {
  username: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}): express.Application
```

### Middleware

- **JSON Parsing**: `express.json()`
- **URL Encoding**: `express.urlencoded()`
- **CORS**: Configured for development (adjust for production)
- **Error Handling**: Global error handler

### Routes

- `/api/workflows/*` - Workflow management routes
- `/health` - Health check endpoint

## Compiler Service

**Location**: `backend/compiler/`

**Responsibilities**:
- Validate workflow specifications
- Build execution graphs
- Topological sorting
- Cycle detection
- Node configuration validation

### Main Function

```typescript
// backend/compiler/compiler.ts
export function compileWorkflow(spec: WorkflowSpec): CompilationResult
```

### Compilation Steps

1. **Structure Validation**: Validate workflow spec structure
2. **Node Registry Check**: Verify all node types exist
3. **Config Validation**: Validate node configurations
4. **Graph Building**: Build execution graph
5. **Graph Validation**: Semantic validation (cycles, unreachable nodes)

### Compilation Result

```typescript
CompilationResult {
  success: boolean;
  graph?: ExecutionGraph;
  errors: CompilationError[];
  warnings: CompilationWarning[];
}
```

## Execution Engine Service

**Location**: `backend/execution-engine/`

**Responsibilities**:
- Execute compiled workflows
- Manage execution state
- Coordinate node execution
- Handle retries and errors
- Template rendering

### Main Class

```typescript
// backend/execution-engine/executor.ts
export class WorkflowExecutionEngine {
  registerExecutor(nodeType: string, executor: INodeExecutor): void;
  execute(
    graph: ExecutionGraph,
    triggerPayload: Record<string, unknown>,
    session?: SessionState,
    options?: ExecutionOptions
  ): Promise<ExecutionResult>;
}
```

### Node Executors

Node executors implement `INodeExecutor`:

```typescript
interface INodeExecutor {
  execute(
    node: ExecutionNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
}
```

Executors are registered per node type:
- `SEND_SMS` → `SendSMSExecutor`
- `SEND_USSD_RESPONSE` → `SendUSSDResponseExecutor`
- `INITIATE_CALL` → `InitiateCallExecutor`
- etc.

## State Management Service

**Location**: `backend/state/`

**Responsibilities**:
- Session creation and management
- Session state persistence
- Session expiration
- Session lifecycle management

### Interface

```typescript
// backend/state/session-manager.ts
export interface ISessionManager {
  createSession(session: SessionState): Promise<SessionState>;
  getSession(sessionId: string): Promise<SessionState | null>;
  updateSession(sessionId: string, updates: Partial<SessionState>): Promise<SessionState>;
  deleteSession(sessionId: string): Promise<void>;
  endSession(sessionId: string): Promise<void>;
}
```

### Current Implementation

**In-Memory Session Manager**:
- Stores sessions in `Map<string, SessionState>`
- Single instance only
- Lost on restart

### Planned Implementation

**Redis Session Manager**:
- Distributed storage
- Persistent across restarts
- Automatic TTL expiration

## Logging Service

**Location**: `backend/logging/`

**Responsibilities**:
- Execution logging
- Node-level logging
- Log querying
- Execution replay data

### Main Functions

```typescript
// backend/logging/logger.ts
export const logger = {
  log(level: string, message: string, data?: Record<string, unknown>): void;
  logExecutionStart(executionId: string, workflowId: string, version: number): void;
  logExecutionEnd(executionId: string, status: string): void;
  logNodeExecution(nodeId: string, result: NodeExecutionResult): void;
  getExecutionLog(executionId: string): Promise<ExecutionLog | null>;
  queryExecutionLogs(filters: ExecutionLogFilters): Promise<ExecutionLog[]>;
};
```

### Log Storage

**Current**: In-memory storage (development)

**Planned**: Database storage (PostgreSQL/MongoDB)

## Adapters

**Location**: `backend/adapters/`

**Responsibilities**:
- External service integration
- API client abstraction
- Error handling
- Rate limiting

### Africa's Talking Adapter

**Location**: `backend/adapters/africas-talking/`

**Components**:
- `ATClient`: AT API client
- Node executors: Type-specific executors

**Supported Services**:
- SMS sending
- USSD responses
- Voice/IVR calls
- Payment requests
- Payment refunds

## Service Dependencies

```
API Server
  ├── Compiler
  ├── Execution Engine
  │   ├── Node Executors
  │   │   └── AT Adapter
  │   └── Template Renderer
  ├── Session Manager
  └── Logger
```

## Service Initialization

```typescript
// backend/server.ts
const app = createApp({
  username: process.env.AT_USERNAME,
  apiKey: process.env.AT_API_KEY,
  environment: process.env.AT_ENVIRONMENT as 'sandbox' | 'production',
});

// Initialize execution engine
const executionEngine = new WorkflowExecutionEngine();

// Register AT node executors
executionEngine.registerExecutor('SEND_SMS', new SendSMSExecutor(atClient));
// ... more executors

// Initialize session manager
const sessionManager = new RedisSessionManager(3600);

// Create routes
app.use('/api/workflows', createWorkflowRoutes(executionEngine, sessionManager));
```

## Error Handling

### Error Types

- **Validation Errors**: Invalid workflow spec or node config
- **Compilation Errors**: Graph structure issues
- **Execution Errors**: Node execution failures
- **System Errors**: Infrastructure failures

### Error Response Format

```typescript
{
  error: string;        // Error type
  message: string;      // Human-readable message
  details?: unknown;    // Additional error details
}
```

## Performance Considerations

### Optimization Strategies

- **Lazy Compilation**: Compile only when needed
- **Graph Caching**: Cache compiled graphs (future)
- **Parallel Execution**: Execute independent nodes in parallel
- **Connection Pooling**: Reuse AT API connections

### Scalability

- Stateless services enable horizontal scaling
- Session state in Redis (distributed)
- Execution logs in database (future)
- Load balancer for API servers

## Related Documentation

- [System Overview](../architecture/system-overview.md) - High-level architecture
- [API Design](api-design.md) - API reference
- [Database](database.md) - Data persistence
- [Workflow Execution](../architecture/workflow-execution.md) - Execution details
