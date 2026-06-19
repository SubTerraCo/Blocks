/**
 * Shared OAuth proxy route handler (Node dev server + Vercel serverless).
 */

import {
  buildGoogleAuthUrl,
  buildReturnUrlWithTokens,
  decodeState,
  encodeState,
  exchangeCodeForTokens,
  generatePkce,
  getConfig,
  isAllowedReturnUrl,
  refreshAccessToken,
} from "./google-oauth.mjs";

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body) {
    return JSON.parse(req.body);
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return null;
  return JSON.parse(body);
}

async function handleStart(url) {
  const returnUrl = url.searchParams.get("returnUrl");
  if (!returnUrl) {
    return { status: 400, body: "Missing returnUrl" };
  }

  const { clientId, proxyBaseUrl, allowedReturnOrigins } = getConfig();
  if (!isAllowedReturnUrl(returnUrl, allowedReturnOrigins)) {
    return { status: 400, body: "returnUrl not allowed" };
  }

  const { verifier, challenge } = await generatePkce();
  const state = encodeState({ returnUrl, codeVerifier: verifier, v: 1 });

  const authUrl = await buildGoogleAuthUrl({
    clientId,
    proxyBaseUrl,
    returnUrl,
    codeChallenge: challenge,
    state,
  });

  return { status: 302, location: authUrl };
}

async function handleCallback(url) {
  const error = url.searchParams.get("error");
  if (error) {
    return { status: 400, body: `Google OAuth error: ${error}` };
  }

  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) {
    return { status: 400, body: "Missing code or state" };
  }

  let state;
  try {
    state = decodeState(stateRaw);
  } catch {
    return { status: 400, body: "Invalid state" };
  }

  const { returnUrl, codeVerifier } = state;
  const { clientId, clientSecret, proxyBaseUrl, allowedReturnOrigins } =
    getConfig();

  if (!returnUrl || !isAllowedReturnUrl(returnUrl, allowedReturnOrigins)) {
    return { status: 400, body: "Invalid returnUrl in state" };
  }

  const tokens = await exchangeCodeForTokens({
    clientId,
    clientSecret,
    proxyBaseUrl,
    code,
    codeVerifier,
  });

  const redirect = buildReturnUrlWithTokens(returnUrl, tokens);
  return { status: 302, location: redirect };
}

async function handleRefresh(req) {
  let json;
  try {
    json = await readJsonBody(req);
  } catch {
    return { status: 400, body: "Invalid JSON" };
  }

  const { refreshToken } = json ?? {};
  if (!refreshToken) {
    return { status: 400, body: "Missing refreshToken" };
  }

  try {
    const { clientId, clientSecret } = getConfig();
    const tokens = await refreshAccessToken({
      clientId,
      clientSecret,
      refreshToken,
    });
    return {
      status: 200,
      json: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        expires_at: new Date(
          Date.now() + (tokens.expires_in ?? 3600) * 1000,
        ).toISOString(),
      },
    };
  } catch (err) {
    return { status: 502, body: String(err.message ?? err) };
  }
}

function handleHealth() {
  const googleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  return {
    status: 200,
    json: {
      ok: true,
      service: "blocks-oauth-proxy",
      googleConfigured,
    },
  };
}

/**
 * @param {import("node:http").IncomingMessage & { body?: unknown }} req
 * @param {URL} url
 */
export async function handleOAuthProxyRequest(req, url) {
  if (req.method === "OPTIONS") {
    return { status: 204 };
  }

  if (req.method === "POST" && url.pathname === "/auth/google/refresh") {
    return handleRefresh(req);
  }

  if (req.method !== "GET") {
    return { status: 405, body: "Method not allowed" };
  }

  if (url.pathname === "/auth/google") {
    return handleStart(url);
  }

  if (url.pathname === "/auth/google/callback") {
    return handleCallback(url);
  }

  if (url.pathname === "/health") {
    return handleHealth();
  }

  return { status: 404, body: "Not found" };
}

/** Write a handler result to a Node HTTP response. */
export function writeOAuthProxyResponse(res, result) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (result.status === 204) {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (result.location) {
    res.writeHead(result.status, { ...headers, Location: result.location });
    res.end();
    return;
  }

  if (result.json) {
    res.writeHead(result.status, {
      ...headers,
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(result.json));
    return;
  }

  res.writeHead(result.status, {
    ...headers,
    "Content-Type": "text/plain",
  });
  res.end(result.body ?? "");
}
