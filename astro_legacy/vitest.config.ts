import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./test/setup.ts",
      include: [
        "test/**/*.{test,spec}.{js,ts}",
        "src/**/*.{test,spec}.{js,ts}",
      ],
      exclude: ["node_modules", "dist", ".astro"],
    },
    resolve: {
      alias: {
        "@/": new URL("./src/", import.meta.url).pathname,
      },
    },
  })
);
