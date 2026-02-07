import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function insertUser(
  user: typeof UserTable.$inferInsert
): Promise<void> {
  await db.insert(UserTable).values(user).onConflictDoNothing();
}

export async function updateUser(
  id: string,
  user: Partial<typeof UserTable.$inferInsert>
): Promise<void> {
  await db.update(UserTable).set(user).where(eq(UserTable.id, id));
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(UserTable).where(eq(UserTable.id, id));
}