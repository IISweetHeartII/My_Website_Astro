interface KVNamespace {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
}

interface Env {
  CHAT_KV?: KVNamespace;
  ADMIN_SECRET?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface CtaPayload {
  cta_name?: string;
  cta_section?: string;
  cta_destination?: string;
  cta_page_path?: string;
  cta_campaign?: string;
  cta_source?: string;
  ts?: number;
}

interface CtaMetricRow {
  key: string;
  cta_name: string;
  cta_section: string;
  cta_destination: string;
  cta_page_path: string;
  cta_campaign: string;
  cta_source: string;
  count: number;
  first_ts: number;
  last_ts: number;
}

interface CtaMetricsStore {
  updated_at: number;
  total_events: number;
  rows: Record<string, CtaMetricRow>;
  recent: Array<{
    ts: number;
    cta_name: string;
    cta_section: string;
    cta_destination: string;
    cta_page_path: string;
    cta_campaign: string;
    cta_source: string;
  }>;
}

const METRICS_KEY = "cta-metrics-v1";
const MAX_RECENT = 200;
const ALLOWED_ORIGINS = ["https://log8.kr", "https://www.log8.kr"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes(".pages.dev"));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "https://log8.kr",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function json(data: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function unauthorized(origin: string | null) {
  return json({ error: "Unauthorized" }, 401, origin);
}

function checkAuth(request: Request, env: Env): boolean {
  const secret = env.ADMIN_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${secret}`;
}

function createEmptyStore(): CtaMetricsStore {
  return {
    updated_at: 0,
    total_events: 0,
    rows: {},
    recent: [],
  };
}

function sanitizeText(value: string | undefined, fallback: string): string {
  return (value ?? fallback).trim().slice(0, 300) || fallback;
}

function normalizePayload(payload: CtaPayload): Required<CtaPayload> {
  const destination = sanitizeText(payload.cta_destination, "");
  const campaign = sanitizeText(payload.cta_campaign, "none");
  const ctaName = sanitizeText(payload.cta_name, "unknown");
  const section = sanitizeText(payload.cta_section, "unknown");
  const pagePath = sanitizeText(payload.cta_page_path, "unknown");
  const source = sanitizeText(payload.cta_source, "unknown");
  const ts = typeof payload.ts === "number" && Number.isFinite(payload.ts) ? payload.ts : Date.now();

  return {
    cta_name: ctaName,
    cta_section: section,
    cta_destination: destination,
    cta_page_path: pagePath,
    cta_campaign: campaign,
    cta_source: source,
    ts,
  };
}

function buildMetricKey(payload: Required<CtaPayload>): string {
  const destinationPath = (() => {
    try {
      return new URL(payload.cta_destination).pathname || payload.cta_destination;
    } catch {
      return payload.cta_destination || "unknown";
    }
  })();

  return [
    payload.cta_name,
    payload.cta_campaign || "none",
    payload.cta_page_path,
    destinationPath,
  ].join("::");
}

async function readStore(kv: KVNamespace): Promise<CtaMetricsStore> {
  try {
    const raw = await kv.get(METRICS_KEY);
    if (!raw) return createEmptyStore();
    return { ...createEmptyStore(), ...JSON.parse(raw) } as CtaMetricsStore;
  } catch {
    return createEmptyStore();
  }
}

async function writeStore(kv: KVNamespace, store: CtaMetricsStore) {
  await kv.put(METRICS_KEY, JSON.stringify(store));
}

async function readPayload(request: Request): Promise<CtaPayload> {
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as CtaPayload;
  }

  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text) as CtaPayload;
}

export async function onRequestOptions(context: PagesContext) {
  return new Response(null, { headers: getCorsHeaders(context.request.headers.get("Origin")) });
}

export async function onRequestPost(context: PagesContext) {
  const { request, env } = context;
  const origin = request.headers.get("Origin");

  if (!env.CHAT_KV) {
    return json({ error: "KV not configured" }, 500, origin);
  }

  try {
    const normalized = normalizePayload(await readPayload(request));
    if (!normalized.cta_destination) {
      return json({ error: "cta_destination is required" }, 400, origin);
    }

    const store = await readStore(env.CHAT_KV);
    const key = buildMetricKey(normalized);
    const existing = store.rows[key];

    store.rows[key] = existing
      ? {
          ...existing,
          count: existing.count + 1,
          last_ts: normalized.ts,
        }
      : {
          key,
          cta_name: normalized.cta_name,
          cta_section: normalized.cta_section,
          cta_destination: normalized.cta_destination,
          cta_page_path: normalized.cta_page_path,
          cta_campaign: normalized.cta_campaign,
          cta_source: normalized.cta_source,
          count: 1,
          first_ts: normalized.ts,
          last_ts: normalized.ts,
        };

    store.updated_at = Date.now();
    store.total_events += 1;
    store.recent.push({
      ts: normalized.ts,
      cta_name: normalized.cta_name,
      cta_section: normalized.cta_section,
      cta_destination: normalized.cta_destination,
      cta_page_path: normalized.cta_page_path,
      cta_campaign: normalized.cta_campaign,
      cta_source: normalized.cta_source,
    });
    store.recent = store.recent.slice(-MAX_RECENT);

    await writeStore(env.CHAT_KV, store);
    return json({ ok: true }, 202, origin);
  } catch (error) {
    return json(
      { error: "failed_to_track_cta", detail: error instanceof Error ? error.message : String(error) },
      500,
      origin
    );
  }
}

export async function onRequestGet(context: PagesContext) {
  const { request, env } = context;
  const origin = request.headers.get("Origin");

  if (!env.CHAT_KV) {
    return json({ error: "KV not configured" }, 500, origin);
  }

  if (!checkAuth(request, env)) {
    return unauthorized(origin);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "summary";
  const store = await readStore(env.CHAT_KV);

  if (action === "summary") {
    const rows = Object.values(store.rows).sort((a, b) => b.count - a.count);
    return json(
      {
        updated_at: store.updated_at,
        total_events: store.total_events,
        rows,
      },
      200,
      origin
    );
  }

  if (action === "recent") {
    return json(
      {
        updated_at: store.updated_at,
        total_events: store.total_events,
        recent: store.recent,
      },
      200,
      origin
    );
  }

  return json({ error: "action must be 'summary' or 'recent'" }, 400, origin);
}
