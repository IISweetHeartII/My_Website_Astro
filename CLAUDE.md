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

## Content Publishing Workflow

1. **Create**: Write Markdown files directly in `src/content/blog/` using Obsidian
2. **Mark for Publishing**: Add `publish: true` to frontmatter
3. **Check**: Run `/blog-check` 로 발행 준비 상태 점검
4. **Deploy**: Commit and push to Git - Astro reads files directly at build time

### 블로그 포스트 파일명 규칙

```
src/content/blog/[번호]_[제목_언더스코어].md
```

- 번호와 제목 사이: `_` (언더바)
- 제목 내 공백 → `_`
- 예: `050_나의_첫_사이드프로젝트_회고.md`

현재 최신 번호: **049**

### 완전한 Frontmatter 템플릿

```yaml
---
title: "제목"
subtitle: "부제목 (선택)"
description: "SEO 설명 - 검색 결과에 노출되는 문장. 150자 이내."
publish: false
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
category: "카테고리"  # 개발 | 회고 | 교육 | 생산성 | 일상
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

**성능:**
PNG 원본을 저장해도 Cloudflare Polish(Lossless) 활성화 시 방문자에게 자동 WebP로 변환·제공됩니다.
→ Cloudflare Dashboard → Speed → Optimization → Polish → `Lossless`

**이미지 생성:**
OpenCode에서 `/blog-images [파일경로]`로 블로그 글의 이미지 프롬프트 주석을 자동 파싱해 이미지를 생성할 수 있습니다. (`~/.config/opencode/command/blog-images.md`)

> **주의**: 초안은 `publish: false`로 저장한다. 검토 후 직접 `true`로 바꾼다.

### 카테고리 기준

| 카테고리 | 내용 |
|---------|------|
| 개발 | 기술, 코드, 트러블슈팅 |
| 회고 | 경험 회고, 후기, 성장 기록 |
| 교육 | 강연, 강의, 학습 |
| 생산성 | 도구, 워크플로우, 습관 |
| 일상 | 그 외 개인 이야기 |

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

| 파일 | 역할 |
|------|------|
| `functions/api/chat.ts` | API 엔드포인트 (Cloudflare Pages Function) |
| `src/shared/components/chat/ChatWidget.astro` | 챗봇 UI 컴포넌트 |
| `src/shared/scripts/chat-widget.ts` | 클라이언트 JS (스트리밍, 마크다운 렌더) |
| `src/content/chat-context.md` | AI에게 주입되는 김덕환 정보 (수동 관리) |
| `src/pages/chat-context.json.ts` | chat-context.md → JSON API |
| `src/pages/blog-index.json.ts` | 발행된 블로그 글 목록 → JSON API |

### 챗봇 환경변수 (Cloudflare Dashboard 또는 `.dev.vars`)

| 변수 | 필수 | 설명 |
|------|------|------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API 키 |
| `OPENAI_API_KEY` | 선택 | 폴백용 OpenAI API 키 |
| `CHAT_KV` | ✅ | Cloudflare KV 바인딩 (wrangler.toml에 정의) |

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
- **Git Workflow**: `main` is the primary development and production branch

## Skills

이 프로젝트에서 사용 가능한 Claude Code 로컬 스킬입니다.

### 블로그 작성 워크플로우

```
/blog-write  →  초안 작성  →  /blog-check  →  수정  →  publish: true  →  커밋
```

### 스킬 목록

| 스킬 | 설명 | 사용 시점 |
|------|------|-----------|
| `/blog-write` | 블로그 글 초안 작성 (frontmatter + 본문 + 이미지 프롬프트) | 새 글 작성 시작할 때 |
| `/blog-check` | 특정 글의 frontmatter, SEO, 이미지, 품질 점검 | 발행 전 최종 확인 |
| `/verify-blog-post` | 발행된 전체 글 일괄 검증 (슬러그 중복, 이미지 프롬프트 잔여, 필수 필드 누락) | PR 전, 정기 점검 |
| `/manage-skills` | 스킬 커버리지 분석 및 유지보수 | 새 패턴 도입 후 |
| `/verify-implementation` | 등록된 모든 verify 스킬 병렬 실행 | PR 전 통합 검증 |

## Obsidian Setup

1. Open Obsidian
2. "Open folder as vault" → Select `C:\projects\My_Website_Astro\src\content\blog`
3. Write blog posts with full Obsidian features
4. Set `publish: true` in frontmatter when ready to publish
