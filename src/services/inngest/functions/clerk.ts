import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { insertUser } from "@/features/users/db/user";
import { insertUserNotificationSettings } from "@/features/users/db/userNotificationSettings";

export const clerkCreateUser = inngest.createFunction(
    { id: "clerk/create-db-user", name: "Clerk - Create DB User" },
    { event: "clerk/user.created" },
    async ({ event, step }) => {
        console.log("🚀 Inngest function triggered for user:", event.data.data.id);

        const userId = await step.run("create-user", async () => {
            const userData = event.data.data;
            const email = userData.email_addresses.find(email => email.id === userData.primary_email_address_id);
            
            if (email == null) {
                throw new NonRetriableError("No primary email address found for user");
            }

            await insertUser({
                id: userData.id,
                name: `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim() || 'Unknown User',
                imageUrl: userData.image_url,
                email: email.email_address,
                createdAt: new Date(userData.created_at),
                updatedAt: new Date(userData.updated_at),
            });

            console.log("✅ User created in database:", userData.id);
            return userData.id;
        });

        await step.run("create-user-notification-settings", async () => {
            await insertUserNotificationSettings({ userId });
            console.log("✅ User notification settings created for:", userId);
        });

        console.log("🎉 User creation flow completed successfully for:", userId);
    }
);