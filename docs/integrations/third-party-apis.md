# Third-Party APIs

**Purpose**: Document third-party API integrations beyond Africa's Talking.

**Audience**: Backend engineers and integration developers.

## Overview

The platform supports integration with third-party APIs through the `HTTP_REQUEST` node type. This enables workflows to interact with external services.

## HTTP Request Node

**Node Type**: `HTTP_REQUEST`

**Purpose**: Make HTTP requests to external APIs

**Configuration**:
```typescript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;                    // API endpoint URL
  headers?: Record<string, string>; // HTTP headers
  body?: unknown;                  // Request body (for POST/PUT)
  timeout?: number;                // Request timeout in ms
}
```

**Example**:
```typescript
{
  "type": "HTTP_REQUEST",
  "config": {
    "method": "POST",
    "url": "https://api.example.com/users",
    "headers": {
      "Authorization": "Bearer {{apiToken}}",
      "Content-Type": "application/json"
    },
    "body": {
      "name": "{{name}}",
      "email": "{{email}}"
    }
  }
}
```

## Variable Substitution

HTTP request configs support variable substitution:

- `{{variable}}`: Context variables
- `{{session.data.key}}`: Session data
- `{{node_<id>.output}}`: Previous node output

## Response Handling

### Success Response

```typescript
NodeExecutionResult {
  status: 'success',
  output: {
    statusCode: 200,
    headers: { /* response headers */ },
    body: { /* response body */ }
  }
}
```

### Error Response

```typescript
NodeExecutionResult {
  status: 'error',
  error: {
    code: 'HTTP_ERROR',
    message: 'Request failed',
    type: 'transient' | 'permanent',
    details: {
      statusCode: 500,
      response: { /* error response */ }
    }
  }
}
```

## Common Integrations

### REST APIs

Most REST APIs can be integrated using HTTP_REQUEST:

```typescript
{
  "type": "HTTP_REQUEST",
  "config": {
    "method": "GET",
    "url": "https://api.service.com/data",
    "headers": {
      "Authorization": "Bearer {{token}}"
    }
  }
}
```

### Webhook Endpoints

Send data to webhook endpoints:

```typescript
{
  "type": "HTTP_REQUEST",
  "config": {
    "method": "POST",
    "url": "https://webhook.example.com/callback",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "event": "payment_completed",
      "data": "{{payment}}"
    }
  }
}
```

## Authentication

### API Keys

```typescript
{
  "headers": {
    "X-API-Key": "{{apiKey}}"
  }
}
```

### Bearer Tokens

```typescript
{
  "headers": {
    "Authorization": "Bearer {{token}}"
  }
}
```

### Basic Auth

```typescript
{
  "headers": {
    "Authorization": "Basic {{base64Credentials}}"
  }
}
```

## Error Handling

### Retry Logic

HTTP_REQUEST nodes support retry configuration:

```typescript
{
  "type": "HTTP_REQUEST",
  "retry": {
    "maxAttempts": 3,
    "initialDelayMs": 1000,
    "backoffMultiplier": 2,
    "retryableErrors": ["HTTP_ERROR"]
  }
}
```

### Error Types

- **Transient**: Network errors, 5xx responses → Retry
- **Permanent**: 4xx responses, invalid config → Fail
- **Rate Limit**: 429 responses → Retry with backoff

## Timeout Configuration

Set request timeout:

```typescript
{
  "type": "HTTP_REQUEST",
  "config": {
    "timeout": 30000  // 30 seconds
  }
}
```

## Best Practices

### Security

- Store API keys in environment variables
- Use HTTPS for all external requests
- Validate and sanitize URLs
- Don't log sensitive data in request/response

### Performance

- Set appropriate timeouts
- Use connection pooling (handled by HTTP client)
- Cache responses when appropriate
- Batch requests when possible

### Error Handling

- Configure retry logic for transient errors
- Handle rate limiting appropriately
- Log API errors for debugging
- Monitor API response times

## Future Enhancements

### Planned Features

- **OAuth Support**: OAuth 2.0 authentication
- **GraphQL Support**: GraphQL query support
- **WebSocket Support**: WebSocket connections
- **API Templates**: Pre-configured API integrations

## Related Documentation

- [Africa's Talking Integration](africas-talking.md) - AT integration
- [Webhooks](webhooks.md) - Webhook handling
- [Security](../security/secrets-management.md) - Credential management
