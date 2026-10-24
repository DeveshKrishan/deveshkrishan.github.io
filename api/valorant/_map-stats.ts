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
    match_id?: string | null;
    started_at?: string | null;
    game_length_in_ms?: number | null;
    queue?: { id?: string | null; name?: string | null } | null;
  } | null;
}

export interface ValorantStoredMatchInput {
  meta?: {
    id?: string | null;
    started_at?: string | null;
    mode?: string | null;
  } | null;
  teams?: {
    red?: number | null;
    blue?: number | null;
  } | null;
}

export interface ValorantGame {
  name: string;
  storeUrl: string;
  iconUrl: string | null;
  lastPlayedAt: string | null;
  playtimeMinutes: number;
  playtimeWindow: '2weeks';
  source: 'valorant';
  riotId: string;
  achievements: null;
}

export const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
/** Typical Valorant round length including buy phase. */
export const ESTIMATED_ROUND_MS = 115_000;
const ESTIMATED_DEATHMATCH_MS = 8 * 60 * 1000;
const ESTIMATED_SWIFTPLAY_MS = 10 * 60 * 1000;
const ESTIMATED_SPIKE_RUSH_MS = 8 * 60 * 1000;
const ESTIMATED_DEFAULT_MS = 35 * 60 * 1000;

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

export function estimateMatchLengthMs(
  mode: string | null | undefined,
  teams: ValorantStoredMatchInput['teams'],
) {
  const normalized = (mode || '').toLowerCase();
  if (normalized.includes('deathmatch')) return ESTIMATED_DEATHMATCH_MS;
  if (normalized.includes('swift')) return ESTIMATED_SWIFTPLAY_MS;
  if (normalized.includes('spike') || normalized.includes('rush')) return ESTIMATED_SPIKE_RUSH_MS;

  const rounds = (teams?.red ?? 0) + (teams?.blue ?? 0);
  if (rounds > 0) return rounds * ESTIMATED_ROUND_MS;
  return ESTIMATED_DEFAULT_MS;
}

export function mapStoredMatch(stored: ValorantStoredMatchInput | null | undefined): ValorantMatchInput | null {
  const startedAt = stored?.meta?.started_at?.trim();
  if (!startedAt) return null;

  return {
    metadata: {
      match_id: stored?.meta?.id?.trim() || null,
      started_at: startedAt,
      game_length_in_ms: estimateMatchLengthMs(stored?.meta?.mode, stored?.teams),
    },
  };
}

function matchKey(match: ValorantMatchInput) {
  const id = match.metadata?.match_id?.trim();
  if (id) return `id:${id}`;
  const startedAt = match.metadata?.started_at?.trim();
  return startedAt ? `at:${startedAt}` : null;
}

export function mergeMatchesForPlaytime(
  liveMatches: ValorantMatchInput[] | null | undefined,
  storedMatches: ValorantStoredMatchInput[] | null | undefined,
): ValorantMatchInput[] {
  const byKey = new Map<string, ValorantMatchInput>();

  const remember = (match: ValorantMatchInput | null, overwrite: boolean) => {
    if (!match?.metadata?.started_at) return;
    const key = matchKey(match);
    if (!key) return;
    if (!overwrite && byKey.has(key)) return;
    byKey.set(key, match);
  };

  for (const stored of storedMatches ?? []) remember(mapStoredMatch(stored), false);
  for (const match of liveMatches ?? []) remember(match, true);

  return [...byKey.values()].sort((a, b) => {
    return Date.parse(b.metadata?.started_at ?? '') - Date.parse(a.metadata?.started_at ?? '');
  });
}

export function sumRecentPlaytimeMinutes(
  matches: ValorantMatchInput[] | null | undefined,
  now = Date.now(),
) {
  const cutoff = now - TWO_WEEKS_MS;
  let totalMs = 0;

  for (const match of matches ?? []) {
    const startedAt = match.metadata?.started_at;
    const lengthMs = match.metadata?.game_length_in_ms;
    if (typeof startedAt !== 'string' || !startedAt.trim()) continue;
    const started = Date.parse(startedAt);
    if (Number.isNaN(started) || started < cutoff) continue;
    if (typeof lengthMs !== 'number' || !Number.isFinite(lengthMs) || lengthMs <= 0) continue;
    totalMs += lengthMs;
  }

  return Math.floor(totalMs / 60_000);
}

export function resolveLastPlayedAt(
  matches: ValorantMatchInput[] | null | undefined,
  account: ValorantAccountInput | null | undefined,
) {
  let latest = 0;
  for (const match of matches ?? []) {
    const startedAt = match.metadata?.started_at;
    if (typeof startedAt !== 'string' || !startedAt.trim()) continue;
    const parsed = Date.parse(startedAt);
    if (!Number.isNaN(parsed) && parsed > latest) latest = parsed;
  }
  if (latest > 0) return new Date(latest).toISOString();

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
  now = Date.now(),
): ValorantGame | null {
  const name = account?.name?.trim();
  const tag = account?.tag?.trim();
  if (!name || !tag) return null;

  const riotId = `${name}#${tag}`;

  return {
    name: 'VALORANT',
    storeUrl: buildValorantProfileUrl(name, tag),
    iconUrl: account?.card?.small || null,
    lastPlayedAt: resolveLastPlayedAt(matches, account),
    playtimeMinutes: sumRecentPlaytimeMinutes(matches, now),
    playtimeWindow: '2weeks',
    source: 'valorant',
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
