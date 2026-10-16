export interface SteamAchievementSummary {
  unlocked: number;
  total: number;
  lastUnlockName: string | null;
}

interface SteamAchievementInput {
  apiname?: string;
  achieved?: number;
  unlocktime?: number;
  name?: string;
}

interface SteamPlayerStatsInput {
  success?: boolean;
  achievements?: SteamAchievementInput[];
}

export function mapSteamAchievements(payload: unknown): SteamAchievementSummary | null {
  const stats = (payload as { playerstats?: SteamPlayerStatsInput } | null)?.playerstats;
  if (!stats || stats.success === false) return null;

  const achievements = Array.isArray(stats.achievements) ? stats.achievements : [];
  if (achievements.length === 0) return null;

  const unlocked = achievements.filter((achievement) => achievement?.achieved === 1);
  const lastUnlock = unlocked
    .filter((achievement) => (achievement?.unlocktime ?? 0) > 0)
    .sort((left, right) => (right.unlocktime ?? 0) - (left.unlocktime ?? 0))[0];

  return {
    unlocked: unlocked.length,
    total: achievements.length,
    lastUnlockName: lastUnlock?.name || lastUnlock?.apiname || null,
  };
}

export function formatSteamAchievementCount(
  achievements: SteamAchievementSummary | null | undefined,
): string | null {
  if (!achievements || achievements.total <= 0) return null;
  return `${achievements.unlocked} / ${achievements.total} achievements`;
}
