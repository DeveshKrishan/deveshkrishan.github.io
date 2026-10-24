import {
  isValorantConfigured,
  mapValorantGame,
  mapValorantRank,
  mergeMatchesForPlaytime,
  type ValorantAccountInput,
  type ValorantGame,
  type ValorantMatchInput,
  type ValorantMmrCurrentInput,
  type ValorantStoredMatchInput,
} from './_map-stats.js';

const HENRIK_API_BASE = 'https://api.henrikdev.xyz';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseHenrikErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const firstError = Array.isArray(data?.errors) ? data.errors[0] : null;
    const msg = firstError?.message ?? data?.error ?? data?.message ?? text;
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  } catch {
    return text || 'Unknown error';
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retriesLeft = MAX_RETRIES) {
  const res = await fetch(url, options);

  if (res.status === 429 && retriesLeft > 0) {
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter
      ? Math.min(Number(retryAfter) * 1000, 60 * 1000)
      : DEFAULT_BACKOFF_MS * Math.pow(2, MAX_RETRIES - retriesLeft);
    await sleep(waitMs);
    return fetchWithRetry(url, options, retriesLeft - 1);
  }

  return res;
}

async function fetchJson(url: string, apiKey: string) {
  const res = await fetchWithRetry(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
      'User-Agent': 'devesh-portfolio/valorant',
    },
  });
  const text = await res.text();

  if (!res.ok) {
    const message = parseHenrikErrorBody(text);
    const status = res.status === 429 ? 429 : res.status === 404 ? 404 : res.status >= 500 ? 502 : 500;
    throw Object.assign(new Error(message), { status });
  }

  return text ? JSON.parse(text) : null;
}

type ValorantEnv = Record<string, string | undefined>;

export async function fetchValorantRecentGame(env: ValorantEnv = process.env): Promise<ValorantGame | null> {
  if (!isValorantConfigured(env)) return null;

  const apiKey = env.HENRIKDEV_API_KEY!.trim();
  const name = env.VALORANT_NAME!.trim();
  const tag = env.VALORANT_TAG!.trim();
  const platform = (env.VALORANT_PLATFORM || 'pc').trim().toLowerCase() || 'pc';

  const accountPayload = await fetchJson(
    `${HENRIK_API_BASE}/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
    apiKey,
  );
  const account = (accountPayload?.data ?? null) as ValorantAccountInput | null;
  if (!account) return null;

  const region = (env.VALORANT_REGION || account.region || '').trim().toLowerCase();
  if (!region) {
    return mapValorantGame(account, []);
  }

  const encodedRegion = encodeURIComponent(region);
  const encodedPlatform = encodeURIComponent(platform);
  const encodedName = encodeURIComponent(name);
  const encodedTag = encodeURIComponent(tag);

  const [matchesPayload, storedPayload, mmrPayload] = await Promise.all([
    fetchJson(
      `${HENRIK_API_BASE}/valorant/v4/matches/${encodedRegion}/${encodedPlatform}/${encodedName}/${encodedTag}?size=10`,
      apiKey,
    ).catch(() => null),
    fetchJson(
      `${HENRIK_API_BASE}/valorant/v1/stored-matches/${encodedRegion}/${encodedName}/${encodedTag}?size=80`,
      apiKey,
    ).catch(() => null),
    fetchJson(
      `${HENRIK_API_BASE}/valorant/v3/mmr/${encodedRegion}/${encodedPlatform}/${encodedName}/${encodedTag}`,
      apiKey,
    ).catch(() => null),
  ]);

  const liveMatches = (Array.isArray(matchesPayload?.data) ? matchesPayload.data : []) as ValorantMatchInput[];
  const storedMatches = (
    Array.isArray(storedPayload?.data) ? storedPayload.data : []
  ) as ValorantStoredMatchInput[];
  const matches = mergeMatchesForPlaytime(liveMatches, storedMatches);
  const rank = mapValorantRank((mmrPayload?.data?.current ?? null) as ValorantMmrCurrentInput | null);
  return mapValorantGame(account, matches, rank);
}
