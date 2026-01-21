# Authentication & Authorization

**Purpose**: Document authentication and authorization mechanisms.

**Audience**: Security engineers, backend engineers, and operators.

## Current State

**Authentication**: None (development only)

**Authorization**: None (development only)

## Planned Authentication

### JWT-Based Authentication

**Technology**: JSON Web Tokens (JWT)

**Flow**:
1. User authenticates (username/password, OAuth, etc.)
2. Server issues JWT token
3. Client includes token in `Authorization` header
4. Server validates token on each request

### Token Structure

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

### Token Validation

```typescript
// Middleware to validate JWT
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Authorization

### Role-Based Access Control (RBAC)

**Roles**:
- `admin`: Full access
- `developer`: Create and manage workflows
- `viewer`: Read-only access
- `operator`: Execute workflows only

### Permission Model

```typescript
interface Permission {
  resource: string;      // e.g., "workflow", "execution"
  action: string;        // e.g., "create", "read", "update", "delete"
}

interface Role {
  name: string;
  permissions: Permission[];
}
```

### Authorization Middleware

```typescript
const authorize = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hasPermission = user.roles.some(role =>
      role.permissions.some(p =>
        p.resource === resource && p.action === action
      )
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

## API Key Authentication

### For External Services

**Use Case**: Allow external services to trigger workflows

**Implementation**:
```typescript
interface APIKey {
  key: string;           // API key value
  name: string;          // Key name/description
  userId: string;        // Owner
  permissions: string[]; // Allowed actions
  expiresAt?: Date;      // Optional expiration
  createdAt: Date;
  lastUsedAt?: Date;
}
```

### API Key Validation

```typescript
const validateAPIKey = async (key: string): Promise<APIKey | null> => {
  const apiKey = await db.getAPIKey(key);
  if (!apiKey || apiKey.expiresAt < new Date()) {
    return null;
  }
  
  await db.updateAPIKeyLastUsed(key);
  return apiKey;
};
```

## OAuth Integration

### Planned: OAuth 2.0

**Supported Providers**:
- Google
- GitHub
- Microsoft
- Custom OAuth provider

**Flow**:
1. User initiates OAuth login
2. Redirect to OAuth provider
3. User authorizes application
4. OAuth provider redirects with code
5. Exchange code for access token
6. Create/update user account
7. Issue JWT token

## Session Management

### JWT Refresh Tokens

**Access Token**: Short-lived (15 minutes)
**Refresh Token**: Long-lived (7 days)

**Flow**:
1. User authenticates → Receive access + refresh tokens
2. Access token expires → Use refresh token to get new access token
3. Refresh token expires → User must re-authenticate

## Security Best Practices

### Token Security

- Use HTTPS for all authentication
- Store tokens securely (httpOnly cookies, secure storage)
- Set appropriate token expiration
- Rotate JWT secrets regularly
- Invalidate tokens on logout

### Password Security

- Hash passwords with bcrypt (salt rounds: 10+)
- Enforce password complexity requirements
- Implement password reset flow
- Rate limit login attempts

### API Security

- Rate limit API endpoints
- Validate and sanitize all inputs
- Use parameterized queries (SQL injection prevention)
- Implement CORS properly
- Log security events

## Related Documentation

- [Secrets Management](secrets-management.md) - Credential storage
- [Security Best Practices](best-practices.md) - Security guidelines
- [Deployment](../deployment/production-checklist.md) - Production security
