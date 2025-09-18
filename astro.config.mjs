// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import remarkMermaid from "remark-mermaid";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  site: "https://log8.kr",
  base: "/",
  // 이미지 최적화 설정
  image: {
    service: "sharp",           // Sharp 서비스 사용 (3-5배 성능 향상)
    domains: ["log8.kr"],       // 원격 이미지 도메인 보안
    remotePatterns: [
      { protocol: "https" },    // HTTPS 이미지만 허용
    ],
  },
  markdown: {
    gfm: true,                  // GitHub Flavored Markdown 활성화
    smartypants: true,          // 타이포그래피 최적화
    remarkPlugins: [
      [
        remarkMermaid,
        {
          simple: true, // Use simpler renderer
          wrap: null, // Don't wrap the output
          mermaidConfig: {
            theme: "default",
            securityLevel: "loose",
            startOnLoad: true,
          },
        },
      ],
    ],
    remarkRehype: {
      allowDangerousHtml: true,
    },
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,       // CSS 청크 분할로 성능 향상
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["astro"],   // Astro 코어 별도 번들
            utils: ["gray-matter", "slugify"], // 유틸리티 라이브러리 분리
          },
        },
      },
    },
  },
  integrations: [
    expressiveCode(),
    mdx(),
    sitemap({
      // 더 자세한 sitemap 설정
      customPages: [
        "https://log8.kr/",
        "https://log8.kr/who-is-dh",
        "https://log8.kr/portfolio",
        "https://log8.kr/contact",
        "https://log8.kr/privacy",
        "https://log8.kr/terms",
        "https://log8.kr/tag/all",
      ],
    }),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/private", "/.obsidian", "/.trash"],
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
      ],
      sitemap: true,
    }),
  ],
  output: "static",
});
