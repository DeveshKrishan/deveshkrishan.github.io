/* eslint-env node */
/**
 * Recent games – Steam + optional VALORANT
 *
 * Steam:
 *   Primary: GET /IPlayerService/GetOwnedGames/v1/ — sort by rtime_last_played
 *   Fallback: GET /IPlayerService/GetRecentlyPlayedGames/v1/
 *   Env: STEAM_WEB_API_KEY, STEAM_ID (or STEAM_VANITY_URL).
 *
 * Valorant (optional, via HenrikDev):
 *   Account + latest match for last-played; lifetime hours from
 *   VALORANT_PLAYTIME_MINUTES (HenrikDev has no reliable lifetime hours field).
 *   Env: HENRIKDEV_API_KEY, VALORANT_NAME, VALORANT_TAG;
 *   optional VALORANT_REGION, VALORANT_PLATFORM, VALORANT_PLAYTIME_MINUTES.
 */

import { API_ERROR_CODE, apiError } from '../_errors.js';
import type { ApiRequest, ApiResponse } from '../_http.js';
import { collectGameSources, mergeRecentGames } from '../games/_merge-recent-games.js';
import { fetchValorantRecentGame } from '../valorant/_fetch-stats.js';
import { mapSteamAchievements } from './_map-achievements.js';
import {
  clampRequestLimit,
  getRecentGamesFromOwned,
  getSteamGamesNote,
  mapSteamGame,
  type SteamGameInput,
} from './_map-recent-games.js';

const STEAM_API_BASE = 'https://api.steampowered.com';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSteamErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const msg = data?.error ?? text;
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  } catch {
    return text || 'Unknown error';
  }
}

async function fetchWithRetry(url: string, options?: RequestInit, retriesLeft = MAX_RETRIES) {
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

async function resolveSteamId(apiKey: string, vanityUrl: string) {
  const params = new URLSearchParams({
    key: apiKey,
    vanityurl: vanityUrl,
  });

  const res = await fetchWithRetry(
    `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/?${params.toString()}`,
  );
  const text = await res.text();

  if (!res.ok) {
    const message = parseSteamErrorBody(text);
    throw new Error(`Failed to resolve Steam vanity URL: ${message}`);
  }

  const data = JSON.parse(text);
  if (data?.response?.success !== 1 || !data?.response?.steamid) {
    throw new Error('Could not resolve Steam vanity URL to a SteamID64.');
  }

  return data.response.steamid;
}

async function fetchOwnedGames(apiKey: string, steamId: string) {
  const params = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    include_appinfo: 'true',
    include_played_free_games: 'true',
  });

  const res = await fetchWithRetry(
    `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?${params.toString()}`,
  );
  const text = await res.text();

  if (!res.ok) {
    const message = parseSteamErrorBody(text);
    const status = res.status === 429 ? 429 : res.status >= 500 ? 502 : 500;
    throw Object.assign(new Error(message), { status });
  }

  const data = JSON.parse(text);
  return (Array.isArray(data?.response?.games) ? data.response.games : []) as SteamGameInput[];
}

async function fetchRecentlyPlayedGames(apiKey: string, steamId: string, limit: number) {
  const params = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    count: String(limit),
  });

  const res = await fetchWithRetry(
    `${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/?${params.toString()}`,
  );
  const text = await res.text();

  if (!res.ok) {
    const message = parseSteamErrorBody(text);
    const status = res.status === 429 ? 429 : res.status >= 500 ? 502 : 500;
    throw Object.assign(new Error(message), { status });
  }

  const data = JSON.parse(text);
  return (Array.isArray(data?.response?.games) ? data.response.games : []) as SteamGameInput[];
}

async function fetchPlayerAchievements(apiKey: string, steamId: string, appid: number) {
  const params = new URLSearchParams({
    key: apiKey,
    steamid: steamId,
    appid: String(appid),
    l: 'english',
  });

  try {
    const res = await fetchWithRetry(
      `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/?${params.toString()}`,
    );
    const text = await res.text();
    if (!res.ok) return null;
    return mapSteamAchievements(JSON.parse(text));
  } catch {
    return null;
  }
}

type SteamMappedGame = NonNullable<ReturnType<typeof mapSteamGame>>;

async function attachAchievements<T extends SteamMappedGame>(
  games: T[],
  apiKey: string,
  steamId: string,
) {
  return Promise.all(
    games.map(async (game) => {
      if (!game.appid) return { ...game, achievements: null as ReturnType<typeof mapSteamAchievements> };
      const achievements = await fetchPlayerAchievements(apiKey, steamId, game.appid);
      return { ...game, achievements };
    }),
  );
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json(apiError(405, 'Method not allowed'));
  }

  const apiKey = process.env.STEAM_WEB_API_KEY;
  let steamId = process.env.STEAM_ID;
  const vanityUrl = process.env.STEAM_VANITY_URL;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing Steam env vars. Set STEAM_WEB_API_KEY.',
      code: API_ERROR_CODE.missingConfig,
    });
  }

  if (!steamId && !vanityUrl) {
    return res.status(500).json({
      error: 'Missing Steam env vars. Set STEAM_ID or STEAM_VANITY_URL.',
      code: API_ERROR_CODE.missingConfig,
    });
  }

  const limit = clampRequestLimit(
    Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit,
  );

  try {
    if (!steamId && vanityUrl) {
      steamId = await resolveSteamId(apiKey, vanityUrl);
    }

    if (!steamId) {
      return res.status(500).json({
        error: 'Missing Steam env vars. Set STEAM_ID or STEAM_VANITY_URL.',
        code: API_ERROR_CODE.missingConfig,
      });
    }

    // Fetch one extra Steam title so Valorant can displace the oldest slot.
    const steamFetchLimit = limit + 1;
    let steamGames: SteamMappedGame[] = [];

    try {
      const ownedGames = await fetchOwnedGames(apiKey, steamId);
      steamGames = getRecentGamesFromOwned(ownedGames, steamFetchLimit);
    } catch {
      // Fall through to GetRecentlyPlayedGames
    }

    if (steamGames.length === 0) {
      const recentGames = await fetchRecentlyPlayedGames(apiKey, steamId, steamFetchLimit);
      steamGames = recentGames
        .map(mapSteamGame)
        .filter((game): game is SteamMappedGame => Boolean(game));
    }

    const steamWithAchievements = await attachAchievements(steamGames, apiKey, steamId);

    let valorantGame: Awaited<ReturnType<typeof fetchValorantRecentGame>> = null;
    try {
      valorantGame = await fetchValorantRecentGame();
    } catch {
      // Valorant is optional; Steam-only response is fine when HenrikDev fails.
    }

    const games = mergeRecentGames(steamWithAchievements, [valorantGame], limit);
    const note = getSteamGamesNote(games);
    const sources = collectGameSources(games);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ games, note, sources });
  } catch (err) {
    const status =
      typeof err === 'object' && err && 'status' in err && typeof err.status === 'number'
        ? err.status
        : 500;
    return res.status(status).json(
      apiError(status, 'Unexpected Steam error', {
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
  }
}
