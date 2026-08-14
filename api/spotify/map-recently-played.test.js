import { describe, expect, it } from 'vitest';
import { getRecentlyPlayedFetchLimit, mapRecentlyPlayedItems } from './map-recently-played.js';

function makeItem(id, title, playedAt, overrides = {}) {
  return {
    played_at: playedAt,
    track: {
      id,
      name: title,
      external_urls: { spotify: `https://open.spotify.com/track/${id}` },
      artists: [
        {
          name: 'Artist A',
          external_urls: { spotify: 'https://open.spotify.com/artist/a' },
        },
        {
          name: 'Artist B',
          external_urls: { spotify: 'https://open.spotify.com/artist/b' },
        },
      ],
      album: {
        images: [
          { url: 'https://i.scdn.co/image/large.jpg', width: 640, height: 640 },
          { url: 'https://i.scdn.co/image/small.jpg', width: 64, height: 64 },
        ],
      },
      ...overrides,
    },
  };
}

describe('mapRecentlyPlayedItems', () => {
  it('deduplicates tracks by id and keeps the most recent play', () => {
    const items = [
      makeItem('track-1', 'First Song', '2026-08-13T17:00:00.000Z'),
      makeItem('track-1', 'First Song', '2026-08-13T16:00:00.000Z'),
      makeItem('track-2', 'Second Song', '2026-08-13T15:00:00.000Z'),
    ];

    const songs = mapRecentlyPlayedItems(items, 3);

    expect(songs).toHaveLength(2);
    expect(songs[0]).toMatchObject({
      id: 'track-1',
      title: 'First Song',
      playedAt: '2026-08-13T17:00:00.000Z',
    });
    expect(songs[1].id).toBe('track-2');
  });

  it('respects the output limit', () => {
    const items = [
      makeItem('track-1', 'Song 1', '2026-08-13T17:00:00.000Z'),
      makeItem('track-2', 'Song 2', '2026-08-13T16:00:00.000Z'),
      makeItem('track-3', 'Song 3', '2026-08-13T15:00:00.000Z'),
      makeItem('track-4', 'Song 4', '2026-08-13T14:00:00.000Z'),
    ];

    const songs = mapRecentlyPlayedItems(items, 2);

    expect(songs).toHaveLength(2);
    expect(songs.map((song) => song.id)).toEqual(['track-1', 'track-2']);
  });

  it('includes album art, track url, and artist links', () => {
    const songs = mapRecentlyPlayedItems(
      [makeItem('track-1', 'My Song', '2026-08-13T17:00:00.000Z')],
      1,
    );

    expect(songs[0]).toEqual({
      id: 'track-1',
      title: 'My Song',
      artist: 'Artist A, Artist B',
      artists: [
        { name: 'Artist A', url: 'https://open.spotify.com/artist/a' },
        { name: 'Artist B', url: 'https://open.spotify.com/artist/b' },
      ],
      url: 'https://open.spotify.com/track/track-1',
      imageUrl: 'https://i.scdn.co/image/small.jpg',
      playedAt: '2026-08-13T17:00:00.000Z',
    });
  });

  it('skips items without a track id', () => {
    const items = [
      { played_at: '2026-08-13T17:00:00.000Z', track: { name: 'No Id Song' } },
      makeItem('track-1', 'Valid Song', '2026-08-13T16:00:00.000Z'),
    ];

    const songs = mapRecentlyPlayedItems(items, 3);

    expect(songs).toHaveLength(1);
    expect(songs[0].title).toBe('Valid Song');
  });
});

describe('getRecentlyPlayedFetchLimit', () => {
  it('requests extra items for deduplication but caps at 50', () => {
    expect(getRecentlyPlayedFetchLimit(3)).toBe(30);
    expect(getRecentlyPlayedFetchLimit(10)).toBe(50);
  });
});
