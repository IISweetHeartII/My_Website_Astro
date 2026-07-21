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
    search: "검색",
    themeToggle: "테마 전환",
    skipToContent: "본문으로 바로가기",
    about: "About",
    work: "Work",
    blog: "Blog",
    library: "Library",
    guides: "Guides",
    showcase: "Showcase",
    portfolio: "Portfolio",
    resume: "Resume",
    readMore: "Read More",
    backToLibrary: "Library로 돌아가기",
  },
  en: {
    search: "Search",
    themeToggle: "Toggle theme",
    skipToContent: "Skip to content",
    about: "About",
    work: "Work",
    blog: "Blog",
    library: "Library",
    guides: "Guides",
    showcase: "Showcase",
    portfolio: "Portfolio",
    resume: "Resume",
    readMore: "Read More",
    backToLibrary: "Back to Library",
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
 * getTranslationPaths answers.
 */
const LOCALIZED_INDEX_ROUTE = /^\/(blog|library)\/(\d+\/)?$/;

export const hasLocalizedIndex = (pathname: string): boolean => {
  const stripped = stripLocaleFromPath(pathname);
  return stripped === "/" || LOCALIZED_INDEX_ROUTE.test(stripped);
};

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
