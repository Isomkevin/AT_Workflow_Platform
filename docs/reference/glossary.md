# Glossary

**Purpose**: Terminology and definitions used in the platform.

**Audience**: All users of the documentation.

## Core Concepts

### Workflow

A visual representation of a business process that can be executed. Consists of nodes (steps) and edges (connections).

### Workflow Specification (WorkflowSpec)

The canonical JSON format that defines a workflow. Contains metadata, trigger, nodes, and edges.

### Node

A single step in a workflow. Can be a trigger, action, logic operation, or state operation.

### Edge

A connection between nodes that defines execution flow.

### Trigger

A special node that initiates workflow execution. Examples: SMS_RECEIVED, USSD_SESSION_START.

### Execution

A single run of a workflow. Each execution has a unique ID and logs all node executions.

### Session

Stateful context for workflows that require multiple interactions (USSD, Voice). Maintains data across interactions.

## Node Types

### Trigger Nodes

- **SMS_RECEIVED**: Fires when SMS is received
- **USSD_SESSION_START**: Fires when USSD session starts
- **INCOMING_CALL**: Fires when call is received
- **PAYMENT_CALLBACK**: Fires on payment callback
- **SCHEDULED**: Fires on schedule (cron)
- **HTTP_WEBHOOK**: Fires on HTTP webhook

### Action Nodes

- **SEND_SMS**: Send SMS message
- **SEND_USSD_RESPONSE**: Send USSD response
- **INITIATE_CALL**: Make outbound call
- **PLAY_IVR**: Play IVR message/audio
- **COLLECT_DTMF**: Collect keypad input
- **REQUEST_PAYMENT**: Initiate payment
- **REFUND_PAYMENT**: Refund payment
- **HTTP_REQUEST**: Make HTTP request

### Logic Nodes

- **CONDITION**: Branch on condition
- **SWITCH**: Branch on value
- **DELAY**: Pause execution
- **RETRY**: Retry on failure
- **RATE_LIMIT**: Rate limit execution
- **MERGE**: Merge execution paths

### State Nodes

- **SESSION_READ**: Read session data
- **SESSION_WRITE**: Write session data
- **SESSION_END**: End session

## Technical Terms

### Compilation

The process of converting a WorkflowSpec into an ExecutionGraph that can be executed.

### Execution Graph

The internal representation of a workflow optimized for execution. Includes topological ordering and metadata.

### Node Executor

A function that executes a specific node type. Each node type has a corresponding executor.

### Execution Context

Runtime data passed through workflow execution, including trigger payload, session state, and variables.

### Variable Substitution

The process of replacing `{{variable}}` placeholders in node configurations with actual values.

### Template Rendering

The process of resolving variables in node configurations before execution.

### Retry Logic

Automatic retry of failed node executions with configurable backoff.

### Topological Sort

Algorithm that orders nodes based on their dependencies for correct execution order.

## Africa's Talking Terms

### AT

Africa's Talking, the telecom API provider.

### MSISDN

Mobile Station International Subscriber Directory Number - the phone number.

### USSD

Unstructured Supplementary Service Data - interactive menu system via mobile networks.

### IVR

Interactive Voice Response - automated phone system with voice prompts.

### DTMF

Dual-Tone Multi-Frequency - keypad tones for phone input.

## Related Documentation

- [FAQ](faq.md) - Frequently asked questions
- [System Overview](../architecture/system-overview.md) - Architecture overview
