import { Webhook } from "svix";
import { inngest } from "../client";
import { env } from "@/data/env/server";
import { NonRetriableError } from "inngest";
import { deleteUser, insertUser, updateUser } from "@/features/users/db/users";
import { insertUserNotificationSettings } from "@/features/users/db/userNotificationSettings";

function verifyWebhook({ raw, headers }: {
    raw: string,
    headers: Record<string, string>
}) {
    return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, headers)
}

export const clerkCreateUser = inngest.createFunction({ id: 'clerk/create-db-user', name: "Clerk - Create DB User"}, {
    event: "clerk/user.created",
}, 
async ({ event, step}) => {
    await step.run("verify-webhook", async () => {
        try {
            verifyWebhook(event.data)
        } catch {
            throw new NonRetriableError("Invalid webhook")
        }
    })

    const userId = await step.run("create-user", async () => {
        const userData = event.data.data
        const email = userData.email_addresses.find(
            email => email.id === userData.primary_email_address_id
        )

        if (email == null ) {
            throw new NonRetriableError("No primary email address found")
        }

        await insertUser({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            imageUrl: userData.image_url,
            email: email.email_address,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at)
        })

        return userData.id
    })

    await step.run("create-user-notification-settings", async () => {
        await insertUserNotificationSettings({ userId })
    })
}
)

export const clerkUpdateUser = inngest.createFunction(
  { id: "clerk/update-db-user", name: "Clerk - Update DB User" },
  {
    event: "clerk/user.updated",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebhook(event.data);
      } catch {
        throw new NonRetriableError("Invalid webhook");
      }
    });

    await step.run("update-user", async () => {
      const userData = event.data.data;
      const email = userData.email_addresses.find(
        (email) => email.id === userData.primary_email_address_id,
      );

      if (email == null) {
        throw new NonRetriableError("No primary email address found");
      }

      await updateUser(userData.id, {
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        email: email.email_address,
        updatedAt: new Date(userData.updated_at),
      });
    });
  },
);

export const clerkDeleteUser = inngest.createFunction(
  { id: "clerk/delete-db-user", name: "Clerk - Delete DB User" },
  {
    event: "clerk/user.deleted",
  },
  async ({ event, step }) => {
    await step.run("verify-webhook", async () => {
      try {
        verifyWebhook(event.data);
      } catch {
        throw new NonRetriableError("Invalid webhook");
      }
    });

    await step.run("delete-user", async () => {
      const { id } = event.data.data;

      if (id == null) {
        throw new NonRetriableError("No id found");
      }

      await deleteUser(id);
    });
  },
);