/**
 * rehype 플러그인: 마크다운 본문의 `<img src="/images/...png|jpg">` 를
 * `<picture><source type="image/webp" srcset=".webp"><img width height loading=lazy decoding=async></picture>` 로 바꾼다.
 *
 * 데이터는 scripts/build-webp.mjs 가 만든 src/shared/generated/image-meta.json. 메타가 없는 이미지는 건드리지 않는다.
 * width/height 를 박아 CLS 를 없애고, WebP 형제가 있으면 브라우저가 그것을 받는다(원본 PNG 는 폴백).
 */
import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";

const META_FILE = path.resolve(process.cwd(), "src/shared/generated/image-meta.json");

function loadMeta() {
  try {
    return JSON.parse(fs.readFileSync(META_FILE, "utf8"));
  } catch {
    return {};
  }
}

export default function rehypePicture() {
  const meta = loadMeta();
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img" || !parent || typeof index !== "number") return;
      if (parent.type === "element" && parent.tagName === "picture") return; // 이미 처리됨
      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/images/")) return;
      const info = meta[src.split("?")[0]];
      if (!info) return;

      node.properties.width ??= info.width;
      node.properties.height ??= info.height;
      node.properties.loading ??= "lazy";
      node.properties.decoding ??= "async";

      parent.children[index] = {
        type: "element",
        tagName: "picture",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "source",
            properties: { type: "image/webp", srcSet: info.webp },
            children: [],
          },
          node,
        ],
      };
    });
  };
}
