# Obsidian Blogger

[![CI](https://github.com/IISweetHeartII/My_Website_Astro/actions/workflows/ci.yml/badge.svg)](https://github.com/IISweetHeartII/My_Website_Astro/actions/workflows/ci.yml)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://log8.kr)
[![Made with Astro](https://img.shields.io/badge/Astro-5.16.x-BC52EE.svg?logo=astro&logoColor=white)](https://astro.build)
[![Bun](https://img.shields.io/badge/Bun-1.x-F9F1E1?logo=bun&logoColor=black)](https://bun.sh)

Transform your Obsidian notes into a beautiful, modern blog with ease. Built with Astro.js for blazing-fast performance and seamless Markdown support.

![Obsidian Blogger](public/images/design/icon.png)

## Features

- **Blazing Fast**: Built with Astro.js for optimal performance and SEO
- **Markdown Support**: Write in pure Markdown, just like in Obsidian
- **Beautiful Design**: Modern, responsive layout with dark mode support
- **Tag System**: Organize posts with tags and browse by categories
- **Mobile-First**: Looks great on any device
- **SEO Optimized**: Built-in SEO with OpenGraph and canonical URLs
- **RSS Feed**: Automatic RSS feed generation
- **Sitemap**: Automatic sitemap generation
- **Featured Images**: Support for post featured images
- **Date-based Sorting**: Chronological post organization
- **Dark Mode**: Built-in dark mode support

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/obsidian-blogger.git
cd obsidian-blogger
```

2. Install dependencies:

```bash
bun install
```

3. Configure your site:
   - Copy `.env.example` to `.env`
   - Update the environment variables for your deployment

4. Start the development server:

```bash
bun dev
```

5. Visit `http://localhost:4321` to see your blog!

## Creating Blog Posts

1. Add your Markdown files to `src/content/blog/`
2. Include required frontmatter:

```yaml
---
title: "Your Post Title"
description: "Post description for SEO"
publish: true
created_date: 2024-01-19
slug: custom-url
tags:
  - tag1
  - tag2
---
```

### Supported Frontmatter Fields

| Field            | Required | Description              |
| ---------------- | -------- | ------------------------ |
| `title`          | Yes      | Post title               |
| `description`    | No       | SEO description          |
| `publish`        | Yes      | Set to `true` to publish |
| `created_date`   | No       | Publication date         |
| `slug`           | No       | Custom URL slug          |
| `tags`           | No       | Array of tags            |
| `featured_image` | No       | Hero image URL           |
| `subtitle`       | No       | Optional subtitle        |

## Customization

### Site Configuration

Update `src/shared/config/consts.ts` to modify:

- Site title
- Site description
- Other global constants

### Styling

- Global styles: `src/styles/global.css`
- Theme variables: `src/styles/theme.css`
- Component styles: Inline in respective `.astro` files

## Deployment

See deployment workflows and runbook:

- `docs/dev/cloudflare-cli-iac-runbook.md`
- `.github/workflows/deploy-cloudflare.yml`

## Project Structure

```
obsidian-blogger/
├── src/
│   ├── features/      # Domain-specific features (blog)
│   ├── shared/        # Shared components, utils, config
│   ├── content/       # Blog posts and content
│   ├── layouts/       # Page layouts
│   ├── pages/         # Route components
│   ├── styles/        # Global styles
│   └── assets/        # Static assets (images)
├── public/            # Public assets
├── astro.config.mjs   # Astro configuration
├── biome.json         # Biome linter/formatter config
└── package.json       # Project dependencies
```

## Development Commands

| Command               | Action                                   |
| --------------------- | ---------------------------------------- |
| `bun dev`             | Start dev server                         |
| `bun run build`       | Build for production                     |
| `bun run preview`     | Preview production build                 |
| `bun run lint`        | Run Biome linter                         |
| `bun run format`      | Format code with Biome                   |
| `bun run check`       | Run Biome check + TypeScript type check  |
| `bun run type-check`  | Run TypeScript type checking only        |
| `bun run deps:check`  | Check for dependency updates (using ncu) |
| `bun run deps:update` | Update dependencies and install          |

## Production-Ready Features

### Code Quality

- **Biome**: Fast linter and formatter (replaces ESLint + Prettier)
- **TypeScript Strict**: Maximum type safety
- **Husky**: Pre-commit hooks with Biome check
- **commitlint**: Conventional commit messages

### Setup

```bash
# Install all dependencies
bun install

# Initialize Git hooks
bun run prepare

# Run all checks
bun run check
```

## CI/CD

This project uses **GitHub Actions** (CI/CD) + **Cloudflare Pages**.

### GitHub Actions

- Biome lint and format check
- TypeScript type check
- Project build verification
- Cloudflare Pages deployment on `main`

### Cloudflare Pages (Automated Deployment)

- **Production**: `main` → https://log8.kr

For CLI/IaC-only operation, see:

- `docs/dev/cloudflare-cli-iac-runbook.md`

See `.github/workflows/` for workflow files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this project helpful, please consider:

- Starring the repository
- Sharing it with others
- Contributing to its development

## Documentation

### Development Guides

- [Development Guide](docs/dev/development-guide.md) - Development setup and guidelines
- [Design System Guide](docs/dev/design-system-guide.md) - Color system & style guide
- [Production Best Practices](docs/dev/production-best-practices.md) - Production best practices
- [Setup Production Tools](docs/dev/SETUP_PRODUCTION_TOOLS.md) - Development tools setup

### Content Creation

- [Publishing Workflow Guide](docs/dev/publishing-workflow-guide.md) - Obsidian → Astro publishing process
- [SEO Optimization Guide](docs/blog-drafts/seo-optimization-guide.md) - Blog post SEO/AEO optimization
- [Markdown Writing Guide](docs/blog-drafts/markdown-writing-guide.md) - Markdown writing guide

### Deployment

- [Cloudflare CLI/IaC Runbook](docs/dev/cloudflare-cli-iac-runbook.md) - Deployment operations guide
- [Environment Setup](astro.config.mjs) - Astro configuration

## Links

- [Documentation](https://github.com/IISweetHeartII/My_Website_Astro/wiki)
- [Issues](https://github.com/IISweetHeartII/My_Website_Astro/issues)
- [Discussions](https://github.com/IISweetHeartII/My_Website_Astro/discussions)

## Tech Stack

- **Framework**: Astro v5.16.x
- **Styling**: TailwindCSS v4.1.x (with @tailwindcss/vite)
- **Package Manager**: Bun
- **Code Quality**: Biome (linter + formatter)
- **Font**: Pretendard (Korean optimized)
- **SEO**: Built-in SEO/AEO optimization
