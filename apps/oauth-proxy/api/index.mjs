import { URL } from "node:url";
import {
  handleOAuthProxyRequest,
  writeOAuthProxyResponse,
} from "../src/handler.mjs";

/** Vercel serverless entry — routes all paths to the shared OAuth handler. */
export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const url = new URL(req.url ?? "/", `${proto}://${host}`);

  try {
    const result = await handleOAuthProxyRequest(req, url);
    writeOAuthProxyResponse(res, result);
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err.message ?? err));
  }
}
