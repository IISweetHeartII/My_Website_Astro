# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Obsidian Blogger** - an Astro-based personal blog by 김덕환 (log8.kr). Blog posts are written directly in `src/content/blog/` where Astro's Content Collections API reads them natively. The project is optimized for Korean content with Pretendard font, and includes an AI chatbot powered by Gemini/OpenAI via Cloudflare Pages Functions.

## Development Commands

| Command               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `bun dev`             | Start development server                 |
| `bun run build`       | Build for production                     |
| `bun run preview`     | Preview production build locally         |
| `bun run lint`        | Run Biome linter                         |
| `bun run format`      | Auto-format code with Biome              |
| `bun run check`       | Run Biome check + TypeScript type check  |
| `bun run type-check`  | Run TypeScript type checking only        |
| `bun run deps:check`  | Check for dependency updates (using ncu) |
| `bun run deps:update` | Update dependencies and install          |

## CI/CD

### GitHub Actions (Continuous Integration)

- **자동 실행**: `main` 브랜치 push 및 PR 생성 시
- **검사 항목**: 코드 포맷팅, TypeScript 타입 체크, 빌드, 보안 감사, Lighthouse 성능
- **워크플로우 파일**: `.github/workflows/ci.yml`, `.github/workflows/deploy-cloudflare.yml`

### Cloudflare Pages (Continuous Deployment)

- **Production**: `main` 브랜치 → https://log8.kr (자동 배포)
- **Preview**: PR → `*.pages.dev` (자동 프리뷰)
- **설정 위치**: Cloudflare Dashboard (https://dash.cloudflare.com)

자세한 내용은 `.github/workflows/` 폴더의 워크플로우 파일을 참조하세요.

## Architecture Overview

### Architecture Philosophy

This project uses **Feature-First Architecture** (domain-driven organization):

- **features/**: Domain-specific features (blog) with collocated components
- **shared/**: Reusable components, utilities, and configuration used across domains
- **Benefits**: Better scalability, clear boundaries, easier maintenance as project grows

### Content System

- **Direct Obsidian Integration**: Write blog posts directly in `src/content/blog/` using Obsidian
- **Content Filtering**: Posts with `publish: true` frontmatter are included in builds (filtered at runtime)
- **No Sync Script**: Astro reads markdown files directly from `src/content/blog/` using Content Collections API

### Project Structure (Feature-First Architecture)

```
src/
├── features/                    # Business domains (feature-first organization)
│   └── blog/                   # Blog domain
│       └── components/
│           ├── BlogCard.astro
│           └── CategoryFilter.astro
│
├── shared/                      # Shared/common code
│   ├── components/
│   │   ├── layout/             # Global layout (Header, Footer, BaseHead)
│   │   ├── ui/                 # Reusable UI (FormattedDate, Images)
│   │   ├── seo/                # SEO components (Analytics, Fonts, Schema)
│   │   ├── comments/           # Comments (Giscus)
│   │   └── chat/               # AI Chat widget (ChatWidget.astro)
│   ├── scripts/                # Client-side scripts (mobile-menu, scroll-animation, chat-widget)
│   ├── utils/                  # Utility functions (url.ts)
│   └── config/                 # Config files (consts.ts)
│
├── content/
│   └── blog/                   # Blog posts - write here with Obsidian!
├── layouts/                    # Astro layouts (Layout, BlogPost)
├── pages/                      # Route files
│   ├── blog-index.json.ts      # AI chatbot용 블로그 인덱스 API
│   └── chat-context.json.ts    # AI chatbot용 컨텍스트 API
├── styles/                     # Global CSS
├── assets/                     # Static assets (images)
└── content.config.ts           # Content Collections schema

functions/
└── api/
    └── chat.ts                 # AI 챗봇 Cloudflare Pages Function
```

### Key Configuration Files

- `astro.config.mjs`: Main Astro config with TailwindCSS v4, MDX, sitemap, robots.txt, prefetch
- `src/shared/config/consts.ts`: Site constants (title, description, author, keywords, URL)
- `src/content.config.ts`: Content Collections schema
- `tsconfig.json`: TypeScript paths configured for `@/` imports with modern bundler settings
- `biome.json`: Code formatting and linting with Biome
- `wrangler.toml`: Cloudflare Pages 설정 (KV 바인딩 포함)
- `src/content/chat-context.md`: AI 챗봇에 제공되는 김덕환 소개 정보

### Path Aliases (tsconfig.json)

- `@/features/*` → `./src/features/*` (domain-specific features)
- `@/shared/*` → `./src/shared/*` (shared components, utils, config)
- `@/layouts/*` → `./src/layouts/*`
- `@/pages/*` → `./src/pages/*`
- `@/styles/*` → `./src/styles/*`
- `@/content/*` → `./src/content/*`
- `@/assets/*` → `./src/assets/*`

## Content 구조 — Blog vs Library

| 구분 | `/blog/` | `/library/` |
|------|----------|-------------|
| 작성자 | **김덕환 전용** (에이전트 접근 금지) | **에이전트 전용** (사람 개입 없음) |
| 발행 방식 | 수동 — 직접 `publish: true` 후 push | 자동 — cron이 직접 main push |
| 승인 단계 | 없음 (김덕환이 직접 결정) | 없음 (에이전트 자율) |
| 관련 cron | 없음 (수동) | `library-content` (월/수/금 9시), `library-design` (일 10시) |

### Blog — 김덕환 직접 발행 워크플로우

1. `src/content/blog/`에 Obsidian으로 글 작성
2. frontmatter `publish: true` 설정
3. `/blog-check` 로 점검
4. `git commit && git push origin main` → Cloudflare Pages 자동 배포

### 블로그 포스트 파일명 규칙

```
src/content/blog/[번호]_[제목_언더스코어].md
```

- 번호와 제목 사이: `_` (언더바)
- 제목 내 공백 → `_`
- 예: `050_나의_첫_사이드프로젝트_회고.md`

현재 최신 번호: **056**

### 완전한 Frontmatter 템플릿

```yaml
---
title: "제목"
subtitle: "부제목 (선택)"
description: "SEO 설명 - 검색 결과에 노출되는 문장. 150자 이내."
publish: true
meta_title: "제목 | 김덕환"
meta_description: "메타 설명 (description과 동일하거나 약간 다르게)"
keywords:
  - 키워드1
  - 키워드2
og_title: "OG 제목"
og_description: "OG 설명"
og_type: article
twitter_card: summary_large_image
created_date: YYYY-MM-DD
updated_date: YYYY-MM-DD
category: "카테고리" # 개발 | 회고 | 교육 | 생산성 | 일상 | DevOps | 블로그운영 | AI | 보안
featured_image: /images/blogs/[번호]/[번호]_00_thumbnail.png
featured_image_alt: "이미지 설명"
slug: 영문-slug-형식
tags:
  - 태그1
  - 태그2
---
```

### 이미지 컨벤션

블로그 이미지는 **글 번호별 서브폴더 + 언더바 네이밍**으로 관리합니다.

**경로 구조:**

```
public/images/blogs/
└── [번호]/
    ├── [번호]_00_thumbnail.png   ← featured_image (썸네일)
    ├── [번호]_01_[영문-설명].png  ← 본문 첫 번째 이미지
    ├── [번호]_02_[영문-설명].png
    └── ...
```

**예시 (050번 글):**

```
public/images/blogs/050/
├── 050_00_thumbnail.png
├── 050_01_problem-description.png
├── 050_02_solution.png
└── 050_03_result.png
```

**규칙 요약:**

- 번호: 3자리 (`050`)
- 순번: 2자리 (`01`, `02`...), 썸네일은 `00`
- 설명: 영문 소문자 + 하이픈 (`coding-start`, `business-fail`)
- 확장자: `.png` 고정
- slug: 영문 소문자 + 하이픈 (`how-i-got-hired-with-ai`)

**성능 (2026-08-19 정정):**
Cloudflare Polish는 **꺼져 있다**(실측: 4MB PNG가 그대로 전송됨). 대신 빌드가 WebP를 만든다.
- `bun run build` = `node scripts/build-webp.mjs && astro build`. 스크립트가 `public/images/**/*.{png,jpg}`의
  **WebP 형제 파일**(gitignore)과 메타 `src/shared/generated/image-meta.json`(원본 크기·경로)을 만든다. 843MB→64MB, 첫 실행 ~15초.
- 마크다운 본문 `<img>`는 `scripts/rehype-picture.mjs`가 `<picture><source webp><img width height loading=lazy>`로 바꾼다.
  컴포넌트(BlogCard·LibraryCard·ResponsiveBlogImage)는 `getImageMeta(src)`(`src/shared/utils/image-meta.ts`)로 같은 일을 한다.
- 글에서는 **계속 `.png` 경로만 쓰면 된다.** 새 이미지를 추가하면 다음 빌드에서 자동 변환. WebP를 커밋하지 말 것.

**이미지 생성:**
`/blog-image [파일경로]` 워크플로우를 실행하여 블로그 글의 이미지 프롬프트 주석을 자동 파싱해 이미지를 생성할 수 있습니다. 16:9 비율이 필요한 경우 프롬프트 끝에 `wide cinematic landscape 16:9 aspect ratio --ar 16:9`를 포함하면 구성이 효과적으로 잡힙니다.

> **에이전트 자동 발행**: 블로그 포스트는 `publish: true`로 바로 발행한다. main 브랜치에 직접 push → Cloudflare Pages 자동 배포.

### 카테고리 기준

| 카테고리   | 내용                               |
| ---------- | ---------------------------------- |
| 개발       | 기술, 코드, 트러블슈팅             |
| 회고       | 경험 회고, 후기, 성장 기록         |
| 교육       | 강연, 강의, 학습                   |
| 생산성     | 도구, 워크플로우, 습관             |
| 일상       | 그 외 개인 이야기                  |
| DevOps     | 인프라, 서버, 배포, CI/CD          |
| 블로그운영 | 블로그 설정, SEO, 최적화           |
| AI         | AI 도구, 프롬프트, 모델 활용       |
| 보안       | 웹 보안, 인증, 보안 기술           |

## Library (Agent Zone) — 에이전트 자율 구역

`/library/` 는 AI 에이전트들의 완전 자율 공간. 사람이 개입하지 않는다.

### 에이전트 역할
- **Luna**: 웹 리서치로 오늘의 트렌드 주제 자율 선택
- **Cheese**: 2000자+ 한국어 포스트 작성, `agent: cheese` 명시
- **Navi**: 코드 예시 포함 글 품질 검토 (비동기, 블로킹 없음)
- **Kkami**: library UI/컴포넌트 개선 지원

### Cron 스케줄
| cron | 주기 | 역할 |
|------|------|------|
| `library-content` | 월/수/금 09:00 | Luna 리서치 → Cheese 작성 → main push |
| `library-design` | 일요일 10:00 | UI/UX 개선, 새 기능 추가 → main push |

### 에이전트 권한 (승인 불필요)
- `src/content/library/` — 글 추가/수정 (publish: true 기본값, 즉시 발행)
- `src/features/library/` — LibraryCard, 컴포넌트 자유 수정
- `src/pages/library/` — index.astro, [slug].astro 자유 수정
- 직접 `main` 브랜치 push (PR 없음)

### Library frontmatter 템플릿

```yaml
---
title: "제목"
description: "설명"
publish: true
created_date: YYYY-MM-DD
category: "AI"  # AI | 개발 | DevOps | 보안 | 생산성
tags:
  - 태그
agent: "cheese"  # 작성 에이전트 이름 (필수)
slug: 영문-slug  # 필수
---
```

## AI Chatbot

모든 페이지 우측 하단에 AI 챗봇 위젯이 있습니다. 방문자가 김덕환에 대해 질문하면 AI가 답변합니다.

### 챗봇 아키텍처

```
ChatWidget.astro (UI)
    ↓ 클릭
chat-widget.ts (메시지 관리, SSE 스트리밍)
    ↓ POST /api/chat
functions/api/chat.ts (Cloudflare Pages Function)
    ├── chat-context.json (김덕환 소개 정보)
    ├── blog-index.json (블로그 글 목록 + 날짜)
    └── Gemini 2.5 Flash Lite (주) → GPT-4.1 Nano (429 폴백)
```

### 챗봇 관련 파일

| 파일                                          | 역할                                       |
| --------------------------------------------- | ------------------------------------------ |
| `functions/api/chat.ts`                       | API 엔드포인트 (Cloudflare Pages Function) |
| `src/shared/components/chat/ChatWidget.astro` | 챗봇 UI 컴포넌트                           |
| `src/shared/scripts/chat-widget.ts`           | 클라이언트 JS (스트리밍, 마크다운 렌더)    |
| `src/content/chat-context.md`                 | AI에게 주입되는 김덕환 정보 (수동 관리)    |
| `src/pages/chat-context.json.ts`              | chat-context.md → JSON API                 |
| `src/pages/blog-index.json.ts`                | 발행된 블로그 글 목록 → JSON API           |

### 챗봇 환경변수 (Cloudflare Dashboard 또는 `.dev.vars`)

| 변수             | 필수 | 설명                                        |
| ---------------- | ---- | ------------------------------------------- |
| `GEMINI_API_KEY` | ✅   | Google Gemini API 키                        |
| `OPENAI_API_KEY` | 선택 | 폴백용 OpenAI API 키                        |
| `CHAT_KV`        | ✅   | Cloudflare KV 바인딩 (wrangler.toml에 정의) |

### 챗봇 수정 시 주의사항

- `chat-context.md`를 수정하면 AI 답변 내용이 바뀜 (가장 중요한 파일)
- `blog-index.json.ts`는 발행된 글 목록과 날짜를 AI에 제공함 — 필드 추가 시 `chat.ts`의 `BlogPost` 인터페이스도 함께 수정
- temperature는 `0.4`로 설정 (hallucination 방지)
- CORS는 `log8.kr` 도메인으로 제한됨 (localhost/pages.dev 허용)

## Technology Stack

- **Framework**: Astro v5.16.x
- **Styling**: TailwindCSS v4.1.x with Vite plugin
- **Package Manager**: Bun
- **Content**: Astro Content Collections (native markdown parsing)
- **Typography**: Pretendard font (Korean-optimized)
- **Features**: MDX, Sitemap, RSS, Robots.txt, Expressive Code, Mermaid diagrams, View Transitions, Prefetch
- **Code Quality**: Biome (linter + formatter), TypeScript strict mode, Husky, commitlint
- **Hosting**: Cloudflare Pages (정적) + Cloudflare Pages Functions (AI 챗봇 API)
- **AI**: Gemini 2.5 Flash Lite (주), GPT-4.1 Nano (폴백), Cloudflare KV (FAQ/로그 저장)

## Important Notes

- **Write directly in `src/content/blog/`** - this is your Obsidian vault for blog posts
- Use Obsidian to edit files in `src/content/blog/` for the best writing experience
- Files with `publish: true` are included in production builds
- Site is deployed to `https://log8.kr`
- All paths use `@/` aliases for cleaner imports
- TailwindCSS v4 is used (different from v3 syntax)
- **CRITICAL**: Use `bg-linear-to-*` (NOT `bg-gradient-to-*`) for gradients in TailwindCSS v4
  - ✅ Correct: `bg-linear-to-br`, `bg-linear-to-r`, `bg-linear-to-t`
  - ❌ Wrong: `bg-gradient-to-br`, `bg-gradient-to-r`, `bg-gradient-to-t`
- **모션 규칙 (2026-08-19, emilkowalski/skills 기준으로 정비)** — 토큰은 `src/styles/theme.css` `@theme`
  - `transition-all` 금지 → **`transition-ui`** (색·그림자·opacity·transform/translate/scale만 전환. gap/height/width 같은 레이아웃 속성은 애니메이션하지 않는다)
  - 이징: `ease-out`(진입·hover 복귀, 강한 커브로 재정의됨) / `ease-in-out`(화면 안 이동) / `ease-drawer`(시트·모바일 메뉴). `ease-in`은 UI에 쓰지 않는다
  - 시간: `duration-(--duration-press)` 120ms(눌림) · `--duration-fast` 160ms(색·아이콘) · `--duration-base` 220ms(hover 리프트) · `--duration-panel` 320ms(패널 진입). UI 전환은 300ms 이내, 퇴장은 진입보다 빠르게
  - 누를 수 있는 것에는 `active:scale-[0.97]`(카드는 0.99, 아이콘 버튼은 0.9) + `active:duration-(--duration-press)`
  - "더 보기 →" 링크는 `hover:gap-*` 대신 컨테이너에 `link-arrow` 클래스(화살표만 3px 이동)
  - hover 모션은 Tailwind `hover:`가 이미 `@media (hover: hover)`로 게이트됨. raw CSS `:hover`는 직접 감쌀 것
  - `prefers-reduced-motion`은 `global.css`가 전역 처리(움직임 제거, 색·opacity 유지). 새 `@keyframes`엔 자체 reduce 블록 추가
- **JSON-LD는 반드시 `set:html={serializeJsonLd(obj)}`** (`src/shared/utils/json-ld.ts`). `set:text`는 `&quot;`로 이스케이프돼
  스키마가 통째로 무효가 된다(2026-08-19 라이브에서 Person/WebSite 깨진 채 배포 중이었음). `scripts/verify-dist.mjs`(CI)가
  모든 JSON-LD 파싱·sitemap 중복·`<main>` 1개를 검사한다 — 페이지에 `<main>`을 또 만들지 말 것(Layout이 제공).
- **챗 API 가드**(`functions/api/chat.ts`): Origin 필수(허용 외 403), 메시지 1~20개·각 1000자·총 15000자·role user/assistant,
  본문 32KB, IP당 20회/10분(CHAT_KV, 초과 429), 업스트림 25초 타임아웃.
- **홈 카피·숫자의 사실 원천 = `src/content/chat-context.md`** (2026-08-19 히어로/Proof bar/서비스 섹션/Library 소개/About 요약 전부 여기서만 가져옴).
  숫자를 바꾸면 chat-context.md → 홈 Proof bar(`index.astro`) → About 요약(`about.astro`·`en/about.astro`) → Library 소개를 함께 고친다.
  PR 수는 반드시 "자율 파이프라인이 머지" 표현. "24시간 안에 회신" 같은 근거 없는 약속 문구 금지.
- **라이트 테마 primary = `#7c3aed`**(흰 글자 5.70:1). 흰 글자 solid 버튼 hover는 `hover:bg-primary-dark`(`#6d28d9`), `hover:bg-primary-light`는 대비 2.7:1이라 쓰지 않는다.
- **Git Workflow**: `main` is the primary development and production branch

## Skills

이 프로젝트에서 사용 가능한 Claude Code 로컬 스킬입니다.

### 블로그 작성 워크플로우

```
/blog-write  →  초안 작성  →  /blog-check  →  수정  →  publish: true  →  커밋
```

### 스킬 목록

| 스킬                     | 설명                                                                         | 사용 시점              |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------- |
| `/blog-write`            | 블로그 글 초안 작성 (frontmatter + 본문 + 이미지 프롬프트)                   | 새 글 작성 시작할 때   |
| `/blog-check`            | 특정 글의 frontmatter, SEO, 이미지, 품질 점검                                | 발행 전 최종 확인      |
| `/verify-blog-post`      | 발행된 전체 글 일괄 검증 (슬러그 중복, 이미지 프롬프트 잔여, 필수 필드 누락) | PR 전, 정기 점검       |
| `/manage-skills`         | 스킬 커버리지 분석 및 유지보수                                               | 새 패턴 도입 후        |
| `/verify-implementation` | 등록된 모든 verify 스킬 병렬 실행                                            | PR 전 통합 검증        |

## Obsidian Setup

1. Open Obsidian
2. "Open folder as vault" → Select `C:\projects\My_Website_Astro\src\content\blog`
3. Write blog posts with full Obsidian features
4. Set `publish: true` in frontmatter when ready to publish
