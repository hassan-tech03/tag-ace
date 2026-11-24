// Tiny reverse proxy for hosts that route the public "/api" path to a
// separate backend port (e.g. :4000) while "/" goes to :3000.
//
// The Next.js app serves both pages and /api routes on one port, so this
// forwards everything it receives to the Next.js server. If the platform
// strips the "/api" prefix before forwarding, it is added back.
//
//   PORT=4000 TARGET_PORT=3000 node deploy/pm2/api-proxy.mjs
import http from "node:http";

const PORT = Number(process.env.PORT) || 4000;
const TARGET_HOST = process.env.TARGET_HOST || "127.0.0.1";
const TARGET_PORT = Number(process.env.TARGET_PORT) || 3000;

const server = http.createServer((req, res) => {
  const path = req.url === "/api" || req.url.startsWith("/api/") || req.url.startsWith("/api?")
    ? req.url
    : `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;

  const headers = { ...req.headers };
  headers["x-forwarded-host"] ??= req.headers.host;
  headers["x-forwarded-for"] = [req.headers["x-forwarded-for"], req.socket.remoteAddress]
    .filter(Boolean)
    .join(", ");

  const upstream = http.request(
    { host: TARGET_HOST, port: TARGET_PORT, method: req.method, path, headers },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    }
  );
  upstream.on("error", (err) => {
    console.error(`[api-proxy] ${req.method} ${path} -> ${err.message}`);
    if (!res.headersSent) res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Upstream unavailable" }));
  });
  req.pipe(upstream);
});

server.listen(PORT, () => {
  console.log(`[api-proxy] :${PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
