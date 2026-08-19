/* global document */
/**
 * Scroll-triggered fade-in animation using Intersection Observer
 * @description Applies fade-in animations to elements with the 'scroll-animate' class when they enter the viewport
 */
export function setupScrollAnimations(): void {
  // 모션 최소화 환경: 스태거·이동 없이 바로 보인다 (CSS도 transform을 끈다)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (const el of document.querySelectorAll<HTMLElement>(".scroll-animate")) {
      el.classList.add("animate-fade-in");
    }
    return;
  }

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in");
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with the 'scroll-animate' class
  const elements: NodeListOf<HTMLElement> = document.querySelectorAll(".scroll-animate");
  for (const el of elements) {
    // 형제 요소 중 인덱스 계산 → stagger delay 설정 (60ms 간격, 최대 0.36s — 길면 느려 보인다)
    const siblings = el.parentElement?.querySelectorAll(":scope > .scroll-animate");
    const index = siblings ? Array.from(siblings).indexOf(el) : 0;
    const delay = Math.min(index * 0.06, 0.36);
    el.style.setProperty("--stagger-delay", `${delay}s`);
    observer.observe(el);
  }
}
