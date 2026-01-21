# Data Flow

**Purpose**: Document how data flows through the system during workflow creation and execution.

**Audience**: Engineers understanding system behavior and debugging data issues.

## Workflow Specification Flow

### Creation Flow

```
User Input (UI)
    ↓
React Flow Canvas State
    ↓
WorkflowSpec JSON Generation
    ↓
POST /api/workflows/validate
    ↓
Backend Validation
    ↓
Validation Results → UI Feedback
```

### WorkflowSpec Structure

```typescript
{
  metadata: {
    workflowId: string;
    version: number;
    name: string;
    createdBy: string;
    createdAt: string;
  },
  trigger: TriggerNode,
  nodes: BaseNode[],
  edges: WorkflowEdge[],
  settings?: WorkflowSettings
}
```

## Workflow Execution Flow

### Execution Request Flow

```
Trigger Event (SMS, USSD, HTTP, etc.)
    ↓
POST /api/workflows/execute
    ↓
Request Body: { workflow, triggerPayload, sessionId?, options? }
    ↓
Compile Workflow → ExecutionGraph
    ↓
Create/Retrieve Session (if needed)
    ↓
ExecutionEngine.execute()
    ↓
Node-by-Node Execution
    ↓
ExecutionResult
    ↓
Log Execution
    ↓
Return Response
```

### Execution Context Flow

During execution, an `ExecutionContext` is passed through nodes:

```typescript
ExecutionContext {
  executionId: string;
  workflowId: string;
  workflowVersion: number;
  triggerPayload: Record<string, unknown>;
  session?: SessionState;
  variables: Record<string, unknown>;
  startedAt: string;
}
```

**Variable Resolution**:
- `{{msisdn}}` → `triggerPayload.msisdn`
- `{{message}}` → `triggerPayload.message`
- `{{session.data.key}}` → `session.data.key`
- `{{node_<id>.output}}` → Previous node output

## Node Execution Flow

### Single Node Execution

```
Node Execution Start
    ↓
Load Node Executor
    ↓
Resolve Variables in Config
    ↓
Execute Node Logic
    ↓
Handle Success/Error
    ↓
Retry on Failure (if configured)
    ↓
Store Node Result
    ↓
Update Execution Context
    ↓
Continue to Next Nodes
```

### Node Result Flow

```typescript
NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped' | 'timeout';
  output?: Record<string, unknown>;
  error?: NodeError;
  durationMs: number;
  executedAt: string;
  attempt: number;
}
```

Results are:
1. Stored in execution log
2. Added to execution context variables
3. Available to subsequent nodes via `{{node_<id>.output}}`

## Session State Flow

### Session Lifecycle

```
USSD/Voice Trigger
    ↓
Create Session
    ↓
SessionState {
  sessionId: string;
  type: 'ussd' | 'voice';
  msisdn: string;
  data: Record<string, unknown>;
  isActive: true;
}
    ↓
Store in SessionManager (Redis)
    ↓
Workflow Execution
    ↓
SESSION_READ → Read session.data
    ↓
SESSION_WRITE → Update session.data
    ↓
SESSION_END → Mark session inactive
    ↓
Session Expires (TTL)
```

### Session Data Access

- **Read**: `SESSION_READ` node → `{{session.data.key}}`
- **Write**: `SESSION_WRITE` node → Updates `session.data`
- **End**: `SESSION_END` node → Sets `isActive: false`

## Template Rendering Flow

### Variable Substitution

```
Node Config: { "message": "Hello {{msisdn}}" }
    ↓
Template Renderer
    ↓
Resolve Variables:
  - {{msisdn}} → triggerPayload.msisdn
  - {{message}} → triggerPayload.message
  - {{session.data.name}} → session.data.name
  - {{node_123.output.result}} → Previous node output
    ↓
Rendered Config: { "message": "Hello +254712345678" }
    ↓
Pass to Node Executor
```

## Error Flow

### Error Handling

```
Node Execution Error
    ↓
NodeError {
  code: string;
  message: string;
  type: 'transient' | 'permanent' | 'rate_limit' | 'validation';
}
    ↓
Check Retry Config
    ↓
If Retryable:
  - Wait (exponential backoff)
  - Retry node execution
  - Max attempts check
    ↓
If Not Retryable or Max Attempts:
  - Mark node as failed
  - Check workflow error handling
  - Continue or fail workflow
    ↓
Log Error
    ↓
Return Error in ExecutionResult
```

## Logging Flow

### Execution Logging

```
Execution Start
    ↓
logExecutionStart(executionId, workflowId, version)
    ↓
For Each Node:
  logNodeExecution(nodeId, result)
    ↓
Execution End
    ↓
logExecutionEnd(executionId, status)
    ↓
Store Complete Log
    ↓
Available via GET /api/workflows/executions/:id
```

### Log Structure

```typescript
ExecutionLog {
  executionId: string;
  workflowId: string;
  workflowVersion: number;
  status: 'completed' | 'failed' | 'running';
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  nodeResults: NodeExecutionResult[];
  error?: NodeError;
}
```

## Africa's Talking Integration Flow

### AT API Call Flow

```
Node Executor (e.g., SendSMSExecutor)
    ↓
ATClient Method Call
    ↓
AT API Request
    ↓
AT API Response
    ↓
Parse Response
    ↓
Handle Success/Error
    ↓
Return Node Result
```

### AT Adapter Responsibilities

- API authentication
- Request formatting
- Response parsing
- Error handling
- Rate limiting
- Retry logic

## Related Documentation

- [System Overview](system-overview.md) - High-level architecture
- [Workflow Execution](workflow-execution.md) - Execution engine details
- [Session Management](session-management.md) - Session handling
- [API Design](../backend/api-design.md) - API endpoints
