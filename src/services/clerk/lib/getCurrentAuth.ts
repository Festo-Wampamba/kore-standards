import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getCurrentUser({ allData = false } = {}) {
    const { userId } = await auth();

    return {
        userId,
        user: (allData && userId != null) ? await getUser(userId) : undefined,
    }
}

function getUser(id: string) {
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id)
    });
}