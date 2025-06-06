const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB", // Using a light gray background
        primary: "#1F2937", // Primary text color
        accent: "#00FF6A", // Main accent color (형광 연두)
        highlight: "#FACC15", // Point highlight color
        blueGray: "#485E8E", // 블루그레이
        brightBlue: "#E5F0FF", // 밝은블루
        mutedPurple: "#8590B3", // 뮤트퍼플
        "palette-background-light": "#FFFFFF",
        "palette-background-grey": "#F9FAFB",
        "palette-text-dark": "#1F2937",
        "palette-accent-main": "#00FF6A",
        "palette-point-coral": "#FF6B6B",
        "palette-point-mint": "#2DD4BF",
        "palette-blue-grey": "#485E8E",
        "palette-light-blue": "#E5F0FF",
        "palette-mute-purple": "#8590B3",
        gray: colors.neutral,
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          a: {
            color: theme("colors.palette-accent-main"),
            "&:hover": {
              opacity: "0.8",
            },
          },
          blockquote: {
            borderLeftColor: theme("colors.palette-accent-main"),
            color: theme("colors.palette-text-dark"),
          },
          h2: {
            color: theme("colors.palette-text-dark"),
          },
          h3: {
            color: theme("colors.palette-text-dark"),
          },
          h4: {
            color: theme("colors.palette-text-dark"),
          },
          strong: {
            color: theme("colors.palette-text-dark"),
          },
          code: {
            // color: theme('colors.palette-text-dark'),
          },
          pre: {
            // backgroundColor: theme('colors.palette-background-grey'),
            // color: theme('colors.palette-text-dark'),
          },
        },
      }),
    },
  },
  plugins: [],
};
