# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Obsidian Blogger** - an Astro-based blog optimized for writing in Obsidian. Blog posts are written directly in `src/content/blog/` where Astro's Content Collections API reads them natively. The project is optimized for Korean content with Pretendard font.

## Development Commands

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start development server         |
| `pnpm build`        | Build for production             |
| `pnpm preview`      | Preview production build locally |
| `pnpm format`       | Auto-format code with Prettier   |
| `pnpm format:check` | Check code formatting            |
| `pnpm type-check`   | Run TypeScript type checking     |

## CI/CD

### GitHub Actions (Continuous Integration)

- **자동 실행**: `main`, `develop` 브랜치 push 및 PR 생성 시
- **검사 항목**: 코드 포맷팅, TypeScript 타입 체크, 빌드, 보안 감사, Lighthouse 성능
- **워크플로우 파일**: `.github/workflows/ci.yml`, `.github/workflows/pr-preview.yml`

### Cloudflare Pages (Continuous Deployment)

- **Production**: `main` 브랜치 → https://log8.kr (자동 배포)
- **Preview**: `develop` 브랜치 및 PR → `*.pages.dev` (자동 프리뷰)
- **설정 위치**: Cloudflare Dashboard (https://dash.cloudflare.com)

자세한 내용은 [CI/CD 가이드](docs/ci-cd-guide.md)를 참조하세요.

## Architecture Overview

### Content System

- **Direct Obsidian Integration**: Write blog posts directly in `src/content/blog/` using Obsidian
- **Content Filtering**: Posts with `publish: true` frontmatter are included in builds (filtered at runtime)
- **No Sync Script**: Astro reads markdown files directly from `src/content/blog/` using Content Collections API

### Project Structure

```
src/
├── components/
│   ├── features/     # Feature-specific components (IntroSection, TagFilter)
│   ├── layout/       # Layout components (Header, Footer, BaseHead)
│   ├── seo/          # SEO components (GoogleAnalytics, Fonts)
│   └── ui/           # UI components (BlogCard, FormattedDate)
├── content/blog/     # Blog posts - write directly here with Obsidian!
├── layouts/          # Astro layouts (Layout.astro, BlogPost.astro)
├── pages/            # Route files (.astro pages)
├── styles/           # Global styles and CSS
├── lib/              # Utility functions
└── utils/            # Helper utilities
```

### Key Configuration Files

- `astro.config.mjs`: Main Astro config with TailwindCSS v4, MDX, sitemap, robots.txt, prefetch, experimental features
- `src/consts.ts`: Site constants (title, description, author, keywords, URL)
- `tsconfig.json`: TypeScript paths configured for `@/` imports with modern bundler settings
- `.prettierrc`: Code formatting with Astro plugin

### Path Aliases (tsconfig.json)

- `@/components/*` → `./src/components/*`
- `@/layouts/*` → `./src/layouts/*`
- `@/utils/*` → `./src/utils/*`
- `@/lib/*` → `./src/lib/*`
- `@/styles/*` → `./src/styles/*`
- `@/content/*` → `./src/content/*`

## Content Publishing Workflow

1. **Create**: Write Markdown files directly in `src/content/blog/` using Obsidian
2. **Mark for Publishing**: Add `publish: true` to frontmatter
3. **Develop**: Run `pnpm dev` to see changes instantly
4. **Deploy**: Commit and push to Git - Astro reads files directly at build time

### Required Frontmatter

```yaml
---
title: "Post Title"
description: "SEO description"
publish: true
created_date: 2024-01-19
slug: custom-url
tags:
  - tag1
  - tag2
---
```

## Technology Stack

- **Framework**: Astro v5.15.8
- **Styling**: TailwindCSS v4.1.17 with Vite plugin
- **Package Manager**: pnpm
- **Content**: Astro Content Collections (native markdown parsing)
- **Typography**: Pretendard font (Korean-optimized)
- **Features**: MDX, Sitemap, RSS, Robots.txt, Expressive Code, Mermaid diagrams, View Transitions, Prefetch

## Important Notes

- **Write directly in `src/content/blog/`** - this is your Obsidian vault for blog posts
- Use Obsidian to edit files in `src/content/blog/` for the best writing experience
- Files with `publish: true` are included in production builds
- Site is deployed to `https://log8.kr`
- All paths use `@/` aliases for cleaner imports
- TailwindCSS v4 is used (different from v3 syntax)

## Obsidian Setup

1. Open Obsidian
2. "Open folder as vault" → Select `C:\projects\My_Website_Astro\src\content\blog`
3. Write blog posts with full Obsidian features
4. Set `publish: true` in frontmatter when ready to publish
