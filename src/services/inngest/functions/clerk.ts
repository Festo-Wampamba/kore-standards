import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { deleteUser, updateUser } from "@/features/users/db/users";
import { insertOrganization } from "@/features/organizations/db/users";
import { db } from "@/drizzle/db";
import { UserTable, UserNotificationSettingsTable } from "@/drizzle/schema";
import { revalidateUserCache } from "@/features/users/db/cache/users";
import { revalidateUserNotificationSettingsCache } from "@/features/users/db/cache/userNotificationSettings";
import { eq } from "drizzle-orm";



export const clerkCreateUser = inngest.createFunction(
    { id: "clerk/create-db-user", name: "Clerk - Create DB User" },
    { event: "clerk/user.created" },
    async ({ event, step }) => {
        console.log(" Inngest function triggered for user:", event.data.data.id);

        const userId = await step.run("create-user", async () => {
            const userData = event.data.data;
            const email = userData.email_addresses.find(email => email.id === userData.primary_email_address_id);
            
            if (email == null) {
                throw new NonRetriableError("No primary email address found for user");
            }

            // Check if user already exists (idempotency for Inngest retries)
            const existingUser = await db
                .select({ id: UserTable.id })
                .from(UserTable)
                .where(eq(UserTable.id, userData.id))
                .limit(1);

            if (existingUser.length === 0) {
                // User doesn't exist - create both user and notification settings atomically
                await db.transaction(async (tx) => {
                    // Insert user (no onConflictDoNothing needed since we checked first)
                    await tx.insert(UserTable).values({
                        id: userData.id,
                        name: `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim() || 'Unknown User',
                        imageUrl: userData.image_url,
                        email: email.email_address,
                        createdAt: new Date(userData.created_at),
                        updatedAt: new Date(userData.updated_at),
                    });

                    // Insert notification settings in same transaction
                    await tx.insert(UserNotificationSettingsTable).values({
                        userId: userData.id,
                    });
                });

                console.log("User and notification settings created successfully:", userData.id);
            } else {
                console.log("User already exists (idempotent retry):", userData.id);
            }

            // Revalidate caches
            revalidateUserCache(userData.id);
            revalidateUserNotificationSettingsCache(userData.id);

            return userData.id;
        });

        console.log("User creation flow completed successfully for:", userId);
    }
);


export const clerkUpdateUser = inngest.createFunction(
    { id: "clerk/update-db-user", name: "Clerk - Update DB User" },
    { event: "clerk/user.updated" },
    async ({ event, step }) => {
        console.log("Inngest function triggered for user:", event.data.data.id);

        const userId = await step.run("update-user", async () => {
            const userData = event.data.data;
            const email = userData.email_addresses.find(email => email.id === userData.primary_email_address_id);
            
            if (email == null) {
                throw new NonRetriableError("No primary email address found for user");
            }


            await updateUser(userData.id, {
                name: `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim() || 'Unknown User',
                imageUrl: userData.image_url,
                email: email.email_address,
                updatedAt: new Date(userData.updated_at),
            });

            console.log("User updated in database:", userData.id);
            return userData.id;
        });

        console.log("User update flow completed successfully for:", userId);
    }
);


export const clerkDeleteUser = inngest.createFunction(
    { id: "clerk/delete-db-user", name: "Clerk - Delete DB User" },
    { event: "clerk/user.deleted" },
    async ({ event, step }) => {
        await step.run("delete-user", async () => {
            const { id } = event.data.data

            if (id == null) {
                throw new NonRetriableError("No user ID provided in delete event");
            }
            await deleteUser(id)
        })
    }
)


export const clerkCreateOrganization = inngest.createFunction(
    { id: "clerk/create-db-organization", name: "Clerk - Create DB Organization" },
    { event: "clerk/organization.created", },
    async ({ event, step }) => {
        await step.run("create-organization", async () => {
            const orgData = event.data.data;

            await insertOrganization({
                id: orgData.id,
                name: orgData.name,
                imageUrl: orgData.image_url,
                createdAt: new Date(orgData.created_at),
                updatedAt: new Date(orgData.updated_at),
            });

            console.log("Organization created in database:", orgData.id);
        });
    }
);

