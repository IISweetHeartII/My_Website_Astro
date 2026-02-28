import { type CollectionEntry, getCollection } from "astro:content";
import { categoryMap } from "@/shared/config/categories";

/**
 * Get a valid timestamp from a date, or return 0 if invalid
 */
export function getValidTimestamp(date: Date | null | undefined): number {
  if (!date) return 0;
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

/**
 * Get all published blog posts
 */
export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const posts = await getCollection("blog");
  return posts.filter((post: CollectionEntry<"blog">) => post.data.publish);
}

/**
 * Sort posts by created date (newest first)
 */
export function sortPostsByDate(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] {
  return [...posts].sort((a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) => {
    const dateA = getValidTimestamp(a.data.created_date);
    const dateB = getValidTimestamp(b.data.created_date);
    return dateB - dateA;
  });
}

/**
 * Get the latest N posts
 */
export function getLatestPosts(
  posts: CollectionEntry<"blog">[],
  count: number
): CollectionEntry<"blog">[] {
  return sortPostsByDate(posts).slice(0, count);
}

/**
 * Get all published posts, sorted by date
 */
export async function getSortedPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const posts = await getPublishedPosts();
  return sortPostsByDate(posts);
}

/**
 * Transform a blog post for card/list display
 */
/**
 * Get related posts based on tag overlap and category match
 */
export function getRelatedPosts(
  currentPost: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  count = 3
): CollectionEntry<"blog">[] {
  const currentSlug = currentPost.data.slug || currentPost.id.replace(/\.[^/.]+$/, "");
  const currentTags = currentPost.data.tags ?? [];
  const currentCategory = currentPost.data.category;

  const scored = allPosts
    .filter((post) => {
      const slug = post.data.slug || post.id.replace(/\.[^/.]+$/, "");
      return slug !== currentSlug;
    })
    .map((post) => {
      const postTags = post.data.tags ?? [];
      const tagOverlap = postTags.filter((t: string) => currentTags.includes(t)).length;
      const categoryMatch = post.data.category === currentCategory ? 2 : 0;
      return { post, score: tagOverlap + categoryMatch };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map((item) => item.post);
}

/**
 * Transform a blog post for card/list display
 */
export function transformPostForCard(post: CollectionEntry<"blog">) {
  return {
    title: post.data.title,
    description: post.data.description ?? undefined,
    date: post.data.created_date ?? undefined,
    slug: post.data.slug ?? post.id.replace(/\.[^/.]+$/, ""),
    dataTags: post.data.tags ? post.data.tags.join(",") : "",
    dataTitle: post.data.title,
    dataDescription: post.data.description ?? "",
    dataCategory: categoryMap[post.data.category] || "daily",
  };
}
