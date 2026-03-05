/* global document */
/**
 * Scroll-triggered fade-in animation using Intersection Observer
 * @description Applies fade-in animations to elements with the 'scroll-animate' class when they enter the viewport
 */
export function setupScrollAnimations(): void {
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
    // 형제 요소 중 인덱스 계산 → stagger delay 설정 (최대 0.6s)
    const siblings = el.parentElement?.querySelectorAll(":scope > .scroll-animate");
    const index = siblings ? Array.from(siblings).indexOf(el) : 0;
    const delay = Math.min(index * 0.1, 0.6);
    el.style.setProperty("--stagger-delay", `${delay}s`);
    observer.observe(el);
  }
}
