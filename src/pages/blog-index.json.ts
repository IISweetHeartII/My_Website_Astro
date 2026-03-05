import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => data.publish);

  const index = posts
    .sort((a, b) => {
      const dateA = a.data.created_date?.getTime() ?? 0;
      const dateB = b.data.created_date?.getTime() ?? 0;
      return dateB - dateA;
    })
    .map((post) => ({
      title: post.data.title,
      description: post.data.description ?? "",
      slug: post.data.slug ?? post.id,
      category: post.data.category,
      tags: post.data.tags ?? [],
    }));

  return new Response(JSON.stringify({ posts: index }), {
    headers: { "Content-Type": "application/json" },
  });
};
