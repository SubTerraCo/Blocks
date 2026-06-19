// ============================================================================
// BLOCKS - Google OAuth helpers (client-side + token refresh via proxy)
// ============================================================================

import type { User } from "../types";
import { UserSchema } from "../types";
import {
  isLikelyOAuthDevContext,
  resolveOAuthProxyBaseUrl,
} from "./oauth-config";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
] as const;

export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface ParsedOAuthHash {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

/** Default proxy URL; override via env in apps. Dev localhost, retail production URL. */
export function getOAuthProxyBaseUrl(): string {
  let envUrl: string | undefined;

  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_OAUTH_PROXY_URL) {
    envUrl = process.env.NEXT_PUBLIC_OAUTH_PROXY_URL;
  }
  if (!envUrl && typeof import.meta !== "undefined") {
    const vite = (import.meta as { env?: { VITE_OAUTH_PROXY_URL?: string } }).env;
    envUrl = vite?.VITE_OAUTH_PROXY_URL;
  }

  return resolveOAuthProxyBaseUrl({
    envUrl,
    preferDev: isLikelyOAuthDevContext(),
  });
}

export function buildGoogleOAuthStartUrl(returnUrl: string): string {
  const base = getOAuthProxyBaseUrl();
  const params = new URLSearchParams({ returnUrl });
  return `${base}/auth/google?${params.toString()}`;
}

export function parseOAuthHash(hash: string): ParsedOAuthHash | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const accessToken = params.get("access_token");
  const expiresAtRaw = params.get("expires_at");
  if (!accessToken || !expiresAtRaw) return null;
  return {
    accessToken,
    refreshToken: params.get("refresh_token") ?? undefined,
    expiresAt: new Date(expiresAtRaw),
  };
}

export function getGoogleProvider(user: User | null) {
  return user?.providers.find((p) => p.provider === "google") ?? null;
}

export function isGoogleTokenValid(user: User | null): boolean {
  const provider = getGoogleProvider(user);
  if (!provider?.accessToken || !provider.expiresAt) return false;
  return new Date(provider.expiresAt).getTime() > Date.now() + 60_000;
}

export function tokensToGoogleProvider(
  tokens: GoogleOAuthTokens,
  existing?: User | null,
): User["providers"][number] {
  const prev = existing ? getGoogleProvider(existing) : undefined;
  return {
    provider: "google",
    providerId: prev?.providerId ?? "google-calendar",
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? prev?.refreshToken,
    expiresAt: tokens.expiresAt,
  };
}

export function mergeGoogleProviderIntoUser(
  user: User | null,
  provider: User["providers"][number],
  email?: string,
  name?: string,
): User {
  const others = (user?.providers ?? []).filter((p) => p.provider !== "google");
  return UserSchema.parse({
    id: user?.id ?? crypto.randomUUID(),
    email: email ?? user?.email ?? "user@blocks.local",
    name: name ?? user?.name ?? "Blocks User",
    avatarUrl: user?.avatarUrl,
    providers: [...others, provider],
    stats: user?.stats,
    createdAt: user?.createdAt ?? new Date(),
    updatedAt: new Date(),
  });
}

export async function refreshGoogleAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const base = getOAuthProxyBaseUrl();
  const res = await fetch(`${base}/auth/google/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_at: string;
  };
  return {
    accessToken: data.access_token,
    expiresAt: new Date(data.expires_at),
  };
}

export async function ensureValidGoogleTokens(
  user: User | null,
  onUserUpdated: (user: User) => Promise<void>,
): Promise<GoogleOAuthTokens | null> {
  if (!user) return null;
  const provider = getGoogleProvider(user);
  if (!provider?.accessToken) return null;

  if (isGoogleTokenValid(user)) {
    return {
      accessToken: provider.accessToken,
      refreshToken: provider.refreshToken,
      expiresAt: new Date(provider.expiresAt!),
    };
  }

  if (!provider.refreshToken) return null;

  const refreshed = await refreshGoogleAccessToken(provider.refreshToken);
  const updatedProvider = tokensToGoogleProvider(
    {
      accessToken: refreshed.accessToken,
      refreshToken: provider.refreshToken,
      expiresAt: refreshed.expiresAt,
    },
    user,
  );
  const updatedUser = mergeGoogleProviderIntoUser(user, updatedProvider);
  await onUserUpdated(updatedUser);
  return {
    accessToken: refreshed.accessToken,
    refreshToken: provider.refreshToken,
    expiresAt: refreshed.expiresAt,
  };
}
