import { DeletedObjectJSON, UserJSON } from "@clerk/nextjs/server";
import { EventSchemas, Inngest } from "inngest";

type ClerkWebHookData<T> = {
    data: {
        data: T,
        raw: string,
        headers: Record<string, string>
    }
}

type Events = {
    "clerk/user.created": ClerkWebHookData<UserJSON>
    "clerk/user.updated": ClerkWebHookData<UserJSON>
    "clerk/user.deleted": ClerkWebHookData<DeletedObjectJSON>
}

// Create a client to send and receive events
export const inngest = new Inngest({ id: "kore-standards", schemas: new EventSchemas().fromRecord<Events>(), });