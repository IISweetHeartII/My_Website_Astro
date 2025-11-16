/**
 * Scroll-triggered fade-in animation using Intersection Observer
 * @description Applies fade-in animations to elements with the 'scroll-animate' class when they enter the viewport
 */
export function setupScrollAnimations(): void {
  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with the 'scroll-animate' class
  const elements: NodeListOf<Element> = document.querySelectorAll('.scroll-animate');
  elements.forEach((el: Element) => observer.observe(el));
}
