import { tool } from "ai";
import { z } from "zod";

import { getVaultAccessToken, withTokenVault } from "@/lib/auth0-ai";

const listEvents = withTokenVault
  ? withTokenVault(
      tool({
        description:
          "List upcoming Google Calendar events via Token Vault (requires a connected Google account in Auth0).",
        inputSchema: z.object({
          maxResults: z.number().min(1).max(10).optional(),
        }),
        execute: async ({ maxResults = 5 }) => {
          const accessToken = await getVaultAccessToken();
          const params = new URLSearchParams({
            maxResults: String(maxResults),
            orderBy: "startTime",
            singleEvents: "true",
            timeMin: new Date().toISOString(),
          });

          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );

          if (!response.ok) {
            const text = await response.text();
            return { error: "Calendar API call failed.", detail: text.slice(0, 200) };
          }

          const data = (await response.json()) as {
            items?: Array<{ summary?: string; start?: { dateTime?: string } }>;
          };

          return {
            provider: "google-calendar",
            events:
              data.items?.map((item) => ({
                title: item.summary ?? "(no title)",
                starts: item.start?.dateTime ?? "all-day",
              })) ?? [],
          };
        },
      }),
    )
  : null;

export const listCalendarEventsTool = listEvents;
