import fs from "node:fs";
import path from "node:path";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const filePath = path.resolve("src/content/chat-context.md");
  const content = fs.readFileSync(filePath, "utf-8");

  return new Response(JSON.stringify({ content }), {
    headers: { "Content-Type": "application/json" },
  });
};
