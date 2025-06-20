import { describe, it, expect, beforeEach, vi } from "vitest";

// 환경 변수를 직접 조작하는 방식
const originalImportMeta = import.meta;

describe("URL utilities", () => {
  beforeEach(() => {
    // 각 테스트 전에 모듈 캐시 클리어
    vi.resetModules();
  });

  describe("getBaseUrl", () => {
    it("should return base URL without trailing slash for root path", async () => {
      // 환경 변수 설정
      vi.stubEnv("BASE_URL", "/");

      const { getBaseUrl } = await import("@/utils/url");
      const result = getBaseUrl();
      expect(result).toBe("");
    });

    it("should handle GitHub Pages URL with trailing slash", async () => {
      vi.stubEnv("BASE_URL", "/my-repo/");

      const { getBaseUrl } = await import("@/utils/url");
      const result = getBaseUrl();
      expect(result).toBe("/my-repo");
    });

    it("should handle GitHub Pages URL without trailing slash", async () => {
      vi.stubEnv("BASE_URL", "/my-repo");

      const { getBaseUrl } = await import("@/utils/url");
      const result = getBaseUrl();
      expect(result).toBe("/my-repo");
    });
  });

  describe("getUrl", () => {
    it("should generate correct URL for path with leading slash", async () => {
      vi.stubEnv("BASE_URL", "/");

      const { getUrl } = await import("@/utils/url");
      const result = getUrl("/blog/test-post");
      expect(result).toBe("/blog/test-post");
    });

    it("should generate correct URL for path without leading slash", async () => {
      vi.stubEnv("BASE_URL", "/");

      const { getUrl } = await import("@/utils/url");
      const result = getUrl("blog/test-post");
      expect(result).toBe("/blog/test-post");
    });

    it("should handle empty path", async () => {
      vi.stubEnv("BASE_URL", "/");

      const { getUrl } = await import("@/utils/url");
      const result = getUrl("");
      expect(result).toBe("/");
    });

    it("should remove duplicate slashes", async () => {
      vi.stubEnv("BASE_URL", "/");

      const { getUrl } = await import("@/utils/url");
      const result = getUrl("//blog//test-post//");
      expect(result).toBe("/blog/test-post/");
    });

    it("should work with GitHub Pages base URL", async () => {
      vi.stubEnv("BASE_URL", "/my-repo/");

      const { getUrl } = await import("@/utils/url");
      const result = getUrl("/blog/test-post");
      expect(result).toBe("/my-repo/blog/test-post");
    });

    it("should handle multiple consecutive slashes correctly", async () => {
      vi.stubEnv("BASE_URL", "/my-repo/");

      const { getUrl } = await import("@/utils/url");
      const result = getUrl("///blog///test-post///");
      expect(result).toBe("/my-repo/blog/test-post/");
    });
  });
});
