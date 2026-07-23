import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createConnection, createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createEgressRelay } from "./youtube-egress-relay.mjs";

function listen(server, options) {
  return new Promise((resolve, reject) => {
    const failed = (error) => reject(error);
    server.once("error", failed);
    server.listen(options, () => {
      server.off("error", failed);
      resolve();
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

function mockProxy(socketPath) {
  return createServer({ allowHalfOpen: true }, (socket) => {
    let request = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      request += chunk;
      if (!request.includes("\r\n\r\n")) return;
      const body = "relay-ok\n";
      socket.end(
        `HTTP/1.1 200 OK\r\nContent-Length: ${body.length}\r\nConnection: close\r\n\r\n${body}`,
      );
    });
  });
}

function request(port) {
  return new Promise((resolve, reject) => {
    let response = "";
    const socket = createConnection({
      host: "127.0.0.1",
      port,
      allowHalfOpen: true,
    });
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("request timed out"));
    }, 2_000);
    socket.setEncoding("utf8");
    socket.once("connect", () => {
      socket.end(
        "GET http://example.invalid/test HTTP/1.1\r\n" +
        "Host: example.invalid\r\nConnection: close\r\n\r\n",
      );
    });
    socket.on("data", (chunk) => {
      response += chunk;
    });
    socket.once("end", () => {
      clearTimeout(timeout);
      if (response) {
        resolve(response);
      } else {
        reject(new Error("relay closed without a response"));
      }
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

test("relay shares a Unix tunnel across concurrent requests and reconnects", async () => {
  const directory = await mkdtemp(join(tmpdir(), "typetype-egress-"));
  const socketPath = join(directory, "proxy.sock");
  let upstream = mockProxy(socketPath);
  await listen(upstream, socketPath);
  const relay = createEgressRelay({
    upstreamSocket: socketPath,
    listenAddress: "127.0.0.1",
    listenPort: 0,
  });
  await new Promise((resolve) => relay.once("listening", resolve));
  const port = relay.address().port;

  try {
    const responses = await Promise.all(Array.from({ length: 20 }, () => request(port)));
    assert.equal(
      responses.filter((response) => response.endsWith("relay-ok\n")).length,
      responses.length,
    );

    await close(upstream);
    await assert.rejects(request(port));
    upstream = mockProxy(socketPath);
    await listen(upstream, socketPath);
    assert.match(await request(port), /relay-ok\n$/);
  } finally {
    await close(upstream);
    await close(relay);
    await rm(directory, { recursive: true, force: true });
  }
});
