import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { generateOgImage } from "@/shared/utils/og-image";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");
  return posts.map((post) => {
    const slug = post.data.slug || post.id.replace(/\.[^/.]+$/, "");
    return {
      params: { slug },
      props: {
        title: post.data.title,
        category: post.data.category,
      },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category } = props as { title: string; category?: string };
  const png = await generateOgImage(title, category);

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
