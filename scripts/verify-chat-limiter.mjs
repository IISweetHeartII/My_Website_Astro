import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

// Uses Wrangler's existing Miniflare installation; does not add an application dependency.
const { Miniflare, convertV4MiniflareOptions } = await import(
  process.env.MINIFLARE_MODULE || "miniflare"
);
const persist = await mkdtemp(`${tmpdir()}/log8-limiter-`);
const options = convertV4MiniflareOptions({
  modules: true,
  scriptPath: resolve(".wrangler/security-test/index.js"),
  durableObjects: { CHAT_RATE_LIMITER: { className: "ChatRateLimiter", useSQLite: true } },
  resourcePersistencePath: persist,
});
let runtime = new Miniflare(options);
try {
  let namespace = await runtime.getDurableObjectNamespace("CHAT_RATE_LIMITER");
  let stub = namespace.get(namespace.idFromName("192.0.2.1"));
  const burst = await Promise.all(
    Array.from({ length: 100 }, () => stub.fetch("https://internal/admit", { method: "POST" }))
  );
  assert.equal(burst.filter((response) => response.status === 204).length, 20);
  assert.equal(burst.filter((response) => response.status === 429).length, 80);
  assert.ok(
    Number(burst.find((response) => response.status === 429).headers.get("Retry-After")) > 0
  );
  const other = namespace.get(namespace.idFromName("192.0.2.2"));
  assert.equal((await other.fetch("https://internal/admit", { method: "POST" })).status, 204);
  assert.equal(
    (await runtime.dispatchFetch("https://internal/admit", { method: "POST" })).status,
    404
  );
  await runtime.dispose();
  runtime = new Miniflare(options);
  namespace = await runtime.getDurableObjectNamespace("CHAT_RATE_LIMITER");
  stub = namespace.get(namespace.idFromName("192.0.2.1"));
  assert.equal((await stub.fetch("https://internal/admit", { method: "POST" })).status, 429);
  console.log(
    "PASS: workerd admitted exactly 20/100, isolated IPs, denied public access, retained allowance after restart"
  );
} finally {
  await runtime.dispose();
  await rm(persist, { recursive: true, force: true });
}
