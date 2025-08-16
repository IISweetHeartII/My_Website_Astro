import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getUrl } from "../utils/url";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => {
    return data.publish !== false;
  });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      ...post.data,
      title: post.data.title,
      description: post.data.description || "",
      pubDate: post.data.created_date || new Date(),
      link: getUrl(`/${post.id}/`),
      // Optional fields - null을 undefined로 변환
      author: post.data.author || undefined,
      categories: post.data.tags || [],
    })),
  });
}
