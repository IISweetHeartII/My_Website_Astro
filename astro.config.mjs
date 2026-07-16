// @ts-check

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import robotsTxt from "astro-robots-txt";

const SITE_URL = "https://log8.kr";
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const CONTENT_COLLECTIONS = [
  { directory: "src/content/blog", routePrefix: "blog" },
  { directory: "src/content/library", routePrefix: "library" },
];

/**
 * @typedef {Record<string, string> & {
 *   publish?: string;
 *   updated_date?: string;
 *   updatedDate?: string;
 *   created_date?: string;
 *   pubDate?: string;
 *   pub_date?: string;
 *   slug?: string;
 * }} FrontmatterScalars
 */

/** @param {string} filePath */
const stripMarkdownExtension = (filePath) => filePath.replace(/\.(md|mdx)$/i, "");

/** @param {string} value */
const removeWrappingQuotes = (value) => value.replace(/^['"]|['"]$/g, "");

/** @param {string} url */
const normalizeSitemapPath = (url) => {
  const pathname = new URL(url, SITE_URL).pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

/**
 * @param {string} directory
 * @returns {string[]}
 */
const readMarkdownFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return readMarkdownFiles(entryPath);
    }

    return /\.(md|mdx)$/i.test(entry.name) ? [entryPath] : [];
  });
};

/**
 * @param {string} source
 * @returns {FrontmatterScalars}
 */
const parseFrontmatterScalars = (source) => {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const scalars = /** @type {FrontmatterScalars} */ ({});
  if (!frontmatter?.[1]) return scalars;

  for (const line of frontmatter[1].split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match?.[1]) continue;

    scalars[match[1]] = removeWrappingQuotes(match[2]?.trim() ?? "");
  }

  return scalars;
};

/** @param {string | undefined} value */
const parseFrontmatterDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildContentLastmodMap = () => {
  const lastmodByPath = new Map();

  for (const { directory, routePrefix } of CONTENT_COLLECTIONS) {
    const contentDirectory = path.join(PROJECT_ROOT, directory);

    for (const filePath of readMarkdownFiles(contentDirectory)) {
      const frontmatter = parseFrontmatterScalars(fs.readFileSync(filePath, "utf8"));
      if (frontmatter.publish === "false") continue;

      const date = parseFrontmatterDate(
        frontmatter.updated_date ??
          frontmatter.updatedDate ??
          frontmatter.created_date ??
          frontmatter.pubDate ??
          frontmatter.pub_date
      );
      if (!date) continue;

      const relativePath = path.relative(contentDirectory, filePath).split(path.sep).join("/");
      const fallbackSlug = stripMarkdownExtension(relativePath);
      const slug = frontmatter.slug || fallbackSlug;
      const routePath = normalizeSitemapPath(`/${routePrefix}/${slug}/`);

      lastmodByPath.set(routePath, date);
    }
  }

  return lastmodByPath;
};

const contentLastmodByPath = buildContentLastmodMap();

/** @param {{ url: string }} item */
const addContentLastmod = (item) => {
  const lastmod = contentLastmodByPath.get(normalizeSitemapPath(item.url));
  return lastmod ? { ...item, lastmod } : item;
};

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: "/",
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // 이미지 최적화 설정 (Sharp는 기본값)
  image: {
    domains: ["log8.kr"], // 원격 이미지 도메인 보안
    remotePatterns: [
      { protocol: "https" }, // HTTPS 이미지만 허용
    ],
  },
  markdown: {
    gfm: true, // GitHub Flavored Markdown 활성화
    smartypants: true, // 타이포그래피 최적화
    syntaxHighlight: false, // expressiveCode 사용하므로 비활성화
    remarkRehype: {
      allowDangerousHtml: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true, // CSS 청크 분할로 성능 향상
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["astro"], // Astro 코어 별도 번들
          },
        },
      },
    },
  },
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"], // 다크모드 지원
      defaultProps: {
        wrap: true,
      },
    }),
    mdx(),
    pagefind(),
    sitemap({
      customPages: [
        "https://log8.kr/",
        "https://log8.kr/portfolio",
        "https://log8.kr/showcase",
        "https://log8.kr/resume",
        "https://log8.kr/privacy",
      ],
      serialize: addContentLastmod,
    }),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/private", "/.trash"],
          crawlDelay: 1,
        },
        {
          userAgent: "Yeti",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "Googlebot",
          allow: "/",
          crawlDelay: 1,
        },
        // AI 봇들을 위한 특별 설정
        {
          userAgent: "GPTBot",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "Google-Extended",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "ChatGPT-User",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "CCBot",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "anthropic-ai",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "Claude-Web",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "PerplexityBot",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "ClaudeBot",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "Bard",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "Applebot-Extended", // Apple Intelligence
          allow: "/",
          crawlDelay: 1,
        },
      ],
      sitemap: true,
    }),
  ],
  output: "static",
  // 성능 최적화
  prefetch: {
    prefetchAll: true, // 링크 프리페치로 페이지 속도 향상
    defaultStrategy: "hover", // 호버 시 프리페치
  },
  // 빌드 최적화
  build: {
    inlineStylesheets: "auto", // 작은 CSS는 인라인으로 성능 향상
  },
});
