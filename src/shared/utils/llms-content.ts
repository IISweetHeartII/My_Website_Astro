import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/shared/config/consts";
import { getEntryPath, isPublishedInLocale, type LocalizedCollection } from "@/shared/i18n/ui";

// Curated (non-full) view keeps at most this many recent posts per category,
// so the plain-text index stays scannable for a ~200-post library.
const CATEGORY_ITEM_LIMIT = 8;

type LlmsEntry = {
  title: string;
  description: string;
  url: string;
  category: string;
  date: number;
};

const toEntry = <C extends LocalizedCollection>(
  collection: C,
  post: CollectionEntry<C>
): LlmsEntry => ({
  title: post.data.title,
  description: post.data.description || post.data.subtitle || "",
  url: `${SITE_URL}${getEntryPath(collection, post)}`,
  category: post.data.category,
  date: post.data.created_date?.getTime() ?? 0,
});

const byDateDesc = (a: LlmsEntry, b: LlmsEntry) => b.date - a.date;

// Groups entries by category, sorted newest-first within each group, and
// orders categories by post count so the biggest topics surface first.
const groupByCategory = (entries: LlmsEntry[]): Map<string, LlmsEntry[]> => {
  const groups = new Map<string, LlmsEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.category) ?? [];
    list.push(entry);
    groups.set(entry.category, list);
  }
  for (const list of groups.values()) list.sort(byDateDesc);
  return new Map([...groups.entries()].sort((a, b) => b[1].length - a[1].length));
};

const renderCategorySection = (heading: string, entries: LlmsEntry[], limit?: number): string => {
  const groups = groupByCategory(entries);
  const lines = [`## ${heading}`, ""];
  for (const [category, categoryEntries] of groups) {
    const items = limit ? categoryEntries.slice(0, limit) : categoryEntries;
    lines.push(`### ${category}`, "");
    for (const entry of items) {
      lines.push(`- [${entry.title}](${entry.url}): ${entry.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
};

/**
 * Builds the llms.txt content by reading published content collections
 * directly, so the file always reflects what is actually live on the site.
 *
 * `full=false` (default) caps each category to the most recent
 * CATEGORY_ITEM_LIMIT posts, matching the concise, hand-curated style of the
 * old public/llms.txt. `full=true` lists every published post (llms-full.txt).
 */
export const buildLlmsText = async (full = false): Promise<string> => {
  const limit = full ? undefined : CATEGORY_ITEM_LIMIT;

  const blogEntries = (await getCollection("blog"))
    .filter((post) => isPublishedInLocale(post, "ko"))
    .map((post) => toEntry("blog", post));

  const libraryEntries = (await getCollection("library"))
    .filter((post) => isPublishedInLocale(post, "ko"))
    .map((post) => toEntry("library", post));

  const guideEntries = (await getCollection("guides"))
    .filter((guide) => guide.data.publish !== false && guide.data.draft !== true)
    .map((guide) => {
      const slug = guide.data.slug ?? guide.id.replace(/\.[^/.]+$/, "");
      return {
        title: guide.data.title,
        description: guide.data.description || guide.data.subtitle || "",
        url: `${SITE_URL}/guides/${slug}/`,
        category: guide.data.category,
        date: guide.data.created_date?.getTime() ?? 0,
      } satisfies LlmsEntry;
    })
    .sort(byDateDesc);

  const sections = [
    `# ${SITE_TITLE} (log8.kr)`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## 저자 소개",
    "",
    `- [소개](${SITE_URL}/about): ${SITE_AUTHOR}의 경력과 관심사 소개`,
    `- [포트폴리오](${SITE_URL}/portfolio): 프로젝트와 기술 스택 소개`,
    `- [이력서](${SITE_URL}/resume): ${SITE_AUTHOR}의 이력서`,
    "",
    renderCategorySection("Blog", blogEntries, limit),
    renderCategorySection("Library", libraryEntries, limit),
  ];

  if (guideEntries.length > 0) {
    sections.push("## Guides", "");
    for (const entry of guideEntries) {
      sections.push(`- [${entry.title}](${entry.url}): ${entry.description}`);
    }
    sections.push("");
  }

  return `${sections.join("\n").trim()}\n`;
};
