import { describe, expect, it } from 'vitest';
import { collectGameSources, mergeRecentGames } from './_merge-recent-games';

describe('mergeRecentGames', () => {
  it('inserts Valorant into Steam recents by last played', () => {
    const merged = mergeRecentGames(
      [
        {
          name: 'Dota 2',
          lastPlayedAt: '2026-10-10T12:00:00.000Z',
          playtimeMinutes: 100,
          source: 'steam',
        },
        {
          name: 'CS2',
          lastPlayedAt: '2026-09-01T12:00:00.000Z',
          playtimeMinutes: 50,
          source: 'steam',
        },
      ],
      [
        {
          name: 'VALORANT',
          lastPlayedAt: '2026-10-20T12:00:00.000Z',
          playtimeMinutes: 7000,
          source: 'valorant',
        },
      ],
      2,
    );

    expect(merged.map((game) => game.name)).toEqual(['VALORANT', 'Dota 2']);
  });

  it('ignores null extras and preserves Steam-only lists', () => {
    const steamOnly = [
      {
        name: 'Dota 2',
        lastPlayedAt: '2026-10-10T12:00:00.000Z',
        playtimeMinutes: 100,
        source: 'steam',
      },
    ];
    expect(mergeRecentGames(steamOnly, [null, undefined], 3)).toEqual(steamOnly);
  });
});

describe('collectGameSources', () => {
  it('returns steam and valorant when both appear', () => {
    expect(
      collectGameSources([
        { name: 'Dota 2', source: 'steam' },
        { name: 'VALORANT', source: 'valorant' },
      ]),
    ).toEqual(['steam', 'valorant']);
  });
});
