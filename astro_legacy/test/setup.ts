import { expect } from "vitest";

// Mock import.meta.env for testing
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        BASE_URL: "/",
        MODE: "test",
        DEV: false,
        PROD: false,
        SSR: false,
      },
    },
  },
  writable: true,
});

// Astro 컴포넌트 테스트를 위한 기본 설정
global.document = globalThis.document;
