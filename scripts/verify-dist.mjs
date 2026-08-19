#!/usr/bin/env node
/**
 * 빌드 산출물 불변식 검사 (CI 게이트).
 * - 모든 application/ld+json 블록이 JSON.parse 가능 (2026-08-19: set:text 이스케이프로 Person/WebSite 가 깨진 채 배포됐었다)
 * - sitemap <loc> 에 trailing-slash 유무 중복 없음
 * - 각 HTML 문서에 <main> 랜드마크 정확히 1개
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const failures = [];

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const htmlFiles = await walk(DIST);
let jsonLdBlocks = 0;
for (const file of htmlFiles) {
  const html = await fs.readFile(file, "utf8");
  const rel = path.relative(DIST, file);
  for (const m of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    jsonLdBlocks += 1;
    try {
      JSON.parse(m[1]);
    } catch (e) {
      failures.push(
        `${rel}: JSON-LD parse failed (${String(e.message).slice(0, 60)}): ${m[1].slice(0, 60)}`
      );
    }
  }
  const mains = (html.match(/<main[\s>]/g) ?? []).length;
  if (mains !== 1) failures.push(`${rel}: expected 1 <main>, found ${mains}`);
}

const sitemapFiles = (await fs.readdir(DIST)).filter((f) => /^sitemap.*\.xml$/.test(f));
for (const f of sitemapFiles) {
  const xml = await fs.readFile(path.join(DIST, f), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const seen = new Map();
  for (const loc of locs) {
    const key = loc.replace(/\/$/, "");
    if (seen.has(key) && seen.get(key) !== loc)
      failures.push(`${f}: duplicate loc (slash variants) ${loc}`);
    seen.set(key, loc);
  }
}

console.log(
  `[verify-dist] ${htmlFiles.length} html, ${jsonLdBlocks} JSON-LD blocks, ${sitemapFiles.length} sitemap files`
);
if (failures.length) {
  console.error(`[verify-dist] ${failures.length} failure(s):`);
  for (const f of failures.slice(0, 50)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("[verify-dist] OK");
