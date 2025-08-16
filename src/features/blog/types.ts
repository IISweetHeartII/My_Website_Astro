export type BlogFrontmatter = {
  title?: string;
  subtitle?: string;
  description?: string;
  publish?: boolean;
  created_date?: string; // e.g. 2025-04-01
  updated_date?: string;
  featured_image?: string;
  featured_image_alt?: string;
  tags?: string[];
  slug?: string;
  excerpt?: string; // fallback field if present
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  filename: string;
  createdAt?: string; // ISO string
  excerpt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  tags?: string[];
};

export type BlogPost = BlogPostMeta & {
  content: string;
  frontmatter: BlogFrontmatter;
};
