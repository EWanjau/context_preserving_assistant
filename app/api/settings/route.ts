import { auth0 } from "@/lib/auth0";
import {
  getUserSettings,
  saveUserSettings,
  type UserSettings,
} from "@/lib/settings-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getUserSettings(session.user.sub);
  return NextResponse.json({
    userId: session.user.sub,
    settings,
    api: "first-party",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<UserSettings>;
  try {
    body = (await req.json()) as Partial<UserSettings>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const settings = await saveUserSettings(session.user.sub, body);
  return NextResponse.json({
    userId: session.user.sub,
    settings,
    api: "first-party",
  });
}
