# API Design

**Purpose**: Complete REST API reference for the workflow platform.

**Audience**: Backend engineers, frontend engineers, and API consumers.

## Base URL

**Development**: `http://localhost:3001`

**Production**: Configured per environment

## Authentication

**Current**: None (development only)

**Planned**: JWT-based authentication

## Endpoints

### Health Check

#### GET /health

Check API server health.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Workflow Validation

#### POST /api/workflows/validate

Validate a workflow specification.

**Request Body**:
```typescript
WorkflowSpec {
  metadata: WorkflowMetadata;
  trigger: TriggerNode;
  nodes: BaseNode[];
  edges: WorkflowEdge[];
  settings?: WorkflowSettings;
}
```

**Response** (200 OK):
```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**Response** (400 Bad Request):
```json
{
  "valid": false,
  "errors": [
    {
      "code": "INVALID_NODE_TYPE",
      "message": "Unknown node type: INVALID_TYPE",
      "nodeId": "node-1",
      "path": "nodes[0].type"
    }
  ],
  "warnings": [
    {
      "code": "MISSING_DESCRIPTION",
      "message": "Workflow metadata missing description",
      "nodeId": null
    }
  ]
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Validation failed",
  "message": "Error message"
}
```

---

### Workflow Compilation

#### POST /api/workflows/compile

Compile a workflow specification into an execution graph.

**Request Body**:
```typescript
WorkflowSpec
```

**Response** (200 OK):
```json
{
  "success": true,
  "graph": {
    "workflowId": "uuid",
    "workflowVersion": 1,
    "trigger": { /* ExecutionNode */ },
    "nodes": { /* Map of ExecutionNode */ },
    "executionOrder": ["trigger-1", "node-1", "node-2"],
    "metadata": {
      "requiresSession": true,
      "hasSessionEnd": true,
      "maxDepth": 3,
      "hasCycles": false
    }
  },
  "warnings": []
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "errors": [
    {
      "code": "CYCLE_DETECTED",
      "message": "Cycle detected in workflow graph at node: node-1",
      "nodeId": "node-1"
    }
  ],
  "warnings": []
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Compilation failed",
  "message": "Error message"
}
```

---

### Workflow Execution

#### POST /api/workflows/execute

Execute a workflow.

**Request Body**:
```json
{
  "workflow": {
    /* WorkflowSpec */
  },
  "triggerPayload": {
    "msisdn": "+254712345678",
    "message": "Hello",
    /* Trigger-specific payload */
  },
  "sessionId": "optional-session-id",
  "options": {
    "maxExecutionTimeMs": 30000,
    "continueOnError": false,
    "dryRun": false
  }
}
```

**Response** (200 OK):
```json
{
  "executionId": "exec_1234567890",
  "status": "completed",
  "output": {
    "result": "success"
  },
  "error": null,
  "nodeResults": [
    {
      "nodeId": "trigger-1",
      "status": "success",
      "output": { /* node output */ },
      "durationMs": 10,
      "executedAt": "2024-01-01T00:00:00.000Z",
      "attempt": 0
    }
  ],
  "durationMs": 150,
  "sessionId": "session-uuid"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Compilation failed",
  "errors": [ /* CompilationError[] */ ]
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Execution failed",
  "message": "Error message"
}
```

---

### Get Execution Log

#### GET /api/workflows/executions/:executionId

Get execution log for a specific execution.

**Path Parameters**:
- `executionId` (string): Execution ID

**Response** (200 OK):
```json
{
  "executionId": "exec_1234567890",
  "workflowId": "workflow-uuid",
  "workflowVersion": 1,
  "status": "completed",
  "startedAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:01.000Z",
  "durationMs": 1000,
  "nodeResults": [ /* NodeExecutionResult[] */ ],
  "error": null
}
```

**Response** (404 Not Found):
```json
{
  "error": "Execution not found"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to get execution log",
  "message": "Error message"
}
```

---

### Query Execution Logs

#### GET /api/workflows/executions

Query execution logs with filters.

**Query Parameters**:
- `workflowId` (string, optional): Filter by workflow ID
- `status` (string, optional): Filter by status (`completed`, `failed`, `running`)
- `startDate` (string, optional): ISO timestamp - filter executions after this date
- `endDate` (string, optional): ISO timestamp - filter executions before this date
- `limit` (number, optional): Maximum number of results (default: 100)

**Example Request**:
```
GET /api/workflows/executions?workflowId=uuid&status=completed&limit=50
```

**Response** (200 OK):
```json
{
  "executions": [
    {
      "executionId": "exec_1234567890",
      "workflowId": "workflow-uuid",
      "workflowVersion": 1,
      "status": "completed",
      "startedAt": "2024-01-01T00:00:00.000Z",
      "completedAt": "2024-01-01T00:00:01.000Z",
      "durationMs": 1000
    }
  ]
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to query execution logs",
  "message": "Error message"
}
```

## Error Codes

### Validation Errors

- `INVALID_NODE_TYPE`: Unknown node type
- `INVALID_NODE_CONFIG`: Node configuration invalid
- `MISSING_REQUIRED_FIELD`: Required field missing
- `INVALID_UUID`: Invalid UUID format

### Compilation Errors

- `CYCLE_DETECTED`: Cycle detected in workflow graph
- `UNREACHABLE_NODE`: Node is unreachable from trigger
- `TRIGGER_HAS_INCOMING_EDGES`: Trigger node has incoming edges
- `USSD_MISSING_SESSION_END`: USSD workflow missing SESSION_END node
- `INVALID_NODE_CONNECTION`: Invalid connection between nodes

### Execution Errors

- `NODE_EXECUTION_FAILED`: Node execution failed
- `TIMEOUT`: Execution timeout
- `SESSION_NOT_FOUND`: Session not found
- `AT_API_ERROR`: Africa's Talking API error

## Rate Limiting

**Current**: None (development only)

**Planned**: Per-API-key rate limiting

## CORS

**Development**: Allows all origins (`*`)

**Production**: Configure allowed origins

## Related Documentation

- [Backend Services](services.md) - Backend architecture
- [Workflow Execution](../architecture/workflow-execution.md) - Execution details
- [System Overview](../architecture/system-overview.md) - Architecture overview
