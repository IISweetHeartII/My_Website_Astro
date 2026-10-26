/* global document, window */
export function setupMobileMenu(): void {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  if (!mobileMenuToggle || !mobileMenu || !mobileMenuClose) {
    console.warn("Mobile menu elements not found");
    return;
  }

  let previousOverflow = "";

  // 메뉴 열기
  mobileMenuToggle.addEventListener("click", () => {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileMenu.inert = false;
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenu.setAttribute("data-state", "open");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileMenuClose.focus();
  });

  // 메뉴 닫기
  mobileMenuClose.addEventListener("click", () => {
    closeMobileMenu();
  });

  // 링크 클릭 시 메뉴 닫기
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  // 메뉴 외부 클릭 시 닫기
  window.addEventListener("click", (event) => {
    const target = event.target as Node;
    if (!mobileMenu.contains(target) && !mobileMenuToggle.contains(target)) {
      closeMobileMenu();
    }
  });

  // ESC 키로 메뉴 닫기
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  function closeMobileMenu(): void {
    if (mobileMenu?.getAttribute("data-state") === "open") {
      mobileMenu.inert = true;
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousOverflow;
      mobileMenu.setAttribute("data-state", "closed");
      mobileMenuToggle?.setAttribute("aria-expanded", "false");
      mobileMenuToggle?.focus();
    }
  }
}
