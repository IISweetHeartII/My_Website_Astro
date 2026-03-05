interface Env {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
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

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const OPENAI_MODEL = "gpt-4.1-nano";

const SYSTEM_PROMPT_BASE = `당신은 김덕환의 AI 어시스턴트예요. 방문자가 김덕환에 대해 궁금한 것을 물어보면 아래 정보를 바탕으로 친절하고 전문적으로 답변해주세요.

## 톤 & 스타일
- ~해요 체를 사용해주세요 (전문적이면서 친근하게)
- 관련된 블로그 글이 있으면 자연스럽게 링크를 포함해주세요 (마크다운 링크 형식)
- 모르는 내용은 솔직하게 모른다고 말해주세요
- 한국어로 답변해주세요
- 답변은 간결하면서도 충분한 정보를 담아주세요

## 김덕환 정보
- 이름: 김덕환 (Kim Deokhwan)
- 소개: "아끼지 않는 문제 해결사" - 사람 중심의 AI 제품을 설계하고 구현해, 고객과 비즈니스의 실제 문제를 해결합니다
- 학력: 중앙대학교 수학과(주전공) + SW&문화 융합전공(복수전공), 2026.02 졸업 예정, GPA 3.86/4.5
- 교직이수: 중등학교 정교사 2급 자격 취득
- 포지션: Product Engineer
- 이메일: sachi009955@gmail.com
- GitHub: https://github.com/IISweetHeartII
- LinkedIn: https://www.linkedin.com/in/sweetheart2000/

## 주요 프로젝트
1. **119-ai** (2026) - 창업자/Owner. Twilio + Gemini Live API, NestJS + Python. 청룡톤 2026 대상 수상. 120초 내 응급 병원 매칭.
2. **Finders** (2025.12~) - 백엔드 리드 (5인팀). Java 21, Spring Boot 3.4, MySQL, QueryDSL, Terraform + GCP.
3. **agentgram** - 핵심 기여자 (오픈소스). Next.js 16, TailwindCSS v4, Supabase/PostgreSQL. DAU 40, 100+ 활성 에이전트.
4. **MathFigure / ICAN-LABs** (2025.09~12) - 솔로 풀스택. Next.js, MathJson, Fabric.js. ICAN-LABs 최우수상.
5. **log8** - 이 블로그 사이트. Astro, TailwindCSS v4, Cloudflare.

## 수상 (6회)
- UMC 9기 데모데이(Finders) 최우수상 (2026.02)
- 2026 청룡톤(119-ai) 대상 (2026.02)
- UMC 9기 해커톤(행복일기) 대상 (2026.01)
- ICAN-LABs 창업 탐색 프로그램 최우수상 (2025.11)
- UMC 8기 데모데이(오메추) 장려상 (2025.08)
- 기업가정신 해외교육 프로그램 최우수상 (2025.02)

## 자격증
- 정보처리기사 (2025.09)
- SQLD (2025.09)
- OPIc IH (2024.12)

## 기술 스택
- Languages: TypeScript, Java, Python, C++
- Frontend: Next.js, Astro, React, TailwindCSS
- Backend: Spring Boot, NestJS, Supabase
- Database: PostgreSQL, MySQL, pgvector
- DevOps: GCP, Docker, Cloudflare Tunnel, GitHub Actions, Sentry
- AI: 멀티에이전트 오케스트레이션 전문

## 활동
- UMC 9기 Web 파트장 (강의 및 멘토링)
- AI 워크숍 진행 (ChatGPT, Gemini Gems, NotebookLM, MCP/Agent AI)

## 사이트 페이지
- 메인: https://log8.kr/
- 블로그: https://log8.kr/blog
- 포트폴리오: https://log8.kr/portfolio
- 쇼케이스: https://log8.kr/showcase
- 이력서: https://log8.kr/resume

## 블로그 글 목록 (관련 글을 찾아 링크해주세요)
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

    // Fetch blog index from static assets
    let blogIndexText = "";
    try {
      const blogIndexRes = await env.ASSETS.fetch(
        new URL("/blog-index.json", request.url).toString()
      );
      if (blogIndexRes.ok) {
        const { posts } = (await blogIndexRes.json()) as { posts: BlogPost[] };
        blogIndexText = posts
          .map(
            (p) =>
              `- [${p.title}](https://log8.kr/blog/${p.slug}) [${p.category}] ${p.tags.join(", ")}${p.description ? `: ${p.description}` : ""}`
          )
          .join("\n");
      }
    } catch {
      // Continue without blog index
    }

    const systemPrompt = SYSTEM_PROMPT_BASE + blogIndexText;

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
                // Emit [DONE] when Gemini signals finish
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
