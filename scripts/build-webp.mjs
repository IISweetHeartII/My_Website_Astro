#!/usr/bin/env node
/**
 * public/images 아래 PNG/JPG의 WebP 형제 파일을 만들고 원본 크기 메타를 기록한다.
 *
 * 왜: Cloudflare Polish가 꺼져 있어 블로그·라이브러리 이미지가 3~4MB PNG 그대로 전송됐다
 * (2026-08-19 실측). WebP는 같은 그림을 5~20배 작게 담는다.
 *
 * - 출력: 원본 옆 `<name>.webp` (gitignore), 메타 `src/shared/generated/image-meta.json`
 * - 멱등: 원본이 webp보다 새것일 때만 재생성. `bun run build` 앞에서 항상 돈다.
 * - 소비자: scripts/rehype-picture.mjs(마크다운 img), src/shared/utils/image-meta.ts(컴포넌트)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const META_FILE = path.join(ROOT, "src", "shared", "generated", "image-meta.json");
const MAX_WIDTH = 1600; // 본문 최대 폭(65ch≈720px)의 2x 여유
const QUALITY = 80;
const CONCURRENCY = 8;
const SKIP_DIRS = new Set(["design"]); // 아이콘·로고는 제외(별도 관리)

/** @returns {Promise<string[]>} */
async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full)));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function isStale(src, dst) {
  try {
    const [s, d] = await Promise.all([fs.stat(src), fs.stat(dst)]);
    return s.mtimeMs > d.mtimeMs;
  } catch {
    return true; // dst 없음
  }
}

async function main() {
  const started = Date.now();
  const files = await walk(IMAGES_DIR);
  /** @type {Record<string, {width:number,height:number,webp:string,bytes:number,webpBytes:number}>} */
  const meta = {};
  let generated = 0;
  let reused = 0;

  const queue = [...files];
  const worker = async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const webpPath = file.replace(/\.(png|jpe?g)$/i, ".webp");
      const image = sharp(file);
      const info = await image.metadata();
      if (await isStale(file, webpPath)) {
        await image
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(webpPath);
        generated += 1;
      } else {
        reused += 1;
      }
      const [orig, webp] = await Promise.all([fs.stat(file), fs.stat(webpPath)]);
      const urlPath = `/${path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/")}`;
      meta[urlPath] = {
        width: info.width ?? 0,
        height: info.height ?? 0,
        webp: urlPath.replace(/\.(png|jpe?g)$/i, ".webp"),
        bytes: orig.size,
        webpBytes: webp.size,
      };
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await fs.mkdir(path.dirname(META_FILE), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(META_FILE, `${JSON.stringify(sorted)}\n`);

  const totalOrig = Object.values(meta).reduce((n, m) => n + m.bytes, 0);
  const totalWebp = Object.values(meta).reduce((n, m) => n + m.webpBytes, 0);
  const mb = (n) => (n / 1024 / 1024).toFixed(1);
  console.log(
    `[build-webp] ${files.length} images (generated ${generated}, reused ${reused}) ` +
      `${mb(totalOrig)}MB → ${mb(totalWebp)}MB in ${((Date.now() - started) / 1000).toFixed(1)}s`
  );
}

main().catch((error) => {
  console.error("[build-webp] failed:", error);
  process.exit(1);
});
