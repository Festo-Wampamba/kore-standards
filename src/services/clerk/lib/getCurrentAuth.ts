import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

type GetCurrentUserResult = {
    userId: string | null;
    user: typeof UserTable.$inferSelect | undefined;
}

export async function getCurrentUser(
    { allData = false } = {}
): Promise<GetCurrentUserResult> {
    const { userId } = await auth();

    return {
        userId,
        user: (allData && userId != null) ? await getUser(userId) : undefined,
    }
}

async function getUser(id: string): Promise<typeof UserTable.$inferSelect | undefined> {
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id)
    });
}