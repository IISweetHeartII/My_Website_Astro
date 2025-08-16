export function GET() {
  const content = `User-agent: *
Allow: /
Sitemap: https://log8.kr/sitemap.xml
`;
  return new Response(content, { headers: { "Content-Type": "text/plain" } });
}
