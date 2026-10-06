interface RateWindow {
  count: number;
  resetAt: number;
}

interface ObjectState {
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    put(key: string, value: RateWindow): Promise<void>;
    setAlarm(timestamp: number): Promise<void>;
    deleteAll(): Promise<void>;
  };
}

// A single globally addressed object owns each IP's 20-per-ten-minute allowance.
// The platform requires a class for a Durable Object; no public Worker route is exposed.
export class ChatRateLimiter {
  constructor(private readonly ctx: ObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/admit") {
      return new Response(null, { status: 404 });
    }
    return this.ctx.blockConcurrencyWhile(async () => {
      const now = Date.now();
      const stored = await this.ctx.storage.get<RateWindow>("window");
      const state = stored && stored.resetAt > now ? stored : { count: 0, resetAt: now + 600_000 };
      if (state.count >= 20) {
        return new Response(null, {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, Math.ceil((state.resetAt - now) / 1000))) },
        });
      }
      // Persist before granting admission. A failed write never permits a provider call.
      await this.ctx.storage.put("window", { ...state, count: state.count + 1 });
      await this.ctx.storage.setAlarm(state.resetAt);
      return new Response(null, { status: 204 });
    });
  }

  async alarm(): Promise<void> {
    await this.ctx.blockConcurrencyWhile(async () => {
      const state = await this.ctx.storage.get<RateWindow>("window");
      if (state && state.resetAt > Date.now()) {
        await this.ctx.storage.setAlarm(state.resetAt);
      } else {
        await this.ctx.storage.deleteAll();
      }
    });
  }
}

export default {
  fetch(): Response {
    return new Response(null, { status: 404 });
  },
};
