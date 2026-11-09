import { Auth0AI, getAccessTokenFromTokenVault } from "@auth0/ai-vercel";

import { getRefreshToken } from "@/lib/auth0";

const auth0AI = new Auth0AI();

export const getVaultAccessToken = () => getAccessTokenFromTokenVault();

const connection = process.env.TOKEN_VAULT_CONNECTION?.trim();

/** Token Vault wrapper for delegated third-party APIs (e.g. Google Calendar). */
export const withTokenVault = connection
  ? auth0AI.withTokenVault({
      connection,
      scopes: [
        "openid",
        "https://www.googleapis.com/auth/calendar.events.readonly",
      ],
      refreshToken: getRefreshToken,
    })
  : null;
