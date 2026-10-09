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

        if (String(url).includes('/api/places/photos')) {
          return Promise.resolve(
            mockJsonResponse({
              photos: {
                [firstVisit?.placeId]: {
                  url: 'https://lh3.googleusercontent.com/test-photo',
                  attributions: [
                    { name: 'Photo Author', url: 'https://maps.google.com/maps/contrib/1' },
                  ],
                },
              },
            }),
          );
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
  });

  it('renders a places photo and its required author attribution', async () => {
    expect(firstVisit?.placeId).toBeTruthy();

    render(<Activity />);

    const photo = await waitFor(() => {
      const img = screen
        .getAllByAltText('')
        .find((candidate) => candidate.classList.contains('activity-visit-icon'));
      expect(img).toBeTruthy();
      return img;
    });

    expect(photo).toHaveAttribute('src', 'https://lh3.googleusercontent.com/test-photo');
    expect(screen.getByRole('link', { name: 'Photo Author' })).toHaveAttribute(
      'href',
      'https://maps.google.com/maps/contrib/1',
    );
  });
});
