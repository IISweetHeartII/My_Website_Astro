import type { APIRoute, GetStaticPaths } from "astro";
import { generateOgImage } from "@/shared/utils/og-image";

const PAGE_OG_PRESETS = {
  home: { title: "김덕환의 WebSite", category: "Home" },
  blog: { title: "Blog | Log8", category: "Insights" },
  category: { title: "Category Archive | Log8", category: "Blog" },
  showcase: { title: "Showcase | Log8", category: "Projects" },
  portfolio: { title: "Portfolio | Log8", category: "Career" },
  resume: { title: "Resume | Log8", category: "Career" },
  privacy: { title: "Privacy | Log8", category: "Policy" },
  notfound: { title: "404 | Log8", category: "Error" },
} as const;

type PagePresetKey = keyof typeof PAGE_OG_PRESETS;

export const getStaticPaths: GetStaticPaths = async () => {
  return (Object.keys(PAGE_OG_PRESETS) as PagePresetKey[]).map((page) => ({
    params: { page },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const { page } = params;
  const pageKey = page as PagePresetKey;
  const preset = PAGE_OG_PRESETS[pageKey] || PAGE_OG_PRESETS.home;

  const png = await generateOgImage(preset.title, preset.category);

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
