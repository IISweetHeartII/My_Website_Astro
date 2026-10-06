import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { onRequestPost as chat } from "../functions/api/chat.ts";
import { onRequestPost as cta, onRequestGet as getCta } from "../functions/api/cta.ts";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

/** @returns {{get: (key: string) => Promise<string|null>, put: (key: string, value: string) => Promise<void>}} */
function memoryKv() {
  const data = new Map();
  return {
    get: async (key) => data.get(key) ?? null,
    put: async (key, value) => {
      data.set(key, value);
    },
  };
}

/** @param {unknown} body @param {string} path */
function request(body, path) {
  return new Request(`https://log8.kr/api/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://log8.kr",
      "CF-Connecting-IP": "192.0.2.1",
    },
    body: JSON.stringify(body),
  });
}

describe("chat admission before paid inference", () => {
  test("a same-IP burst cannot exceed twenty admitted provider calls", async () => {
    let calls = 0;
    let remaining = 20;
    const pending = [];
    globalThis.fetch = async () => {
      calls++;
      return new Response("data: [DONE]\n\n");
    };
    const env = {
      GEMINI_API_KEY: "test",
      OPENAI_API_KEY: "",
      CHAT_KV: memoryKv(),
      ASSETS: { fetch: async () => Response.json({ content: "context", posts: [] }) },
      CHAT_RATE_LIMITER: {
        idFromName: (name) => name,
        get: () => ({
          fetch: async () =>
            --remaining >= 0
              ? new Response(null, { status: 204 })
              : new Response(null, { status: 429, headers: { "Retry-After": "600" } }),
        }),
      },
    };
    const responses = await Promise.all(
      Array.from({ length: 30 }, () =>
        chat({
          request: request({ messages: [{ role: "user", content: "hello" }] }, "chat"),
          env,
          waitUntil: (promise) => pending.push(promise),
        })
      )
    );
    await Promise.all(responses.map((response) => response.text()));
    await Promise.all(pending);
    expect(calls).toBe(20);
    expect(responses.filter((response) => response.status === 429)).toHaveLength(10);
  });

  test.each([
    undefined,
    {
      idFromName: () => {
        throw new Error("offline");
      },
    },
  ])("missing or unavailable limiter fails closed", async (limiter) => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response("data: [DONE]\n\n");
    };
    const pending = [];
    const response = await chat({
      request: request({ messages: [{ role: "user", content: "hello" }] }, "chat"),
      env: {
        GEMINI_API_KEY: "test",
        OPENAI_API_KEY: "",
        ASSETS: { fetch: async () => Response.json({ content: "context", posts: [] }) },
        CHAT_RATE_LIMITER: limiter,
      },
      waitUntil: (promise) => pending.push(promise),
    });
    await response.text();
    await Promise.all(pending);
    expect(response.status).toBe(503);
    expect(calls).toBe(0);
  });
});

describe("bounded CTA persistence", () => {
  test("a new aggregate remains queryable when all writes share a timestamp", async () => {
    const clock = spyOn(Date, "now").mockReturnValue(1_800_000_000_000);
    try {
      const kv = memoryKv();
      for (let i = 0; i < 257; i++) {
        await cta({
          request: request({ cta_destination: `/post-${i}` }, "cta"),
          env: { CHAT_KV: kv },
        });
      }
      const stored = JSON.parse(await kv.get("cta-metrics-v1"));
      expect(Object.values(stored.rows).some((row) => row.cta_destination === "/post-256")).toBe(
        true
      );
    } finally {
      clock.mockRestore();
    }
  });

  test.each([null, [], { cta_destination: { toString: "bad" } }])(
    "rejects malformed dimensions without writes",
    async (body) => {
      const kv = memoryKv();
      const response = await cta({ request: request(body, "cta"), env: { CHAT_KV: kv } });
      expect(response.status).toBe(400);
      expect(await kv.get("cta-metrics-v1")).toBeNull();
    }
  );

  test("text/plain beacons preserve repeated click counts and administrator access", async () => {
    const kv = memoryKv();
    for (let i = 0; i < 2; i++) {
      const beacon = request(
        {
          cta_name: "newsletter",
          cta_destination: "/newsletter?utm_campaign=hello",
          cta_source: "inline_cta_link",
        },
        "cta"
      );
      beacon.headers.set("Content-Type", "text/plain");
      expect((await cta({ request: beacon, env: { CHAT_KV: kv } })).status).toBe(202);
    }
    const summary = await getCta({
      request: new Request("https://log8.kr/api/cta?action=summary", {
        headers: { Authorization: "Bearer test" },
      }),
      env: { CHAT_KV: kv, ADMIN_SECRET: "test" },
    });
    const body = await summary.json();
    expect(body.rows[0].count).toBe(2);
    expect(body.total_events).toBe(2);
  });
  test("unique submissions stay bounded and normal aggregate queries still work", async () => {
    const kv = memoryKv();
    for (let i = 0; i < 300; i++) {
      const response = await cta({
        request: request(
          {
            cta_name: "page_view",
            cta_destination: `https://log8.kr/library/post-${i}`,
            cta_page_path: `/library/post-${i}`,
            cta_source: "page_view:example.com",
            ts: Number.MAX_SAFE_INTEGER,
          },
          "cta"
        ),
        env: { CHAT_KV: kv },
      });
      expect(response.status).toBe(202);
    }
    const stored = JSON.parse(await kv.get("cta-metrics-v1"));
    expect(Object.keys(stored.rows).length).toBeLessThanOrEqual(256);
    expect(stored.recent).toHaveLength(200);
    expect(stored.total_events).toBe(300);
    expect(stored.recent.at(-1).ts).toBeLessThanOrEqual(Date.now());
    const summary = await getCta({
      request: new Request(
        "https://log8.kr/api/cta?action=public_summary&page_path=/library/post-299"
      ),
      env: { CHAT_KV: kv },
    });
    expect((await summary.json()).matched_events).toBe(1);
    const privateResponse = await getCta({
      request: new Request("https://log8.kr/api/cta?action=recent"),
      env: { CHAT_KV: kv },
    });
    expect(privateResponse.status).toBe(401);
  });

  test("oversize bodies without Content-Length are rejected before KV access", async () => {
    let touched = false;
    const response = await cta({
      request: request({ cta_destination: "x".repeat(20000) }, "cta"),
      env: {
        CHAT_KV: {
          get: async () => {
            touched = true;
            return null;
          },
          put: async () => {
            touched = true;
          },
        },
      },
    });
    expect(response.status).toBe(413);
    expect(touched).toBe(false);
  });
});
