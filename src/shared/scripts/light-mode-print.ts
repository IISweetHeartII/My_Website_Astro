import { applyTheme, getCurrentTheme } from "@/shared/scripts/theme-utils";

const PRINT_BOUND_DATASET_KEY = "lightModePrintBound";

type VoidCallback = () => void;

type PrintOptions = {
  beforePrint?: VoidCallback;
  afterPrint?: VoidCallback;
};

export function printWithForcedLightMode(options: PrintOptions = {}): void {
  const mediaQuery = window.matchMedia("print");
  const originalTheme = getCurrentTheme();
  let cleanedUp = false;
  let cleanupTimerId: number | undefined;

  const cleanup = (): void => {
    if (cleanedUp) return;
    cleanedUp = true;

    if (cleanupTimerId !== undefined) window.clearTimeout(cleanupTimerId);

    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", handlePrintMediaChange);
    }

    window.removeEventListener("afterprint", cleanup);

    if (getCurrentTheme() !== originalTheme) {
      applyTheme(originalTheme);
    }

    options.afterPrint?.();
  };

  const handlePrintMediaChange = (event: MediaQueryListEvent): void => {
    if (!event.matches) cleanup();
  };

  options.beforePrint?.();

  if (originalTheme !== "light") {
    applyTheme("light");
  }

  window.addEventListener("afterprint", cleanup);
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handlePrintMediaChange);
  }

  cleanupTimerId = window.setTimeout(cleanup, 10_000);
  window.requestAnimationFrame(() => {
    window.print();
  });
}

export function setupLightModePrintButton(
  button: HTMLButtonElement | null,
  options: PrintOptions = {}
): void {
  if (!button) return;
  if (button.dataset[PRINT_BOUND_DATASET_KEY] === "true") return;

  button.dataset[PRINT_BOUND_DATASET_KEY] = "true";
  button.addEventListener("click", () => {
    printWithForcedLightMode(options);
  });
}
