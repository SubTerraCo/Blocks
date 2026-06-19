// ============================================================================
// BLOCKS - OAuth proxy URL resolution (dev vs retail)
// ============================================================================

/** Hosted OAuth proxy for production builds. Override via env before ship. */
export const BLOCKS_OAUTH_PROXY_PRODUCTION_URL = "https://auth.blocks.app";

export const BLOCKS_OAUTH_PROXY_DEV_URL = "http://localhost:8787";

export interface ResolveOAuthProxyOptions {
  /** Explicit override from NEXT_PUBLIC_OAUTH_PROXY_URL / VITE_OAUTH_PROXY_URL / OAUTH_PROXY_BASE_URL */
  envUrl?: string | null;
  /** When true, fall back to localhost; when false, fall back to production URL */
  preferDev?: boolean;
}

/** Resolve OAuth proxy base URL with no trailing slash. */
export function resolveOAuthProxyBaseUrl(
  options: ResolveOAuthProxyOptions = {},
): string {
  const trimmed = options.envUrl?.replace(/\/$/, "");
  if (trimmed) return trimmed;
  return options.preferDev
    ? BLOCKS_OAUTH_PROXY_DEV_URL
    : BLOCKS_OAUTH_PROXY_PRODUCTION_URL;
}

/** True when running on localhost (browser or typical dev server). */
export function isLikelyOAuthDevContext(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  if (typeof process !== "undefined") {
    return process.env.NODE_ENV === "development";
  }
  return false;
}
