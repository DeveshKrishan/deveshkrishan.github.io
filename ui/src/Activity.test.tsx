import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
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

        if (String(url).includes('/api/youtube/recent-videos')) {
          return Promise.resolve(mockJsonResponse({ videos: [] }));
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

  it('shows skeletons while spotify, youtube, and steam are loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    render(<Activity />);

    expect(screen.getAllByRole('status', { name: 'loading' })).toHaveLength(3);
    expect(document.querySelectorAll('.activity-skeleton-row')).toHaveLength(9);
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

        if (String(url).includes('/api/youtube/recent-videos')) {
          return Promise.resolve(mockJsonResponse({ videos: [] }));
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );

    render(<Activity />);

    expect(await screen.findByText("couldn't load recent songs right now.")).toBeInTheDocument();
    expect(screen.getByText('steam is rate-limited. try again soon.')).toBeInTheDocument();
    expect(screen.queryByText(/SPOTIFY_CLIENT_ID/)).not.toBeInTheDocument();
  });

  it('renders the beli column from the committed visit data', async () => {
    render(<Activity />);

    expect(await screen.findByText('recent restaurants rated')).toBeInTheDocument();
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
    const restaurantAttribution = screen.getByRole('link', { name: 'Beli' }).closest(
      '.activity-attribution',
    );
    expect(restaurantAttribution?.querySelector('.activity-attribution-sep')).toHaveTextContent('·');
    const visitPhoto = screen
      .getAllByAltText('')
      .find((img) => img.classList.contains('activity-visit-icon'));
    expect(visitPhoto).toHaveAttribute(
      'src',
      `/api/places/photo?placeId=${encodeURIComponent(firstVisit.placeId ?? '')}`,
    );
    expect(screen.queryByText('recent commits pushed')).not.toBeInTheDocument();
  });

  it('renders steam achievement progress for recent games', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/api/spotify/recently-played')) {
          return Promise.resolve(mockJsonResponse({ songs: [] }));
        }

        if (String(url).includes('/api/steam/recent-games')) {
          return Promise.resolve(
            mockJsonResponse({
              games: [
                {
                  name: 'Dota 2',
                  storeUrl: 'https://store.steampowered.com/app/570',
                  iconUrl:
                    'https://media.steampowered.com/steamcommunity/public/images/apps/570/abc.jpg',
                  lastPlayedAt: '2026-10-15T17:00:00.000Z',
                  playtimeMinutes: 90,
                  playtimeWindow: '2weeks',
                  source: 'steam',
                  achievements: { unlocked: 12, total: 47, lastUnlockName: 'First Win' },
                },
              ],
              sources: ['steam'],
            }),
          );
        }

        if (String(url).includes('/api/youtube/recent-videos')) {
          return Promise.resolve(mockJsonResponse({ videos: [] }));
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );

    render(<Activity />);

    expect(await screen.findByRole('link', { name: 'Dota 2' })).toHaveAttribute(
      'href',
      'https://store.steampowered.com/app/570',
    );
    expect(
      screen.getByRole('heading', { name: 'recent games played in last 2 weeks' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1h 30m/)).toBeInTheDocument();
    expect(screen.queryByText(/1h 30m in last 2 weeks/)).not.toBeInTheDocument();
    expect(screen.getByText('12 / 47 achievements')).toBeInTheDocument();
    const lastPlayed = screen.getByText(/^last played /);
    const meter = document.querySelector('.activity-achievement-meter');
    expect(lastPlayed).toHaveClass('activity-last-played');
    expect(meter).toBeInTheDocument();
    expect(meter?.parentElement).toBe(lastPlayed.parentElement);
    expect((meter as HTMLElement).style.getPropertyValue('--achievement-fill')).toBe(
      `${(12 / 47) * 100}%`,
    );
    expect(screen.queryByText(/past 2 weeks/i)).not.toBeInTheDocument();
    expect(screen.queryByText('First Win')).not.toBeInTheDocument();
  });

  it('merges Valorant into recent games with dual attribution', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/api/spotify/recently-played')) {
          return Promise.resolve(mockJsonResponse({ songs: [] }));
        }

        if (String(url).includes('/api/steam/recent-games')) {
          return Promise.resolve(
            mockJsonResponse({
              games: [
                {
                  name: 'VALORANT',
                  storeUrl: 'https://tracker.gg/valorant/profile/riot/Solo%23NA1/overview',
                  iconUrl: 'https://media.valorant-api.com/playercards/abc/smallart.png',
                  lastPlayedAt: '2026-10-22T12:30:00.000Z',
                  playtimeMinutes: 130,
                  playtimeWindow: '2weeks',
                  source: 'valorant',
                  riotId: 'Solo#NA1',
                  achievements: null,
                },
                {
                  name: 'Dota 2',
                  storeUrl: 'https://store.steampowered.com/app/570',
                  iconUrl:
                    'https://media.steampowered.com/steamcommunity/public/images/apps/570/abc.jpg',
                  lastPlayedAt: '2026-10-15T17:00:00.000Z',
                  playtimeMinutes: 90,
                  source: 'steam',
                  achievements: null,
                },
              ],
              sources: ['steam', 'valorant'],
            }),
          );
        }

        if (String(url).includes('/api/youtube/recent-videos')) {
          return Promise.resolve(mockJsonResponse({ videos: [] }));
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );

    render(<Activity />);

    await waitFor(() => {
      expect(screen.getByText(/2h 10m/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Level \d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Diamond|RR/)).not.toBeInTheDocument();
    expect(document.querySelector('.activity-rank-icon')).toBeNull();

    const valorantLinks = screen.getAllByRole('link', { name: 'VALORANT' });
    expect(
      valorantLinks.some(
        (link) =>
          link.getAttribute('href') ===
          'https://tracker.gg/valorant/profile/riot/Solo%23NA1/overview',
      ),
    ).toBe(true);
    expect(
      valorantLinks.some((link) => link.getAttribute('href') === 'https://playvalorant.com'),
    ).toBe(true);
    expect(screen.queryByText(/2h 10m in last 2 weeks/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Steam' })).toBeInTheDocument();
  });

  it('renders recent youtube videos with thumbnails, links, and view counts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/api/spotify/recently-played')) {
          return Promise.resolve(mockJsonResponse({ songs: [] }));
        }

        if (String(url).includes('/api/steam/recent-games')) {
          return Promise.resolve(mockJsonResponse({ games: [] }));
        }

        if (String(url).includes('/api/youtube/recent-videos')) {
          return Promise.resolve(
            mockJsonResponse({
              videos: [
                {
                  id: 'abc12345678',
                  title: 'My Latest Edit',
                  url: 'https://www.youtube.com/watch?v=abc12345678',
                  thumbnailUrl: 'https://i.ytimg.com/vi/abc12345678/mqdefault.jpg',
                  viewCount: 2048,
                  durationSeconds: 358,
                  publishedAt: '2026-10-20T17:00:00.000Z',
                },
                {
                  id: 'def12345678',
                  title: 'Second Edit',
                  url: 'https://www.youtube.com/watch?v=def12345678',
                  thumbnailUrl: 'https://i.ytimg.com/vi/def12345678/mqdefault.jpg',
                  viewCount: 1,
                  durationSeconds: 45,
                  publishedAt: '2026-10-18T12:00:00.000Z',
                },
              ],
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );

    render(<Activity />);

    expect(
      await screen.findByRole('heading', { name: 'recent videos published' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My Latest Edit' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abc12345678',
    );
    expect(screen.getByText('2,048 views · 5:58')).toBeInTheDocument();
    expect(screen.getByText('1 view · 0:45')).toBeInTheDocument();
    expect(screen.getByText(/published Oct 20, 2026/i)).toBeInTheDocument();
    const thumbnail = screen
      .getAllByAltText('')
      .find((img) => img.classList.contains('activity-video-icon'));
    expect(thumbnail).toHaveAttribute('src', 'https://i.ytimg.com/vi/abc12345678/mqdefault.jpg');
    expect(screen.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@devaliskedits3290',
    );
  });

  it('nests recent shots under what i have been up to', async () => {
    render(<Activity />);

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    const about = document.getElementById('about');
    const photos = document.getElementById('photos');
    expect(about?.contains(photos)).toBe(true);
    expect(
      within(about as HTMLElement).getByRole('heading', { name: 'recent shots' }),
    ).toBeInTheDocument();
  });
});
