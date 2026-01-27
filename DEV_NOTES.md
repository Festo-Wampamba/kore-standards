# Developer Notes & Troubleshooting

This comprehensive developer handbook contains setup instructions, workflows, command references, and troubleshooting guides for the **Kore-Standards** project. Designed for team members working on the codebase.

---

## 📋 Table of Contents

1. [Quick Command Reference](#-quick-command-reference)
2. [Development Environment Setup](#-development-environment-setup)
3. [Docker Commands (Database Management)](#-docker-commands-database-management)
4. [Database Development Workflow](#-database-development-workflow)
5. [Code Architecture Patterns](#-code-architecture-patterns)
6. [Git Workflows](#-git-workflows)
7. [Common Issues & Solutions](#-common-issues--solutions)
8. [Performance Optimization](#-performance-optimization)
9. [Team Collaboration](#-team-collaboration)

---

## 🚀 Quick Command Reference

We use **pnpm** as our package manager for this project.

### Core Development Commands

| Action               | Command            | Description                                         |
| :------------------- | :----------------- | :-------------------------------------------------- |
| **Install Packages** | `pnpm install`     | Install all dependencies from package.json          |
| **Start Dev Server** | `pnpm dev`         | Start Next.js on localhost:3000 with hot reload     |
| **Build Production** | `pnpm build`       | Create optimized production build                   |
| **Start Production** | `pnpm start`       | Run production server (requires `pnpm build` first) |
| **Lint Code**        | `pnpm lint`        | Run ESLint to check for code quality issues         |
| **Type Check**       | `npx tsc --noEmit` | Check TypeScript types without emitting files       |

### Database Commands

| Action               | Command            | Description                                             |
| :------------------- | :----------------- | :------------------------------------------------------ |
| **Generate SQL**     | `pnpm db:generate` | Create migration files based on schema changes          |
| **Push Schema**      | `pnpm db:push`     | Push schema directly to DB (dev only, skips migrations) |
| **Apply Migrations** | `pnpm db:migrate`  | Apply pending migrations to the database                |
| **Open Studio**      | `pnpm db:studio`   | Launch Drizzle Studio visual database editor            |

### Utility Commands

| Action                   | Command                              | Description                             |
| :----------------------- | :----------------------------------- | :-------------------------------------- |
| **Clear Next.js Cache**  | `rm -rf .next`                       | Remove build cache (fixes stale builds) |
| **Clear Node Modules**   | `rm -rf node_modules pnpm-lock.yaml` | Full dependency reset                   |
| **Reinstall Everything** | `pnpm install --force`               | Fresh install of all packages           |

---

## 🛠️ Development Environment Setup

### Required Software

1. **Node.js (v18+)**

   ```bash
   # Verify installation
   node --version  # Should be v18.0.0 or higher
   npm --version
   ```

2. **pnpm (Package Manager)**

   ```bash
   # Install pnpm globally
   npm install -g pnpm

   # Verify
   pnpm --version  # Should be 8.0.0 or higher
   ```

3. **Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Verify installation:
     ```bash
     docker --version
     docker compose version
     ```

4. **Git**
   ```bash
   # Verify
   git --version
   ```

### Recommended IDE Setup

**Visual Studio Code** with the following extensions:

- **ESLint** (`dbaeumer.vscode-eslint`) - Linting
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - CSS autocomplete
- **Drizzle ORM** (`drizzle-team.drizzle-vscode`) - Database schema support
- **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- **TypeScript Vue Plugin (Volar)** - Enhanced TypeScript support
- **Error Lens** (`usernamehw.errorlens`) - Inline error display
- **Git Graph** (`mhutchie.git-graph`) - Visual Git history

**VS Code Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### First-Time Setup Checklist

- [ ] Clone repository: `git clone https://github.com/Festo-Wampamba/kore-standards.git`
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`
- [ ] Start Docker Desktop application
- [ ] Start PostgreSQL: `docker compose up -d`
- [ ] Install dependencies: `pnpm install`
- [ ] Run migrations: `pnpm db:migrate`
- [ ] Start dev server: `pnpm dev`
- [ ] Open browser to `http://localhost:3000`

---

## 🐳 Docker Commands (Database Management)

These commands control the PostgreSQL database container running in the background.

### Essential Docker Commands

| Action                | Command                                                                      | Description                                 |
| :-------------------- | :--------------------------------------------------------------------------- | :------------------------------------------ |
| **Start Database**    | `docker compose up -d`                                                       | Start PostgreSQL container in detached mode |
| **Stop Database**     | `docker compose down`                                                        | Stop and remove container (data persists)   |
| **Restart Database**  | `docker compose restart`                                                     | Restart the container                       |
| **Check Status**      | `docker ps`                                                                  | List all running containers                 |
| **View Logs**         | `docker logs postgres_kore-standards`                                        | View PostgreSQL logs                        |
| **Follow Logs**       | `docker logs -f postgres_kore-standards`                                     | Stream logs in real-time (Ctrl+C to exit)   |
| **Access PostgreSQL** | `docker exec -it postgres_kore-standards psql -U postgres -d kore_standards` | Open psql shell                             |
| **Container Shell**   | `docker exec -it postgres_kore-standards bash`                               | Access container terminal                   |

### Database Container Management

**Start Fresh Database** (⚠️ Destroys all data):

```bash
docker compose down -v  # Stop and remove volume
docker compose up -d    # Start fresh container
pnpm db:migrate         # Re-apply migrations
```

**Check Database Connection**:

```bash
docker exec postgres_kore-standards pg_isready -U postgres
# Expected output: /var/run/postgresql:5432 - accepting connections
```

**View Database Size**:

```bash
docker exec postgres_kore-standards psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('kore_standards'));"
```

### Troubleshooting Docker Issues

**Port 5432 Already in Use**:

```bash
# Find process using port 5432
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Kill the process or change port in docker-compose.yml to "5433:5432"
```

**Container Won't Start**:

```bash
# Check detailed error logs
docker compose logs postgres

# Remove and recreate container
docker compose down
docker compose up -d
```

---

## 🗄️ Database Development Workflow

### Understanding Drizzle ORM

Drizzle uses a **schema-first migration workflow**:

1. Define your schema in TypeScript files (`src/drizzle/schema/*.ts`)
2. Generate SQL migrations with `pnpm db:generate`
3. Apply migrations to database with `pnpm db:migrate`

This ensures type safety and version control for database changes.

### Adding a New Database Table

**Step-by-Step Guide**:

1. **Create Schema File**: `src/drizzle/schema/yourTable.ts`

   ```typescript
   import { pgTable, varchar, text } from "drizzle-orm/pg-core";
   import { createdAt, updatedAt, id } from "../schemaHelpers";

   export const YourTable = pgTable("your_table", {
     id, // Auto-generated UUID from helper
     title: varchar().notNull(),
     description: text(),
     createdAt,
     updatedAt,
   });
   ```

2. **Export Schema**: Add to `src/drizzle/schema.ts`

   ```typescript
   export * from "./schema/yourTable";
   ```

3. **Add Relations** (if needed):

   ```typescript
   import { relations } from "drizzle-orm";

   export const yourTableRelations = relations(YourTable, ({ one }) => ({
     user: one(UserTable, {
       fields: [YourTable.userId],
       references: [UserTable.id],
     }),
   }));
   ```

4. **Generate Migration**:

   ```bash
   pnpm db:generate
   ```

   Review the generated SQL in `src/drizzle/migrations/XXXX_*.sql`

5. **Apply Migration**:

   ```bash
   pnpm db:migrate
   ```

6. **Verify in Drizzle Studio**:
   ```bash
   pnpm db:studio
   ```
   Open `https://local.drizzle.studio` to see your new table.

### Modifying Existing Tables

1. **Edit Schema File**: Make changes to the table definition
2. **Generate Migration**: `pnpm db:generate`
3. **Review SQL**: Check the migration handles data correctly
4. **Apply Migration**: `pnpm db:migrate`

### Seeding Development Data

Create a seed script `src/drizzle/seed.ts`:

```typescript
import { db } from "./db";
import { UserTable, OrganizationTable } from "./schema";

async function seed() {
  // Insert sample users
  await db.insert(UserTable).values([
    {
      id: "user_test123",
      email: "test@example.com",
      name: "Test User",
      imageUrl: "https://example.com/avatar.jpg",
    },
  ]);

  console.log("✅ Seed data inserted");
}

seed().catch(console.error);
```

Run with:

```bash
npx tsx src/drizzle/seed.ts
```

### Database Backup & Restore

**Backup** (Docker PostgreSQL):

```bash
docker exec postgres_kore-standards pg_dump -U postgres kore_standards > backup.sql
```

**Restore**:

```bash
docker exec -i postgres_kore-standards psql -U postgres -d kore_standards < backup.sql
```

### Migration Conflicts

If two developers create migrations simultaneously:

1. **Pull latest code**: `git pull origin develop`
2. **Delete your migration**: Remove your `.sql` file from `src/drizzle/migrations/`
3. **Regenerate**: `pnpm db:generate`
4. **Review merged migration**: Ensure it includes all changes
5. **Apply**: `pnpm db:migrate`

---

## 🏗️ Code Architecture Patterns

### Project Structure Explained

```
src/
├── app/                       # Next.js 16 App Router
│   ├── layout.tsx            # Root layout (metadata, fonts)
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global Tailwind styles
│   └── [route]/              # Feature routes (future)
│       ├── page.tsx          # Route page component
│       └── layout.tsx        # Route-specific layout (optional)
├── drizzle/                   # Database layer (ORM)
│   ├── schema/                # Modular table definitions
│   │   ├── user.ts           # Users table + relations
│   │   ├── organization.ts   # Organizations table
│   │   └── ...
│   ├── migrations/            # Auto-generated SQL migrations
│   ├── schema.ts              # Central schema export
│   ├── schemaHelpers.ts       # Reusable field definitions (id, timestamps)
│   └── db.ts                  # Database connection singleton
└── data/env/                  # Environment configuration
    └── server.ts              # T3 Env with Zod validation
```

### Environment Variable Management

**Using T3 Env** for type-safe environment variables:

`src/data/env/server.ts`:

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    // ... other variables
  },
  createFinalSchema: (env) => {
    return z.object(env).transform((val) => {
      // Construct DATABASE_URL from components
      return {
        ...val,
        DATABASE_URL: `postgresql://${val.DB_USER}:${val.DB_PASSWORD}@${val.DB_HOST}:${val.DB_PORT}/${val.DB_NAME}`,
      };
    });
  },
  experimental__runtimeEnv: process.env,
});
```

**Usage**:

```typescript
import { env } from "@/data/env/server";

// Fully type-safe, throws error if not defined
const dbUrl = env.DATABASE_URL;
```

**Best Practices**:

- ✅ Always use `env` object, never `process.env` directly
- ✅ Define Zod schemas for validation
- ✅ Use `.min(1)` to prevent empty strings
- ✅ Keep `.env` in `.gitignore`, commit `.env.example`

### Type Safety Patterns

**Drizzle Type Inference**:

```typescript
import { UserTable } from "@/drizzle/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Inferred types from schema
type User = InferSelectModel<typeof UserTable>;
type NewUser = InferInsertModel<typeof UserTable>;

// Usage
const user: User = await db.query.UserTable.findFirst();
const newUser: NewUser = { id: "123", email: "user@example.com", ... };
```

**Zod for Runtime Validation**:

```typescript
import { z } from "zod";

const jobListingSchema = z.object({
  title: z.string().min(5).max(200),
  wage: z.number().int().positive().optional(),
  district: z.string().optional(),
});

// In API route
const result = jobListingSchema.safeParse(requestBody);
if (!result.success) {
  return Response.json({ errors: result.error }, { status: 400 });
}
```

### Adding New API Routes (App Router)

Create `src/app/api/your-endpoint/route.ts`:

```typescript
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const jobs = await db.query.JobListingTable.findMany({
      where: (jobs, { eq }) => eq(jobs.status, "published"),
      limit: 10,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests
}
```

---

## 🌳 Git Workflows

### Branch Naming Conventions

```
feature/job-listing-page       # New features
bugfix/fix-login-redirect      # Bug fixes
hotfix/critical-db-error       # Urgent production fixes
refactor/extract-auth-logic    # Code improvements
docs/update-readme             # Documentation changes
```

### Standard Workflow

1. **Create Feature Branch**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Commit**:

   ```bash
   git add .
   git commit -m "feat: Add job listing creation form"
   ```

3. **Push to Remote**:

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request** on GitHub:
   - Base: `develop`
   - Compare: `feature/your-feature-name`
   - Add description and link to issue (if applicable)

5. **Code Review**: Wait for team member approval

6. **Merge**: Use "Squash and Merge" on GitHub

### Commit Message Format

Follow **Conventional Commits**:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding/updating tests
- `chore:` - Maintenance (dependencies, config)

**Examples**:

```bash
git commit -m "feat: Add employer verification workflow"
git commit -m "fix: Resolve database connection timeout issue"
git commit -m "docs: Update API documentation for job endpoints"
```

### Handling Merge Conflicts

1. **Update Your Branch**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git merge develop
   ```

2. **Resolve Conflicts** in your IDE or manually

3. **Mark as Resolved**:

   ```bash
   git add .
   git commit -m "chore: Resolve merge conflicts"
   ```

4. **Push Updated Branch**:
   ```bash
   git push origin your-feature-branch
   ```

---

## 🐛 Common Issues & Solutions

### 1. TypeScript Errors

**Issue**: `Cannot find module '@/drizzle/schema'`

**Solution**: Ensure `tsconfig.json` has path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

**Issue**: `ForceConsistentCasingInFileNames` warning

**Solution**: Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
```

### 2. Database Connection Issues

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:

```bash
# 1. Check if Docker is running
docker ps

# 2. Start database
docker compose up -d

# 3. Verify container health
docker logs postgres_kore-standards

# 4. Test connection
docker exec postgres_kore-standards pg_isready -U postgres
```

---

**Issue**: Migration fails with "relation already exists"

**Solution**: Reset database (⚠️ destroys data):

```bash
docker compose down -v
docker compose up -d
pnpm db:migrate
```

### 3. pnpm / Node Modules Issues

**Issue**: `ERR_PNPM_OUTDATED_LOCKFILE`

**Solution**:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

**Issue**: Package not found after installation

**Solution**: Ensure you're using pnpm (not npm):

```bash
pnpm install <package-name>  # ✅ Correct
npm install <package-name>   # ❌ Wrong for this project
```

### 4. Next.js Build Issues

**Issue**: Build fails with stale cache errors

**Solution**:

```bash
rm -rf .next
pnpm dev
```

---

**Issue**: `Module not found: Can't resolve 'react'`

**Solution** (dependencies out of sync):

```bash
pnpm install --force
```

### 5. Environment Variable Errors

**Issue**: `Error: DB_USER is required`

**Solutions**:

```bash
# 1. Check .env file exists
ls -la .env

# 2. Verify format (no quotes needed)
DB_USER=postgres  # ✅ Correct
DB_USER="postgres"  # ❌ Wrong

# 3. Restart dev server after editing .env
# Ctrl+C to stop, then:
pnpm dev
```

### 6. Port Conflicts

**Issue**: `Port 3000 is already in use`

**Solutions**:

```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
npx kill-port 3000             # Windows

# Option 2: Use different port
pnpm dev -- -p 3001
```

### 7. 🚨 CRITICAL: Privacy Browser Shields Blocking Local Development

> **⚠️ WARNING: This issue can cost you HOURS of debugging time!**

**Issue**: Privacy-focused browsers (Brave, Firefox Focus, etc.) can **silently block** local development tools, preventing proper functionality even when your code is 100% correct.

**Symptoms**:

- Inngest dev server shows events received but functions don't execute
- Drizzle Studio can't connect to local database
- Webhooks aren't reaching your local endpoints
- Database writes fail silently with no error messages
- API calls timeout or return empty responses

**Affected Browsers**:

- 🛡️ **Brave Browser** - Brave Shields
- 🛡️ **Firefox Focus** - Enhanced Tracking Protection
- 🛡️ **DuckDuckGo Browser** - Privacy Protection
- 🛡️ **Safari** - Intelligent Tracking Prevention (less common)

**Root Cause**:
Privacy shields block cross-origin requests and tracking scripts. Even though `localhost` is local, these browsers treat different ports (`localhost:3000` → `localhost:8288`) as cross-origin requests and block them for "security."

**Solution**:

**For Brave Browser**:

```
1. Click the Brave Shield icon (🛡️) in the address bar
2. Toggle "Shields" to OFF for localhost
3. Or set Shields to "Advanced View" and disable:
   - Block cross-site trackers
   - Block fingerprinting
```

**For Firefox**:

```
1. Click the shield icon in address bar
2. Turn OFF "Enhanced Tracking Protection" for localhost
```

**Alternative**: Use **Chrome** or **Edge** for local development (they don't have aggressive shields by default).

**Real-World Impact**:
One developer spent **7+ hours debugging** Inngest and Drizzle persistence issues, checking environment variables, rewriting database logic, and reviewing migrations—only to discover Brave Shields was silently blocking all requests. The code was perfect; the browser was the issue.

**Best Practice**:

```bash
# Add to your development checklist:
- [ ] Using Chrome/Edge for development
- OR
- [ ] Privacy shields disabled for localhost
```

**Test if shields are the issue**:

1. Open Chrome/Edge (no shields)
2. Run the same workflow
3. If it works → shields were blocking
4. If it fails → actual code issue

---

## ⚡ Performance Optimization

### Database Query Optimization

**Use Indexes** for frequently queried fields:

```typescript
// In schema definition
export const JobListingTable = pgTable(
  "job_listings",
  {
    // ... fields
  },
  (table) => [
    index().on(table.district), // For location filtering
    index().on(table.status), // For status queries
    index().on(table.postedAt), // For sorting by date
  ],
);
```

**Limit & Pagination**:

```typescript
// Always limit results
const jobs = await db.query.JobListingTable.findMany({
  limit: 10,
  offset: page * 10,
});
```

**Select Only Needed Fields**:

```typescript
// Instead of SELECT *
const users = await db
  .select({
    id: UserTable.id,
    name: UserTable.name,
  })
  .from(UserTable);
```

### Next.js Optimization

**Image Optimization**:

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>;
```

**Lazy Loading Components**:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
});
```

### Docker Resource Management

Limit PostgreSQL memory usage in `docker-compose.yml`:

```yaml
services:
  postgres:
    # ... existing config
    deploy:
      resources:
        limits:
          memory: 512M # Limit to 512MB
```

---

## 🤝 Team Collaboration

### Code Review Checklist

Before requesting a review, ensure:

- [ ] Code follows TypeScript best practices
- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Database migrations tested locally
- [ ] No console.log statements (use proper logging)
- [ ] Comments added for complex logic
- [ ] Commit messages follow conventions
- [ ] `.env` changes documented in `.env.example`

### Pair Programming Guidelines

- **Driver**: Person writing code, focuses on implementation
- **Navigator**: Reviews code in real-time, thinks strategically
- **Switch Roles**: Every 25-30 minutes to maintain focus
- **Use Live Share**: VS Code Live Share extension for remote pairing

### Knowledge Sharing

**Daily Standups** (15 minutes):

- What did you complete yesterday?
- What will you work on today?
- Any blockers?

**Weekly Tech Talks** (30 minutes):

- Team member presents a technology/pattern used in the project
- Topics: Drizzle ORM, Next.js Server Components, AI Embeddings, etc.

**Documentation as You Go**:

- Document complex decisions in code comments
- Update DEV_NOTES.md when discovering new solutions
- Create GitHub Issues for known bugs/future enhancements

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

**Need Help?** Ask in the team Slack/WhatsApp channel or create a GitHub Discussion.
