import { describe, expect, it } from 'vitest';
import {
  buildSteamIconUrl,
  clampRequestLimit,
  getRecentGamesFromOwned,
  getSteamGamesNote,
  mapSteamGame,
} from './map-recent-games.js';

describe('buildSteamIconUrl', () => {
  it('builds a Steam CDN icon URL', () => {
    expect(buildSteamIconUrl(570, 'abc123')).toBe(
      'https://media.steampowered.com/steamcommunity/public/images/apps/570/abc123.jpg',
    );
  });

  it('returns null when appid or icon hash is missing', () => {
    expect(buildSteamIconUrl(null, 'abc123')).toBeNull();
    expect(buildSteamIconUrl(570, null)).toBeNull();
  });
});

describe('mapSteamGame', () => {
  it('maps Steam game payloads with store and icon links', () => {
    expect(
      mapSteamGame({
        appid: 570,
        name: 'Dota 2',
        playtime_2weeks: 120,
        rtime_last_played: 1_755_100_800,
        img_icon_url: 'abc123',
      }),
    ).toEqual({
      name: 'Dota 2',
      playtimeMinutes: 120,
      lastPlayedAt: '2025-08-13T16:00:00.000Z',
      storeUrl: 'https://store.steampowered.com/app/570',
      iconUrl:
        'https://media.steampowered.com/steamcommunity/public/images/apps/570/abc123.jpg',
    });
  });

  it('returns null for invalid game payloads', () => {
    expect(mapSteamGame({ appid: 570 })).toBeNull();
    expect(mapSteamGame({ name: 'Dota 2' })).toBeNull();
  });
});

describe('getRecentGamesFromOwned', () => {
  it('filters to games played in the past 2 weeks and sorts by last played', () => {
    const games = getRecentGamesFromOwned(
      [
        {
          appid: 1,
          name: 'Older Game',
          playtime_2weeks: 60,
          rtime_last_played: 100,
          img_icon_url: 'a',
        },
        {
          appid: 2,
          name: 'Recent Game',
          playtime_2weeks: 30,
          rtime_last_played: 200,
          img_icon_url: 'b',
        },
        {
          appid: 3,
          name: 'Not Recent',
          playtime_2weeks: 0,
          rtime_last_played: 999,
          img_icon_url: 'c',
        },
      ],
      2,
    );

    expect(games).toHaveLength(2);
    expect(games[0].name).toBe('Recent Game');
    expect(games[1].name).toBe('Older Game');
  });

  it('sorts by playtime when last played timestamps are unavailable', () => {
    const games = getRecentGamesFromOwned(
      [
        { appid: 1, name: 'Low Time', playtime_2weeks: 10, img_icon_url: 'a' },
        { appid: 2, name: 'High Time', playtime_2weeks: 90, img_icon_url: 'b' },
      ],
      2,
    );

    expect(games.map((game) => game.name)).toEqual(['High Time', 'Low Time']);
  });
});

describe('getSteamGamesNote', () => {
  it('returns an empty-state note only when there are no games', () => {
    expect(getSteamGamesNote([{ name: 'Dota 2' }])).toBeNull();
    expect(getSteamGamesNote([])).toBe(
      'No games played in the last 2 weeks. Make sure Game details is set to Public on your Steam profile.',
    );
  });
});

describe('clampRequestLimit', () => {
  it('clamps query limits between 1 and 50', () => {
    expect(clampRequestLimit(undefined)).toBe(3);
    expect(clampRequestLimit(100)).toBe(50);
  });
});
