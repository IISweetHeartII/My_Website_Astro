import satori from "satori";
import sharp from "sharp";

const NOTO_SANS_KR_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.ttf";

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

  const res = await fetch(NOTO_SANS_KR_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch font: ${res.status}`);
  }
  fontCache = await res.arrayBuffer();
  return fontCache;
}

export async function generateOgImage(title: string, category?: string): Promise<Uint8Array> {
  const fontData = await loadFont();

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          padding: "60px",
          fontFamily: "Noto Sans KR",
        },
        children: [
          // Category badge
          ...(category
            ? [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "20px",
                      color: "rgba(255,255,255,0.85)",
                      background: "rgba(255,255,255,0.15)",
                      padding: "8px 24px",
                      borderRadius: "9999px",
                      marginBottom: "24px",
                      fontWeight: 700,
                    },
                    children: category,
                  },
                },
              ]
            : []),
          // Title
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: title.length > 30 ? "42px" : "52px",
                fontWeight: 700,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.3,
                maxWidth: "900px",
                wordBreak: "keep-all",
              },
              children: title,
            },
          },
          // Divider
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                width: "80px",
                height: "4px",
                background: "rgba(255,255,255,0.4)",
                borderRadius: "2px",
                marginTop: "40px",
                marginBottom: "32px",
              },
              children: "",
            },
          },
          // Bottom row: branding + author
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "16px",
                fontSize: "22px",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 700,
              },
              children: [
                {
                  type: "span",
                  props: {
                    children: "log8.kr",
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "rgba(255,255,255,0.4)" },
                    children: "·",
                  },
                },
                {
                  type: "span",
                  props: {
                    children: "김덕환",
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

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(buffer);
}
