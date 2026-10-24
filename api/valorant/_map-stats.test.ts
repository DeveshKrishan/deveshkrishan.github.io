import { describe, expect, it } from 'vitest';
import {
  buildValorantProfileUrl,
  isValorantConfigured,
  mapValorantGame,
  parsePlaytimeMinutes,
  resolveLastPlayedAt,
} from './_map-stats';

describe('buildValorantProfileUrl', () => {
  it('builds a tracker.gg profile URL for a Riot ID', () => {
    expect(buildValorantProfileUrl('Solo', 'NA1')).toBe(
      'https://tracker.gg/valorant/profile/riot/Solo%23NA1/overview',
    );
  });
});

describe('parsePlaytimeMinutes', () => {
  it('parses non-negative minute totals', () => {
    expect(parsePlaytimeMinutes('125')).toBe(125);
    expect(parsePlaytimeMinutes(90.7)).toBe(90);
    expect(parsePlaytimeMinutes(-1)).toBe(0);
    expect(parsePlaytimeMinutes(undefined)).toBe(0);
  });
});

describe('resolveLastPlayedAt', () => {
  it('prefers the latest match start time', () => {
    expect(
      resolveLastPlayedAt(
        [{ metadata: { started_at: '2026-10-20T18:00:00.000Z' } }],
        { last_update_raw: 1_700_000_000 },
      ),
    ).toBe('2026-10-20T18:00:00.000Z');
  });

  it('falls back to account last_update_raw seconds', () => {
    expect(resolveLastPlayedAt([], { last_update_raw: 1_755_100_800 })).toBe(
      '2025-08-13T16:00:00.000Z',
    );
  });
});

describe('mapValorantGame', () => {
  it('maps HenrikDev account + match payloads into a Game row', () => {
    expect(
      mapValorantGame(
        {
          name: 'Solo',
          tag: 'NA1',
          region: 'na',
          account_level: 210,
          card: { small: 'https://media.valorant-api.com/playercards/abc/smallart.png' },
          last_update_raw: 1_700_000_000,
        },
        [{ metadata: { started_at: '2026-10-22T12:30:00.000Z' } }],
        7320,
      ),
    ).toEqual({
      name: 'VALORANT',
      storeUrl: 'https://tracker.gg/valorant/profile/riot/Solo%23NA1/overview',
      iconUrl: 'https://media.valorant-api.com/playercards/abc/smallart.png',
      lastPlayedAt: '2026-10-22T12:30:00.000Z',
      playtimeMinutes: 7320,
      source: 'valorant',
      accountLevel: 210,
      riotId: 'Solo#NA1',
      achievements: null,
    });
  });

  it('returns null without a Riot ID', () => {
    expect(mapValorantGame({ name: 'Solo' }, [])).toBeNull();
  });
});

describe('isValorantConfigured', () => {
  it('requires HenrikDev key plus Riot name and tag', () => {
    expect(
      isValorantConfigured({
        HENRIKDEV_API_KEY: 'key',
        VALORANT_NAME: 'Solo',
        VALORANT_TAG: 'NA1',
      }),
    ).toBe(true);
    expect(
      isValorantConfigured({
        HENRIKDEV_API_KEY: 'key',
        VALORANT_NAME: 'Solo',
      }),
    ).toBe(false);
  });
});
