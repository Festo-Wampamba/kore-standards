import { db } from "@/drizzle/db";
import { OrganizationTable } from "@/drizzle/schema";
import { UserTable } from "@/drizzle/schema/user";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organization";
import { getUserIdTag } from "@/features/users/db/cache/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

type GetCurrentUserResult = {
    userId: string | null;
    user: typeof UserTable.$inferSelect | undefined;
}

type GetCurrentOrganizationResult = {
    orgId: string | null | undefined;
    organization: typeof OrganizationTable.$inferSelect | undefined; 
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


export async function getCurrentOrganization(
    { allData = false } = {}
): Promise<GetCurrentOrganizationResult> {
    const { orgId } = await auth();

    return {
        orgId,
        organization: (allData && orgId != null) ? await getOrganization(orgId) : undefined,
    }
}

async function getUser(id: string) {
    "use cache";
    cacheTag(getUserIdTag(id));

    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id)
    });
}


async function getOrganization(id: string) {
    "use cache";
    cacheTag(getOrganizationIdTag(id));

    return db.query.OrganizationTable.findFirst({
        where: eq(OrganizationTable.id, id)
    });
}

