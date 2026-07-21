import type { CollectionEntry } from "astro:content";

export const DEFAULT_LOCALE = "ko";
export const SUPPORTED_LOCALES = ["ko", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocalizedCollection = "blog" | "library";

export const localeNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

export const localeLabels: Record<Locale, string> = {
  ko: "KO",
  en: "EN",
};

export const htmlLang: Record<Locale, string> = {
  ko: "ko",
  en: "en",
};

export const ogLocale: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};

export const localeRegion: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
};

export const ui = {
  ko: {
    siteTitle: "김덕환의 WebSite",
    search: "검색",
    searchClose: "검색 닫기",
    searchUnavailable:
      "검색 인덱스를 불러오지 못했습니다. `bun run build` 후 `bun run preview`로 확인해주세요.",
    themeToggle: "테마 전환",
    skipToContent: "본문으로 바로가기",
    about: "About",
    work: "Work",
    blog: "Blog",
    library: "Library",
    guides: "Guides",
    portfolio: "Portfolio",
    resume: "Resume",
    readMore: "Read More",
    backToLibrary: "Library로 돌아가기",
    chatOpen: "채팅 열기",
    chatTitle: "김덕환에게 물어보세요",
    chatSubtitle: "AI가 답변해드려요",
    chatNew: "새 채팅",
    chatClose: "채팅 닫기",
    chatWelcome:
      "안녕하세요! 김덕환에 대해 궁금한 것이 있으시면 편하게 물어보세요.<br><br>프로젝트, 기술 스택, 경력 등 무엇이든 질문해주세요!",
    chatSuggestionProjects: "최근 프로젝트가 뭔가요?",
    chatSuggestionTechStack: "기술 스택을 알려주세요",
    chatSuggestionAwards: "수상 경력이 있나요?",
    chatSuggestionContact: "연락처가 어떻게 돼요?",
    chatInputPlaceholder: "메시지를 입력하세요...",
    chatInputLabel: "메시지 입력",
    chatSend: "전송",
    chatThinking: "생각하는 중...",
    chatRequestError: "일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
    chatEmptyResponse: "답변을 생성하지 못했어요. 질문을 다시 해주세요.",
    chatConnectionError: "연결이 불안정해요. 인터넷 연결을 확인해주세요.",
  },
  en: {
    siteTitle: "Deokhwan Kim",
    search: "Search",
    searchClose: "Close search",
    searchUnavailable:
      "Search is unavailable. Run `bun run build`, then use `bun run preview` to check it.",
    themeToggle: "Toggle theme",
    skipToContent: "Skip to content",
    about: "About",
    work: "Work",
    blog: "Blog",
    library: "Library",
    guides: "Guides",
    portfolio: "Portfolio",
    resume: "Resume",
    readMore: "Read More",
    backToLibrary: "Back to Library",
    chatOpen: "Open chat",
    chatTitle: "Ask Kim Deog Hwan",
    chatSubtitle: "AI will answer",
    chatNew: "New chat",
    chatClose: "Close chat",
    chatWelcome:
      "Hello! Feel free to ask anything about Kim Deog Hwan.<br><br>Ask about his projects, tech stack, experience, or anything else!",
    chatSuggestionProjects: "What have you been working on recently?",
    chatSuggestionTechStack: "What technologies do you work with?",
    chatSuggestionAwards: "Have you won any awards?",
    chatSuggestionContact: "How can I contact you?",
    chatInputPlaceholder: "Type a message...",
    chatInputLabel: "Message input",
    chatSend: "Send",
    chatThinking: "Thinking...",
    chatRequestError: "Something went wrong. Please try again in a moment.",
    chatEmptyResponse: "I couldn't generate a response. Please try asking again.",
    chatConnectionError: "The connection seems unstable. Please check your internet connection.",
  },
} satisfies Record<Locale, Record<string, string>>;

export const isLocale = (value: string | undefined): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

export const getLocaleFromPathname = (pathname: string): Locale => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
};

export const stripLocaleFromPath = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  const stripped = `/${segments.join("/")}`;
  return stripped === "/" ? "/" : `${stripped.replace(/\/+$/, "")}/`;
};

export const withLocalePath = (pathname: string, locale: Locale): string => {
  const stripped = stripLocaleFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return stripped;
  return stripped === "/" ? `/${locale}/` : `/${locale}${stripped}`;
};

export const getEntrySlug = (entry: CollectionEntry<LocalizedCollection>): string =>
  entry.data.slug ?? entry.id.replace(/^en\//, "").replace(/\.[^/.]+$/, "");

export const getEntryLocale = (entry: CollectionEntry<LocalizedCollection>): Locale =>
  entry.data.lang === "en" || entry.id.startsWith("en/") ? "en" : "ko";

export const getEntryPath = (
  collection: LocalizedCollection,
  entry: CollectionEntry<LocalizedCollection>
): string => withLocalePath(`/${collection}/${getEntrySlug(entry)}/`, getEntryLocale(entry));

export const isPublishedInLocale = (
  entry: CollectionEntry<LocalizedCollection>,
  locale: Locale
): boolean =>
  entry.data.publish !== false && entry.data.draft !== true && getEntryLocale(entry) === locale;

/**
 * Routes that are built in every locale. Article routes are not listed here:
 * whether they have a counterpart depends on the translation existing, which
 * getTranslationPaths answers. Paginated indexes are excluded because locale
 * post counts differ, so the same page number may not be built in both locales.
 */
const LOCALIZED_COUNTERPART_ROUTES = new Set([
  "/",
  "/about/",
  "/portfolio/",
  "/resume/",
  "/blog/",
  "/library/",
]);

export const hasLocalizedCounterpart = (pathname: string): boolean =>
  LOCALIZED_COUNTERPART_ROUTES.has(stripLocaleFromPath(pathname));

/**
 * Paths of a piece of content in both locales, or null when it is only
 * published in one. Used for the hreflang tags and for deciding whether the
 * language switch has anywhere to go.
 */
export const getTranslationPaths = async (
  collection: LocalizedCollection | undefined,
  translationKey: string | null | undefined
): Promise<Record<Locale, string> | null> => {
  if (!collection || !translationKey) return null;

  const { getCollection } = await import("astro:content");
  const entries = await getCollection(
    collection,
    ({ data }: CollectionEntry<LocalizedCollection>) => data.translationKey === translationKey
  );

  const ko = entries.find((entry) => isPublishedInLocale(entry, "ko"));
  const en = entries.find((entry) => isPublishedInLocale(entry, "en"));
  if (!ko || !en) return null;

  return { ko: getEntryPath(collection, ko), en: getEntryPath(collection, en) };
};
