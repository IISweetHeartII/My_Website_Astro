# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Obsidian Blogger** - an Astro-based blog that transforms Obsidian notes into a beautiful, modern website. The project features automatic Obsidian-to-Astro content synchronization and is optimized for Korean content with Pretendard font.

## Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server with Obsidian sync |
| `pnpm build` | Build for production with Obsidian sync |
| `pnpm preview` | Preview production build locally |
| `pnpm sync` | Manually sync Obsidian content to Astro |

**Important**: All dev/build commands automatically run `node tools/scripts/sync-obsidian.js` first to sync content.

## Architecture Overview

### Content System
- **Obsidian Integration**: Markdown files from anywhere in the project are automatically synced to `src/content/blog/`
- **Content Filtering**: Only files with `publish: true` frontmatter are synchronized
- **Smart Sync**: The sync script (`tools/scripts/sync-obsidian.js`) scans the entire project for `.md` files, excluding `node_modules`, `.git`, etc.

### Project Structure
```
src/
├── components/
│   ├── features/     # Feature-specific components (IntroSection, TagFilter)
│   ├── layout/       # Layout components (Header, Footer, BaseHead)
│   ├── seo/          # SEO components (GoogleAnalytics, Fonts)
│   └── ui/           # UI components (BlogCard, FormattedDate)
├── content/blog/     # Auto-synced blog posts (managed by sync script)
├── layouts/          # Astro layouts (Layout.astro, BlogPost.astro)
├── pages/            # Route files (.astro pages)
├── styles/           # Global styles and CSS
├── lib/              # Utility functions
└── utils/            # Helper utilities
```

### Key Configuration Files
- `astro.config.mjs`: Main Astro config with TailwindCSS v4, MDX, sitemap, robots.txt
- `src/consts.ts`: Site constants (title, description, author, keywords, URL)
- `tools/scripts/sync-obsidian.js`: Content synchronization from Obsidian
- `tsconfig.json`: TypeScript paths configured for `@/` imports

### Path Aliases (tsconfig.json)
- `@/components/*` → `./src/components/*`
- `@/layouts/*` → `./src/layouts/*`
- `@/utils/*` → `./src/utils/*`
- `@/lib/*` → `./src/lib/*`
- `@/styles/*` → `./src/styles/*`
- `@/content/*` → `./src/content/*`

## Content Publishing Workflow

1. **Create**: Write Markdown files anywhere in the project
2. **Mark for Publishing**: Add `publish: true` to frontmatter
3. **Auto-Sync**: Development/build commands automatically sync content
4. **Manual Sync**: Use `pnpm sync` if needed

### Required Frontmatter
```yaml
---
title: 'Post Title'
description: 'SEO description'
publish: true
created_date: 2024-01-19
slug: custom-url
tags:
  - tag1
  - tag2
---
```

## Technology Stack
- **Framework**: Astro v5.13.8
- **Styling**: TailwindCSS v4.0.0 with Vite plugin
- **Package Manager**: pnpm
- **Content**: Markdown with gray-matter frontmatter parsing
- **Typography**: Pretendard font (Korean-optimized)
- **Features**: MDX, Sitemap, RSS, Robots.txt, Expressive Code, Mermaid diagrams

## Important Notes
- Content in `src/content/blog/` is auto-managed - don't edit directly
- Use the sync script to manage content from Obsidian
- Site is deployed to `https://log8.kr`
- All paths use `@/` aliases for cleaner imports
- TailwindCSS v4 is used (different from v3 syntax)