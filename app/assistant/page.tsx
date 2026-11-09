import { generateId } from "ai";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AssistantChat } from "@/components/assistant-chat";
import { auth0 } from "@/lib/auth0";

export default async function AssistantPage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=/assistant");
  }

  const userName =
    session.user.name?.trim() ||
    session.user.nickname?.trim() ||
    session.user.email ||
    "there";

  return (
    <div className="min-h-screen pb-12">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">Harbor · MLH identity demo</span>
        <div className="flex gap-4">
          <Link href="/settings" className="text-teal-300 hover:underline">
            Settings
          </Link>
          <a href="/auth/logout" className="text-slate-400 hover:text-slate-200">
            Sign out
          </a>
        </div>
      </nav>
      <AssistantChat userName={userName} threadId={generateId()} />
    </div>
  );
}
