import { getCollection, render } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { SITE_TITLE } from "@/shared/config/consts";
import { getEntrySlug, isPublishedInLocale, withLocalePath } from "@/shared/i18n/ui";
import { getUrl } from "@/shared/utils/url";

const RSS_ITEM_LIMIT = 20;

const getPublishedAt = (post: Awaited<ReturnType<typeof getCollection<"blog">>>[number]) => {
  return post.data.created_date?.getTime() ?? 0;
};

const stripHtmlComments = (html: string) => html.replace(/<!--([\s\S]*?)-->/g, "");

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog")).filter((post) => isPublishedInLocale(post, "en"));
  const recentPosts = posts
    .sort((a, b) => getPublishedAt(b) - getPublishedAt(a))
    .slice(0, RSS_ITEM_LIMIT);
  const container = await AstroContainer.create();
  const items = await Promise.all(
    recentPosts.map(async (post) => {
      const { Content } = await render(post);
      const content = stripHtmlComments(await container.renderToString(Content));
      const slug = getEntrySlug(post);

      return {
        ...post.data,
        title: post.data.title,
        description: post.data.description || "",
        pubDate: post.data.created_date || new Date(),
        link: getUrl(withLocalePath(`/blog/${slug}/`, "en")),
        content,
        author: post.data.author || undefined,
        categories: post.data.tags || [],
      };
    })
  );

  return rss({
    title: `${SITE_TITLE} — English`,
    description: "English translations of selected Log8 posts.",
    site: context.site!,
    items,
  });
}
