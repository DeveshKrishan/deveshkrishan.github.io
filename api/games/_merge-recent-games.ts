export interface MergeableGame {
  name: string;
  lastPlayedAt?: string | null;
  playtimeMinutes?: number | null;
  source?: string | null;
}

function lastPlayedTimestamp(game: MergeableGame) {
  if (!game.lastPlayedAt) return 0;
  const parsed = Date.parse(game.lastPlayedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Merge Steam + Valorant rows and keep the most recently played titles.
 * Valorant (or any non-Steam source) is included when present, then the list
 * is sorted by lastPlayedAt desc with playtime as a tiebreaker.
 */
export function mergeRecentGames(
  steamGames: MergeableGame[],
  extraGames: Array<MergeableGame | null | undefined>,
  limit: number,
): MergeableGame[] {
  const extras = extraGames.filter((game): game is MergeableGame => Boolean(game));
  const combined = [...steamGames, ...extras];

  combined.sort((a, b) => {
    const byLastPlayed = lastPlayedTimestamp(b) - lastPlayedTimestamp(a);
    if (byLastPlayed !== 0) return byLastPlayed;
    return (b.playtimeMinutes ?? 0) - (a.playtimeMinutes ?? 0);
  });

  return combined.slice(0, Math.max(limit, 0));
}

export function collectGameSources(games: MergeableGame[]) {
  const sources = new Set<string>();
  for (const game of games) {
    if (game.source === 'valorant') sources.add('valorant');
    else sources.add('steam');
  }
  return Array.from(sources);
}
