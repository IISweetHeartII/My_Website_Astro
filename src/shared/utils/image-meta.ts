import fs from "node:fs";
import path from "node:path";

/**
 * scripts/build-webp.mjs 가 만든 이미지 메타(원본 크기·WebP 경로).
 * 빌드 시점(Node)에만 읽는다. 파일이 없으면(예: 스크립트 없이 dev 실행) 빈 메타 → 원본 <img> 그대로.
 */
export interface ImageMeta {
  width: number;
  height: number;
  webp: string;
  bytes: number;
  webpBytes: number;
}

const META_FILE = path.resolve(process.cwd(), "src/shared/generated/image-meta.json");
let cache: Record<string, ImageMeta> | null = null;

function load(): Record<string, ImageMeta> {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(META_FILE, "utf8")) as Record<string, ImageMeta>;
  } catch {
    cache = {};
  }
  return cache;
}

/** `/images/...png` 같은 public 경로로 조회. 없으면 undefined. */
export function getImageMeta(src: string | undefined): ImageMeta | undefined {
  if (!src) return undefined;
  const key = src.startsWith("/") ? src : `/${src}`;
  return load()[key.split("?")[0] ?? key];
}
