import Link from "next/link";
import { listLegacyMarkdown } from "@/features/blog/lib/fs";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = listLegacyMarkdown();
  return (
    <main className="section">
      <div className="container-responsive">
        <h1 className="text-3xl font-bold">블로그</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Astro의 콘텐츠를 임시로 파일 시스템에서 읽어와 렌더링합니다.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug} className="card flex flex-col">
              {p.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.featuredImage}
                  alt={p.featuredImageAlt || p.title}
                  className="rounded-md w-full h-40 object-cover"
                  loading="lazy"
                />
              )}
              <div className="mt-4">
                <h2 className="font-semibold text-lg line-clamp-2">
                  {p.title}
                </h2>
                {p.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                )}
                {p.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                    {p.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${encodeURIComponent(p.slug)}`}
                  className="btn btn-primary mt-4 inline-block">
                  읽기
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
