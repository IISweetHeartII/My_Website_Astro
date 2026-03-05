interface KVNamespace {
  get: (key: string, options?: { type?: string }) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
}

interface Env {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  CHAT_KV?: KVNamespace;
  ASSETS: { fetch: (input: Request | string) => Promise<Response> };
}

interface PagesContext {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BlogPost {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
}

interface RequestBody {
  messages: ChatMessage[];
}

interface QAPair {
  q: string;
  a: string;
  count: number;
}

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const OPENAI_MODEL = "gpt-4.1-nano";
const FAQ_KEY = "curated-faq";
const LOG_KEY = "question-log";
const MAX_LOG_ENTRIES = 200;

const SYSTEM_PROMPT_BASE = `당신은 김덕환의 AI 어시스턴트예요. 방문자가 김덕환에 대해 궁금한 것을 물어보면 아래 정보를 바탕으로 친절하고 전문적으로 답변해주세요.

## 톤 & 스타일
- ~해요 체를 사용해주세요 (전문적이면서 친근하게)
- 관련된 블로그 글이 있으면 자연스럽게 링크를 포함해주세요 (마크다운 링크 형식)
- 모르는 내용은 솔직하게 모른다고 말해주세요
- 한국어로 답변해주세요
- 답변은 간결하면서도 충분한 정보를 담아주세요

`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context: PagesContext) {
  const { request, env, waitUntil } = context;

  try {
    const body: RequestBody = await request.json();
    const { messages } = body;

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the latest user question to KV (non-blocking)
    const lastUserMsg = messages.findLast((m) => m.role === "user");
    if (lastUserMsg && env.CHAT_KV) {
      waitUntil(logQuestion(env.CHAT_KV, lastUserMsg.content));
    }

    // Build system prompt: base + context.md + FAQ + blog index
    const [contextText, blogIndexText, faqText] = await Promise.all([
      fetchChatContext(env, request.url),
      fetchBlogIndex(env, request.url),
      fetchCuratedFAQ(env),
    ]);

    const systemPrompt =
      SYSTEM_PROMPT_BASE +
      (contextText ? `${contextText}\n\n` : "") +
      (faqText ? `## 자주 묻는 질문\n${faqText}\n\n` : "") +
      `## 블로그 글 목록 (관련 글을 찾아 링크해주세요)\n${blogIndexText}`;

    // Try Gemini first, fallback to OpenAI
    try {
      return await streamGemini(env.GEMINI_API_KEY, systemPrompt, messages, waitUntil);
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;
      if (status === 429 && env.OPENAI_API_KEY) {
        return await streamOpenAI(env.OPENAI_API_KEY, systemPrompt, messages, waitUntil);
      }
      throw error;
    }
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      status === 429
        ? "현재 많은 분들이 이용 중이에요. 잠시 후 다시 시도해주세요."
        : "일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// ===== KV: Question Logging (2단계) =====

async function logQuestion(kv: KVNamespace, question: string) {
  try {
    const raw = await kv.get(LOG_KEY);
    const log: Array<{ q: string; ts: number }> = raw ? JSON.parse(raw) : [];

    log.push({ q: question.slice(0, 200), ts: Date.now() });

    // Keep only recent entries
    const trimmed = log.slice(-MAX_LOG_ENTRIES);
    await kv.put(LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // Non-critical, silently fail
  }
}

// ===== KV: Curated FAQ (3단계) =====

async function fetchCuratedFAQ(env: Env): Promise<string> {
  if (!env.CHAT_KV) return "";
  try {
    const raw = await env.CHAT_KV.get(FAQ_KEY);
    if (!raw) return "";
    const faq: QAPair[] = JSON.parse(raw);
    return faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
  } catch {
    return "";
  }
}

// ===== Chat Context (from chat-context.md) =====

async function fetchChatContext(env: Env, requestUrl: string): Promise<string> {
  try {
    const res = await env.ASSETS.fetch(new URL("/chat-context.json", requestUrl).toString());
    if (!res.ok) return "";
    const { content } = (await res.json()) as { content: string };
    return content;
  } catch {
    return "";
  }
}

// ===== Blog Index =====

async function fetchBlogIndex(env: Env, requestUrl: string): Promise<string> {
  try {
    const res = await env.ASSETS.fetch(new URL("/blog-index.json", requestUrl).toString());
    if (!res.ok) return "";
    const { posts } = (await res.json()) as { posts: BlogPost[] };
    return posts
      .map(
        (p) =>
          `- [${p.title}](https://log8.kr/blog/${p.slug}) [${p.category}] ${p.tags.join(", ")}${p.description ? `: ${p.description}` : ""}`
      )
      .join("\n");
  } catch {
    return "";
  }
}

// ===== Gemini Streaming =====

async function streamGemini(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  waitUntil: (promise: Promise<unknown>) => void
): Promise<Response> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const err = new Error(`Gemini ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return createSSEResponse(res, "gemini", waitUntil);
}

// ===== OpenAI Streaming =====

async function streamOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  waitUntil: (promise: Promise<unknown>) => void
): Promise<Response> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = new Error(`OpenAI ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return createSSEResponse(res, "openai", waitUntil);
}

// ===== SSE Transform =====

function createSSEResponse(
  upstream: Response,
  provider: "gemini" | "openai",
  waitUntil: (promise: Promise<unknown>) => void
): Response {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  waitUntil(
    (async () => {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              await writer.write(encoder.encode("data: [DONE]\n\n"));
              continue;
            }

            try {
              const json = JSON.parse(data);
              let content = "";

              if (provider === "gemini") {
                content = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                if (json?.candidates?.[0]?.finishReason === "STOP") {
                  if (content) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                  await writer.write(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }
              } else {
                content = json?.choices?.[0]?.delta?.content ?? "";
              }

              if (content) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } finally {
        await writer.close();
      }
    })()
  );

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "Identity",
    },
  });
}
