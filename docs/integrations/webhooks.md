# Webhooks

**Purpose**: Document webhook handling for incoming events.

**Audience**: Backend engineers and integration developers.

## Overview

Webhooks allow external services (like Africa's Talking) to send events to the platform, triggering workflow execution.

## Webhook Triggers

### HTTP_WEBHOOK Node

**Node Type**: `HTTP_WEBHOOK`

**Purpose**: Trigger workflow on HTTP webhook

**Configuration**:
```typescript
{
  path: string;           // Webhook path (e.g., "/webhooks/sms")
  method?: string;        // HTTP method (default: "POST")
  secret?: string;        // Webhook secret for verification
}
```

**Example**:
```typescript
{
  "type": "HTTP_WEBHOOK",
  "config": {
    "path": "/webhooks/sms-delivery",
    "method": "POST"
  }
}
```

## Webhook Endpoints

### Endpoint Structure

Webhook endpoints follow the pattern:
```
POST /webhooks/{workflowId}/{path}
```

### Webhook Payload

Webhook payload becomes the `triggerPayload`:

```typescript
ExecutionContext {
  triggerPayload: {
    // Webhook request body
    // Webhook headers (normalized)
    // Webhook query parameters
  }
}
```

## Africa's Talking Webhooks

### SMS Delivery Status

**Webhook Type**: SMS delivery callback

**Payload**:
```json
{
  "status": "Delivered",
  "messageId": "ATXid_...",
  "phoneNumber": "+254712345678",
  "cost": "KES 1.00"
}
```

### USSD User Input

**Webhook Type**: USSD menu selection

**Payload**:
```json
{
  "sessionId": "ATUid_...",
  "phoneNumber": "+254712345678",
  "text": "1",
  "serviceCode": "*384*123#"
}
```

### Payment Callback

**Webhook Type**: Payment status callback

**Payload**:
```json
{
  "status": "Success",
  "transactionId": "ATPid_...",
  "phoneNumber": "+254712345678",
  "amount": "100.00",
  "currency": "KES"
}
```

## Webhook Verification

### Signature Verification

**Current**: Not implemented (development only)

**Planned**: HMAC signature verification

```typescript
// Verify webhook signature
const signature = req.headers['x-webhook-signature'];
const expectedSignature = generateHMAC(req.body, webhookSecret);
if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### Secret Management

Webhook secrets stored securely:
- Environment variables (development)
- Secrets manager (production)

## Webhook Routing

### Route to Workflow

Webhooks are routed to workflows based on:
- Webhook path
- Workflow configuration
- Webhook type

**Planned Implementation**:
```typescript
// Register webhook route
app.post('/webhooks/:workflowId/:path', async (req, res) => {
  const workflow = await getWorkflowByWebhookPath(req.params.path);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  // Verify webhook signature
  // Execute workflow with webhook payload
});
```

## Webhook Payload Normalization

### Normalize Payload

Different webhook sources have different formats. Normalize to consistent format:

```typescript
const normalizeWebhookPayload = (source: string, payload: unknown) => {
  switch (source) {
    case 'africas-talking':
      return normalizeATWebhook(payload);
    default:
      return payload;
  }
};
```

## Error Handling

### Webhook Errors

- **Invalid Signature**: Return 401
- **Workflow Not Found**: Return 404
- **Execution Failed**: Return 500 (but acknowledge webhook)

### Acknowledgment

Always acknowledge webhook receipt:

```typescript
// Acknowledge webhook immediately
res.status(200).json({ received: true });

// Execute workflow asynchronously
executeWorkflow(workflow, payload).catch(handleError);
```

## Security Considerations

### Best Practices

1. **Verify Signatures**: Always verify webhook signatures
2. **HTTPS Only**: Only accept webhooks over HTTPS
3. **Rate Limiting**: Rate limit webhook endpoints
4. **IP Whitelisting**: Whitelist known webhook IPs (if possible)
5. **Idempotency**: Handle duplicate webhooks (idempotency keys)

### Secrets Management

- Store webhook secrets securely
- Rotate secrets regularly
- Use different secrets per environment
- Never log secrets

## Testing Webhooks

### Local Testing

Use tools like ngrok to test webhooks locally:

```bash
ngrok http 3001
# Use ngrok URL as webhook endpoint
```

### Webhook Testing Tools

- **Postman**: Send test webhook requests
- **curl**: Command-line webhook testing
- **Webhook.site**: Public webhook testing endpoint

## Related Documentation

- [Africa's Talking Integration](africas-talking.md) - AT webhooks
- [Third-Party APIs](third-party-apis.md) - External API integration
- [Security](../security/secrets-management.md) - Security practices
