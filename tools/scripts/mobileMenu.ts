export function setupMobileMenu(): void {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  if (!mobileMenuToggle || !mobileMenu || !mobileMenuClose) {
    console.warn("Mobile menu elements not found");
    return;
  }

  // 메뉴 열기
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenu.classList.remove("translate-x-full");
    mobileMenu.classList.add("translate-x-0");
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
    if (mobileMenu) {
      mobileMenu.classList.remove("translate-x-0");
      mobileMenu.classList.add("translate-x-full");
    }
  }
}
