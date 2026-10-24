import { describe, expect, it } from 'vitest';
import {
  ESTIMATED_ROUND_MS,
  buildValorantProfileUrl,
  estimateMatchLengthMs,
  isValorantConfigured,
  mapValorantGame,
  mergeMatchesForPlaytime,
  parsePlaytimeMinutes,
  resolveLastPlayedAt,
  sumRecentPlaytimeMinutes,
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

describe('estimateMatchLengthMs', () => {
  it('estimates competitive length from round scores', () => {
    expect(estimateMatchLengthMs('Competitive', { red: 13, blue: 8 })).toBe(21 * ESTIMATED_ROUND_MS);
  });

  it('uses fixed averages for short modes', () => {
    expect(estimateMatchLengthMs('Deathmatch', { red: 0, blue: 0 })).toBe(8 * 60 * 1000);
    expect(estimateMatchLengthMs('Swiftplay', null)).toBe(10 * 60 * 1000);
    expect(estimateMatchLengthMs('Spike Rush', null)).toBe(8 * 60 * 1000);
  });
});

describe('mergeMatchesForPlaytime', () => {
  it('keeps stored matches beyond the live 10 and prefers exact v4 lengths', () => {
    const merged = mergeMatchesForPlaytime(
      [
        {
          metadata: {
            match_id: 'live-1',
            started_at: '2026-10-24T07:29:09.718Z',
            game_length_in_ms: 2_441_618,
          },
        },
      ],
      [
        {
          meta: { id: 'live-1', started_at: '2026-10-24T07:29:09.718Z', mode: 'Competitive' },
          teams: { red: 13, blue: 8 },
        },
        {
          meta: { id: 'older-1', started_at: '2026-10-12T18:00:00.000Z', mode: 'Unrated' },
          teams: { red: 13, blue: 5 },
        },
      ],
    );

    expect(merged).toHaveLength(2);
    expect(merged[0]?.metadata?.match_id).toBe('live-1');
    expect(merged[0]?.metadata?.game_length_in_ms).toBe(2_441_618);
    expect(merged[1]?.metadata?.match_id).toBe('older-1');
    expect(merged[1]?.metadata?.game_length_in_ms).toBe(18 * ESTIMATED_ROUND_MS);
  });
});

describe('sumRecentPlaytimeMinutes', () => {
  const now = Date.parse('2026-10-24T18:00:00.000Z');

  it('sums match lengths from the last two weeks', () => {
    expect(
      sumRecentPlaytimeMinutes(
        [
          { metadata: { started_at: '2026-10-24T07:29:09.718Z', game_length_in_ms: 2_400_000 } },
          { metadata: { started_at: '2026-10-20T12:00:00.000Z', game_length_in_ms: 1_800_000 } },
          { metadata: { started_at: '2026-10-01T12:00:00.000Z', game_length_in_ms: 3_600_000 } },
        ],
        now,
      ),
    ).toBe(70);
  });

  it('counts more than the live 10-match window after a stored merge', () => {
    const live = Array.from({ length: 10 }, (_, index) => ({
      metadata: {
        match_id: `live-${index}`,
        started_at: `2026-10-${String(24 - index).padStart(2, '0')}T12:00:00.000Z`,
        game_length_in_ms: 2_400_000,
      },
    }));
    const stored = [
      ...live.map((match) => ({
        meta: { id: match.metadata.match_id, started_at: match.metadata.started_at, mode: 'Competitive' },
        teams: { red: 13, blue: 8 },
      })),
      {
        meta: { id: 'stored-11', started_at: '2026-10-13T12:00:00.000Z', mode: 'Unrated' },
        teams: { red: 13, blue: 4 },
      },
      {
        meta: { id: 'stored-12', started_at: '2026-10-12T12:00:00.000Z', mode: 'Unrated' },
        teams: { red: 13, blue: 2 },
      },
    ];

    expect(sumRecentPlaytimeMinutes(mergeMatchesForPlaytime(live, stored), now)).toBe(
      400 + Math.floor((17 * ESTIMATED_ROUND_MS + 15 * ESTIMATED_ROUND_MS) / 60_000),
    );
  });

  it('ignores matches without a usable start time or length', () => {
    expect(
      sumRecentPlaytimeMinutes(
        [{ metadata: { started_at: '2026-10-24T07:29:09.718Z' } }, { metadata: {} }],
        now,
      ),
    ).toBe(0);
  });
});

describe('resolveLastPlayedAt', () => {
  it('prefers the latest match start time', () => {
    expect(
      resolveLastPlayedAt(
        [
          { metadata: { started_at: '2026-10-18T12:00:00.000Z' } },
          { metadata: { started_at: '2026-10-20T18:00:00.000Z' } },
        ],
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
        [
          {
            metadata: {
              started_at: '2026-10-22T12:30:00.000Z',
              game_length_in_ms: 2_400_000,
            },
          },
        ],
        Date.parse('2026-10-24T18:00:00.000Z'),
      ),
    ).toEqual({
      name: 'VALORANT',
      storeUrl: 'https://tracker.gg/valorant/profile/riot/Solo%23NA1/overview',
      iconUrl: 'https://media.valorant-api.com/playercards/abc/smallart.png',
      lastPlayedAt: '2026-10-22T12:30:00.000Z',
      playtimeMinutes: 40,
      playtimeWindow: '2weeks',
      source: 'valorant',
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
