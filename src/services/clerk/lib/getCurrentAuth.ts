import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { getUserIdTag } from "@/features/users/db/cache/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

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

async function getUser(id: string) {
    "use cache";
    cacheTag(getUserIdTag(id));

    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id)
    });
}