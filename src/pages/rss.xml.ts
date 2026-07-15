import { getCollection, render } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/shared/config/consts";
import { getUrl } from "@/shared/utils/url";

const RSS_ITEM_LIMIT = 20;

const getPublishedAt = (post: Awaited<ReturnType<typeof getCollection<"blog">>>[number]) => {
  return post.data.created_date?.getTime() ?? 0;
};

const stripHtmlComments = (html: string) => html.replace(/<!--([\s\S]*?)-->/g, "");

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => {
    return data.publish !== false;
  });
  const recentPosts = posts
    .sort((a, b) => getPublishedAt(b) - getPublishedAt(a))
    .slice(0, RSS_ITEM_LIMIT);
  const container = await AstroContainer.create();
  const items = await Promise.all(
    recentPosts.map(async (post) => {
      const { Content } = await render(post);
      const content = stripHtmlComments(await container.renderToString(Content));

      return {
        ...post.data,
        title: post.data.title,
        description: post.data.description || "",
        pubDate: post.data.created_date || new Date(),
        link: getUrl(`/blog/${post.data.slug || post.id.replace(/\.[^/.]+$/, "")}/`),
        content,
        // Optional fields - null을 undefined로 변환
        author: post.data.author || undefined,
        categories: post.data.tags || [],
      };
    })
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items,
  });
}
