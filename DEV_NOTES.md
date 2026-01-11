# Developer Notes & Troubleshooting

This document contains setup instructions, common fixes, and command references for the **WorkConnectUG** project.

## 🚀 Quick Command Reference

We use **pnpm** for this project.

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start Server** | `pnpm dev` | Starts Next.js on localhost:3000 |
| **Generate SQL** | `pnpm db:generate` | Creates migration files based on schema changes |
| **Push to DB** | `pnpm db:migrate` | Applies the migrations to the actual Docker database |
| **Open Studio** | `pnpm db:studio` | Opens the visual database editor |

---

## 🐳 Docker Commands (Database Management)

These commands control the database container running in the background.

| Action | Command |
| :--- | :--- |
| **Check Status** | `docker ps` |
| **Start Database** | `docker compose up -d` |
| **Stop Database** | `docker compose down` |
| **View Logs** | `docker logs job-link-db` |

---

## 🔥 Dangerous: How to Fix a "Conflicting" Database

If your database is corrupted or has conflicts that cannot be fixed, use this process to **delete everything and start fresh**.

### Step 1: Delete the Database (The "Hard Reset")

Run this command to stop the container and **delete the saved data volumes**:

```bash
docker compose down -v
```

---

### Warning: "ForceConsistentCasingInFileNames"

**Cause:** Ensures TypeScript strictly enforces case-sensitive file imports, preventing "Module not found" errors during Vercel deployment.
**Fix:** Open `tsconfig.json` and add this line inside `"compilerOptions"`:

```json
"compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    // ... other settings
}
