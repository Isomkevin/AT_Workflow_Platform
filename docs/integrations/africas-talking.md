# Africa's Talking Integration

**Purpose**: Document the Africa's Talking API integration and adapters.

**Audience**: Backend engineers, integration developers, and operators.

## Overview

The platform integrates with Africa's Talking (AT) services for SMS, USSD, Voice/IVR, and Payments. The integration is abstracted through adapters that provide a consistent interface for workflow nodes.

## AT Adapter Architecture

**Location**: `backend/adapters/africas-talking/`

**Components**:
- `ATClient`: AT API client
- Node executors: Type-specific executors

## AT Client

**Location**: `backend/adapters/africas-talking/client.ts`

**Responsibilities**:
- AT API authentication
- HTTP request handling
- Response parsing
- Error handling
- Rate limiting

### Configuration

```typescript
interface ATConfig {
  username: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl?: string;  // Optional, defaults to AT URLs
}
```

### Initialization

```typescript
const atClient = new ATClient({
  username: process.env.AT_USERNAME,
  apiKey: process.env.AT_API_KEY,
  environment: process.env.AT_ENVIRONMENT as 'sandbox' | 'production',
});
```

## Supported Services

### SMS

**Node Type**: `SEND_SMS`

**Executor**: `SendSMSExecutor`

**Configuration**:
```typescript
{
  to: string;        // Phone number (e.g., "+254712345678")
  message: string;     // SMS message content
  from?: string;     // Sender ID (optional)
}
```

**AT API**: SMS API

**Example**:
```typescript
{
  "type": "SEND_SMS",
  "config": {
    "to": "{{msisdn}}",
    "message": "Hello, {{name}}!"
  }
}
```

### USSD

**Node Type**: `SEND_USSD_RESPONSE`

**Executor**: `SendUSSDResponseExecutor`

**Configuration**:
```typescript
{
  sessionId: string;  // USSD session ID
  message: string;    // USSD menu text
  action: 'request' | 'end';  // Session action
}
```

**AT API**: USSD API

**Example**:
```typescript
{
  "type": "SEND_USSD_RESPONSE",
  "config": {
    "sessionId": "{{session.sessionId}}",
    "message": "1. Option 1\n2. Option 2",
    "action": "request"
  }
}
```

### Voice/IVR

**Node Types**:
- `INITIATE_CALL`: Make outbound call
- `PLAY_IVR`: Play audio message
- `COLLECT_DTMF`: Collect keypad input

**Executors**:
- `InitiateCallExecutor`
- `PlayIVRExecutor`
- `CollectDTMFExecutor`

**AT API**: Voice API

**Example - Initiate Call**:
```typescript
{
  "type": "INITIATE_CALL",
  "config": {
    "to": "{{msisdn}}",
    "from": "+254700000000",
    "callBackUrl": "https://api.example.com/voice/callback"
  }
}
```

**Example - Play IVR**:
```typescript
{
  "type": "PLAY_IVR",
  "config": {
    "sessionId": "{{session.sessionId}}",
    "audioUrl": "https://example.com/audio.wav",
    "text": "Press 1 to continue"
  }
}
```

### Payments

**Node Types**:
- `REQUEST_PAYMENT`: Initiate payment request
- `REFUND_PAYMENT`: Refund a payment

**Executors**:
- `RequestPaymentExecutor`
- `RefundPaymentExecutor`

**AT API**: Payments API

**Example - Request Payment**:
```typescript
{
  "type": "REQUEST_PAYMENT",
  "config": {
    "productName": "Service Payment",
    "phoneNumber": "{{msisdn}}",
    "currencyCode": "KES",
    "amount": 100.00,
    "metadata": {
      "orderId": "{{orderId}}"
    }
  }
}
```

**Example - Refund Payment**:
```typescript
{
  "type": "REFUND_PAYMENT",
  "config": {
    "transactionId": "{{payment.transactionId}}",
    "amount": 100.00
  }
}
```

## Node Executors

### Executor Interface

All AT node executors implement:

```typescript
interface INodeExecutor {
  execute(
    node: ExecutionNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
}
```

### Executor Pattern

1. **Resolve Variables**: Replace `{{variable}}` in config
2. **Validate Config**: Ensure required fields present
3. **Call AT API**: Make API request via ATClient
4. **Handle Response**: Parse response or error
5. **Return Result**: Format NodeExecutionResult

### Error Handling

AT API errors are categorized:

- **Transient**: Network errors, temporary failures → Retry
- **Permanent**: Invalid config, authentication errors → Fail
- **Rate Limit**: Rate limiting errors → Retry with backoff

## Authentication

### API Key Authentication

AT uses API key authentication:

```typescript
headers: {
  'apiKey': config.apiKey,
  'Content-Type': 'application/json'
}
```

### Environment Support

- **Sandbox**: Test environment with limited functionality
- **Production**: Live environment with full functionality

## Rate Limiting

### AT Rate Limits

AT APIs have rate limits:
- SMS: Varies by account
- USSD: Varies by account
- Voice: Varies by account
- Payments: Varies by account

### Handling Rate Limits

- Detect rate limit errors
- Retry with exponential backoff
- Log rate limit events
- Alert operators (future)

## Webhooks

### Incoming Webhooks

AT sends webhooks for:
- SMS delivery status
- USSD user input
- Voice call events
- Payment callbacks

### Webhook Handling

**Current**: Webhooks trigger workflow execution (future)

**Planned**:
- Webhook signature verification
- Webhook routing to workflows
- Webhook payload normalization

## Error Codes

### AT API Errors

Common AT API error codes:
- `InvalidApiKey`: Authentication failed
- `InvalidPhoneNumber`: Invalid phone number format
- `InsufficientBalance`: Account balance too low
- `RateLimitExceeded`: Rate limit exceeded

### Error Mapping

AT errors are mapped to NodeError:

```typescript
{
  code: 'AT_API_ERROR',
  message: 'AT API error message',
  type: 'transient' | 'permanent',
  details: { atErrorCode: '...' }
}
```

## Testing

### Sandbox Environment

Use AT sandbox for testing:
- No real charges
- Limited functionality
- Test workflows safely

### Test Credentials

Store test credentials in `.env`:
```env
AT_USERNAME=your_sandbox_username
AT_API_KEY=your_sandbox_api_key
AT_ENVIRONMENT=sandbox
```

## Best Practices

### Configuration

- Use environment variables for credentials
- Never commit credentials to code
- Use sandbox for development
- Rotate API keys regularly

### Error Handling

- Always handle AT API errors
- Implement retry logic for transient errors
- Log all API calls and responses
- Monitor API usage and costs

### Performance

- Batch API calls when possible (future)
- Cache API responses when appropriate
- Monitor API response times
- Optimize API call frequency

## Related Documentation

- [Third-Party APIs](third-party-apis.md) - Other integrations
- [Webhooks](webhooks.md) - Webhook handling
- [Backend Services](../backend/services.md) - Backend architecture
- [Security](../security/secrets-management.md) - Credential management
