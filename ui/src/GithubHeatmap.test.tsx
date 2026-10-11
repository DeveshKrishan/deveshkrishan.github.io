import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GithubHeatmap from './GithubHeatmap';
import { formatDayTitle, formatHeatmapCaption } from './github-heatmap-format';

function mockJsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('formatHeatmapCaption', () => {
  it('names the contribution total and year', () => {
    expect(
      formatHeatmapCaption({ isLoading: false, error: null, total: 551, year: 2026 }),
    ).toBe('551 contributions in 2026');
    expect(
      formatHeatmapCaption({ isLoading: false, error: null, total: 1, year: 2026 }),
    ).toBe('1 contribution in 2026');
  });
});

describe('formatDayTitle', () => {
  it('describes a contribution day in UTC', () => {
    expect(formatDayTitle('2026-04-06', 3)).toBe('3 contributions on Apr 6, 2026');
    expect(formatDayTitle('2026-04-06', 1)).toBe('1 contribution on Apr 6, 2026');
    expect(formatDayTitle('', 2)).toBe('');
  });
});

describe('GithubHeatmap', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          mockJsonResponse({
            username: 'DeveshKrishan',
            profileUrl: 'https://github.com/DeveshKrishan',
            total: 12,
            months: [{ index: 0, label: 'Apr' }],
            weeks: [
              {
                firstDay: '2026-04-05',
                days: [
                  { date: '2026-04-05', count: 0, level: 0 },
                  { date: '2026-04-06', count: 3, level: 2 },
                ],
              },
            ],
          }),
        ),
      ),
    );
  });

  it('renders the total and heatmap cells after loading', async () => {
    render(<GithubHeatmap />);

    expect(screen.getByText('loading contributions')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('12 contributions in 2026')).toBeInTheDocument();
    });

    expect(screen.getByText('GitHub Activity')).toBeInTheDocument();
    expect(screen.getByText('@DeveshKrishan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Profile →' })).toHaveAttribute(
      'href',
      'https://github.com/DeveshKrishan',
    );
    expect(screen.getByText('Apr')).toBeInTheDocument();
    expect(document.querySelectorAll('.intro-heatmap-weeks .intro-heatmap-cell')).toHaveLength(2);
  });

  it('shows an error when the contributions request fails', async () => {
    vi.mocked(fetch).mockImplementationOnce(() =>
      Promise.resolve(mockJsonResponse({ error: 'Missing GITHUB_TOKEN' }, false, 500) as Response),
    );

    render(<GithubHeatmap />);

    await waitFor(() => {
      expect(screen.getByText('contributions unavailable')).toBeInTheDocument();
    });
    expect(screen.queryByText('Missing GITHUB_TOKEN')).not.toBeInTheDocument();
    expect(screen.getByText("couldn't load github activity right now.")).toBeInTheDocument();
  });
});
