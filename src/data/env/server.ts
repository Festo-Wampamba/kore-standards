import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

/**
 * Server-side environment variables configuration
 * 
 * This module validates and transforms environment variables at build time and runtime.
 * If any required variables are missing or invalid, the application will FAIL TO START.
 * 
 * Required Environment Variables:
 * - DB_USER: PostgreSQL username
 * - DB_PASSWORD: PostgreSQL password
 * - DB_HOST: PostgreSQL host (e.g., localhost, or RDS endpoint)
 * - DB_PORT: PostgreSQL port (typically 5432)
 * - DB_NAME: Database name
 * 
 * The individual DB_* variables are automatically transformed into a single
 * DATABASE_URL connection string for use with Drizzle ORM.
 * 
 * Example .env file:
 * ```
 * DB_USER=postgres
 * DB_PASSWORD=mysecretpassword
 * DB_HOST=localhost
 * DB_PORT=5432
 * DB_NAME=kore_standards
 * ```
 * 
 * See .env.example for a template.
 */
export const env = createEnv({
    server: {
        DB_USER: z.string().min(1),
        DB_PASSWORD: z.string().min(1),
        DB_HOST: z.string().min(1),
        DB_PORT: z.string().min(1),
        DB_NAME: z.string().min(1),
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_WEBHOOK_SECRET: z.string().min(1)
    },
    createFinalSchema: env => {
        return z.object(env).transform( val => {
        const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val

        return {
            ...rest,
            DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
        }

    })
    },
    emptyStringAsUndefined: true,
    experimental__runtimeEnv: process.env
})