# Database

**Purpose**: Document database design and data persistence strategy.

**Audience**: Backend engineers, database administrators, and system architects.

## Current State

**Workflow Storage**: In-memory (development only)

**Session Storage**: In-memory Map (development only)

**Execution Logs**: In-memory (development only)

## Planned Database Architecture

### Database Choice

**Primary Database**: PostgreSQL (recommended) or MongoDB

**Session Storage**: Redis (already planned)

**Rationale**:
- PostgreSQL: Strong consistency, ACID transactions, JSON support
- MongoDB: Flexible schema, good for workflow documents
- Redis: Fast, distributed, TTL support for sessions

## Data Models

### Workflows Table

**Table**: `workflows`

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL UNIQUE,
  version INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  spec JSONB NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  environment VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(workflow_id, version)
);

CREATE INDEX idx_workflows_workflow_id ON workflows(workflow_id);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);
CREATE INDEX idx_workflows_environment ON workflows(environment);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
```

**Fields**:
- `id`: Primary key
- `workflow_id`: Unique workflow identifier
- `version`: Workflow version number
- `spec`: Complete workflow specification (JSONB)
- `is_active`: Whether workflow is active/published

### Execution Logs Table

**Table**: `execution_logs`

```sql
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id VARCHAR(255) NOT NULL UNIQUE,
  workflow_id UUID NOT NULL,
  workflow_version INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  trigger_payload JSONB,
  output JSONB,
  error JSONB,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_workflow_id ON execution_logs(workflow_id);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
CREATE INDEX idx_execution_logs_started_at ON execution_logs(started_at);
CREATE INDEX idx_execution_logs_session_id ON execution_logs(session_id);
```

**Fields**:
- `execution_id`: Unique execution identifier
- `workflow_id`: Reference to workflow
- `status`: Execution status (`completed`, `failed`, `running`, `timeout`)
- `trigger_payload`: Original trigger payload
- `output`: Final execution output
- `error`: Error details (if failed)

### Node Execution Logs Table

**Table**: `node_execution_logs`

```sql
CREATE TABLE node_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id VARCHAR(255) NOT NULL,
  node_id VARCHAR(255) NOT NULL,
  node_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  output JSONB,
  error JSONB,
  duration_ms INTEGER NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY (execution_id) REFERENCES execution_logs(execution_id) ON DELETE CASCADE
);

CREATE INDEX idx_node_execution_logs_execution_id ON node_execution_logs(execution_id);
CREATE INDEX idx_node_execution_logs_node_id ON node_execution_logs(node_id);
CREATE INDEX idx_node_execution_logs_status ON node_execution_logs(status);
```

**Fields**:
- `execution_id`: Reference to execution log
- `node_id`: Node identifier within workflow
- `node_type`: Type of node
- `status`: Node execution status
- `output`: Node output data
- `error`: Node error details (if failed)
- `attempt`: Retry attempt number

## Session Storage (Redis)

**Key Format**: `session:{sessionId}`

**Value**: JSON-encoded `SessionState`

**TTL**: Configurable (default: 3600 seconds)

**Example**:
```
Key: session:abc123
Value: {
  "sessionId": "abc123",
  "type": "ussd",
  "msisdn": "+254712345678",
  "data": { "step": 1, "selection": "1" },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastActivityAt": "2024-01-01T00:01:00.000Z",
  "isActive": true
}
TTL: 3600
```

## Data Access Patterns

### Workflow CRUD

**Create**:
```sql
INSERT INTO workflows (workflow_id, version, name, spec, created_by)
VALUES ($1, $2, $3, $4, $5);
```

**Read**:
```sql
SELECT * FROM workflows
WHERE workflow_id = $1 AND version = $2;
```

**Update**:
```sql
UPDATE workflows
SET spec = $1, published_at = NOW()
WHERE workflow_id = $2 AND version = $3;
```

**List**:
```sql
SELECT * FROM workflows
WHERE is_active = true
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
```

### Execution Log Queries

**Get Execution**:
```sql
SELECT * FROM execution_logs
WHERE execution_id = $1;
```

**Query Executions**:
```sql
SELECT * FROM execution_logs
WHERE workflow_id = $1
  AND status = $2
  AND started_at >= $3
  AND started_at <= $4
ORDER BY started_at DESC
LIMIT $5;
```

**Get Node Results**:
```sql
SELECT * FROM node_execution_logs
WHERE execution_id = $1
ORDER BY executed_at ASC;
```

## Migration Strategy

### Phase 1: Add Database Support

1. Add database connection (PostgreSQL client)
2. Create migration scripts
3. Implement workflow persistence
4. Implement execution log persistence

### Phase 2: Migrate from In-Memory

1. Add database read/write alongside in-memory
2. Gradually migrate workflows to database
3. Switch to database-only mode
4. Remove in-memory storage

### Phase 3: Optimize

1. Add database indexes
2. Implement connection pooling
3. Add query optimization
4. Add caching layer (if needed)

## Backup and Recovery

### Backup Strategy

- **Daily Backups**: Full database backup
- **Point-in-Time Recovery**: WAL archiving (PostgreSQL)
- **Session Backup**: Redis persistence (AOF/RDB)

### Recovery Procedures

1. Restore database from backup
2. Restore Redis from backup (if needed)
3. Verify data integrity
4. Resume operations

## Performance Considerations

### Indexing

- Index frequently queried fields
- Use composite indexes for multi-field queries
- Monitor index usage and optimize

### Query Optimization

- Use prepared statements
- Limit result sets with pagination
- Use appropriate WHERE clauses
- Avoid N+1 queries

### Connection Pooling

- Use connection pool (e.g., `pg-pool` for PostgreSQL)
- Configure pool size based on load
- Monitor connection usage

## Related Documentation

- [Backend Services](services.md) - Backend architecture
- [Session Management](../architecture/session-management.md) - Session handling
- [Deployment](../deployment/production-checklist.md) - Production setup
