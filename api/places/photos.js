/* eslint-env node */
/**
 * Google Places (New) – cover photos for the restaurants in the Beli column.
 *
 * Two calls per place: Place Details for a photo name, then Place Photos for the
 * hosted image url. Photo names cannot be cached and do expire, so the lookup runs
 * at request time from the place id committed in src/data/beli-visits.json.
 *
 * `skipHttpRedirect=true` returns the image url as json, which keeps the API key on
 * the server while letting the browser load the bytes straight from Google.
 *
 * Env: GOOGLE_PLACES_API_KEY
 */

import {
  buildPhotoMediaPath,
  clampPhotoWidth,
  parsePlaceIds,
  pickPhoto,
} from './map-place-photos.js';

const PLACES_API_BASE = 'https://places.googleapis.com/v1';

async function fetchPhotoUrl(placeId, apiKey, maxWidth) {
  const detailsRes = await fetch(`${PLACES_API_BASE}/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'photos',
    },
  });

  if (!detailsRes.ok) {
    throw Object.assign(new Error(`Place Details failed (${detailsRes.status})`), {
      status: detailsRes.status,
    });
  }

  const photo = pickPhoto(await detailsRes.json());
  if (!photo) return null;

  const mediaRes = await fetch(
    `${PLACES_API_BASE}/${buildPhotoMediaPath(photo.name, maxWidth)}&key=${encodeURIComponent(apiKey)}`,
  );

  if (!mediaRes.ok) {
    throw Object.assign(new Error(`Place Photos failed (${mediaRes.status})`), {
      status: mediaRes.status,
    });
  }

  const media = await mediaRes.json();
  if (!media?.photoUri) return null;

  return { url: media.photoUri, attributions: photo.attributions };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing Google env vars. Set GOOGLE_PLACES_API_KEY.',
    });
  }

  const placeIds = parsePlaceIds(req.query?.placeIds);
  if (placeIds.length === 0) {
    return res.status(400).json({ error: 'Provide at least one valid placeIds value.' });
  }

  const maxWidth = clampPhotoWidth(req.query?.maxWidth);

  // One unreachable place should not blank out the rest of the column.
  const results = await Promise.all(
    placeIds.map(async (placeId) => {
      try {
        return [placeId, await fetchPhotoUrl(placeId, apiKey, maxWidth)];
      } catch {
        return [placeId, null];
      }
    }),
  );

  const photos = Object.fromEntries(results.filter(([, photo]) => photo));

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({ photos });
}
