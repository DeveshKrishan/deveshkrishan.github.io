export interface ValorantAccountInput {
  name?: string;
  tag?: string;
  region?: string;
  account_level?: number;
  card?: {
    id?: string;
    small?: string | null;
    large?: string | null;
    wide?: string | null;
  } | null;
  last_update?: string | null;
  last_update_raw?: number | null;
}

export interface ValorantMatchInput {
  metadata?: {
    started_at?: string | null;
    game_length_in_ms?: number | null;
  } | null;
}

export interface ValorantGame {
  name: string;
  storeUrl: string;
  iconUrl: string | null;
  lastPlayedAt: string | null;
  playtimeMinutes: number;
  source: 'valorant';
  accountLevel: number | null;
  riotId: string;
  achievements: null;
}

export function buildValorantProfileUrl(name: string, tag: string) {
  const riotId = `${name}#${tag}`;
  return `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(riotId)}/overview`;
}

export function parsePlaytimeMinutes(value: unknown) {
  if (value === undefined || value === null || value === '') return 0;
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0) return 0;
  return Math.floor(minutes);
}

export function resolveLastPlayedAt(
  matches: ValorantMatchInput[] | null | undefined,
  account: ValorantAccountInput | null | undefined,
) {
  const startedAt = matches?.[0]?.metadata?.started_at;
  if (typeof startedAt === 'string' && startedAt.trim()) {
    const parsed = Date.parse(startedAt);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }

  if (typeof account?.last_update_raw === 'number' && account.last_update_raw > 0) {
    // HenrikDev returns unix seconds for last_update_raw.
    const ms = account.last_update_raw < 1e12 ? account.last_update_raw * 1000 : account.last_update_raw;
    return new Date(ms).toISOString();
  }

  if (typeof account?.last_update === 'string' && account.last_update.trim()) {
    const parsed = Date.parse(account.last_update);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }

  return null;
}

export function mapValorantGame(
  account: ValorantAccountInput | null | undefined,
  matches: ValorantMatchInput[] | null | undefined,
  playtimeMinutes = 0,
): ValorantGame | null {
  const name = account?.name?.trim();
  const tag = account?.tag?.trim();
  if (!name || !tag) return null;

  const riotId = `${name}#${tag}`;
  const accountLevel =
    typeof account?.account_level === 'number' && account.account_level > 0
      ? account.account_level
      : null;

  return {
    name: 'VALORANT',
    storeUrl: buildValorantProfileUrl(name, tag),
    iconUrl: account?.card?.small || null,
    lastPlayedAt: resolveLastPlayedAt(matches, account),
    playtimeMinutes: parsePlaytimeMinutes(playtimeMinutes),
    source: 'valorant',
    accountLevel,
    riotId,
    achievements: null,
  };
}

export function isValorantConfigured(env: {
  HENRIKDEV_API_KEY?: string;
  VALORANT_NAME?: string;
  VALORANT_TAG?: string;
}) {
  return Boolean(env.HENRIKDEV_API_KEY?.trim() && env.VALORANT_NAME?.trim() && env.VALORANT_TAG?.trim());
}
