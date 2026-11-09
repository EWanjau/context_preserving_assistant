import Link from "next/link";
import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/settings-form";
import { auth0 } from "@/lib/auth0";
import { getUserSettings } from "@/lib/settings-store";

export default async function SettingsPage() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    redirect("/auth/login?returnTo=/settings");
  }

  const settings = await getUserSettings(session.user.sub);

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between text-sm">
        <Link href="/assistant" className="text-teal-300 hover:underline">
          ← Back to assistant
        </Link>
        <a href="/auth/logout" className="text-slate-400">
          Sign out
        </a>
      </div>
      <h1 className="font-display text-2xl text-teal-300 mb-2">
        First-party profile settings
      </h1>
      <p className="text-slate-400 text-sm mb-6">
        Stored per Auth0 user id and read by the agent through{" "}
        <code className="text-teal-200">/api/settings</code>.
      </p>
      <SettingsForm initial={settings} />
    </main>
  );
}
