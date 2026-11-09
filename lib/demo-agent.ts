import type { UserSettings } from "@/lib/settings-store";
import type { WeatherSnapshot } from "@/lib/weather";

export function buildDemoBriefing(input: {
  userName: string;
  userId: string;
  settings: UserSettings;
  weather: WeatherSnapshot;
  threadId: string;
}) {
  const unit = input.settings.temperatureUnit === "fahrenheit" ? "°F" : "°C";
  return [
    `Hi ${input.userName} — same Auth0 session (\`${input.userId.slice(0, 12)}…\`) and thread \`${input.threadId.slice(0, 8)}\` throughout this reply.`,
    "",
    "**From your first-party settings API**",
    `- Home city: **${input.settings.homeCity}**`,
    `- Preferred units: **${input.settings.temperatureUnit}**`,
    `- Tone: **${input.settings.assistantTone}**`,
    "",
    "**From Open-Meteo (third-party, on your behalf)**",
    `- **${input.weather.temperature}${unit}** in ${input.weather.locationLabel}`,
    `- Rain chance: **${input.weather.precipitationChance}%** · Wind: **${input.weather.windKph} km/h**`,
    `- ${input.weather.summary}`,
    "",
    "Ask again in the same chat — I'll keep using your saved settings and signed-in identity.",
  ].join("\n");
}
