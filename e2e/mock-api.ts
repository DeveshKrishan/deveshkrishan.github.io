import { test as base, expect, type Page } from '@playwright/test';

const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const activityApi = {
  songs: [
    {
      id: 'track-1',
      title: 'Night Drive',
      artist: 'Test Artist',
      artists: [{ name: 'Test Artist', url: 'https://open.spotify.com/artist/test-artist' }],
      url: 'https://open.spotify.com/track/track-1',
      imageUrl: null,
      playedAt: '2026-10-11T19:00:00.000Z',
    },
  ],
  videos: [
    {
      id: 'video-1',
      title: 'Kickbox',
      url: 'https://www.youtube.com/watch?v=video-1',
      thumbnailUrl: null,
      viewCount: 125,
      durationSeconds: 358,
      publishedAt: '2026-10-11T19:00:00.000Z',
    },
  ],
  games: [
    {
      name: 'VALORANT',
      storeUrl: 'https://tracker.gg/valorant/profile/riot/Solo%23NA1/overview',
      iconUrl: null,
      lastPlayedAt: '2026-10-11T19:00:00.000Z',
      playtimeMinutes: 40,
      playtimeWindow: '2weeks',
      source: 'valorant',
    },
  ],
  contributions: {
    username: 'DeveshKrishan',
    profileUrl: 'https://github.com/DeveshKrishan',
    total: 12,
    weeks: [{ days: [{ date: '2026-10-11', count: 2, level: 2 }] }],
    months: [{ index: 0, label: 'Oct' }],
  },
  visitors: { visitors: 1280 },
};

function jsonFor(url: string) {
  if (url.includes('/api/spotify/recently-played')) return { songs: activityApi.songs };
  if (url.includes('/api/youtube/recent-videos')) return { videos: activityApi.videos };
  if (url.includes('/api/steam/recent-games')) {
    return { games: activityApi.games, note: null, sources: ['valorant'] };
  }
  if (url.includes('/api/github/recent-commits')) return { commits: [], note: null };
  if (url.includes('/api/github/contributions')) return activityApi.contributions;
  if (url.includes('/api/analytics/visitors')) return activityApi.visitors;
  return null;
}

export async function installApiMocks(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/places/photo')) {
      await route.fulfill({ body: pixel, contentType: 'image/png' });
      return;
    }

    const body = jsonFor(url);
    if (!body) {
      await route.fulfill({ status: 404, json: { error: 'not mocked' } });
      return;
    }

    await route.fulfill({ json: body });
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await installApiMocks(page);
    await use(page);
  },
});

export { expect };
