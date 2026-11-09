import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export function getChatModel() {
  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return google("gemini-3-flash-preview");
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return openai("gpt-4o-mini");
  }

  return null;
}
