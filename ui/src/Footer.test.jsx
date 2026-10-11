import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Footer from './Footer';
import { formatVisitorLabel } from './footer-format';

function mockJsonResponse(data, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('formatVisitorLabel', () => {
  it('formats a unique-visitor count', () => {
    expect(formatVisitorLabel(0)).toBe('0 visitors');
    expect(formatVisitorLabel(1)).toBe('1 visitor');
    expect(formatVisitorLabel(980)).toBe('980 visitors');
    expect(formatVisitorLabel(1250)).toBe('1,250 visitors');
    expect(formatVisitorLabel(null)).toBeNull();
  });
});

describe('Footer', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(mockJsonResponse({ visitors: 980, pageviews: 1250 }))),
    );
  });

  it('renders the copyright line and visitor count', async () => {
    render(<Footer />);

    expect(screen.getByText('© 2026 devesh krishan | portfolio.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('980 visitors')).toBeInTheDocument();
    });
  });

  it('keeps the copyright line when visitor counts fail to load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(mockJsonResponse({ error: 'Missing VERCEL_TOKEN' }, false, 500))),
    );

    render(<Footer />);

    expect(screen.getByText('© 2026 devesh krishan | portfolio.')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/visitor/)).not.toBeInTheDocument();
    });
  });
});
