import { notFound } from "next/navigation";
import { readLegacyMarkdown } from "@/features/blog/lib/fs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { parseMdx } from "@/features/blog/lib/markdown";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = readLegacyMarkdown(slug);
  if (!post) return notFound();
  const { mdx } = await parseMdx(post.content);
  return (
    <main className="section">
      <div className="container-responsive prose prose-zinc dark:prose-invert max-w-3xl">
        <h1>{post.title}</h1>
        <MDXRemote source={mdx} />
      </div>
    </main>
  );
}
