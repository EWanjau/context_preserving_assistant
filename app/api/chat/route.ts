import { setAIContext } from "@auth0/ai-vercel";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { NextRequest } from "next/server";

import { auth0 } from "@/lib/auth0";
import { buildDemoBriefing } from "@/lib/demo-agent";
import { getChatModel } from "@/lib/model";
import { getUserSettings } from "@/lib/settings-store";
import { fetchWeatherForCoords } from "@/lib/weather";
import { getUserSettingsTool } from "@/lib/tools/user-settings";
import { getWeatherTool } from "@/lib/tools/weather";

const SYSTEM = `You are Harbor, a personal assistant. The user is already authenticated via Auth0 Universal Login.
Always prefer their saved profile settings from the first-party API before guessing cities or units.
When asked for weather, call getUserSettingsTool first if you need home city or units, then getWeatherTool.
Mention the user's home city and unit preference when reporting weather. Stay concise.`;

function wantsBriefing(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("weather") ||
    t.includes("brief") ||
    t.includes("setting") ||
    t.includes("home city") ||
    t.includes("what should i wear") ||
    t.includes("pack")
  );
}

async function runDemoFlow(threadId: string, userText: string) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return "Please sign in through Universal Login first.";
  }

  if (!wantsBriefing(userText)) {
    return [
      "I'm running in **demo mode** (set `GOOGLE_GENERATIVE_AI_API_KEY` or `OPENAI_API_KEY` for full tool routing).",
      "",
      "Try: **“What’s the weather at my home city?”** — I'll read your first-party settings, then call Open-Meteo.",
    ].join("\n");
  }

  const settings = await getUserSettings(session.user.sub);
  const weather = await fetchWeatherForCoords({
    latitude: settings.latitude,
    longitude: settings.longitude,
    cityLabel: settings.homeCity,
    temperatureUnit: settings.temperatureUnit,
  });

  const name =
    session.user.name?.trim() ||
    session.user.nickname?.trim() ||
    session.user.email ||
    "friend";

  return buildDemoBriefing({
    userName: name,
    userId: session.user.sub,
    settings,
    weather,
    threadId,
  });
}

export async function POST(req: NextRequest) {
  const { id, messages }: { id: string; messages: UIMessage[] } =
    await req.json();

  setAIContext({ threadID: id });

  const session = await auth0.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText =
    lastUser?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";

  const model = getChatModel();

  if (!model) {
    const text = await runDemoFlow(id, userText);
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const result = streamText({
    model,
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      getUserSettingsTool,
      getWeatherTool,
    },
    onError({ error }) {
      console.error("Harbor streamText error:", error);
    },
  });

  return result.toUIMessageStreamResponse();
}
