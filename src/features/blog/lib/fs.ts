import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";
import type { BlogPost, BlogPostMeta, BlogFrontmatter } from "../types";

const LEGACY_DIR = join(
  process.cwd(),
  "astro_legacy",
  "src",
  "content",
  "blog"
);

export function listLegacyMarkdown(): BlogPostMeta[] {
  try {
    const files = readdirSync(LEGACY_DIR).filter((f) => f.endsWith(".md"));
    return files.map((filename) => {
      const raw = readFileSync(join(LEGACY_DIR, filename), "utf8");
      const { data } = matter(raw) as unknown as { data: BlogFrontmatter };
      const slug = data.slug || stripMd(basename(filename));
      const title = data.title || inferTitleFromFilename(filename);
      const createdAt = data.created_date;
      const excerpt = data.description || data.subtitle || data.excerpt;
      return {
        filename,
        slug,
        title,
        createdAt,
        excerpt,
        featuredImage: data.featured_image,
        featuredImageAlt: data.featured_image_alt,
        tags: data.tags,
      };
    });
  } catch {
    return [];
  }
}

export function readLegacyMarkdown(slug: string): BlogPost | null {
  const file = join(LEGACY_DIR, `${slug}.md`);
  try {
    const content = readFileSync(file, "utf8");
    const { data } = matter(content) as unknown as { data: BlogFrontmatter };
    const title = data.title || inferTitleFromFilename(`${slug}.md`);
    return {
      slug,
      title,
      filename: `${slug}.md`,
      createdAt: data.created_date,
      excerpt: data.description || data.subtitle || data.excerpt,
      featuredImage: data.featured_image,
      featuredImageAlt: data.featured_image_alt,
      tags: data.tags,
      content,
      frontmatter: data,
    };
  } catch {
    return null;
  }
}

function stripMd(name: string) {
  return name.replace(/\.mdx?$/i, "");
}

function inferTitleFromFilename(filename: string) {
  const noExt = stripMd(filename);
  return noExt.replace(/^\d+\.\s*/, "");
}
