import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]';

function revealAll(nodes) {
  nodes.forEach((node) => {
    node.classList.add('is-revealed');
  });
}

export function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    if (nodes.length === 0) return undefined;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      revealAll(nodes);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}
