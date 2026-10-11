import { useEffect, useState } from 'react';

export function getNavbarScrollState({
  scrollY,
  lastScrollY,
  isHidden,
  minHideY = 72,
  minDelta = 2,
}) {
  if (scrollY <= minHideY) {
    return { isHidden: false, lastScrollY: scrollY };
  }

  const delta = scrollY - lastScrollY;
  if (Math.abs(delta) < minDelta) {
    return { isHidden, lastScrollY: scrollY };
  }

  return {
    isHidden: delta > 0,
    lastScrollY: scrollY,
  };
}

export function useScrollNavbar() {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    let lastScrollY = window.scrollY;
    let hidden = false;
    let frame = 0;

    function update() {
      frame = 0;
      const next = getNavbarScrollState({
        scrollY: window.scrollY,
        lastScrollY,
        isHidden: hidden,
      });
      lastScrollY = next.lastScrollY;
      if (next.isHidden === hidden) return;
      hidden = next.isHidden;
      setIsHidden(hidden);
    }

    function handleScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return isHidden;
}
