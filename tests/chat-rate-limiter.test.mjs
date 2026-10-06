import { expect, test } from "bun:test";
import { ChatRateLimiter } from "../workers/chat-rate-limiter/index.ts";

test("expired windows renew; a late alarm cannot erase a new window", async () => {
  let state = { count: 20, resetAt: Date.now() - 1 };
  let alarmAt = 0;
  const limiter = new ChatRateLimiter({
    blockConcurrencyWhile: (callback) => callback(),
    storage: {
      get: async () => state,
      put: async (_key, value) => {
        state = value;
      },
      setAlarm: async (timestamp) => {
        alarmAt = timestamp;
      },
      deleteAll: async () => {
        state = undefined;
      },
    },
  });
  expect(
    (await limiter.fetch(new Request("https://internal/admit", { method: "POST" }))).status
  ).toBe(204);
  expect(state.count).toBe(1);
  await limiter.alarm();
  expect(state.count).toBe(1);
  expect(alarmAt).toBe(state.resetAt);
  state.resetAt = Date.now() - 1;
  await limiter.alarm();
  expect(state).toBeUndefined();
});

test("failed durable writes do not grant admission", async () => {
  const limiter = new ChatRateLimiter({
    blockConcurrencyWhile: (callback) => callback(),
    storage: {
      get: async () => undefined,
      put: async () => {
        throw new Error("unavailable");
      },
    },
  });
  await expect(
    limiter.fetch(new Request("https://internal/admit", { method: "POST" }))
  ).rejects.toThrow("unavailable");
});
