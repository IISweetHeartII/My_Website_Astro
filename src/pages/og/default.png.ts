import type { APIRoute } from "astro";
import { SITE_TITLE } from "@/shared/config/consts";
import { generateOgImage } from "@/shared/utils/og-image";

export const GET: APIRoute = async () => {
  const png = await generateOgImage(SITE_TITLE, "Product Engineer");

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
