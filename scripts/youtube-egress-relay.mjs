import { createConnection, createServer } from "node:net";
import { pathToFileURL } from "node:url";

function positiveInteger(value, fallback, name) {
  const parsed = Number(value ?? fallback);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

export function createEgressRelay({
  upstreamSocket,
  listenAddress = "0.0.0.0",
  listenPort = 29083,
  maxConnections = 256,
  idleTimeoutMs = 120_000,
}) {
  if (!upstreamSocket) {
    throw new Error("upstreamSocket is required");
  }

  const server = createServer({ allowHalfOpen: true }, (downstream) => {
    const upstream = createConnection({
      path: upstreamSocket,
      allowHalfOpen: true,
    });

    downstream.setNoDelay(true);
    upstream.setNoDelay(true);
    downstream.setTimeout(idleTimeoutMs, () => downstream.destroy());
    upstream.setTimeout(idleTimeoutMs, () => upstream.destroy());
    downstream.pipe(upstream);
    upstream.pipe(downstream);

    downstream.once("error", () => upstream.destroy());
    upstream.once("error", () => downstream.destroy());
    downstream.once("close", () => upstream.destroy());
    upstream.once("close", () => downstream.destroy());
  });

  server.maxConnections = maxConnections;
  server.listen(listenPort, listenAddress);
  return server;
}

function run() {
  const server = createEgressRelay({
    upstreamSocket: process.env.UPSTREAM_SOCKET,
    listenAddress: process.env.LISTEN_ADDRESS ?? "0.0.0.0",
    listenPort: positiveInteger(process.env.LISTEN_PORT, 29083, "LISTEN_PORT"),
    maxConnections: positiveInteger(process.env.MAX_CONNECTIONS, 256, "MAX_CONNECTIONS"),
    idleTimeoutMs: positiveInteger(process.env.IDLE_TIMEOUT_MS, 120_000, "IDLE_TIMEOUT_MS"),
  });

  const shutdown = () => {
    server.close();
    setTimeout(() => process.exit(1), 5_000).unref();
  };
  server.once("listening", () => {
    const address = server.address();
    console.log(`YouTube egress relay listening on ${address.address}:${address.port}`);
  });
  server.once("close", () => process.exit(0));
  server.once("error", (error) => {
    console.error(`YouTube egress relay failed: ${error.message}`);
    process.exit(1);
  });
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  run();
}
