const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // 핵심 팔레트 - 의미론적 이름
        "surface-light": "#F9FAFB", // 일반적인 밝은 배경
        "surface-dark": "#FFFFFF", // 더 밝은 배경 (필요시 사용)
        "text-default": "#1F2937", // 기본 텍스트 색상

        // 브랜드 색상 - 김덕환님의 페르소나 반영
        "brand-primary": "#485E8E", // 블루그레이: 기술, 신뢰, 문제 해결
        "brand-secondary": "#8590B3", // 뮤트퍼플: 보완적, 세련됨

        // 악센트 색상 - 에너지, 생산성, 하이라이트
        "accent-vibrant": "#00FF6A", // 형광 연두: 고에너지, CTA

        // 보조 색상 - 부드러운 배경, 테두리 등
        "ui-light-blue": "#E5F0FF", // 밝은 블루: 가벼운 UI 요소

        // Tailwind CSS 기본 중립 회색을 위한 별칭
        // 이전에 `colors.neutral`을 직접 참조했으므로, 더 이상 필요하지 않으면 삭제하거나 주석 처리할 수 있습니다.
        // 기존 CSS에서 `gray`를 사용하는 부분이 있다면 유지하는 것이 좋습니다.
        gray: colors.neutral, // tailwindcss/colors에서 중립 색상 가져옴
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          a: {
            color: theme("colors.accent-vibrant"), // 새 이름으로 업데이트
            "&:hover": {
              opacity: "0.8",
            },
          },
          blockquote: {
            borderLeftColor: theme("colors.accent-vibrant"), // 새 이름으로 업데이트
            color: theme("colors.text-default"), // 새 이름으로 업데이트
          },
          h2: {
            color: theme("colors.text-default"), // 새 이름으로 업데이트
          },
          h3: {
            color: theme("colors.text-default"), // 새 이름으로 업데이트
          },
          h4: {
            color: theme("colors.text-default"), // 새 이름으로 업데이트
          },
          strong: {
            color: theme("colors.text-default"), // 새 이름으로 업데이트
          },
          code: {
            // color: theme('colors.palette-text-dark'), // 주석 처리된 부분 유지
          },
          pre: {
            // backgroundColor: theme('colors.palette-background-grey'), // 주석 처리된 부분 유지
            // color: theme('colors.palette-text-dark'), // 주석 처리된 부분 유지
          },
        },
      }),
    },
  },
  plugins: [],
};
