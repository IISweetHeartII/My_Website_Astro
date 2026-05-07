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

function getTitleFontSize(title: string): string {
  if (title.length > 50) return "34px";
  if (title.length > 30) return "44px";
  return "54px";
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
          justifyContent: "space-between",
          alignItems: "stretch",
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 40%, #6d28d9 70%, #a855f7 100%)",
          fontFamily: "Noto Sans KR",
          overflow: "hidden",
        },
        children: [
          // Top decorative row: left accent bar + category badge
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingTop: "56px",
                paddingLeft: "60px",
                paddingRight: "60px",
                gap: "20px",
              },
              children: [
                // Left vertical accent bar
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      width: "5px",
                      height: "32px",
                      borderRadius: "3px",
                      background: "#c084fc",
                    },
                    children: "",
                  },
                },
                // Category badge (or site name if no category)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.90)",
                      background: "rgba(192,132,252,0.18)",
                      padding: "7px 22px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(192,132,252,0.35)",
                      letterSpacing: "0.02em",
                    },
                    children: category || "log8.kr",
                  },
                },
              ],
            },
          },

          // Center: title block
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                flex: 1,
                paddingLeft: "64px",
                paddingRight: "80px",
                paddingTop: "20px",
                paddingBottom: "20px",
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
                      lineHeight: 1.35,
                      maxWidth: "1000px",
                      wordBreak: "keep-all",
                      textShadow: "0 2px 24px rgba(109,40,217,0.4)",
                    },
                    children: title,
                  },
                },
              ],
            },
          },

          // Bottom row: divider + branding
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
                // Divider line
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      width: "100%",
                      height: "1px",
                      background: "rgba(192,132,252,0.30)",
                    },
                    children: "",
                  },
                },
                // Branding row
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
                      // Left: heart + domain
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
                            // Brand mark — purple dot (heart glyph not in Noto Sans KR Korean subset)
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "9999px",
                                  background: "#c084fc",
                                  boxShadow: "0 0 12px rgba(192,132,252,0.6)",
                                },
                                children: "",
                              },
                            },
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  fontSize: "22px",
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.92)",
                                  letterSpacing: "0.01em",
                                },
                                children: "log8.kr",
                              },
                            },
                          ],
                        },
                      },
                      // Right: role
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "rgba(192,132,252,0.85)",
                            letterSpacing: "0.02em",
                          },
                          children: "AI Product Engineer",
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

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(buffer);
}
