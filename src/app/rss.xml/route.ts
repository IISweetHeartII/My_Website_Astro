import { NextResponse } from "next/server";
import { listLegacyMarkdown } from "@/features/blog/lib/fs";

export async function GET() {
  const items = listLegacyMarkdown();
  const site = "https://log8.kr"; // TODO: env로 분리 가능
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>My Website RSS</title>
      <link>${site}</link>
      <description>Latest posts</description>
      ${items
        .map(
          (p) => `
        <item>
          <title><![CDATA[${p.title}]]></title>
          <link>${site}/blog/${encodeURIComponent(p.slug)}</link>
          <guid isPermaLink="false">${p.slug}</guid>
          ${
            p.createdAt
              ? `<pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>`
              : ""
          }
          ${
            p.excerpt
              ? `<description><![CDATA[${p.excerpt}]]></description>`
              : ""
          }
        </item>`
        )
        .join("")}
    </channel>
  </rss>`;
  return new NextResponse(rss, {
    headers: { "Content-Type": "application/xml" },
  });
}
