import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useReveal } from './useReveal';

function Probe() {
  useReveal();
  return <p data-reveal>hello</p>;
}

describe('useReveal', () => {
  afterEach(() => {
    cleanup();
  });

  it('reveals immediately when IntersectionObserver is unavailable', async () => {
    const previous = window.IntersectionObserver;
    // jsdom has no observer; keep that path explicit for the test.
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    render(<Probe />);

    await waitFor(() => {
      expect(document.querySelector('[data-reveal]')).toHaveClass('is-revealed');
    });

    if (previous) {
      window.IntersectionObserver = previous;
    }
  });
});
