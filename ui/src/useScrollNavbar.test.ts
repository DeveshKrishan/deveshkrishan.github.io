import { describe, expect, it } from 'vitest';
import { getNavbarScrollState } from './useScrollNavbar';

describe('getNavbarScrollState', () => {
  it('keeps the navbar visible near the top', () => {
    expect(
      getNavbarScrollState({ scrollY: 20, lastScrollY: 8, isHidden: true }),
    ).toEqual({ isHidden: false, lastScrollY: 20 });
  });

  it('hides the navbar when scrolling down past the threshold', () => {
    expect(
      getNavbarScrollState({ scrollY: 240, lastScrollY: 180, isHidden: false }),
    ).toEqual({ isHidden: true, lastScrollY: 240 });
  });

  it('shows the navbar when scrolling up', () => {
    expect(
      getNavbarScrollState({ scrollY: 160, lastScrollY: 220, isHidden: true }),
    ).toEqual({ isHidden: false, lastScrollY: 160 });
  });

  it('ignores tiny scroll jitter', () => {
    expect(
      getNavbarScrollState({ scrollY: 200, lastScrollY: 199, isHidden: true }),
    ).toEqual({ isHidden: true, lastScrollY: 200 });
  });
});
