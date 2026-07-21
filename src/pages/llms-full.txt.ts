import type { APIRoute } from "astro";
import { buildLlmsText } from "@/shared/utils/llms-content";

export const GET: APIRoute = async () => {
  const content = await buildLlmsText(true);

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
