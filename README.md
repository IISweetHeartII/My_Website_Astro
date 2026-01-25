# Obsidian Blogger

[![CI](https://github.com/IISweetHeartII/My_Website_Astro/actions/workflows/ci.yml/badge.svg)](https://github.com/IISweetHeartII/My_Website_Astro/actions/workflows/ci.yml)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://log8.kr)
[![Made with Astro](https://img.shields.io/badge/Astro-5.15.8-BC52EE.svg?logo=astro&logoColor=white)](https://astro.build)
[![pnpm](https://img.shields.io/badge/pnpm-8.x-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

Transform your Obsidian notes into a beautiful, modern blog with ease. Built with Astro.js for blazing-fast performance and seamless Markdown support.

![Obsidian Blogger](public/images/design/icon.png)

## ✨ Features

- 🚀 **Blazing Fast**: Built with Astro.js for optimal performance and SEO
- 📝 **Markdown Support**: Write in pure Markdown, just like in Obsidian
- 🎨 **Beautiful Design**: Modern, responsive layout with dark mode support
- 🏷️ **Tag System**: Organize posts with tags and browse by categories
- 📱 **Mobile-First**: Looks great on any device
- 🔍 **SEO Optimized**: Built-in SEO with OpenGraph and canonical URLs
- 📰 **RSS Feed**: Automatic RSS feed generation
- 🗺️ **Sitemap**: Automatic sitemap generation
- 🖼️ **Featured Images**: Support for post featured images
- 📅 **Date-based Sorting**: Chronological post organization
- 🌙 **Dark Mode**: Built-in dark mode support

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/obsidian-blogger.git
cd obsidian-blogger
```

2. Install dependencies:

```bash
npm install
```

3. Configure your site:
   - Copy `.env.example` to `.env`
   - Update the environment variables for your deployment

4. Start the development server:

```bash
npm run dev
```

5. Visit `http://localhost:4321` to see your blog!

## 📝 Creating Blog Posts

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

## 🎨 Customization

### Site Configuration

Update `src/consts.ts` to modify:

- Site title
- Site description
- Other global constants

### Styling

- Global styles: `src/styles/global.css`
- Component styles: Inline in respective `.astro` files
- Theme variables: CSS custom properties in global styles

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:

- GitHub Pages
- Netlify
- Vercel
- Custom domains

## 📦 Project Structure

```
obsidian-blogger/
├── src/
│   ├── components/    # Reusable components
│   ├── content/       # Blog posts and content
│   ├── layouts/       # Page layouts
│   ├── pages/         # Route components
│   ├── styles/        # Global styles
│   └── utils/         # Utility functions
├── public/           # Static assets
├── astro.config.mjs  # Astro configuration
└── package.json      # Project dependencies
```

## 🛠️ Development Commands

| Command             | Action                                 |
| ------------------- | -------------------------------------- |
| `pnpm dev`          | Start dev server                       |
| `pnpm build`        | Build for production                   |
| `pnpm preview`      | Preview production build               |
| `pnpm format`       | Format code with Prettier              |
| `pnpm format:check` | Check code formatting                  |
| `pnpm lint`         | Run ESLint                             |
| `pnpm lint:fix`     | Auto-fix ESLint errors                 |
| `pnpm type-check`   | Run TypeScript type checking           |
| `pnpm check`        | Run all checks (format + lint + types) |
| `pnpm fix`          | Auto-fix all issues                    |

## 🏢 Production-Ready Features

### Code Quality

- ✅ **ESLint**: Code quality & bug prevention
- ✅ **Prettier**: Consistent code formatting
- ✅ **TypeScript Strict**: Maximum type safety
- ✅ **Husky**: Pre-commit hooks
- ✅ **lint-staged**: Fast incremental linting
- ✅ **commitlint**: Conventional commit messages

### Setup

```bash
# Install all dependencies (including development tools)
pnpm install

# Initialize Git hooks
pnpm run prepare

# Run all checks
pnpm run check
```

📖 See [Setup Guide](SETUP_PRODUCTION_TOOLS.md) for detailed instructions.

## 🔄 CI/CD

이 프로젝트는 **GitHub Actions** (CI) + **Cloudflare Pages** (CD)로 자동화되어 있습니다.

### GitHub Actions (자동 품질 검사)

- ✅ 코드 포맷팅 검사 (Prettier)
- ✅ TypeScript 타입 체크
- ✅ 프로젝트 빌드
- ✅ 보안 감사 (npm audit)
- ✅ Lighthouse 성능 측정 (PR)

### Cloudflare Pages (자동 배포)

- 🚀 **Production**: `main` → https://log8.kr
- 🔍 **Preview**: `develop` → https://\*.pages.dev
- 📝 **PR Previews**: 자동 생성

자세한 내용은 `.github/workflows/` 폴더의 워크플로우 파일을 참조하세요.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Support

If you find this project helpful, please consider:

- Starring the repository
- Sharing it with others
- Contributing to its development

## 📚 Documentation

### Development Guides

- [Development Guide](docs/dev/development-guide.md) - 개발 환경 설정 및 가이드라인
- [Design System Guide](docs/dev/design-system-guide.md) - 색상 시스템 & 스타일 가이드
- [Production Best Practices](docs/dev/production-best-practices.md) - 실무급 개발 Best Practices
- [Setup Production Tools](docs/dev/SETUP_PRODUCTION_TOOLS.md) - 개발 도구 설정 가이드
- [TailwindCSS v4 Migration](CHANGELOG.md) - v3 → v4 마이그레이션 과정

### Content Creation

- [Publishing Workflow Guide](docs/dev/publishing-workflow-guide.md) - Obsidian → Astro 발행 프로세스
- [SEO Optimization Guide](docs/blog-drafts/seo-optimization-guide.md) - 블로그 게시물 SEO/AEO 최적화
- [Markdown Writing Guide](docs/blog-drafts/markdown-writing-guide.md) - 마크다운 작성 가이드

### Deployment

- [Deployment Guide](DEPLOYMENT.md) - 다양한 플랫폼 배포 가이드
- [Environment Setup](astro.config.mjs) - Astro 설정 및 환경 변수

## 🔗 Links

- [Documentation](https://github.com/yourusername/obsidian-blogger/wiki)
- [Issues](https://github.com/yourusername/obsidian-blogger/issues)
- [Discussions](https://github.com/yourusername/obsidian-blogger/discussions)

## 🎨 Tech Stack

- **Framework**: Astro v5.13.8
- **Styling**: TailwindCSS v4.0.0 (with @tailwindcss/vite)
- **Package Manager**: pnpm
- **IDE Support**: Cursor IDE with custom rules system
- **Font**: Pretendard (Korean optimized)
- **SEO**: Built-in SEO/AEO optimization
