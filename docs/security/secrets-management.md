# Secrets Management

**Purpose**: Document how secrets and credentials are managed.

**Audience**: Security engineers, backend engineers, and operators.

## Overview

Secrets include API keys, database credentials, JWT secrets, and other sensitive configuration. Proper secrets management is critical for security.

## Current State

**Development**: Environment variables (`.env` file)

**Production**: Not implemented (planned)

## Environment Variables

### Development Setup

Create `.env` file in project root:

```env
# Africa's Talking
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox

# Server
PORT=3001
NODE_ENV=development

# Database (future)
DATABASE_URL=postgresql://user:password@localhost:5432/workflows

# JWT (future)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m

# Redis (future)
REDIS_URL=redis://localhost:6379
```

### Loading Environment Variables

Use `dotenv` package:

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

### Accessing Variables

```typescript
const atUsername = process.env.AT_USERNAME;
const atApiKey = process.env.AT_API_KEY;
```

## Secrets Categories

### API Keys

- Africa's Talking API key
- Third-party API keys
- Webhook secrets

### Database Credentials

- Database connection strings
- Database passwords
- Database usernames

### Authentication Secrets

- JWT secret
- OAuth client secrets
- Session secrets

### Service Credentials

- Redis passwords
- External service credentials

## Best Practices

### Development

1. **Never Commit Secrets**: Add `.env` to `.gitignore`
2. **Use Example Files**: Provide `.env.example` with placeholder values
3. **Rotate Regularly**: Change secrets periodically
4. **Use Different Secrets**: Different secrets per environment

### Production

1. **Use Secrets Manager**: AWS Secrets Manager, HashiCorp Vault, etc.
2. **Encrypt at Rest**: Encrypt secrets in storage
3. **Encrypt in Transit**: Use TLS for secrets transmission
4. **Access Control**: Limit who can access secrets
5. **Audit Logging**: Log all secret access

## Planned: Secrets Manager Integration

### AWS Secrets Manager

```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const getSecret = async (secretName: string): Promise<string> => {
  const client = new SecretsManager({ region: 'us-east-1' });
  const response = await client.getSecretValue({ SecretId: secretName });
  return response.SecretString;
};
```

### HashiCorp Vault

```typescript
import vault from 'node-vault';

const getSecret = async (path: string): Promise<unknown> => {
  const client = vault({ endpoint: process.env.VAULT_ADDR });
  const response = await client.read(path);
  return response.data;
};
```

## Secret Rotation

### Rotation Strategy

1. **Generate New Secret**: Create new secret value
2. **Update in Secrets Manager**: Store new secret
3. **Update Application**: Reload application with new secret
4. **Verify**: Test with new secret
5. **Deprecate Old Secret**: Mark old secret as deprecated
6. **Delete Old Secret**: Remove old secret after grace period

### Zero-Downtime Rotation

- Support multiple secrets simultaneously
- Gradually migrate to new secret
- Remove old secret after migration complete

## Secret Injection

### Environment Variables

```typescript
// Load from environment
const secret = process.env.SECRET_NAME;
```

### Secrets Manager

```typescript
// Load from secrets manager
const secret = await secretsManager.getSecret('secret-name');
```

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
data:
  at-api-key: <base64-encoded>
```

## Security Considerations

### Access Control

- Limit who can read secrets
- Use IAM roles (AWS) or policies (Vault)
- Audit secret access
- Rotate access credentials

### Encryption

- Encrypt secrets at rest
- Encrypt secrets in transit
- Use strong encryption algorithms
- Manage encryption keys securely

### Logging

- Log secret access (without values)
- Alert on suspicious access
- Monitor secret usage
- Audit secret changes

## Related Documentation

- [Authentication & Authorization](auth.md) - Auth system
- [Security Best Practices](best-practices.md) - Security guidelines
- [Deployment](../deployment/production-checklist.md) - Production setup
