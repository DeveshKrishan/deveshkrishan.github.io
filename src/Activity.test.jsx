import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Activity from './Activity';
import beliVisitsData from './data/beli-visits.json';

const [firstVisit] = beliVisitsData.visits ?? [];

function mockJsonResponse(data) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  };
}

describe('Activity', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/api/spotify/recently-played')) {
          return Promise.resolve(
            mockJsonResponse({
              songs: [
                {
                  id: 'track-1',
                  title: 'Test Song',
                  artist: 'Test Artist',
                  artists: [
                    {
                      name: 'Test Artist',
                      url: 'https://open.spotify.com/artist/test-artist',
                    },
                  ],
                  url: 'https://open.spotify.com/track/track-1',
                  imageUrl: 'https://i.scdn.co/image/test.jpg',
                  playedAt: '2026-08-13T17:30:00.000Z',
                },
              ],
            }),
          );
        }

        if (String(url).includes('/api/github/recent-commits')) {
          return Promise.resolve(mockJsonResponse({ commits: [] }));
        }

        if (String(url).includes('/api/steam/recent-games')) {
          return Promise.resolve(mockJsonResponse({ games: [] }));
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );
  });

  afterEach(() => {
    // Vitest runs without `globals`, so Testing Library's auto-cleanup never registers.
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders spotify songs with album art, links, and played time', async () => {
    render(<Activity />);

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Test Song' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/track-1',
    );
    expect(screen.getByRole('link', { name: 'Test Artist' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/artist/test-artist',
    );
    const albumArt = screen
      .getAllByAltText('')
      .find((img) => img.classList.contains('activity-song-icon'));
    expect(albumArt).toHaveAttribute('src', 'https://i.scdn.co/image/test.jpg');
    expect(screen.getByText(/played Aug 13/i)).toBeInTheDocument();
  });

  it('renders the beli column from the committed visit data', async () => {
    render(<Activity />);

    expect(await screen.findByText('recent restaurants visited')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beli' })).toHaveAttribute(
      'href',
      'https://beliapp.com',
    );
    expect(firstVisit?.cuisines?.[0]).toBeTruthy();
    const cuisineChip = screen.getByText(firstVisit.cuisines[0]);
    expect(cuisineChip).toHaveClass('activity-cuisine-chip');
    expect(screen.queryByRole('link', { name: 'Google Places' })).not.toBeInTheDocument();
    expect(
      screen.queryAllByAltText('').some((img) => img.classList.contains('activity-visit-icon')),
    ).toBe(false);
    expect(screen.queryByText('recent commits pushed')).not.toBeInTheDocument();
  });
});
