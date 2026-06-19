/**
 * Desktop Google OAuth — loopback (dev) or blocks:// protocol (packaged retail).
 */

import http from "node:http";
import { app, shell } from "electron";
import {
  BLOCKS_OAUTH_PROXY_DEV_URL,
  BLOCKS_OAUTH_PROXY_PRODUCTION_URL,
  resolveOAuthProxyBaseUrl,
} from "@blocks/core";

export class OAuthProxyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OAuthProxyError";
  }
}

export interface GoogleOAuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

type PendingFlow = {
  resolve: (value: GoogleOAuthResult) => void;
  reject: (err: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

let pendingFlow: PendingFlow | null = null;

function getOAuthProxyBaseUrl(): string {
  const envUrl =
    process.env.OAUTH_PROXY_BASE_URL ?? process.env.VITE_OAUTH_PROXY_URL;
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  return resolveOAuthProxyBaseUrl({ envUrl, preferDev: isDev });
}

function devSetupHint(base: string): string {
  return (
    `Google sign-in requires the Blocks OAuth proxy at ${base}.\n\n` +
    "Developer setup:\n" +
    "  1. pnpm --filter @blocks/oauth-proxy dev\n" +
    "  2. cp apps/oauth-proxy/.env.example apps/oauth-proxy/.env\n" +
    "  3. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET\n\n" +
    "Full guide: Docs/Integrations/GOOGLE_OAUTH_ROLLOUT.md"
  );
}

function retailSetupHint(): string {
  return (
    "Google sign-in is temporarily unavailable.\n\n" +
    "Blocks could not reach the sign-in service. Check your internet connection " +
    "and try again later.\n\n" +
    `Expected service: ${BLOCKS_OAUTH_PROXY_PRODUCTION_URL}`
  );
}

/** Verify OAuth proxy is up and Google credentials are configured. */
export async function checkOAuthProxyReady(
  baseUrl?: string,
): Promise<string> {
  const base = (baseUrl ?? getOAuthProxyBaseUrl()).replace(/\/$/, "");
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  let res: Response;
  try {
    res = await fetch(`${base}/health`, {
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    throw new OAuthProxyError(isDev ? devSetupHint(base) : retailSetupHint());
  }

  if (!res.ok) {
    throw new OAuthProxyError(
      `OAuth proxy at ${base} returned ${res.status}. Check proxy logs.`,
    );
  }

  let body: { ok?: boolean; googleConfigured?: boolean };
  try {
    body = (await res.json()) as { ok?: boolean; googleConfigured?: boolean };
  } catch {
    throw new OAuthProxyError(
      `OAuth proxy at ${base} returned an invalid health response.`,
    );
  }

  if (!body.googleConfigured) {
    throw new OAuthProxyError(
      isDev
        ? "OAuth proxy is running but Google credentials are missing.\n\n" +
            "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in apps/oauth-proxy/.env"
        : "Google sign-in is not configured on the server. Please try again later.",
    );
  }

  return base;
}

function parseOAuthCallbackUrl(rawUrl: string): GoogleOAuthResult | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const isLoopback =
    parsed.hostname === "127.0.0.1" && parsed.pathname === "/auth/callback";
  const isProtocol =
    parsed.protocol === "blocks:" &&
    (parsed.pathname === "/auth/callback" || parsed.host === "auth");

  if (!isLoopback && !isProtocol) return null;

  const accessToken = parsed.searchParams.get("access_token");
  const expiresAt = parsed.searchParams.get("expires_at");
  if (!accessToken || !expiresAt) return null;

  return {
    accessToken,
    refreshToken: parsed.searchParams.get("refresh_token") ?? undefined,
    expiresAt,
  };
}

function clearPendingFlow() {
  if (!pendingFlow) return;
  clearTimeout(pendingFlow.timeout);
  pendingFlow = null;
}

function settlePendingFlow(result: GoogleOAuthResult) {
  if (!pendingFlow) return false;
  const { resolve, timeout } = pendingFlow;
  clearTimeout(timeout);
  pendingFlow = null;
  resolve(result);
  return true;
}

function rejectPendingFlow(err: Error) {
  if (!pendingFlow) return false;
  const { reject, timeout } = pendingFlow;
  clearTimeout(timeout);
  pendingFlow = null;
  reject(err);
  return true;
}

/** Handle blocks:// or loopback callback URLs (protocol handler + second instance). */
export function deliverOAuthCallback(rawUrl: string): boolean {
  const result = parseOAuthCallbackUrl(rawUrl);
  if (!result) return false;
  return settlePendingFlow(result);
}

function registerPendingFlow(): Promise<GoogleOAuthResult> {
  clearPendingFlow();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      rejectPendingFlow(
        new OAuthProxyError("Google sign-in timed out after 5 minutes."),
      );
    }, 5 * 60_000);

    pendingFlow = { resolve, reject, timeout };
  });
}

function startLoopbackFlow(base: string): Promise<GoogleOAuthResult> {
  const flowPromise = registerPendingFlow();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");

    if (url.pathname !== "/auth/callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const fullUrl = `http://127.0.0.1${url.pathname}${url.search}`;
    const result = parseOAuthCallbackUrl(fullUrl);

    if (!result) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>Authentication failed</h1><p>Missing tokens.</p>");
      rejectPendingFlow(
        new OAuthProxyError("Google sign-in failed: missing tokens in callback."),
      );
      server.close();
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h1>Google Calendar connected</h1><p>You can close this window and return to Blocks.</p>",
    );

    server.close();
    settlePendingFlow(result);
  });

  void (async () => {
    try {
      await new Promise<void>((listenResolve, listenReject) => {
        server.listen(0, "127.0.0.1", () => listenResolve());
        server.on("error", listenReject);
      });

      const addr = server.address();
      if (!addr || typeof addr === "string") {
        rejectPendingFlow(
          new OAuthProxyError("Failed to bind loopback port for Google callback."),
        );
        return;
      }

      const returnUrl = `http://127.0.0.1:${addr.port}/auth/callback`;
      const startUrl = `${base}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
      await shell.openExternal(startUrl);
    } catch (err) {
      server.close();
      rejectPendingFlow(
        err instanceof OAuthProxyError
          ? err
          : new OAuthProxyError(
              err instanceof Error ? err.message : "Google sign-in failed.",
            ),
      );
    }
  })();

  return flowPromise;
}

function startProtocolFlow(base: string): Promise<GoogleOAuthResult> {
  const flowPromise = registerPendingFlow();
  const returnUrl = "blocks://auth/callback";
  const startUrl = `${base}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;

  void shell.openExternal(startUrl).catch((err) => {
    rejectPendingFlow(
      new OAuthProxyError(
        err instanceof Error ? err.message : "Could not open sign-in browser.",
      ),
    );
  });

  return flowPromise;
}

export function startGoogleOAuthFlow(): Promise<GoogleOAuthResult> {
  return (async () => {
    const base = await checkOAuthProxyReady();
    const useProtocol = app.isPackaged;
    return useProtocol ? startProtocolFlow(base) : startLoopbackFlow(base);
  })();
}

/** For tests / diagnostics */
export function getDesktopOAuthProxyUrl(): string {
  return getOAuthProxyBaseUrl();
}

export { BLOCKS_OAUTH_PROXY_DEV_URL, BLOCKS_OAUTH_PROXY_PRODUCTION_URL };
