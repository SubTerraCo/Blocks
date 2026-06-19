// B-0017 · Desktop Google OAuth proxy preflight @core
import { test, expect } from "@playwright/test";

const PROXY_BASE = process.env.OAUTH_PROXY_BASE_URL ?? "http://localhost:8787";

async function fetchHealth(base: string) {
  const res = await fetch(`${base.replace(/\/$/, "")}/health`, {
    signal: AbortSignal.timeout(3000),
  });
  const body = (await res.json()) as {
    ok?: boolean;
    googleConfigured?: boolean;
    service?: string;
  };
  return { ok: res.ok, body };
}

test.describe("DT.BG.06.008 · OAuth proxy health @B-0017 @core", () => {
  test("health endpoint exposes googleConfigured flag", async () => {
    let health: Awaited<ReturnType<typeof fetchHealth>>;
    try {
      health = await fetchHealth(PROXY_BASE);
    } catch {
      test.skip(true, "OAuth proxy not running — start with pnpm --filter @blocks/oauth-proxy dev");
      return;
    }

    expect(health.ok).toBe(true);
    expect(health.body.service).toBe("blocks-oauth-proxy");
    expect(typeof health.body.googleConfigured).toBe("boolean");
  });

  test("auth/google redirects to Google when configured", async () => {
    let health: Awaited<ReturnType<typeof fetchHealth>>;
    try {
      health = await fetchHealth(PROXY_BASE);
    } catch {
      test.skip(true, "OAuth proxy not running");
      return;
    }

    if (!health.body.googleConfigured) {
      test.skip(true, "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set in oauth-proxy .env");
      return;
    }

    const returnUrl = "http://127.0.0.1:65457/auth/callback";
    const startUrl = `${PROXY_BASE.replace(/\/$/, "")}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;

    const res = await fetch(startUrl, { redirect: "manual" });
    expect(res.status).toBe(302);
    const location = res.headers.get("location") ?? "";
    expect(location).toMatch(/^https:\/\/accounts\.google\.com\//);
  });
});
