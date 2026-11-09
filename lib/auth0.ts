import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  enableConnectAccountEndpoint: true,
});

export async function getRefreshToken() {
  const session = await auth0.getSession();
  return session?.tokenSet?.refreshToken;
}

export async function getSessionUser() {
  const session = await auth0.getSession();
  return session?.user ?? null;
}
