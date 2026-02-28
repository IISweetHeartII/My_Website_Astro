export type Theme = "light" | "dark";

export const THEME_DATASET_KEY = "theme";

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset[THEME_DATASET_KEY] = theme;
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
}

export function getCurrentTheme(): Theme {
  return (document.documentElement.dataset[THEME_DATASET_KEY] as Theme | undefined) ?? "light";
}
