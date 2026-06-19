/**
 * Local dev server for Blocks Google OAuth proxy.
 * Production: deploy handler via Vercel (see vercel.json) or `node src/server.mjs` on Railway/Fly.
 */

import http from "node:http";
import { URL } from "node:url";
import {
  handleOAuthProxyRequest,
  writeOAuthProxyResponse,
} from "./handler.mjs";

const PORT = Number(process.env.PORT ?? 8787);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  try {
    const result = await handleOAuthProxyRequest(req, url);
    writeOAuthProxyResponse(res, result);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(String(err.message ?? err));
  }
});

server.listen(PORT, () => {
  console.log(`Blocks OAuth proxy listening on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
