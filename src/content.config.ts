import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Custom date schema that handles invalid dates gracefully
const dateSchema = z.preprocess(
  (val) => {
    if (!val) return null;

    if (val instanceof Date) {
      return Number.isNaN(val.getTime()) ? null : val;
    }

    if (typeof val === "string" || typeof val === "number") {
      const date = new Date(val);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  },
  z
    .date()
    .nullable()
    .default(() => new Date())
);

const stripMarkdownExtension = (entry: string) => entry.replace(/\.(md|mdx)$/i, "");

const generateLocalizedId = ({ entry, data }: { entry: string; data: { slug?: unknown } }) => {
  const dataSlug = data.slug;
  const slug =
    typeof dataSlug === "string" && dataSlug.length > 0 ? dataSlug : stripMarkdownExtension(entry);
  return entry.startsWith("en/") ? `en/${slug}` : slug;
};

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
    generateId: generateLocalizedId,
  }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    publish: z.boolean().default(true),
    draft: z.boolean().default(false),
    lang: z.enum(["ko", "en"]).default("ko"),
    translationKey: z.string().optional().nullable(),
    source_hash: z.string().optional().nullable(),
    translated_at: z.string().optional().nullable(),
    created_date: dateSchema,
    updated_date: dateSchema,
    featured_image: z.string().optional().nullable(),
    featured_image_alt: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    category: z
      .enum(["일상", "개발", "AI", "보안", "교육", "DevOps", "생산성", "블로그운영"])
      .default("일상"),
    tags: z.array(z.string()).default([]).nullable(),
    // SEO specific fields
    meta_title: z.string().optional().nullable(),
    meta_description: z.string().optional().nullable(),
    canonical_url: z.string().optional().nullable(),
    og_title: z.string().optional().nullable(),
    og_description: z.string().optional().nullable(),
    og_image: z.string().optional().nullable(),
    og_type: z.string().default("article"),
    twitter_title: z.string().optional().nullable(),
    twitter_description: z.string().optional().nullable(),
    twitter_image: z.string().optional().nullable(),
    twitter_card: z.string().default("summary_large_image"),
    keywords: z.array(z.string()).default([]).nullable(),
    author: z.string().optional().nullable(),
    reading_time: z.number().optional().nullable(),
    series: z.string().optional().nullable(),
    series_order: z.number().optional().nullable(),
    no_index: z.boolean().default(false),
    // AEO: FAQ Schema (Answer Engine Optimization)
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional()
      .nullable(),
  }),
});

const requiredDateSchema = z.preprocess((val) => {
  if (val instanceof Date) return Number.isNaN(val.getTime()) ? undefined : val;

  if (typeof val === "string" || typeof val === "number") {
    const date = new Date(val);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}, z.date());

const library = defineCollection({
  loader: glob({
    base: "./src/content/library",
    pattern: "**/*.{md,mdx}",
    generateId: generateLocalizedId,
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    publish: z.boolean().default(true),
    draft: z.boolean().default(false),
    lang: z.enum(["ko", "en"]).default("ko"),
    translationKey: z.string().optional().nullable(),
    source_hash: z.string().optional().nullable(),
    translated_at: z.string().optional().nullable(),
    created_date: dateSchema,
    updated_date: dateSchema,
    featured_image: z.string().optional().nullable(),
    featured_image_alt: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    category: z.string().default("일반"),
    tags: z.array(z.string()).default([]).nullable(),
    agent: z.string().optional().nullable(),
    reading_time: z.number().optional().nullable(),
    youtube_id: z.string().optional().nullable(),
    // SEO
    meta_title: z.string().optional().nullable(),
    meta_description: z.string().optional().nullable(),
    keywords: z.array(z.string()).default([]).nullable(),
    og_title: z.string().optional().nullable(),
    og_description: z.string().optional().nullable(),
    og_image: z.string().optional().nullable(),
    og_type: z.string().default("article"),
    twitter_card: z.string().default("summary_large_image"),
    canonical_url: z.string().optional().nullable(),
    no_index: z.boolean().default(false),
  }),
});

const faqSchema = z.array(
  z.object({
    question: z.string(),
    answer: z.string(),
  })
);

const guides = defineCollection({
  loader: glob({ base: "./src/content/guides", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    publish: z.boolean().default(true),
    draft: z.boolean().default(false),
    created_date: dateSchema,
    updatedDate: requiredDateSchema,
    featured_image: z.string().optional().nullable(),
    featured_image_alt: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    category: z.string().default("Guides"),
    tags: z.array(z.string()).default([]).nullable(),
    reading_time: z.number().optional().nullable(),
    guideVersion: z.string(),
    toolVersion: z.string().optional().nullable(),
    faq: faqSchema,
    // SEO
    meta_title: z.string().optional().nullable(),
    meta_description: z.string().optional().nullable(),
    keywords: z.array(z.string()).default([]).nullable(),
    og_title: z.string().optional().nullable(),
    og_description: z.string().optional().nullable(),
    og_image: z.string().optional().nullable(),
    og_type: z.string().default("article"),
    twitter_card: z.string().default("summary_large_image"),
    canonical_url: z.string().optional().nullable(),
    no_index: z.boolean().default(false),
  }),
});

export const collections = { blog, library, guides };
