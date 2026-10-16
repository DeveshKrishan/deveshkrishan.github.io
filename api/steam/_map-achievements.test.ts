import { describe, expect, it } from 'vitest';

import { formatSteamAchievementCount, mapSteamAchievements } from './_map-achievements';

const samplePayload = {
  playerstats: {
    success: true,
    achievements: [
      {
        apiname: 'ACH_FIRST',
        achieved: 1,
        unlocktime: 1_700_000_000,
        name: 'First Win',
      },
      {
        apiname: 'ACH_LATEST',
        achieved: 1,
        unlocktime: 1_755_100_800,
        name: 'Latest Win',
      },
      {
        apiname: 'ACH_LOCKED',
        achieved: 0,
        unlocktime: 0,
        name: 'Not Yet',
      },
    ],
  },
};

describe('mapSteamAchievements', () => {
  it('counts unlocked achievements and keeps the latest name', () => {
    expect(mapSteamAchievements(samplePayload)).toEqual({
      unlocked: 2,
      total: 3,
      lastUnlockName: 'Latest Win',
    });
  });

  it('falls back to the api name when a localized name is missing', () => {
    expect(
      mapSteamAchievements({
        playerstats: {
          success: true,
          achievements: [{ apiname: 'ACH_ONLY', achieved: 1, unlocktime: 10 }],
        },
      }),
    ).toEqual({
      unlocked: 1,
      total: 1,
      lastUnlockName: 'ACH_ONLY',
    });
  });

  it('returns null when the game has no stats or achievements', () => {
    expect(mapSteamAchievements({ playerstats: { success: false, error: 'no stats' } })).toBeNull();
    expect(mapSteamAchievements({ playerstats: { success: true, achievements: [] } })).toBeNull();
    expect(mapSteamAchievements(null)).toBeNull();
  });
});

describe('formatSteamAchievementCount', () => {
  it('formats a compact unlocked / total count', () => {
    expect(formatSteamAchievementCount({ unlocked: 12, total: 47, lastUnlockName: null })).toBe(
      '12 / 47 achievements',
    );
    expect(formatSteamAchievementCount(null)).toBeNull();
  });
});
