# Workflow Execution

**Purpose**: Detailed documentation of the workflow execution engine.

**Audience**: Engineers working on execution engine, debugging execution issues, or extending node types.

## Execution Engine Overview

The execution engine is responsible for executing compiled workflows. It is:

- **Event-Driven**: Each node execution is independent
- **Stateless**: Execution state is stored externally (logs, sessions)
- **Resumable**: Can pause and resume execution (future enhancement)
- **Idempotent**: Safe to retry individual steps
- **Horizontally Scalable**: Multiple workers can execute steps

## Execution Graph

Before execution, a `WorkflowSpec` is compiled into an `ExecutionGraph`:

```typescript
ExecutionGraph {
  workflowId: string;
  workflowVersion: number;
  trigger: ExecutionNode;
  nodes: Map<string, ExecutionNode>;
  executionOrder: string[];  // Topologically sorted node IDs
  metadata: {
    requiresSession: boolean;
    hasSessionEnd: boolean;
    maxDepth: number;
    hasCycles: boolean;
  }
}
```

### Execution Node

```typescript
ExecutionNode {
  id: string;
  type: string;
  definition: NodeDefinition;
  config: Record<string, unknown>;
  retry?: RetryConfig;
  timeout: number;
  disabled: boolean;
  incomingEdges: ExecutionEdge[];
  outgoingEdges: ExecutionEdge[];
  metadata: {
    requiresSession: boolean;
    endsSession: boolean;
    executionOrder: number;
  }
}
```

## Execution Process

### 1. Compilation

```typescript
const compileResult = compileWorkflow(workflowSpec);
// Returns: ExecutionGraph or CompilationError[]
```

Compilation:
- Validates workflow structure
- Validates node configurations
- Builds execution graph
- Topologically sorts nodes
- Detects cycles and unreachable nodes

### 2. Execution Start

```typescript
const result = await executionEngine.execute(
  graph,
  triggerPayload,
  session?,
  options?
);
```

Execution options:
- `maxExecutionTimeMs`: Maximum execution duration
- `continueOnError`: Whether to continue on non-critical errors
- `dryRun`: Execute without side effects (future)

### 3. Node Execution Loop

```
1. Start with trigger node
2. Execute node:
   a. Resolve variables in config
   b. Load node executor
   c. Execute node logic
   d. Handle result/error
   e. Retry if needed
3. Store node result
4. Determine next nodes from outgoing edges
5. Execute next nodes (parallel if possible)
6. Repeat until all nodes complete or workflow fails
```

### 4. Execution Result

```typescript
ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'timeout' | 'cancelled';
  output: Record<string, unknown>;
  error?: NodeError;
  nodeResults: NodeExecutionResult[];
  durationMs: number;
  sessionId?: string;
}
```

## Node Execution

### Node Executor Interface

```typescript
interface INodeExecutor {
  execute(
    node: ExecutionNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
}
```

### Execution Steps

1. **Variable Resolution**: Replace `{{variable}}` in node config
2. **Validation**: Validate resolved config against node schema
3. **Execution**: Run node-specific logic
4. **Result Handling**: Format result or error
5. **Logging**: Log execution result

### Node Result

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

## Retry Logic

### Retry Configuration

```typescript
RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier?: number;  // Default: 2
  maxDelayMs?: number;
  retryableErrors?: string[];  // Error codes to retry
}
```

### Retry Process

1. Node execution fails
2. Check if error is retryable
3. Check if max attempts reached
4. Calculate delay: `min(initialDelayMs * (backoffMultiplier ^ attempt), maxDelayMs)`
5. Wait for delay
6. Retry node execution
7. Repeat until success or max attempts

### Retryable Errors

- `transient`: Network errors, temporary failures
- `rate_limit`: Rate limiting errors
- `validation`: Config validation errors (usually not retryable)

## Error Handling

### Error Types

```typescript
NodeError {
  code: string;  // Machine-readable error code
  message: string;  // Human-readable message
  type: 'transient' | 'permanent' | 'rate_limit' | 'validation';
  details?: Record<string, unknown>;
  stack?: string;
}
```

### Error Propagation

1. Node execution fails
2. Error is categorized (transient/permanent)
3. Retry logic applied (if retryable)
4. If retry fails or not retryable:
   - Check workflow `errorHandling.continueOnError`
   - If true: Continue to next nodes
   - If false: Fail workflow execution
5. Error logged in execution log

## Conditional Execution

### Edge Conditions

Edges can have conditions:

```typescript
WorkflowEdge {
  source: string;
  target: string;
  condition?: string;  // e.g., "success", "error", "condition_met"
}
```

### Condition Evaluation

- `success`: Node executed successfully
- `error`: Node execution failed
- `condition_met`: Custom condition evaluated to true
- No condition: Always follow edge

### Conditional Logic Nodes

- **CONDITION**: Branch based on expression
- **SWITCH**: Branch based on value match

## Parallel Execution

Nodes without dependencies can execute in parallel:

```
Node A → Node B
Node A → Node C
Node B → Node D
Node C → Node D
```

Execution order:
1. Execute Node A
2. Execute Node B and Node C in parallel
3. Execute Node D (after B and C complete)

## Session Integration

### Session-Aware Execution

Nodes that require sessions:
- `requiresSession: true` in node metadata
- Execution engine ensures session exists
- Session passed in execution context

### Session State Updates

- **SESSION_READ**: Reads `session.data`
- **SESSION_WRITE**: Updates `session.data`
- **SESSION_END**: Marks session inactive

## Timeout Handling

### Node Timeout

Each node can have a timeout:

```typescript
timeout: number;  // Milliseconds
```

If execution exceeds timeout:
- Execution is cancelled
- Node marked as `timeout`
- Error logged
- Workflow continues or fails based on error handling

### Workflow Timeout

Global workflow timeout:

```typescript
settings: {
  maxExecutionTimeMs: number;
}
```

If workflow exceeds timeout:
- All pending nodes cancelled
- Workflow marked as `timeout`
- Execution result returned

## Execution Logging

Every execution step is logged:

1. **Execution Start**: Workflow execution begins
2. **Node Execution**: Each node execution logged
3. **Node Result**: Success/error result logged
4. **Execution End**: Workflow execution completes

Logs are queryable via:
- `GET /api/workflows/executions/:id` - Single execution
- `GET /api/workflows/executions` - Query multiple executions

## Performance Considerations

### Optimization Strategies

1. **Lazy Evaluation**: Only execute nodes that are reachable
2. **Parallel Execution**: Execute independent nodes in parallel
3. **Caching**: Cache compiled graphs (future)
4. **Batching**: Batch AT API calls (future)

### Scalability

- Stateless execution allows horizontal scaling
- Multiple workers can execute different workflows
- Session state stored in Redis (distributed)
- Execution logs stored separately (future: database)

## Related Documentation

- [System Overview](system-overview.md) - High-level architecture
- [Data Flow](data-flow.md) - Data flow through system
- [Session Management](session-management.md) - Session handling
- [Backend Services](../backend/services.md) - Backend components
