export function LoginTicket() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="panel max-w-md w-full p-8 text-center space-y-6">
        <p className="text-teal-400 text-xs uppercase tracking-[0.2em] font-medium">
          Auth0 Universal Login
        </p>
        <h1 className="font-display text-3xl text-slate-100">Harbor</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          A personal assistant that keeps your signed-in identity across
          first-party settings and third-party weather calls.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href="/auth/login?returnTo=/assistant"
            className="rounded-lg bg-teal-500 text-slate-900 font-semibold px-5 py-2.5 text-sm"
          >
            Enter with Universal Login
          </a>
          <a
            href="/auth/login?screen_hint=signup&returnTo=/assistant"
            className="rounded-lg border border-slate-500/50 text-slate-200 px-5 py-2.5 text-sm"
          >
            Create account
          </a>
        </div>
      </div>
    </main>
  );
}
