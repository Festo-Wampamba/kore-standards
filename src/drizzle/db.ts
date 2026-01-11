import { env } from '@/data/env/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/drizzle/schema';

export const db = drizzle(env.DATABASE_URL, { schema });
