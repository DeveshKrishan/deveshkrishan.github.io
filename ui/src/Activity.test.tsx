import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Activity from './Activity';
import beliVisitsData from './data/beli-visits.json';

const [firstVisit] = beliVisitsData.visits ?? [];

function mockJsonResponse(data: unknown) {
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

  it('shows skeletons while spotify and steam are loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    render(<Activity />);

    expect(screen.getAllByRole('status', { name: 'loading' })).toHaveLength(2);
    expect(document.querySelectorAll('.activity-skeleton-row')).toHaveLength(6);
  });

  it('shows a friendly spotify error instead of the raw API message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/api/spotify/recently-played')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () =>
              Promise.resolve({
                error:
                  'Missing Spotify env vars. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN.',
              }),
          });
        }

        if (String(url).includes('/api/steam/recent-games')) {
          return Promise.resolve({
            ok: false,
            status: 429,
            json: () => Promise.resolve({ error: 'rate limited', code: 'rate_limited' }),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );

    render(<Activity />);

    expect(
      await screen.findByText("couldn't load recent songs right now."),
    ).toBeInTheDocument();
    expect(screen.getByText('steam is rate-limited. try again soon.')).toBeInTheDocument();
    expect(screen.queryByText(/SPOTIFY_CLIENT_ID/)).not.toBeInTheDocument();
  });

  it('renders the beli column from the committed visit data', async () => {
    render(<Activity />);

    expect(await screen.findByText('recent restaurants visited')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beli' })).toHaveAttribute(
      'href',
      'https://beliapp.com',
    );
    expect(firstVisit?.cuisines?.[0]).toBeTruthy();
    expect(firstVisit?.placeId).toBeTruthy();
    const cuisineChip = screen.getByText(firstVisit.cuisines[0]);
    expect(cuisineChip).toHaveClass('activity-cuisine-chip');
    expect(screen.getByRole('link', { name: 'Google Places' })).toHaveAttribute(
      'href',
      'https://developers.google.com/maps/documentation/places/web-service/policies',
    );
    const visitPhoto = screen
      .getAllByAltText('')
      .find((img) => img.classList.contains('activity-visit-icon'));
    expect(visitPhoto).toHaveAttribute(
      'src',
      `/api/places/photo?placeId=${encodeURIComponent(firstVisit.placeId ?? '')}`,
    );
    expect(screen.queryByText('recent commits pushed')).not.toBeInTheDocument();
  });
});
