import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";


export const env = createEnv({
    server: {
        DB_USER: z.string().min(1),
        DB_PASSWORD: z.string().min(1),
        DB_NAME: z.string().min(1),
        DB_HOST: z.string().min(1),
        DB_PORT: z.string().min(1),
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_WEBHOOK_SECRET: z.string().min(1),
    },
    createFinalSchema: env => {
        return z.object(env).transform(val => {
            const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val;

            return {
                ...rest,
                DATABASE_URL: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
            }
        })
    },
    emptyStringAsUndefined: true,
    experimental__runtimeEnv: process.env
});