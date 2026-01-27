import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";

export async function insertUser(user: typeof UserTable.$inferInsert) {
    await db.insert(UserTable).values(user).onConflictDoNothing();
}