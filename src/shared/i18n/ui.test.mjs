import { describe, expect, test } from "bun:test";
import { hasLocalizedCounterpart } from "./ui.ts";

describe("hasLocalizedCounterpart", () => {
  test.each([
    "/",
    "/about/",
    "/portfolio/",
    "/resume/",
    "/blog/",
    "/library/",
  ])("returns true for %s", (pathname) => {
    expect(hasLocalizedCounterpart(pathname)).toBe(true);
  });

  test.each(["/blog/2/", "/library/2/", "/guides/"])("returns false for %s", (pathname) => {
    expect(hasLocalizedCounterpart(pathname)).toBe(false);
  });

  test("recognizes the English counterpart of a localized route", () => {
    expect(hasLocalizedCounterpart("/en/about/")).toBe(true);
  });
});
