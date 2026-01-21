# Environments

**Purpose**: Document environment configuration and setup.

**Audience**: DevOps engineers, backend engineers, and operators.

## Environment Types

### Development

**Purpose**: Local development and testing

**Configuration**:
- In-memory storage
- No authentication
- Debug logging enabled
- Hot reload enabled

**Setup**:
```bash
npm install
npm run dev
```

**Access**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Landing: http://localhost:3000

### Staging

**Purpose**: Pre-production testing

**Configuration**:
- Database: Staging database
- Redis: Staging Redis instance
- Authentication: Enabled
- Logging: Production-level logging
- AT Environment: Sandbox

**Setup**:
- Deploy to staging infrastructure
- Configure staging environment variables
- Run database migrations
- Verify integrations

### Production

**Purpose**: Live production environment

**Configuration**:
- Database: Production database (replicated)
- Redis: Production Redis cluster
- Authentication: Enabled with MFA
- Logging: Structured logging with monitoring
- AT Environment: Production
- SSL/TLS: Required
- Rate Limiting: Enabled
- Monitoring: Full observability

**Setup**:
- Follow [Production Checklist](production-checklist.md)
- Deploy to production infrastructure
- Configure production secrets
- Run database migrations
- Verify all integrations
- Enable monitoring and alerting

## Environment Variables

### Required Variables

```env
# Server
NODE_ENV=development|staging|production
PORT=3001

# Africa's Talking
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox|production

# Database (future)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (future)
REDIS_URL=redis://host:6379

# JWT (future)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
```

### Optional Variables

```env
# Logging
LOG_LEVEL=info|debug|warn|error
LOG_FORMAT=json|text

# CORS
CORS_ORIGIN=https://example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Configuration Management

### Development

Use `.env` file (not committed to git):

```bash
cp .env.example .env
# Edit .env with your values
```

### Staging/Production

Use secrets manager:
- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets
- Environment-specific config files

## Database Setup

### Development

**Current**: In-memory (no setup needed)

**Planned**: Local PostgreSQL

```bash
# Install PostgreSQL
# Create database
createdb workflows_dev

# Run migrations
npm run migrate
```

### Staging/Production

1. Provision database instance
2. Configure connection string
3. Run migrations
4. Set up backups
5. Configure monitoring

## Redis Setup

### Development

**Current**: In-memory (no setup needed)

**Planned**: Local Redis

```bash
# Install Redis
# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis
```

### Staging/Production

1. Provision Redis instance/cluster
2. Configure connection string
3. Set up persistence (AOF/RDB)
4. Configure replication (production)
5. Set up monitoring

## Service Dependencies

### Required Services

- **Node.js**: 18+ runtime
- **Database**: PostgreSQL (planned)
- **Redis**: For sessions (planned)
- **Africa's Talking**: API access

### Optional Services

- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK stack, CloudWatch
- **Tracing**: OpenTelemetry, Jaeger
- **Secrets Manager**: AWS Secrets Manager, Vault

## Health Checks

### Application Health

```bash
curl http://localhost:3001/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Service Health

Check individual service health:
- Database connectivity
- Redis connectivity
- AT API connectivity

## Environment-Specific Considerations

### Development

- Fast iteration
- Easy debugging
- No security restrictions
- Local data only

### Staging

- Production-like setup
- Test integrations
- Validate deployments
- Performance testing

### Production

- High availability
- Security hardened
- Monitoring and alerting
- Backup and recovery
- Disaster recovery plan

## Related Documentation

- [CI/CD](ci-cd.md) - Deployment automation
- [Production Checklist](production-checklist.md) - Production requirements
- [Security](../security/secrets-management.md) - Secrets management
