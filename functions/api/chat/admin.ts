interface KVNamespace {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

interface Env {
  CHAT_KV?: KVNamespace;
  ADMIN_SECRET?: string;
}

interface AdminContext {
  request: Request;
  env: Env;
}

const FAQ_KEY = "curated-faq";
const LOG_KEY = "question-log";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

function checkAuth(request: Request, env: Env): boolean {
  const secret = env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${secret}`;
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// GET /api/chat/admin?action=logs|faq
export async function onRequestGet(context: AdminContext) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return unauthorized();
  if (!env.CHAT_KV) return json({ error: "KV not configured" }, 500);

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "logs") {
    const raw = await env.CHAT_KV.get(LOG_KEY);
    const logs: Array<{ q: string; ts: number }> = raw ? JSON.parse(raw) : [];

    // Group by question and count frequency
    const freq: Record<string, number> = {};
    for (const log of logs) {
      const key = log.q.toLowerCase().trim();
      freq[key] = (freq[key] ?? 0) + 1;
    }

    const sorted = Object.entries(freq)
      .map(([q, count]) => ({ q, count }))
      .sort((a, b) => b.count - a.count);

    return json({ total: logs.length, questions: sorted });
  }

  if (action === "faq") {
    const raw = await env.CHAT_KV.get(FAQ_KEY);
    return json({ faq: raw ? JSON.parse(raw) : [] });
  }

  return json({ error: "action must be 'logs' or 'faq'" }, 400);
}

// POST /api/chat/admin - Add/update FAQ
// Body: { faq: [{ q: "질문", a: "답변" }] }
export async function onRequestPost(context: AdminContext) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return unauthorized();
  if (!env.CHAT_KV) return json({ error: "KV not configured" }, 500);

  const body = (await request.json()) as { faq: Array<{ q: string; a: string }> };
  if (!body.faq || !Array.isArray(body.faq)) {
    return json({ error: "faq array is required" }, 400);
  }

  await env.CHAT_KV.put(FAQ_KEY, JSON.stringify(body.faq));
  return json({ ok: true, count: body.faq.length });
}

// DELETE /api/chat/admin?target=logs|faq
export async function onRequestDelete(context: AdminContext) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return unauthorized();
  if (!env.CHAT_KV) return json({ error: "KV not configured" }, 500);

  const url = new URL(request.url);
  const target = url.searchParams.get("target");

  if (target === "logs") {
    await env.CHAT_KV.delete(LOG_KEY);
    return json({ ok: true, deleted: "logs" });
  }

  if (target === "faq") {
    await env.CHAT_KV.delete(FAQ_KEY);
    return json({ ok: true, deleted: "faq" });
  }

  return json({ error: "target must be 'logs' or 'faq'" }, 400);
}
