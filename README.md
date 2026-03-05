# Obsidian Blogger

[![CI](https://github.com/IISweetHeartII/My_Website_Astro/actions/workflows/ci.yml/badge.svg)](https://github.com/IISweetHeartII/My_Website_Astro/actions/workflows/ci.yml)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://log8.kr)
[![Made with Astro](https://img.shields.io/badge/Astro-5.16.x-BC52EE.svg?logo=astro&logoColor=white)](https://astro.build)
[![Bun](https://img.shields.io/badge/Bun-1.x-F9F1E1?logo=bun&logoColor=black)](https://bun.sh)

Obsidian으로 글 쓰고, Astro로 빌드하고, Cloudflare Pages로 배포하는 블로그.
AI 챗봇이 방문자에게 블로그 주인에 대해 답변해줍니다.

> **Demo**: https://log8.kr

## 주요 기능

- **Obsidian 직접 연동** - `src/content/blog/`을 Obsidian vault로 열고 바로 글쓰기
- **AI 챗봇** - Gemini/OpenAI 기반, SSE 스트리밍, 블로그 글 자동 연결
- **다크모드** - 시스템 설정 연동 + 수동 토글
- **SEO/AEO** - OpenGraph, sitemap, robots.txt, FAQ Schema, RSS
- **한국어 최적화** - Pretendard 폰트
- **코드 하이라이트** - Expressive Code + Mermaid 다이어그램
- **검색** - Pagefind 기반 전문 검색

## 빠른 시작

### 1. 클론 & 설치

```bash
git clone https://github.com/IISweetHeartII/My_Website_Astro.git
cd My_Website_Astro
bun install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 수정:

```env
PUBLIC_GA_ID=G-XXXXXXXXXX    # Google Analytics 4 측정 ID
```

### 3. 사이트 정보 수정

`src/shared/config/consts.ts`에서 사이트 기본 정보를 수정하세요:

```ts
export const SITE_TITLE = "내 블로그";
export const SITE_URL = "https://my-site.com";
export const SITE_AUTHOR = "홍길동";
```

### 4. 개발 서버 시작

```bash
bun dev
# http://localhost:4321
```

## 블로그 글 작성

`src/content/blog/`에 마크다운 파일을 추가하세요:

```yaml
---
title: "글 제목"
description: "SEO 설명"
publish: true
created_date: 2026-01-01
slug: my-post-url
category: "개발"
tags:
  - TypeScript
  - Astro
---

본문 내용...
```

### Obsidian 연동

1. Obsidian → "Open folder as vault" → `src/content/blog/` 선택
2. 마크다운으로 글 작성
3. `publish: true` 설정 후 git push → 자동 배포

## AI 챗봇 설정

방문자가 블로그 주인에 대해 질문할 수 있는 AI 챗봇입니다.

### 구조

```
방문자 질문
  → Cloudflare Pages Function (/api/chat)
  → Gemini 2.5 Flash-Lite (무료) → 실패 시 OpenAI fallback
  → SSE 스트리밍 응답

시스템 프롬프트 = 톤 설정 (chat.ts)
               + chat-context.md (프로필, Git 관리)
               + blog-index.json (블로그 목록, 빌드 자동)
               + KV FAQ (동적 보정, curl 관리)
```

### 챗봇 활성화 순서

#### Step 1: API 키 발급

- **Gemini** (무료): https://aistudio.google.com/apikey
- **OpenAI** (fallback): https://platform.openai.com/api-keys

#### Step 2: 로컬 환경변수

`.dev.vars` 파일 생성 (gitignore 대상):

```env
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

#### Step 3: 프로필 수정

`src/content/chat-context.md`를 본인 정보로 수정하세요.
이 파일이 AI의 지식 베이스가 됩니다.

#### Step 4: Cloudflare 배포 설정

Cloudflare Dashboard → Pages → Settings → Environment variables:

| 변수 | 용도 | 필수 |
|------|------|------|
| `PUBLIC_GA_ID` | Google Analytics 4 | 선택 |
| `GEMINI_API_KEY` | 챗봇 메인 모델 | 필수 |
| `OPENAI_API_KEY` | 챗봇 fallback | 선택 |
| `ADMIN_SECRET` | 관리 API 인증 | 선택 |

#### Step 5: KV 설정 (선택, 챗봇 학습 기능)

1. Cloudflare Dashboard → Workers & Pages → KV → Create namespace
2. Pages → Settings → Functions → KV namespace bindings:
   - Variable name: `CHAT_KV`
   - Namespace: 생성한 KV
3. `wrangler.toml`의 `id`를 생성한 KV ID로 수정

### 챗봇 관리 API

KV가 설정되면 질문 로그가 자동 저장됩니다.

```bash
# 인기 질문 조회
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-site.com/api/chat/admin?action=logs"

# FAQ 등록 (시스템 프롬프트에 자동 주입)
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"faq":[{"q":"질문","a":"답변"}]}' \
  "https://your-site.com/api/chat/admin"

# FAQ 확인
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-site.com/api/chat/admin?action=faq"

# 로그 삭제
curl -X DELETE -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-site.com/api/chat/admin?target=logs"
```

### 챗봇 없이 사용하기

챗봇이 필요 없으면:

1. `src/layouts/Layout.astro`에서 `<ChatWidget />` 줄 제거
2. `functions/` 폴더 삭제
3. `wrangler.toml` 삭제

## 프로젝트 구조

```
src/
├── features/blog/components/  # 블로그 컴포넌트 (카드, 필터 등)
├── shared/
│   ├── components/
│   │   ├── layout/            # Header, Footer, BaseHead
│   │   ├── chat/              # AI 챗봇 위젯
│   │   ├── seo/               # GA, Schema, Fonts
│   │   └── ui/                # 공용 UI 컴포넌트
│   ├── scripts/               # 클라이언트 스크립트
│   └── config/                # 사이트 설정
├── content/
│   ├── blog/                  # 블로그 글 (Obsidian vault)
│   └── chat-context.md        # AI 챗봇 지식 베이스
├── pages/                     # 라우트
├── layouts/                   # 레이아웃
└── styles/                    # 글로벌 CSS

functions/                     # Cloudflare Pages Functions
├── api/
│   ├── chat.ts                # AI 챗봇 API (SSE 스트리밍)
│   └── chat/admin.ts          # 챗봇 관리 API
```

## 환경변수 정리

| 파일 | 변수 | 설명 |
|------|------|------|
| `.env` | `PUBLIC_GA_ID` | GA4 측정 ID (빌드 타임) |
| `.dev.vars` | `GEMINI_API_KEY` | Gemini API 키 (로컬 런타임) |
| `.dev.vars` | `OPENAI_API_KEY` | OpenAI API 키 (로컬 런타임) |
| `.dev.vars` | `ADMIN_SECRET` | 관리 API 시크릿 (로컬 런타임) |
| `wrangler.toml` | KV binding | Cloudflare KV namespace ID |

> `.env`는 Astro 빌드 타임, `.dev.vars`는 Cloudflare Pages Functions 런타임 환경변수입니다.

## 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `bun dev` | 개발 서버 시작 |
| `bun run build` | 프로덕션 빌드 |
| `bun run preview` | 빌드 결과 미리보기 |
| `bun run lint` | Biome 린트 |
| `bun run format` | 코드 포맷팅 |
| `bun run check` | 린트 + 타입 체크 |
| `bun run deps:check` | 의존성 업데이트 확인 |
| `bun run deps:update` | 의존성 업데이트 |

## 배포

### Cloudflare Pages (권장)

1. GitHub 연결: Cloudflare Dashboard → Pages → Create project → GitHub repo 연결
2. 빌드 설정:
   - Build command: `bun run build`
   - Build output: `dist`
   - Node version: `NODE_VERSION = 22`
3. 환경변수 설정 (위 표 참고)
4. `main` 브랜치 push → 자동 배포

### 로컬에서 Functions 테스트

```bash
bun run build
npx wrangler pages dev dist/
```

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Astro 5.16.x |
| Styling | TailwindCSS 4.1.x |
| Package Manager | Bun |
| AI | Gemini 2.5 Flash-Lite + OpenAI GPT-4.1-nano |
| Serverless | Cloudflare Pages Functions |
| Storage | Cloudflare KV |
| Analytics | Google Analytics 4 |
| Code Quality | Biome, TypeScript strict, Husky, commitlint |
| Search | Pagefind |
| Font | Pretendard |

## 문서

- [개발 가이드](docs/dev/development-guide.md)
- [디자인 시스템](docs/dev/design-system-guide.md)
- [퍼블리싱 워크플로우](docs/dev/publishing-workflow-guide.md)
- [SEO 최적화 가이드](docs/blog-drafts/seo-optimization-guide.md)

## 라이선스

MIT License - [LICENSE](LICENSE) 참고
