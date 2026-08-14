/* eslint-env node */
/**
 * Steam Web API – Recent games played in the past 2 weeks
 *
 * Primary: GET /IPlayerService/GetOwnedGames/v1/ — filter playtime_2weeks > 0,
 * sort by rtime_last_played (most recent first). Works when the API key belongs
 * to the same account as STEAM_ID.
 *
 * Fallback: GET /IPlayerService/GetRecentlyPlayedGames/v1/ when last-played
 * timestamps are unavailable.
 *
 * Requires Game details privacy to be Public.
 * Env: STEAM_WEB_API_KEY, STEAM_ID (or STEAM_VANITY_URL).
 */

const STEAM_API_BASE = 'https://api.steampowered.com';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSteamErrorBody(text) {
  try {
    const data = JSON.parse(text);
    const msg = data?.error ?? text;
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  } catch {
    return text || 'Unknown error';
  }
}

async function fetchWithRetry(url, options, retriesLeft = MAX_RETRIES) {
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

function buildSteamIconUrl(appid, imgIconUrl) {
  if (!appid || !imgIconUrl) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${imgIconUrl}.jpg`;
}

function mapGame(game) {
  const appid = game?.appid;
  const name = game?.name ?? '';
  if (!appid || !name) return null;

  const lastPlayedAt =
    typeof game?.rtime_last_played === 'number' && game.rtime_last_played > 0
      ? new Date(game.rtime_last_played * 1000).toISOString()
      : null;

  return {
    name,
    playtimeMinutes: game?.playtime_2weeks ?? 0,
    lastPlayedAt,
    storeUrl: `https://store.steampowered.com/app/${appid}`,
    iconUrl: buildSteamIconUrl(appid, game?.img_icon_url),
  };
}

async function resolveSteamId(apiKey, vanityUrl) {
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

async function fetchOwnedGames(apiKey, steamId) {
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
  return Array.isArray(data?.response?.games) ? data.response.games : [];
}

async function fetchRecentlyPlayedGames(apiKey, steamId, limit) {
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
  return Array.isArray(data?.response?.games) ? data.response.games : [];
}

function getRecentGamesFromOwned(ownedGames, limit) {
  const recent = ownedGames.filter((game) => (game?.playtime_2weeks ?? 0) > 0);
  const hasLastPlayed = recent.some((game) => (game?.rtime_last_played ?? 0) > 0);

  if (hasLastPlayed) {
    recent.sort((a, b) => (b?.rtime_last_played ?? 0) - (a?.rtime_last_played ?? 0));
  } else {
    recent.sort((a, b) => (b?.playtime_2weeks ?? 0) - (a?.playtime_2weeks ?? 0));
  }

  return recent.slice(0, limit).map(mapGame).filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.STEAM_WEB_API_KEY;
  let steamId = process.env.STEAM_ID;
  const vanityUrl = process.env.STEAM_VANITY_URL;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing Steam env vars. Set STEAM_WEB_API_KEY.',
    });
  }

  if (!steamId && !vanityUrl) {
    return res.status(500).json({
      error: 'Missing Steam env vars. Set STEAM_ID or STEAM_VANITY_URL.',
    });
  }

  const limit = Math.min(Math.max(Number(req.query?.limit) || 3, 1), 50);

  try {
    if (!steamId) {
      steamId = await resolveSteamId(apiKey, vanityUrl);
    }

    let games = [];

    try {
      const ownedGames = await fetchOwnedGames(apiKey, steamId);
      games = getRecentGamesFromOwned(ownedGames, limit);
    } catch {
      // Fall through to GetRecentlyPlayedGames
    }

    if (games.length === 0) {
      const recentGames = await fetchRecentlyPlayedGames(apiKey, steamId, limit);
      games = recentGames.map(mapGame).filter(Boolean);
    }

    const note =
      games.length === 0
        ? 'No games played in the last 2 weeks. Make sure Game details is set to Public on your Steam profile.'
        : null;

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ games, note });
  } catch (err) {
    const status = err?.status ?? 500;
    return res.status(status).json({
      error: 'Unexpected Steam error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
