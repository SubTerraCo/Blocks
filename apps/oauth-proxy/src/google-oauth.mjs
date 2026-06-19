/**
 * Shared Google OAuth helpers for Blocks oauth-proxy.
 * Exchanges auth codes server-side; never stores tokens.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

export function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const proxyBaseUrl =
    process.env.OAUTH_PROXY_BASE_URL ?? "http://localhost:8787";
  const allowedReturnOrigins = (
    process.env.ALLOWED_RETURN_ORIGINS ??
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,blocks://auth"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
  }

  return { clientId, clientSecret, proxyBaseUrl, allowedReturnOrigins };
}

export function getRedirectUri(proxyBaseUrl) {
  return `${proxyBaseUrl.replace(/\/$/, "")}/auth/google/callback`;
}

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePkce() {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  const challenge = base64UrlEncode(new Uint8Array(digest));
  return { verifier, challenge };
}

/** @param {string} returnUrl */
export function isAllowedReturnUrl(returnUrl, allowedOrigins) {
  if (returnUrl.startsWith("blocks://")) return true;
  if (/^http:\/\/127\.0\.0\.1:\d+\/auth\/callback/.test(returnUrl)) return true;
  try {
    const u = new URL(returnUrl);
    const origin = u.origin;
    return allowedOrigins.some((allowed) => {
      if (allowed === origin) return true;
      if (allowed.endsWith("*") && origin.startsWith(allowed.slice(0, -1)))
        return true;
      return false;
    });
  } catch {
    return false;
  }
}

export function encodeState(payload) {
  return base64UrlEncode(JSON.stringify(payload));
}

export function decodeState(state) {
  const json = Buffer.from(
    state.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  return JSON.parse(json);
}

export async function buildGoogleAuthUrl({
  clientId,
  proxyBaseUrl,
  returnUrl,
  codeChallenge,
  state,
}) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(proxyBaseUrl),
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens({
  clientId,
  clientSecret,
  proxyBaseUrl,
  code,
  codeVerifier,
}) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(proxyBaseUrl),
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  return res.json();
}

export function buildReturnUrlWithTokens(returnUrl, tokens) {
  const expiresAt = new Date(
    Date.now() + (tokens.expires_in ?? 3600) * 1000,
  ).toISOString();

  const params = new URLSearchParams({
    access_token: tokens.access_token,
    expires_at: expiresAt,
  });
  if (tokens.refresh_token) {
    params.set("refresh_token", tokens.refresh_token);
  }

  const qs = params.toString();
  // Loopback / custom protocol cannot read URL hash server-side
  if (
    returnUrl.includes("127.0.0.1") ||
    returnUrl.startsWith("blocks://")
  ) {
    const sep = returnUrl.includes("?") ? "&" : "?";
    return `${returnUrl}${sep}${qs}`;
  }

  return `${returnUrl}#${qs}`;
}
