import { tool } from "ai";
import { z } from "zod";

import { auth0 } from "@/lib/auth0";
import { getUserSettings } from "@/lib/settings-store";
import { fetchWeatherForCoords } from "@/lib/weather";

export const getWeatherTool = tool({
  description:
    "Get current weather from the public Open-Meteo API for a city. If coordinates are omitted, uses the user's saved home city from settings.",
  inputSchema: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    cityLabel: z.string().optional(),
  }),
  execute: async ({ latitude, longitude, cityLabel }) => {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return { error: "No authenticated user in this session." };
    }

    const settings = await getUserSettings(session.user.sub);
    const lat = latitude ?? settings.latitude;
    const lon = longitude ?? settings.longitude;
    const label = cityLabel ?? settings.homeCity;

    const weather = await fetchWeatherForCoords({
      latitude: lat,
      longitude: lon,
      cityLabel: label,
      temperatureUnit: settings.temperatureUnit,
    });

    return {
      thirdPartyApi: "https://api.open-meteo.com/v1/forecast",
      delegatedForUserId: session.user.sub,
      weather,
    };
  },
});
