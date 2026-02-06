import { inngest } from "@/services/inngest/client";
import { clerkCreateUser } from "@/services/inngest/functions/clerk";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [clerkCreateUser],
});
