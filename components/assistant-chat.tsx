"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { FormEvent, useState } from "react";

import { ContextRail } from "@/components/context-rail";

function messageText(message: UIMessage) {
  const bits: string[] = [];
  for (const part of message.parts) {
    if (part.type === "text" && part.text) {
      bits.push(part.text);
    } else if (part.type.startsWith("tool-")) {
      const name = part.type.replace(/^tool-/, "");
      bits.push(`[using ${name}]`);
    }
  }
  return bits.join("\n").trim();
}

export function AssistantChat({
  userName,
  threadId,
  placeholder,
}: {
  userName: string;
  threadId: string;
  placeholder?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const { messages, sendMessage, status } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { id: threadId },
    }),
    onError: (err) => {
      setError(err.message || "Chat request failed.");
    },
  });

  const [input, setInput] = useState("");
  const loading = status === "streaming" || status === "submitted";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setError(null);
    await sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 max-w-6xl mx-auto w-full px-4 py-8">
      <section className="panel flex flex-col min-h-[70vh]">
        <header className="px-5 py-4 border-b border-slate-700/50">
          <h1 className="font-display text-2xl text-teal-300">
            Harbor assistant
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Signed in as {userName}. Ask about your saved settings, then weather
            at your home city.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-slate-400 text-sm space-y-2">
              <p>Try one message that hits both APIs, for example:</p>
              <p className="text-teal-200 font-medium">
                “What’s the weather at my home city based on my settings?”
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap max-w-[90%] ${
                m.role === "user"
                  ? "chat-bubble-user ml-auto"
                  : "chat-bubble-assistant"
              }`}
            >
              {messageText(m) || (m.role === "assistant" && loading ? "Thinking…" : "…")}
            </div>
          ))}
          {error && (
            <p className="text-red-300 text-sm">{error}</p>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="p-4 border-t border-slate-700/50 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              placeholder ?? "Ask Harbor about your settings or weather…"
            }
            className="flex-1 rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-2.5 text-sm outline-none focus:border-teal-500/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-500 text-slate-900 font-medium px-4 py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </section>

      <ContextRail threadId={threadId} />
    </div>
  );
}
