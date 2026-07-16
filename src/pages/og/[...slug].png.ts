import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { SITE_AUTHOR } from "@/shared/config/consts";
import { getEntryLocale } from "@/shared/i18n/ui";
import { generateOgImage } from "@/shared/utils/og-image";

type OgCollection = "blog" | "library" | "guides";

interface OgPathProps {
  title: string;
  category?: string | null;
  author?: string | null;
  collection: OgCollection;
}

const stripMarkdownExtension = (id: string) => id.replace(/^en\//, "").replace(/\.[^/.]+$/, "");
const getContentSlug = (entry: { id: string; data: { slug?: string | null } }) =>
  entry.data.slug || stripMarkdownExtension(entry.id);

const hasManualThumbnail = (data: { featured_image?: string | null; og_image?: string | null }) =>
  Boolean(data.og_image || data.featured_image);

const getOgRouteSlug = (collection: OgCollection, slug: string, locale?: "ko" | "en") => {
  if (collection === "blog") return locale === "en" ? `en/blog/${slug}` : slug;
  if (collection === "library") return locale === "en" ? `en/library/${slug}` : `library/${slug}`;
  return `guides/${slug}`;
};

const getAgentDisplayName = (agent?: string | null) =>
  agent
    ? agent
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "AI Agent";

export const getStaticPaths: GetStaticPaths = async () => {
  const [blogPosts, libraryPosts, guides] = await Promise.all([
    getCollection("blog"),
    getCollection("library"),
    getCollection("guides"),
  ]);

  const blogPaths = blogPosts
    .filter((post) => post.data.publish !== false && post.data.draft !== true)
    .filter((post) => !hasManualThumbnail(post.data))
    .map((post) => {
      const slug = getContentSlug(post);
      const locale = getEntryLocale(post);
      return {
        params: { slug: getOgRouteSlug("blog", slug, locale) },
        props: {
          title: post.data.title,
          category: post.data.category,
          author: post.data.author || SITE_AUTHOR,
          collection: "blog",
        } satisfies OgPathProps,
      };
    });

  const libraryPaths = libraryPosts
    .filter((post) => post.data.publish !== false && post.data.draft !== true)
    .filter((post) => !hasManualThumbnail(post.data))
    .map((post) => {
      const slug = getContentSlug(post);
      const locale = getEntryLocale(post);
      return {
        params: { slug: getOgRouteSlug("library", slug, locale) },
        props: {
          title: post.data.title,
          category: post.data.category,
          author: getAgentDisplayName(post.data.agent),
          collection: "library",
        } satisfies OgPathProps,
      };
    });

  const guidePaths = guides
    .filter((guide) => guide.data.publish !== false && guide.data.draft !== true)
    .filter((guide) => !hasManualThumbnail(guide.data))
    .map((guide) => {
      const slug = getContentSlug(guide);
      return {
        params: { slug: getOgRouteSlug("guides", slug) },
        props: {
          title: guide.data.title,
          category: guide.data.category || "Guides",
          author: SITE_AUTHOR,
          collection: "guides",
        } satisfies OgPathProps,
      };
    });

  return [...blogPaths, ...libraryPaths, ...guidePaths];
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category, author, collection } = props as OgPathProps;
  const png = await generateOgImage({ title, category, author, collection });

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
