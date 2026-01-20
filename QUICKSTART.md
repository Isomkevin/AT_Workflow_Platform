# Quick Start Guide

## Overview

This is a production-ready workflow automation platform for Africa's Talking. It provides:

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **Executable Workflows**: Real orchestration, not just diagrams
- **AT Integration**: Native support for SMS, USSD, Voice, and Payments
- **Full Observability**: Complete execution logging and replay

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React Flow)                   │
│              Visual Workflow Builder UI                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────┐
│                  Backend API Layer                       │
│  - Workflow Validation                                   │
│  - Workflow Compilation                                  │
│  - Workflow Execution                                    │
│  - Execution Logging                                     │
└─────┬──────────────┬──────────────┬─────────────────────┘
      │              │              │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│ Compiler  │  │ Execution │  │  Logging  │
│           │  │  Engine   │  │           │
└───────────┘  └─────┬─────┘  └───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐          ┌───────▼──────┐
    │   AT    │          │   Session    │
    │ Adapter │          │   Manager    │
    └─────────┘          └──────────────┘
```

## Installation

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend/workflow-builder
npm install
cd ../..
```

### 2. Configure Africa's Talking

Create a `.env` file in the root:

```env
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend/workflow-builder
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:3000`

## Creating Your First Workflow

### Using the Visual Builder

1. Open `http://localhost:5173` in your browser
2. You'll see a trigger node already on the canvas
3. Drag nodes from the left sidebar onto the canvas
4. Connect nodes by dragging from output handles to input handles
5. Click on a node to configure it
6. Click "Save Workflow" to validate and save

### Example: SMS Echo Workflow

1. **Trigger**: SMS_RECEIVED (already on canvas)
2. **Action**: Drag "Send SMS" from Actions
3. **Connect**: Connect trigger output to Send SMS input
4. **Configure Send SMS**:
   - `to`: `{{msisdn}}`
   - `message`: `You said: {{message}}`
5. **Save**: Click "Save Workflow"

### Example: USSD Menu

See `examples/ussd-menu-workflow.json` for a complete USSD menu workflow.

## Using the API

### Validate a Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/validate \
  -H "Content-Type: application/json" \
  -d @examples/simple-sms-workflow.json
```

### Compile a Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/compile \
  -H "Content-Type: application/json" \
  -d @examples/simple-sms-workflow.json
```

### Execute a Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": { ... },  # Your workflow spec
    "triggerPayload": {
      "msisdn": "+254712345678",
      "message": "Hello"
    }
  }'
```

### Get Execution Log

```bash
curl http://localhost:3000/api/workflows/executions/{executionId}
```

## Workflow Specification

Workflows are defined as JSON following this structure:

```typescript
{
  metadata: {
    workflowId: string;      // Unique ID
    version: number;         // Version number
    name: string;            // Human-readable name
    createdBy: string;       // Creator identifier
    createdAt: string;       // ISO timestamp
  },
  trigger: {
    id: string;
    type: 'SMS_RECEIVED' | 'USSD_SESSION_START' | ...;
    label: string;
    config: Record<string, unknown>;
  },
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    config: Record<string, unknown>;
  }>,
  edges: Array<{
    id: string;
    source: string;          // Source node ID
    target: string;          // Target node ID
    condition?: string;      // Optional condition
  }>
}
```

## Variable Substitution

Use `{{variable.name}}` syntax to reference data:

- `{{msisdn}}` - Phone number from trigger
- `{{message}}` - SMS message content
- `{{session.data.key}}` - Session data
- `{{node_<nodeId>.output}}` - Output from previous node

## Node Types Reference

### Triggers
- **SMS_RECEIVED**: Fires when SMS is received
- **USSD_SESSION_START**: Fires when USSD session starts
- **INCOMING_CALL**: Fires when call is received
- **PAYMENT_CALLBACK**: Fires on payment callback
- **SCHEDULED**: Fires on schedule (cron)
- **HTTP_WEBHOOK**: Fires on HTTP webhook

### Actions
- **SEND_SMS**: Send SMS message
- **SEND_USSD_RESPONSE**: Send USSD response
- **INITIATE_CALL**: Make outbound call
- **PLAY_IVR**: Play IVR message/audio
- **COLLECT_DTMF**: Collect keypad input
- **REQUEST_PAYMENT**: Initiate payment
- **REFUND_PAYMENT**: Refund payment
- **HTTP_REQUEST**: Make HTTP request

### Logic
- **CONDITION**: Branch on condition
- **SWITCH**: Branch on value
- **DELAY**: Pause execution
- **RETRY**: Retry on failure
- **RATE_LIMIT**: Rate limit execution
- **MERGE**: Merge execution paths

### State
- **SESSION_READ**: Read session data
- **SESSION_WRITE**: Write session data
- **SESSION_END**: End session (required for USSD)

## Best Practices

1. **Always end USSD sessions**: USSD workflows must include SESSION_END
2. **Use meaningful node labels**: Makes workflows easier to understand
3. **Validate before saving**: Use the validation endpoint
4. **Handle errors**: Use RETRY nodes for transient failures
5. **Test in sandbox**: Always test workflows in AT sandbox first
6. **Monitor executions**: Check execution logs regularly

## Troubleshooting

### Workflow won't compile
- Check validation errors: `POST /api/workflows/validate`
- Ensure all nodes are connected properly
- Verify node configurations match schemas

### Execution fails
- Check execution logs: `GET /api/workflows/executions/{id}`
- Verify AT credentials are correct
- Check node error messages in logs

### Frontend won't load
- Ensure backend is running on port 3000
- Check browser console for errors
- Verify Vite dev server is running

## Next Steps

1. **Explore Examples**: Check `examples/` directory
2. **Read Architecture**: See `README.md` for detailed architecture
3. **Customize Nodes**: Add custom node types in `shared/node-definitions/`
4. **Add Persistence**: Replace in-memory storage with database
5. **Add Authentication**: Implement user authentication
6. **Deploy**: Set up production deployment

## Production Checklist

Before deploying to production:

- [ ] Replace in-memory session manager with Redis
- [ ] Add database for workflow persistence
- [ ] Implement authentication & authorization
- [ ] Add rate limiting
- [ ] Set up monitoring & alerting
- [ ] Configure webhook signature verification
- [ ] Add distributed tracing
- [ ] Set up CI/CD pipeline
- [ ] Configure production AT credentials
- [ ] Add backup & recovery procedures
