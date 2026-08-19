import { applyTheme, getCurrentTheme, type Theme } from "@/shared/scripts/theme-utils";

function getStoredTheme(): Theme | null {
  const value = localStorage.getItem("theme");
  if (value === "light" || value === "dark") return value;
  return null;
}

function getPreferredTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateToggleUI(toggle: HTMLButtonElement): void {
  const current = getCurrentTheme();
  const isDark = current === "dark";

  toggle.setAttribute("aria-pressed", String(isDark));
  // 아이콘 표시는 CSS(Header.astro)가 data-theme로 결정한다 — 크로스페이드를 위해 hidden 토글 안 함
  toggle.setAttribute("data-theme", current);
}

export function setupThemeToggle(): void {
  const toggle = document.getElementById("theme-toggle") as HTMLButtonElement | null;
  if (!toggle) return;

  const initial = getPreferredTheme();
  applyTheme(initial);
  updateToggleUI(toggle);

  toggle.addEventListener("click", () => {
    const current = getCurrentTheme();
    const next: Theme = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
    updateToggleUI(toggle);
  });

  document.addEventListener("astro:page-load", () => {
    updateToggleUI(toggle);
  });
}
