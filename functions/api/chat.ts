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
  url: string;
  collection: "blog" | "library";
  category: string;
  tags: string[];
  keywords: string[];
  description: string;
  created_date: string | null;
}

interface RequestBody {
  messages: ChatMessage[];
}

interface QAPair {
  q: string;
  a: string;
  count: number;
}

const GEMINI_MODEL = "gemini-2.5-flash";
const OPENAI_MODEL = "gpt-4.1-mini";
const MAX_OUTPUT_TOKENS = 2048;
const FAQ_KEY = "curated-faq";
const LOG_KEY = "question-log";
const MAX_LOG_ENTRIES = 200;

function buildSystemPromptBase(): string {
  const today = new Date().toISOString().split("T")[0];
  return `당신은 김덕환의 AI 어시스턴트예요. log8.kr을 방문한 분들 — 주로 잠재 고객이나 협업을 제안하려는 분들 — 을 맞이하는 1차 상담 창구예요. 아래 정보를 바탕으로 친절하고 전문적으로 답변해주세요.

오늘 날짜: ${today}

## 역할
- 방문자가 "이런 작업을 의뢰할 수 있나요?", "이런 것도 만들어 주시나요?" 라고 물으면, 아래 정보에서 관련된 경험·산출물을 근거로 들어 답해주세요
- 답할 수 있는 범위: AI 에이전트/자동화 구축, AI 제품 기획~MVP 개발, 웹 서비스 개발·운영, 콘텐츠/SEO 자동화, AI 도입 워크숍
- 의뢰·협업 이야기가 나오면 자연스럽게 연락 수단으로 연결해주세요:
  - LinkedIn DM: https://www.linkedin.com/in/sweetheart2000/
  - 이메일: sachi009955@gmail.com
- 견적, 기간, 계약 조건, 가용성은 정해진 값이 없어요. 절대 임의로 답하지 말고 "직접 상담이 필요해요"라고 안내하며 위 연락 수단으로 연결해주세요

## 톤 & 스타일
- ~해요 체를 사용해주세요 (전문적이면서 친근하게)
- 한국어로 답변해주세요
- 답변은 간결하면서도 충분한 정보를 담아주세요
- 아래 "관련 글" 목록에 질문과 관련된 글이 있으면 반드시 마크다운 링크로 인용해주세요 (예: [글 제목](https://log8.kr/blog/slug/))

## 중요: 정확성 원칙 (가장 중요)
- 아래 제공된 정보에 없는 내용은 절대 추측하거나 지어내지 마세요
- 날짜, 수치, 세부 사항을 모를 때는 반드시 "정확한 정보가 없어요"라고 솔직하게 말하고, 필요하면 직접 문의를 안내해주세요
- 아래 "관련 글" 목록에 있는 글만 추천하세요. 목록에 없는 글의 제목이나 URL을 만들어내면 안 돼요
- 숫자(cron 개수, PR 개수, 글 편수 등)는 아래 적힌 값을 그대로만 쓰고, 임의로 계산하거나 부풀리지 마세요
- AgentGram PR 862개 중 770개는 "김덕환이 직접 작성한 PR"이 아니라 "김덕환이 설계·운영하는 자율 파이프라인이 머지시킨 PR"이에요. 이 구분을 반드시 지켜서 표현해주세요

`;
}

const ALLOWED_ORIGINS = ["https://log8.kr", "https://www.log8.kr"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      origin.includes(".pages.dev") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1"));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "https://log8.kr",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function onRequestOptions(context: PagesContext) {
  const origin = context.request.headers.get("Origin");
  return new Response(null, { headers: getCorsHeaders(origin) });
}

const MAX_MESSAGE_LENGTH = 1000;

export async function onRequestPost(context: PagesContext) {
  const { request, env, waitUntil } = context;
  const origin = request.headers.get("Origin");
  const cors = getCorsHeaders(origin);

  try {
    const body: RequestBody = await request.json();
    const { messages } = body;

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages is required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate last user message length
    const lastUserMsg = messages.findLast((m) => m.role === "user");
    if (lastUserMsg && lastUserMsg.content.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하로 입력해주세요.` }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Log the latest user question to KV (non-blocking)
    if (lastUserMsg && env.CHAT_KV) {
      waitUntil(logQuestion(env.CHAT_KV, lastUserMsg.content));
    }

    // Build system prompt: base + context.md + FAQ + question-relevant posts
    const [contextText, posts, faqText] = await Promise.all([
      fetchChatContext(env, request.url),
      fetchPosts(env, request.url),
      fetchCuratedFAQ(env),
    ]);

    const relevantPosts = selectRelevantPosts(posts, messages);

    const systemPrompt =
      buildSystemPromptBase() +
      (contextText ? `${contextText}\n\n` : "") +
      (faqText ? `## 자주 묻는 질문\n${faqText}\n\n` : "") +
      `## 관련 글 (질문과 관련도가 높은 순. 이 목록에 있는 글만 링크로 인용하세요)\n${formatPosts(relevantPosts)}`;

    // Try Gemini first, fall back to OpenAI on any failure. Limiting the
    // fallback to 429 meant a model the key cannot reach — a 403 or 404 — took
    // the whole chat down instead of degrading to the other provider.
    try {
      return await streamGemini(env.GEMINI_API_KEY, systemPrompt, messages, cors, waitUntil);
    } catch (error: unknown) {
      if (!env.OPENAI_API_KEY) throw error;
      console.error("Gemini failed, falling back to OpenAI:", error);
      return await streamOpenAI(env.OPENAI_API_KEY, systemPrompt, messages, cors, waitUntil);
    }
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      status === 429
        ? "현재 많은 분들이 이용 중이에요. 잠시 후 다시 시도해주세요."
        : "일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
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

// ===== In-memory cache (lives for the Worker instance lifetime) =====

let cachedContext: string | null = null;
let cachedPosts: BlogPost[] | null = null;

// ===== Chat Context (from chat-context.md) =====

async function fetchChatContext(env: Env, requestUrl: string): Promise<string> {
  if (cachedContext !== null) return cachedContext;
  try {
    const res = await env.ASSETS.fetch(new URL("/chat-context.json", requestUrl).toString());
    if (!res.ok) return "";
    const { content } = (await res.json()) as { content: string };
    cachedContext = content;
    return cachedContext;
  } catch {
    return "";
  }
}

// ===== Post Index (blog + library) =====

async function fetchPosts(env: Env, requestUrl: string): Promise<BlogPost[]> {
  if (cachedPosts !== null) return cachedPosts;
  try {
    const res = await env.ASSETS.fetch(new URL("/blog-index.json", requestUrl).toString());
    if (!res.ok) return [];
    const { posts } = (await res.json()) as { posts: BlogPost[] };
    cachedPosts = posts;
    return cachedPosts;
  } catch {
    return [];
  }
}

// ===== Keyword retrieval =====
// No embeddings: Pages Functions have no vector store. Weighted substring
// matching over title/tags/keywords/category/description is enough for ~200 posts.

const MAX_RELEVANT_POSTS = 12;
const MIN_RELEVANT_POSTS = 6;

const STOPWORDS = new Set([
  "그리고",
  "그런데",
  "무엇",
  "어떤",
  "어떻게",
  "있나요",
  "있어요",
  "알려줘",
  "알려주세요",
  "관련",
  "대해",
  "대한",
  "정도",
  "혹시",
  "가능",
  "가능한가요",
  "what",
  "when",
  "where",
  "which",
  "about",
  "with",
  "from",
  "that",
  "this",
  "have",
  "does",
  "you",
  "the",
  "and",
  "for",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/** Korean particles glue onto nouns ("자동화에"), so also try the trimmed stem. */
function variantsOf(token: string): string[] {
  const isHangul = /[가-힣]/.test(token);
  if (isHangul && token.length >= 3) return [token, token.slice(0, -1)];
  return [token];
}

function scorePost(post: BlogPost, tokens: string[]): number {
  const title = post.title.toLowerCase();
  const terms = [...post.tags, ...post.keywords].join(" ").toLowerCase();
  const category = post.category.toLowerCase();
  const description = post.description.toLowerCase();

  let score = 0;
  for (const token of tokens) {
    const forms = variantsOf(token);
    if (forms.some((f) => title.includes(f))) score += 5;
    if (forms.some((f) => terms.includes(f))) score += 3;
    if (forms.some((f) => category.includes(f))) score += 2;
    if (forms.some((f) => description.includes(f))) score += 1;
  }
  return score;
}

function selectRelevantPosts(posts: BlogPost[], messages: ChatMessage[]): BlogPost[] {
  if (!posts.length) return [];

  // Last two user turns: enough for follow-up questions, short enough to stay focused.
  const query = messages
    .filter((m) => m.role === "user")
    .slice(-2)
    .map((m) => m.content)
    .join(" ");
  const tokens = tokenize(query);

  const scored = posts
    .map((post) => ({ post, score: scorePost(post, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || (b.post.created_date ?? "").localeCompare(a.post.created_date ?? "")
    )
    .slice(0, MAX_RELEVANT_POSTS)
    .map((entry) => entry.post);

  // Always leave the model something to point at, even on a zero-match question.
  if (scored.length >= MIN_RELEVANT_POSTS) return scored;
  const picked = new Set(scored.map((p) => p.url));
  const recent = posts
    .filter((p) => !picked.has(p.url))
    .slice(0, MIN_RELEVANT_POSTS - scored.length);
  return [...scored, ...recent];
}

function formatPosts(posts: BlogPost[]): string {
  if (!posts.length) return "(제공된 글 목록이 없어요. 글을 추천하지 마세요.)";
  return posts
    .map((p) => {
      const date = p.created_date ? ` (${p.created_date})` : "";
      const tags = p.tags.length ? ` 태그: ${p.tags.join(", ")}` : "";
      const author = p.collection === "library" ? "에이전트 자율 발행" : "김덕환 작성";
      return `- [${p.title}](${p.url})${date} [${p.category} / ${author}]${tags}${p.description ? ` — ${p.description}` : ""}`;
    })
    .join("\n");
}

// ===== Gemini Streaming =====

async function streamGemini(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  cors: Record<string, string>,
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
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          // 2.5 Flash thinks by default and thinking tokens eat maxOutputTokens,
          // which would truncate the answer and stall the first streamed chunk.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = new Error(`Gemini ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return createSSEResponse(res, "gemini", cors, waitUntil);
}

// ===== OpenAI Streaming =====

async function streamOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  cors: Record<string, string>,
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
      temperature: 0.4,
      max_tokens: MAX_OUTPUT_TOKENS,
    }),
  });

  if (!res.ok) {
    const err = new Error(`OpenAI ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return createSSEResponse(res, "openai", cors, waitUntil);
}

// ===== SSE Transform =====

function createSSEResponse(
  upstream: Response,
  provider: "gemini" | "openai",
  cors: Record<string, string>,
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
      ...cors,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "Identity",
    },
  });
}
