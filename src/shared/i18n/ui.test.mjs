import { describe, expect, test } from "bun:test";
import { buildSystemPromptBase, normalizeLocale } from "../../../functions/api/chat.ts";
import { createChatRequestBody } from "../scripts/chat-widget.ts";
import { hasLocalizedCounterpart, stripLocaleFromPath } from "./ui.ts";

describe("hasLocalizedCounterpart", () => {
  test.each(["/blog/2/", "/library/2/", "/guides/"])("returns false for %s", (pathname) => {
    expect(hasLocalizedCounterpart(pathname)).toBe(false);
  });

  test("strips locale prefixes before checking localized routes", () => {
    expect(hasLocalizedCounterpart("/en/about/")).toBe(hasLocalizedCounterpart("/about/"));
  });
});

describe("stripLocaleFromPath", () => {
  test.each([
    ["/en/", "/"],
    ["/en/about", "/about/"],
    ["/en/blog/2/", "/blog/2/"],
    ["/about/", "/about/"],
  ])("normalizes %s to %s", (pathname, expected) => {
    expect(stripLocaleFromPath(pathname)).toBe(expected);
  });
});

describe("chat locale", () => {
  test("includes the widget locale in the API request body", () => {
    const messages = [{ role: "user", content: "What do you build?" }];
    expect(createChatRequestBody(messages, "en")).toEqual({ messages, locale: "en" });
  });

  test("defaults absent and unexpected request locales to Korean", () => {
    expect(normalizeLocale(undefined)).toBe("ko");
    expect(normalizeLocale("fr")).toBe("ko");
    expect(normalizeLocale("ko")).toBe("ko");
    expect(normalizeLocale("en")).toBe("en");
  });

  test("uses English instructions while reading Korean source material", () => {
    const prompt = buildSystemPromptBase("en");
    expect(prompt).toContain("Answer in English");
    expect(prompt).toContain("source material and post index below are in Korean");
    expect(prompt).not.toContain("한국어로 답변해주세요");
  });
});
