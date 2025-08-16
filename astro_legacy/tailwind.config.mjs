const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 시스템 - 일관성 있는 네이밍
        primary: {
          DEFAULT: "#485E8E", // 블루그레이: 헤더, 메인 브랜드
          light: "#8590B3", // 뮤트퍼플: 서브 컬러
          lighter: "#E5F0FF", // 밝은 블루: 배경용
        },

        // 악센트 컬러 - 브랜드 강조
        accent: {
          DEFAULT: "#00FF6A", // 형광 연두: CTA, 중요 요소
          light: "#66FF9A", // 밝은 형광 연두: 호버 효과
          coral: "#FF6B6B", // 코랄: 호버, 경고
          mint: "#2DD4BF", // 민트: 성공, 보조 강조
        },

        // 기본 색상 시스템
        background: {
          DEFAULT: "#FFFFFF", // 메인 배경
          light: "#F9FAFB", // 서브 배경
          lighter: "#E5F0FF", // 밝은 블루: 배경용
        },

        text: {
          DEFAULT: "#1F2937", // 기본 텍스트
          light: "#6B7280", // 보조 텍스트
          lighter: "#9CA3AF", // 연한 텍스트
          muted: "#9CA3AF", // 뮤트 텍스트
        },

        // 상태 색상
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        error: {
          DEFAULT: "#EF4444",
          dark: "#DC2626",
          light: "#FEE2E2",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
        },

        // Tailwind 호환성을 위한 그레이 스케일
        gray: colors.neutral,
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            h1: {
              color: theme("colors.primary.DEFAULT"),
              fontWeight: "700",
            },
            h2: {
              color: theme("colors.accent.DEFAULT"),
              fontWeight: "600",
            },
            h3: {
              color: theme("colors.text.DEFAULT"),
              fontWeight: "600",
            },
            h4: {
              color: theme("colors.text.DEFAULT"),
              fontWeight: "500",
            },
            a: {
              color: theme("colors.accent.DEFAULT"),
              textDecoration: "none",
              "&:hover": {
                color: theme("colors.accent.coral"),
                textDecoration: "underline",
              },
            },
            blockquote: {
              borderLeftColor: theme("colors.accent.DEFAULT"),
              color: theme("colors.text.light"),
              backgroundColor: theme("colors.background.light"),
              padding: "1rem 1.5rem",
              borderRadius: "0.5rem",
            },
            strong: {
              color: theme("colors.text.DEFAULT"),
              fontWeight: "600",
            },
            code: {
              color: theme("colors.accent.DEFAULT"),
              backgroundColor: theme("colors.background.light"),
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontSize: "0.875em",
            },
            pre: {
              backgroundColor: theme("colors.primary.DEFAULT"),
              color: theme("colors.background.DEFAULT"),
              borderRadius: "0.5rem",
            },
          },
        },
      }),
    },
  },
  plugins: [],
};
