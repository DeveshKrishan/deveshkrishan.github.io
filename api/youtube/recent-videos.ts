/* eslint-env node */
/**
 * YouTube Data API v3 – 3 most recently published public uploads.
 *
 * https://developers.google.com/youtube/v3/docs/channels/list
 * https://developers.google.com/youtube/v3/docs/playlistItems/list
 * https://developers.google.com/youtube/v3/docs/videos/list
 *
 * Public channel data only. An API key is enough — no OAuth.
 * Search is avoided (100 quota units); this path is 2–3 units per request.
 *
 * Env: YOUTUBE_API_KEY
 * Optional: YOUTUBE_CHANNEL_ID, YOUTUBE_CHANNEL_HANDLE
 */

import { API_ERROR_CODE, apiError } from '../_errors.js';
import type { ApiRequest, ApiResponse } from '../_http.js';
import {
  DEFAULT_YOUTUBE_CHANNEL_HANDLE,
  DEFAULT_YOUTUBE_CHANNEL_ID,
  clampRequestLimit,
  getPlaylistFetchLimit,
  getUploadsPlaylistId,
  getVideoIdsFromPlaylistItems,
  isYouTubeQuotaError,
  mapYouTubeVideos,
  normalizeYouTubeHandle,
  readChannelFromList,
} from './_map-recent-videos.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseYouTubeErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const message = data?.error?.message ?? data?.message ?? text;
    return {
      message: typeof message === 'string' ? message : JSON.stringify(message),
      payload: data,
    };
  } catch {
    return { message: text || 'Unknown error', payload: null };
  }
}

async function fetchWithRetry(url: string, retriesLeft = MAX_RETRIES) {
  const res = await fetch(url);

  if (res.status === 429 && retriesLeft > 0) {
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter
      ? Math.min(Number(retryAfter) * 1000, 60 * 1000)
      : DEFAULT_BACKOFF_MS * Math.pow(2, MAX_RETRIES - retriesLeft);
    await sleep(waitMs);
    return fetchWithRetry(url, retriesLeft - 1);
  }

  return res;
}

function statusForYouTubeError(status: number, payload: unknown) {
  if (status === 429 || isYouTubeQuotaError(payload)) return 429;
  if (status === 404) return 404;
  if (status >= 500) return 502;
  return status >= 400 ? status : 500;
}

async function youtubeGet(path: string, params: Record<string, string>) {
  const url = `${YOUTUBE_API_BASE}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetchWithRetry(url);
  const text = await res.text();
  if (!res.ok) {
    const { message, payload } = parseYouTubeErrorBody(text);
    const status = statusForYouTubeError(res.status, payload);
    throw Object.assign(new Error(message), { status, payload });
  }
  return JSON.parse(text);
}

async function resolveUploadsPlaylist(
  apiKey: string,
  channelId: string | null,
  handle: string,
): Promise<{ channelId: string | null; uploadsPlaylistId: string }> {
  if (channelId) {
    const derived = getUploadsPlaylistId(channelId);
    if (derived) return { channelId, uploadsPlaylistId: derived };
  }

  const data = await youtubeGet('/channels', {
    part: 'contentDetails',
    forHandle: normalizeYouTubeHandle(handle) || DEFAULT_YOUTUBE_CHANNEL_HANDLE,
    key: apiKey,
  });
  const resolved = readChannelFromList(data);
  if (!resolved.uploadsPlaylistId) {
    throw Object.assign(new Error('Could not resolve the YouTube uploads playlist.'), {
      status: 404,
    });
  }
  return { channelId: resolved.channelId, uploadsPlaylistId: resolved.uploadsPlaylistId };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json(apiError(405, 'Method not allowed'));
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing YouTube env vars. Set YOUTUBE_API_KEY.',
      code: API_ERROR_CODE.missingConfig,
    });
  }

  const limit = clampRequestLimit(
    Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit,
  );
  const channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_YOUTUBE_CHANNEL_ID;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE || DEFAULT_YOUTUBE_CHANNEL_HANDLE;

  try {
    const { uploadsPlaylistId } = await resolveUploadsPlaylist(apiKey, channelId, handle);
    const playlistJson = await youtubeGet('/playlistItems', {
      part: 'contentDetails,snippet',
      playlistId: uploadsPlaylistId,
      maxResults: String(getPlaylistFetchLimit(limit)),
      key: apiKey,
    });
    const videoIds = getVideoIdsFromPlaylistItems(
      playlistJson?.items,
      getPlaylistFetchLimit(limit),
    );

    if (videoIds.length === 0) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
      return res.status(200).json({ videos: [] });
    }

    const videosJson = await youtubeGet('/videos', {
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: apiKey,
    });
    const videos = mapYouTubeVideos(videosJson?.items, videoIds, limit);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json({ videos });
  } catch (err) {
    const status =
      typeof err === 'object' && err && 'status' in err && typeof err.status === 'number'
        ? err.status
        : 500;
    return res.status(status).json(
      apiError(status, 'Unexpected YouTube error', {
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
  }
}
