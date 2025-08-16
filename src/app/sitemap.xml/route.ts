import { listLegacyMarkdown } from "@/features/blog/lib/fs";

export async function GET() {
  const site = "https://log8.kr"; // TODO: env로 분리 가능
  const posts = listLegacyMarkdown();
  const urls = [
    "/",
    "/blog",
    "/who-is-dh",
    "/contact",
    ...posts.map((p) => `/blog/${encodeURIComponent(p.slug)}`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (u) => `
      <url>
        <loc>${site}${u}</loc>
      </url>`
      )
      .join("")}
  </urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
