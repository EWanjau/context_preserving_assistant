import { auth0 } from "@/lib/auth0";
import { getUserSettings } from "@/lib/settings-store";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const settings = await getUserSettings(session.user.sub);

  return NextResponse.json({
    authenticated: true,
    user: {
      sub: session.user.sub,
      name: session.user.name ?? session.user.nickname ?? session.user.email,
      email: session.user.email,
    },
    settings,
    tokenVaultEnabled: Boolean(process.env.TOKEN_VAULT_CONNECTION),
  });
}
