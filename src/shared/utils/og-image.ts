import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import { SITE_AUTHOR, SITE_TITLE } from "@/shared/config/consts";

const NOTO_SANS_KR_FONT_PATH = path.join(process.cwd(), "src/assets/fonts/noto-sans-kr-700.ttf");

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

  const fontBuffer = await readFile(NOTO_SANS_KR_FONT_PATH);
  fontCache = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  ) as ArrayBuffer;
  return fontCache;
}

function getTitleFontSize(title: string): string {
  if (title.length > 64) return "32px";
  if (title.length > 48) return "38px";
  if (title.length > 30) return "46px";
  return "56px";
}

export interface OgImageOptions {
  title: string;
  category?: string | null;
  author?: string | null;
  collection?: "blog" | "library" | "guides" | "page" | "default";
  siteName?: string;
}

function normalizeOgOptions(
  titleOrOptions: string | OgImageOptions,
  category?: string
): OgImageOptions {
  if (typeof titleOrOptions === "string") {
    return {
      title: titleOrOptions,
      category,
      author: SITE_AUTHOR,
      collection: "blog",
      siteName: SITE_TITLE,
    };
  }

  return {
    author: SITE_AUTHOR,
    collection: "blog",
    siteName: SITE_TITLE,
    ...titleOrOptions,
  };
}

function getCollectionLabel(collection: OgImageOptions["collection"]): string {
  if (collection === "library") return "Library";
  if (collection === "guides") return "Guides";
  if (collection === "page") return "Page";
  return "Blog";
}

// Use the existing satori + sharp dependency pair instead of adding astro-og-canvas:
// it keeps the Astro endpoint lightweight, produces deterministic PNGs at build time,
// and lets us embed the Korean font from the repository instead of relying on system fonts.
export async function generateOgImage(
  titleOrOptions: string | OgImageOptions,
  category?: string
): Promise<Uint8Array> {
  const {
    title,
    author,
    collection,
    siteName,
    category: optionCategory,
  } = normalizeOgOptions(titleOrOptions, category);
  const categoryLabel = category ?? optionCategory;
  const fontData = await loadFont();
  const collectionLabel = getCollectionLabel(collection);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 38%, #6d28d9 68%, #a855f7 100%)",
          fontFamily: "Noto Sans KR",
          overflow: "hidden",
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "-140px",
                top: "-140px",
                width: "420px",
                height: "420px",
                borderRadius: "9999px",
                background: "rgba(216,180,254,0.18)",
              },
              children: "",
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: "-120px",
                bottom: "-160px",
                width: "520px",
                height: "520px",
                borderRadius: "9999px",
                background: "rgba(49,46,129,0.42)",
              },
              children: "",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "56px",
                paddingLeft: "64px",
                paddingRight: "64px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "16px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            width: "5px",
                            height: "34px",
                            borderRadius: "3px",
                            background: "#d8b4fe",
                          },
                          children: "",
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.92)",
                            background: "rgba(192,132,252,0.20)",
                            padding: "8px 22px",
                            borderRadius: "9999px",
                            border: "1px solid rgba(216,180,254,0.38)",
                            letterSpacing: "0.02em",
                          },
                          children: categoryLabel || collectionLabel,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.82)",
                      background: "rgba(15,23,42,0.18)",
                      padding: "8px 18px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(255,255,255,0.14)",
                    },
                    children: collectionLabel,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                flex: 1,
                paddingLeft: "68px",
                paddingRight: "88px",
                paddingTop: "22px",
                paddingBottom: "24px",
                gap: "24px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: getTitleFontSize(title),
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.32,
                      maxWidth: "1020px",
                      wordBreak: "keep-all",
                      textShadow: "0 3px 28px rgba(30,27,75,0.46)",
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "rgba(233,213,255,0.92)",
                      letterSpacing: "0.01em",
                    },
                    children: author ? `by ${author}` : siteName,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                paddingLeft: "64px",
                paddingRight: "64px",
                paddingBottom: "52px",
                gap: "20px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      width: "100%",
                      height: "1px",
                      background: "rgba(216,180,254,0.30)",
                    },
                    children: "",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "12px",
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "9999px",
                                  background: "#d8b4fe",
                                  boxShadow: "0 0 14px rgba(216,180,254,0.65)",
                                },
                                children: "",
                              },
                            },
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  fontSize: "23px",
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.94)",
                                  letterSpacing: "0.01em",
                                },
                                children: "log8.kr",
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "rgba(216,180,254,0.88)",
                            letterSpacing: "0.02em",
                          },
                          children: siteName,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const svgBytes = new TextEncoder().encode(svg);
  const buffer = await sharp(svgBytes).png().toBuffer();
  return new Uint8Array(buffer);
}
