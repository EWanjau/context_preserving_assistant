import { tool } from "ai";
import { headers } from "next/headers";
import { z } from "zod";

import { auth0 } from "@/lib/auth0";

/**
 * Calls the app's first-party settings API using the same browser session
 * cookie, so the agent acts only for the authenticated user.
 */
export const getUserSettingsTool = tool({
  description:
    "Fetch the signed-in user's profile settings from the first-party Harbor API (home city, units, tone).",
  inputSchema: z.object({
    reason: z.string().optional().describe("Why settings are needed"),
  }),
  execute: async () => {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return { error: "No authenticated user in this session." };
    }

    const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie");

    const response = await fetch(`${base}/api/settings`, {
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Could not load settings from the first-party API." };
    }

    return {
      firstPartyApi: `${base}/api/settings`,
      userId: session.user.sub,
      ...(await response.json()),
    };
  },
});
