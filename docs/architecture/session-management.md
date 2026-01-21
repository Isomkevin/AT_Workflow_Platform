# Session Management

**Purpose**: Document how stateful sessions are managed for USSD and Voice workflows.

**Audience**: Engineers working on session handling, debugging session issues, or extending session functionality.

## Overview

Sessions enable stateful workflows for USSD and Voice interactions where multiple back-and-forth exchanges occur. The session manager maintains state across these interactions.

## Session Types

### USSD Sessions

USSD workflows require sessions because:
- Multiple menu interactions occur in sequence
- User selections must be remembered
- Session must be explicitly ended

**Session Lifecycle**:
1. `USSD_SESSION_START` trigger creates session
2. User navigates through menu (multiple workflow executions)
3. Session data persists across interactions
4. `SESSION_END` node ends session

### Voice Sessions

Voice/IVR workflows use sessions for:
- Multi-step voice interactions
- DTMF input collection
- Call state management

**Session Lifecycle**:
1. `INCOMING_CALL` trigger creates session
2. Voice interactions occur (play audio, collect input)
3. Session data persists
4. `SESSION_END` node ends session

### SMS Sessions

SMS workflows can optionally use sessions for:
- Multi-message conversations
- Context preservation

### Payment Sessions

Payment workflows use sessions for:
- Payment request tracking
- Payment callback correlation

## Session State Structure

```typescript
SessionState {
  sessionId: string;           // Unique session identifier
  type: 'ussd' | 'voice' | 'sms' | 'payment';
  msisdn: string;              // Phone number
  data: Record<string, unknown>;  // Session data (key-value store)
  createdAt: string;           // ISO timestamp
  lastActivityAt: string;      // ISO timestamp
  expiresAt?: string;          // ISO timestamp (optional)
  isActive: boolean;           // Whether session is active
}
```

## Session Manager Interface

```typescript
interface ISessionManager {
  createSession(session: SessionState): Promise<SessionState>;
  getSession(sessionId: string): Promise<SessionState | null>;
  updateSession(sessionId: string, updates: Partial<SessionState>): Promise<SessionState>;
  deleteSession(sessionId: string): Promise<void>;
  endSession(sessionId: string): Promise<void>;
}
```

## Session Operations

### Creating a Session

Sessions are created automatically when:
- `USSD_SESSION_START` trigger fires
- `INCOMING_CALL` trigger fires
- Workflow requires session and none exists

```typescript
const session = await sessionManager.createSession({
  sessionId: uuidv4(),
  type: 'ussd',
  msisdn: '+254712345678',
  data: {},
  isActive: true,
});
```

### Reading Session Data

Use `SESSION_READ` node or access in templates:

```typescript
// In node config
{
  "key": "{{session.data.userName}}"
}
```

### Writing Session Data

Use `SESSION_WRITE` node:

```typescript
{
  "type": "SESSION_WRITE",
  "config": {
    "data": {
      "userName": "{{triggerPayload.input}}",
      "step": 2
    }
  }
}
```

### Ending a Session

Use `SESSION_END` node:

```typescript
{
  "type": "SESSION_END",
  "config": {}
}
```

This:
- Sets `isActive: false`
- Optionally deletes session (future)
- Prevents further session updates

## Session Expiration

### TTL Configuration

Sessions expire after a configurable TTL:

```typescript
const sessionManager = new RedisSessionManager(3600);  // 1 hour TTL
```

### Expiration Behavior

- Sessions are checked for expiration on access
- Expired sessions return `null` from `getSession()`
- `lastActivityAt` is updated on each access
- Expiration can be extended by updating `expiresAt`

## Implementation Details

### Current Implementation: In-Memory

**Location**: `backend/state/session-manager.ts`

**Storage**: In-memory `Map<string, SessionState>`

**Limitations**:
- Single instance only
- Lost on server restart
- Not suitable for production

### Planned Implementation: Redis

**Storage**: Redis with TTL

**Benefits**:
- Distributed across multiple instances
- Persistent across restarts
- Automatic expiration
- High performance

**Redis Structure**:
```
Key: session:{sessionId}
Value: JSON-encoded SessionState
TTL: Configurable (default: 1 hour)
```

## Session in Workflow Execution

### Session Creation

```typescript
// In workflow execution
if (workflow.trigger.type === 'USSD_SESSION_START') {
  const session = await sessionManager.createSession({
    sessionId: uuidv4(),
    type: 'ussd',
    msisdn: triggerPayload.msisdn,
    data: {},
    isActive: true,
  });
  // Session passed to execution context
}
```

### Session Access

```typescript
// In execution context
ExecutionContext {
  session?: SessionState;
  // ...
}

// In node executors
const userName = context.session?.data.userName;
```

### Session Updates

```typescript
// SESSION_WRITE node executor
if (node.type === 'SESSION_WRITE') {
  const updates = {
    data: { ...context.session.data, ...node.config.data },
    lastActivityAt: new Date().toISOString(),
  };
  await sessionManager.updateSession(context.session.sessionId, updates);
}
```

## USSD Session Flow Example

```
1. User dials USSD code
   ↓
2. USSD_SESSION_START trigger fires
   ↓
3. Session created: { sessionId: "abc123", type: "ussd", data: {} }
   ↓
4. Workflow executes, shows menu
   ↓
5. User selects option "1"
   ↓
6. Workflow executes with session
   ↓
7. SESSION_WRITE: { data: { selection: "1" } }
   ↓
8. Workflow processes selection
   ↓
9. User selects option "2"
   ↓
10. Workflow executes with same session
    ↓
11. SESSION_READ: {{session.data.selection}} → "1"
    ↓
12. Workflow processes based on previous selection
    ↓
13. SESSION_END
    ↓
14. Session marked inactive
```

## Best Practices

### Session Data

- Keep session data minimal (store IDs, not full objects)
- Use clear, descriptive keys
- Avoid storing sensitive data (use encryption if needed)
- Clean up unused data

### Session Lifecycle

- Always end USSD sessions explicitly
- Set appropriate TTL for session type
- Handle expired sessions gracefully
- Log session creation and deletion

### Error Handling

- Handle missing sessions
- Handle expired sessions
- Handle concurrent session updates (use optimistic locking if needed)

## Related Documentation

- [System Overview](system-overview.md) - High-level architecture
- [Workflow Execution](workflow-execution.md) - Execution engine
- [Data Flow](data-flow.md) - Data flow through system
- [Backend Services](../backend/services.md) - Backend components
