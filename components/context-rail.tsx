"use client";

import { useEffect, useState } from "react";

type ContextPayload = {
  authenticated: boolean;
  user?: { sub: string; name?: string; email?: string };
  settings?: {
    homeCity: string;
    temperatureUnit: string;
    assistantTone: string;
  };
  tokenVaultEnabled?: boolean;
};

export function ContextRail({ threadId }: { threadId: string }) {
  const [ctx, setCtx] = useState<ContextPayload | null>(null);

  useEffect(() => {
    fetch("/api/context")
      .then((r) => r.json())
      .then(setCtx)
      .catch(() => setCtx({ authenticated: false }));
  }, []);

  return (
    <aside className="panel p-4 text-sm space-y-3 h-fit">
      <h2 className="font-display text-lg text-teal-300">Session context</h2>
      <p className="text-slate-400 text-xs leading-relaxed">
        Auth0 identity and thread id stay bound for every tool call in this chat.
      </p>
      <dl className="space-y-2 font-mono text-xs">
        <div>
          <dt className="text-slate-500">Thread</dt>
          <dd className="text-teal-200 break-all">{threadId}</dd>
        </div>
        {ctx?.user && (
          <>
            <div>
              <dt className="text-slate-500">Auth0 sub</dt>
              <dd className="text-slate-200 break-all">{ctx.user.sub}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Display name</dt>
              <dd className="text-slate-200">{ctx.user.name ?? "—"}</dd>
            </div>
          </>
        )}
        {ctx?.settings && (
          <div>
            <dt className="text-slate-500">First-party settings</dt>
            <dd className="text-slate-200">
              {ctx.settings.homeCity} · {ctx.settings.temperatureUnit} ·{" "}
              {ctx.settings.assistantTone}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-slate-500">Token Vault</dt>
          <dd className="text-slate-200">
            {ctx?.tokenVaultEnabled ? "Enabled (calendar)" : "Optional — not configured"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
