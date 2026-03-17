/* eslint-env node */
/**
 * Spotify Web API – Get Recently Played Tracks
 *
 * OpenAPI spec: https://developer.spotify.com/reference/web-api/open-api-schema.yaml
 * Endpoint: GET /v1/me/player/recently-played
 *
 * Authorization: Authorization Code flow (secure backend). Obtain refresh_token via
 * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 * Redirect URIs: use HTTPS in production; for local dev use http://127.0.0.1 (not localhost).
 * Scopes: user-read-recently-played only.
 * Token refresh: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
 *
 * Rate limits: 429 responses are retried with exponential backoff and Retry-After.
 * ToS: minimal caching (60s); attribute Spotify in the UI.
 */

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function parseSpotifyErrorBody(text) {
  try {
    const data = JSON.parse(text);
    const msg = data?.error_description ?? data?.error ?? text;
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  } catch {
    return text || 'Unknown error';
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with 429 handling: exponential backoff and Retry-After.
 * Does not retry on other status codes.
 */
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({
      error:
        'Missing Spotify env vars. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN.',
    });
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenRes = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) {
      const message = parseSpotifyErrorBody(tokenText);
      return res.status(tokenRes.status >= 500 ? 502 : 500).json({
        error: 'Failed to refresh Spotify token',
        message,
      });
    }

    const tokenJson = JSON.parse(tokenText);
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      return res.status(500).json({ error: 'No access_token in refresh response' });
    }

    // GET /v1/me/player/recently-played – limit 1–50; optional after, before (Unix ms)
    const limit = Math.min(Math.max(Number(req.query?.limit) || 3, 1), 50);
    const params = new URLSearchParams({ limit: String(limit) });
    if (req.query?.after) params.set('after', String(req.query.after));
    if (req.query?.before) params.set('before', String(req.query.before));

    const recentRes = await fetchWithRetry(
      `${SPOTIFY_API_BASE}/me/player/recently-played?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const recentText = await recentRes.text();
    if (!recentRes.ok) {
      const message = parseSpotifyErrorBody(recentText);
      const status = recentRes.status === 429 ? 429 : recentRes.status >= 500 ? 502 : 500;
      return res.status(status).json({
        error: 'Failed to fetch recently played',
        message,
      });
    }

    const recentJson = JSON.parse(recentText);
    const items = Array.isArray(recentJson?.items) ? recentJson.items : [];
    const songs = items
      .map((item) => {
        const track = item?.track;
        if (!track) return null;

        const title = track?.name ?? '';
        const artist = Array.isArray(track?.artists)
          ? track.artists.map((a) => a?.name).filter(Boolean).join(', ')
          : '';

        return {
          title,
          artist,
          url: track?.external_urls?.spotify ?? null,
          playedAt: item?.played_at ?? null,
        };
      })
      .filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ songs });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected Spotify error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
