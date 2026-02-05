# Production Readiness Checklist

This document tracks security, performance, and infrastructure improvements that are deferred to the production deployment stage. Each item includes detailed implementation guidance.

---

## 🔒 Security Improvements

### 1. Database Connection Security (SSL/TLS)

**Current State:** Database connections use plain PostgreSQL connection strings without SSL encryption.

**Risk:** In production environments, unencrypted database connections expose credentials and data to potential interception.

**Implementation Required:**

**File:** `src/drizzle/db.ts`

**Before (Development):**

```typescript
import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";

export const db = drizzle(env.DATABASE_URL, { schema });
```

**After (Production):**

```typescript
import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/drizzle/schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
          // For managed databases (AWS RDS, Google Cloud SQL, etc.)
          // You might need to provide CA certificates:
          // ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
        }
      : false,
  max: 20, // maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
```

**Additional Steps:**

1. Obtain SSL/TLS certificates from your database provider
2. Store certificates securely (not in repository)
3. Update deployment scripts to include certificate deployment
4. Test SSL connection in staging environment

**Environment Variables to Add:**

```env
# Production database configuration
DATABASE_SSL_ENABLED=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
DATABASE_CA_CERT_PATH=/path/to/ca-cert.pem  # Optional, for managed databases
```

---

### 2. Credential Management & Secrets Rotation

**Current State:** Database credentials stored in environment variables with manual configuration.

**Risk:**

- Credentials stored in plain text in .env files
- No rotation policy
- No audit trail for credential access

**Implementation Required:**

**Use a Secrets Manager:**

- **AWS Secrets Manager** (if deploying to AWS)
- **Google Secret Manager** (if deploying to GCP)
- **HashiCorp Vault** (for on-premise or multi-cloud)
- **Vercel Environment Variables** (if deploying to Vercel)

**Example Implementation with AWS Secrets Manager:**

Create new file: `src/data/env/secrets.ts`

```typescript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName }),
    );
    return response.SecretString || "";
  } catch (error) {
    console.error("Failed to retrieve secret:", error);
    throw new Error(`Could not retrieve secret: ${secretName}`);
  }
}

export async function getDatabaseCredentials() {
  if (process.env.NODE_ENV === "production") {
    const secretString = await getSecret("kore-standards/database");
    const credentials = JSON.parse(secretString);
    return credentials;
  }

  // Fallback to env vars for development
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  };
}
```

**Action Items:**

1. Set up secrets manager in cloud provider
2. Migrate credentials to secrets manager
3. Update deployment scripts to reference secrets
4. Implement credential rotation policy (90-day rotation recommended)
5. Set up CloudWatch/monitoring alerts for secret access

---

### 3. Database Connection String Logging Prevention

**Current State:** DATABASE_URL contains credentials and could be logged accidentally.

**Risk:** Credentials exposure in application logs, monitoring systems, or error reports.

**Implementation Required:**

**File:** `src/data/env/server.ts`

Add sanitization function:

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

/**
 * Sanitizes database URL for safe logging
 * Replaces password with asterisks
 */
export function sanitizeDatabaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.password) {
      urlObj.password = "****";
    }
    return urlObj.toString();
  } catch {
    return "****";
  }
}

export const env = createEnv({
  server: {
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_NAME: z.string().min(1),
  },
  createFinalSchema: (env) => {
    return z.object(env).transform((val) => {
      const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val;

      const DATABASE_URL = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

      // Log sanitized version only
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Database URL (sanitized):",
          sanitizeDatabaseUrl(DATABASE_URL),
        );
      }

      return {
        ...rest,
        DATABASE_URL,
      };
    });
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
```

**Additional Steps:**

1. Audit all logging statements for credential leaks
2. Implement logging policy: never log DATABASE_URL
3. Configure error reporting tools (Sentry, Datadog) to redact credentials
4. Add pre-commit hooks to scan for credential patterns

---

### 4. IAM Database Authentication (Cloud Deployments)

**Current State:** Traditional username/password authentication.

**Risk:** Long-lived credentials, manual rotation, credential theft.

**Implementation Required (AWS RDS Example):**

**Dependencies to Add:**

```json
"@aws-sdk/client-rds": "^3.x.x",
"@aws-sdk/rds-signer": "^3.x.x"
```

**New File:** `src/drizzle/iam-auth.ts`

```typescript
import { Signer } from "@aws-sdk/rds-signer";
import { Pool } from "pg";

export async function createIAMAuthenticatedPool() {
  const signer = new Signer({
    region: process.env.AWS_REGION!,
    hostname: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER!,
  });

  const token = await signer.getAuthToken();

  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: token, // IAM token instead of static password
    ssl: { rejectUnauthorized: true },
    max: 20,
  });
}
```

**Update:** `src/drizzle/db.ts`

```typescript
import { createIAMAuthenticatedPool } from "./iam-auth";

const pool =
  process.env.USE_IAM_AUTH === "true"
    ? await createIAMAuthenticatedPool()
    : new Pool({ connectionString: env.DATABASE_URL });
```

**Benefits:**

- No static credentials to rotate
- Tokens expire automatically (15 minutes)
- Uses IAM roles and policies
- Better audit trail via CloudTrail

---

## ⚡ Performance Improvements

### 5. Database Connection Pooling

**Current State:** Using default Drizzle connection handling without explicit pool configuration.

**Impact:**

- Potential connection exhaustion under load
- No control over connection lifecycle
- Slower response times during traffic spikes

**Implementation Required:**

**File:** `src/drizzle/db.ts`

**Current:**

```typescript
export const db = drizzle(env.DATABASE_URL, { schema });
```

**Production:**

```typescript
import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/drizzle/schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,

  // Connection Pool Configuration
  max: 20, // maximum number of clients in the pool
  min: 5, // minimum number of clients to keep alive

  // Connection Timing
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return error after 2 seconds if no connection available

  // Keep-Alive Settings (prevents connection drops)
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,

  // Statement Timeout (prevents long-running queries)
  statement_timeout: 30000, // 30 seconds max per query

  // SSL (production only)
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
        }
      : false,
});

// Error handling for pool
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle database client", err);
  // In production, send to error tracking service (Sentry, DataDog, etc.)
});

pool.on("connect", (client) => {
  // Optional: log pool connections in development
  if (process.env.NODE_ENV !== "production") {
    console.log("New database client connected");
  }
});

export const db = drizzle(pool, { schema });

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
```

**Configuration Guide by Traffic Level:**

| Traffic Level             | Max Connections | Idle Timeout | Notes                         |
| ------------------------- | --------------- | ------------ | ----------------------------- |
| Low (< 100 req/min)       | 10              | 30s          | Small apps, prototypes        |
| Medium (100-1000 req/min) | 20              | 20s          | Most production apps          |
| High (1000-10k req/min)   | 50              | 10s          | High-traffic apps             |
| Very High (> 10k req/min) | 100+            | 5s           | Enterprise, use read replicas |

**Monitoring to Add:**

```typescript
// Add health check endpoint: app/api/health/route.ts
export async function GET() {
  try {
    await pool.query("SELECT 1");
    return Response.json({
      status: "healthy",
      database: "connected",
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
    });
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        error: "Database connection failed",
      },
      { status: 503 },
    );
  }
}
```

---

### 6. Database Indexing Strategy

**Current State:** Only one index on `job_listings.district`

**Impact:**

- Slow queries on common filter operations
- Poor performance as data grows
- Inefficient sorting and pagination

**Implementation Required:**

**File:** `src/drizzle/schema/jobListing.ts`

**Current:**

```typescript
(table) => [index().on(table.district)];
```

**Production:**

```typescript
(table) => [
  // Geographic filtering
  index("idx_job_listings_district").on(table.district),
  index("idx_job_listings_region").on(table.region),

  // Status filtering (most common query)
  index("idx_job_listings_status").on(table.status),

  // Organization queries
  index("idx_job_listings_org_id").on(table.organizationId),

  // Date-based queries and sorting
  index("idx_job_listings_posted_at").on(table.postedAt),
  index("idx_job_listings_created_at").on(table.createdAt),

  // Composite indexes for common query patterns
  // Example: "Show all published jobs in X district, sorted by posted date"
  index("idx_job_listings_status_district").on(table.status, table.district),
  index("idx_job_listings_status_posted").on(table.status, table.postedAt),

  // Featured listings (often queried separately)
  index("idx_job_listings_featured")
    .on(table.isFeatured)
    .where(sql`${table.isFeatured} = true`), // partial index
];
```

**Additional Indexes for Other Tables:**

`src/drizzle/schema/jobListingApplication.ts`:

```typescript
(table) => [
  primaryKey({ columns: [table.jobListingId, table.userId] }),
  // Add these indexes:
  index("idx_applications_stage").on(table.stage),
  index("idx_applications_job_id").on(table.jobListingId),
  index("idx_applications_user_id").on(table.userId),
  index("idx_applications_rating").on(table.rating),
];
```

`src/drizzle/schema/user.ts`:

```typescript
// Email is already unique (automatic index), but add:
index('idx_users_email').on(table.email), // for email search/lookup
```

**Index Monitoring:**

```sql
-- Add to database maintenance scripts
-- Check index usage (PostgreSQL)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Find unused indexes (candidates for removal)
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%'
AND schemaname = 'public';
```

---

### 7. Query Optimization & N+1 Prevention

**Current State:** No query optimization patterns implemented.

**Risk:** N+1 query problems when loading related data.

**Implementation Required:**

**Use Drizzle's Query Features:**

**Example: Loading Job Listings with Organizations**

❌ **Bad (N+1):**

```typescript
const jobs = await db.select().from(JobListingTable);
// Then for each job:
for (const job of jobs) {
  const org = await db
    .select()
    .from(OrganizationTable)
    .where(eq(OrganizationTable.id, job.organizationId));
}
```

✅ **Good (Single query with join):**

```typescript
const jobsWithOrgs = await db
  .select({
    job: JobListingTable,
    organization: OrganizationTable,
  })
  .from(JobListingTable)
  .leftJoin(
    OrganizationTable,
    eq(JobListingTable.organizationId, OrganizationTable.id),
  );
```

✅ **Better (Using Drizzle Relations):**

```typescript
const jobsWithRelations = await db.query.JobListingTable.findMany({
  with: {
    organization: true,
    applications: {
      with: {
        user: true,
      },
    },
  },
});
```

---

### 8. Caching Strategy

**Current State:** No caching implemented.

**Impact:** Every request hits the database, even for static or rarely-changing data.

**Implementation Required:**

**Add Redis for Caching:**

**Install Dependencies:**

```json
"ioredis": "^5.x.x",
"@vercel/kv": "^1.x.x"  // If deploying to Vercel
```

**New File:** `src/lib/redis.ts`

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300, // 5 minutes default
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const data = await fetcher();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

export { redis };
```

**Usage Example:**

```typescript
import { getCachedOrFetch } from "@/lib/redis";

// Cache job listings for 10 minutes
const publishedJobs = await getCachedOrFetch(
  "jobs:published",
  async () => {
    return await db.query.JobListingTable.findMany({
      where: eq(JobListingTable.status, "published"),
    });
  },
  600, // 10 minutes
);
```

**Cache Invalidation Strategy:**

```typescript
// After creating/updating a job
await redis.del("jobs:published");
await redis.del(`job:${jobId}`);

// After organization update
await redis.del(`org:${orgId}:jobs`);
```

---

## 🚀 Infrastructure & Deployment

### 9. Database Migration Strategy for Production

**Current State:** Migrations exist but no documented production strategy.

**Risk:**

- Downtime during migrations
- Data loss from incorrect migrations
- No rollback plan

**Implementation Required:**

**Migration Workflow:**

1. **Development:**

   ```bash
   # Make schema changes
   pnpm db:generate  # Generate migration
   pnpm db:push      # Apply to dev DB (or use db:migrate)
   ```

2. **Staging:**

   ```bash
   # Test migration on staging database
   pnpm db:migrate
   # Run integration tests
   pnpm test:integration
   ```

3. **Production:**

   ```bash
   # Backup database FIRST
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).backup

   # Run migration
   pnpm db:migrate

   # Verify migration
   pnpm db:studio  # Visual check

   # If issues, rollback:
   # pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME backup_XXXXXX.backup
   ```

**Add to package.json:**

```json
"scripts": {
  "db:backup": "pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f ./backups/backup_$(date +%Y%m%d_%H%M%S).backup",
  "db:migrate:prod": "NODE_ENV=production drizzle-kit migrate",
  "db:rollback": "./scripts/rollback-migration.sh"
}
```

**Create:** `scripts/rollback-migration.sh`

```bash
#!/bin/bash
# Rollback last migration
echo "WARNING: This will rollback the last migration"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
  # Get latest backup
  LATEST_BACKUP=$(ls -t ./backups/*.backup | head -1)
  echo "Restoring from: $LATEST_BACKUP"

  pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME --clean --if-exists $LATEST_BACKUP

  echo "Rollback complete"
else
  echo "Rollback cancelled"
fi
```

---

### 10. Health Checks & Monitoring

**Current State:** No health check endpoints.

**Impact:**

- Can't monitor application health
- Load balancers can't detect unhealthy instances
- No visibility into database connection status

**Implementation Required:**

**File:** `src/app/api/health/route.ts`

```typescript
import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: "unknown",
      memory: "unknown",
    },
    uptime: process.uptime(),
  };

  try {
    // Database check
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const responseTime = Date.now() - start;

    healthCheck.checks.database = responseTime < 100 ? "healthy" : "degraded";

    // Memory check
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    healthCheck.checks.memory = memUsageMB < 500 ? "healthy" : "warning";

    return Response.json(healthCheck);
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.checks.database = "unavailable";

    return Response.json(healthCheck, { status: 503 });
  }
}
```

**Add Deep Health Check:** `src/app/api/health/deep/route.ts`

```typescript
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const checks = [];

  // Database connectivity
  try {
    await db.execute(sql`SELECT 1`);
    checks.push({ name: "database_connection", status: "healthy" });
  } catch (error) {
    checks.push({
      name: "database_connection",
      status: "unhealthy",
      error: error.message,
    });
  }

  // Table accessibility
  try {
    await db.select().from(UserTable).limit(1);
    checks.push({ name: "database_tables", status: "healthy" });
  } catch (error) {
    checks.push({
      name: "database_tables",
      status: "unhealthy",
      error: error.message,
    });
  }

  const allHealthy = checks.every((check) => check.status === "healthy");

  return Response.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: allHealthy ? 200 : 503,
    },
  );
}
```

---

## Environment Variable Additions for Production

```env
# Security
NODE_ENV=production
DATABASE_SSL_ENABLED=true
USE_IAM_AUTH=false  # Set to true if using IAM auth

# Performance
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
DATABASE_STATEMENT_TIMEOUT=30000

# Monitoring
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your_sentry_dsn_here
ENABLE_QUERY_LOGGING=false  # Set to true for debugging

# AWS (if using IAM auth or secrets manager)
AWS_REGION=us-east-1
AWS_SECRETS_NAME=kore-standards/database
```

---

## Testing Requirements Before Production

### 1. Load Testing

- Use tools like k6, Artillery, or Apache JMeter
- Test with 10x expected traffic
- Monitor connection pool exhaustion

### 2. Security Audit

- Run OWASP ZAP or Burp Suite
- Check for SQL injection vulnerabilities
- Audit environment variable exposure

### 3. Database Performance

- Run EXPLAIN ANALYZE on common queries
- Check query execution times
- Monitor index usage

### 4. Failover Testing

- Test database connection loss recovery
- Verify graceful degradation
- Test health check responses

---

## Deployment Checklist

Before deploying to production:

- [ ] SSL/TLS database connections configured
- [ ] Connection pooling implemented with proper limits
- [ ] Database indexes created and tested
- [ ] Caching strategy implemented
- [ ] Health check endpoints added
- [ ] Migration rollback plan documented
- [ ] Secrets moved to secrets manager
- [ ] Monitoring and alerting configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Database backup strategy in place
- [ ] Error tracking integrated (Sentry, DataDog, etc.)
- [ ] Performance benchmarks documented

---

**Last Updated:** 2026-02-05  
**Status:** Development Phase - Production deployment pending
