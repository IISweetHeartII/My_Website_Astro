import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getEntrySlug, isPublishedInLocale } from "@/shared/i18n/ui";

type IndexedPost = {
  title: string;
  description: string;
  slug: string;
  url: string;
  collection: "blog" | "library";
  category: string;
  tags: string[];
  keywords: string[];
  created_date: string | null;
};

export const GET: APIRoute = async () => {
  const [blogPosts, libraryPosts] = await Promise.all([
    getCollection("blog", (post) => isPublishedInLocale(post, "ko")),
    getCollection("library", (post) => isPublishedInLocale(post, "ko")),
  ]);

  const toIndexed = (
    post: (typeof blogPosts)[number] | (typeof libraryPosts)[number],
    collection: "blog" | "library"
  ): IndexedPost => {
    const slug = getEntrySlug(post);
    return {
      title: post.data.title,
      description: post.data.description ?? "",
      slug,
      url: `https://log8.kr/${collection}/${slug}/`,
      collection,
      category: post.data.category,
      tags: post.data.tags ?? [],
      keywords: post.data.keywords ?? [],
      created_date: post.data.created_date?.toISOString().split("T")[0] ?? null,
    };
  };

  const index = [
    ...blogPosts.map((post) => toIndexed(post, "blog")),
    ...libraryPosts.map((post) => toIndexed(post, "library")),
  ].sort((a, b) => (b.created_date ?? "").localeCompare(a.created_date ?? ""));

  return new Response(JSON.stringify({ posts: index }), {
    headers: { "Content-Type": "application/json" },
  });
};
