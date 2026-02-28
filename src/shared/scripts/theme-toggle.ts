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
  toggle.setAttribute("data-theme", current);

  const sun = toggle.querySelector<HTMLElement>("[data-icon='sun']");
  const moon = toggle.querySelector<HTMLElement>("[data-icon='moon']");
  sun?.classList.toggle("hidden", !isDark);
  moon?.classList.toggle("hidden", isDark);
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
