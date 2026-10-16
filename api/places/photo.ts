/* eslint-env node */
/**
 * Google Places (New) – restaurant thumbnail for a Beli visit.
 *
 * Photo resource names expire, so this looks up the first photo from the
 * stored `placeId` at request time instead of baking a URL into beli-visits.json.
 *
 * Env: GOOGLE_PLACES_API_KEY
 */

import { API_ERROR_CODE, apiError } from '../_errors.js';
import type { ApiRequest, ApiResponse } from '../_http.js';
import {
  firstPhotoName,
  isPlaceId,
  photoMediaUrl,
  photoUriFromMedia,
  placeDetailsUrl,
  placesRequestHeaders,
} from './_map-place-photo.js';

const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePlacesErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const message = data?.error?.message ?? data?.message ?? text;
    return typeof message === 'string' ? message : JSON.stringify(message);
  } catch {
    return text || 'Unknown error';
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retriesLeft = MAX_RETRIES) {
  const res = await fetch(url, options);

  if (res.status === 429 && retriesLeft > 0) {
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter
      ? Math.min(Number(retryAfter) * 1000, 60_000)
      : DEFAULT_BACKOFF_MS * Math.pow(2, MAX_RETRIES - retriesLeft);
    await sleep(waitMs);
    return fetchWithRetry(url, options, retriesLeft - 1);
  }

  return res;
}

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json(apiError(405, 'Method not allowed'));
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = queryValue(req.query?.placeId);

  if (!apiKey) {
    return res.status(404).json({
      error: 'Missing GOOGLE_PLACES_API_KEY.',
      code: API_ERROR_CODE.missingConfig,
    });
  }

  if (!isPlaceId(placeId)) {
    return res.status(400).json(apiError(400, 'Invalid place id'));
  }

  try {
    const detailsRes = await fetchWithRetry(placeDetailsUrl(placeId), {
      headers: placesRequestHeaders(apiKey, 'photos'),
    });
    const detailsText = await detailsRes.text();

    if (!detailsRes.ok) {
      const status = detailsRes.status === 429 ? 429 : detailsRes.status === 404 ? 404 : 502;
      return res.status(status).json(
        apiError(status, 'Failed to fetch place details', {
          message: parsePlacesErrorBody(detailsText),
        }),
      );
    }

    const photoName = firstPhotoName(JSON.parse(detailsText));
    if (!photoName) {
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      return res.status(404).json(apiError(404, 'No place photo available'));
    }

    const mediaRes = await fetchWithRetry(photoMediaUrl(photoName), {
      headers: placesRequestHeaders(apiKey),
    });
    const mediaText = await mediaRes.text();

    if (!mediaRes.ok) {
      const status = mediaRes.status === 429 ? 429 : mediaRes.status === 404 ? 404 : 502;
      return res.status(status).json(
        apiError(status, 'Failed to fetch place photo', {
          message: parsePlacesErrorBody(mediaText),
        }),
      );
    }

    const photoUri = photoUriFromMedia(JSON.parse(mediaText));
    if (!photoUri) {
      return res.status(502).json(apiError(502, 'Unexpected place photo response'));
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Location', photoUri);
    return res.status(302).end();
  } catch (err) {
    return res.status(500).json(
      apiError(500, 'Unexpected Places error', {
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
  }
}
