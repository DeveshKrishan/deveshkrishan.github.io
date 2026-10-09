/**
 * Maps Google Places (New) responses into the photo entries the Activity section renders.
 *
 * Kept separate from the route so the parsing and validation rules stay unit testable
 * without a live API key.
 */

/** Google place ids are opaque base64url-ish tokens; anything else is rejected outright. */
const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,512}$/;

const MAX_PLACE_IDS = 6;
const DEFAULT_PHOTO_WIDTH = 96;
const MIN_PHOTO_WIDTH = 1;
// Place Photos rejects maxWidthPx outside 1–4800.
const MAX_PHOTO_WIDTH = 4800;

export function parsePlaceIds(value, max = MAX_PLACE_IDS) {
  const raw = Array.isArray(value) ? value.join(',') : typeof value === 'string' ? value : '';

  const unique = [];
  for (const candidate of raw.split(',')) {
    const placeId = candidate.trim();
    if (!PLACE_ID_PATTERN.test(placeId) || unique.includes(placeId)) continue;
    unique.push(placeId);
    if (unique.length >= max) break;
  }

  return unique;
}

export function clampPhotoWidth(value) {
  const width = Math.trunc(Number(value));
  if (!Number.isFinite(width) || width < MIN_PHOTO_WIDTH) return DEFAULT_PHOTO_WIDTH;
  return Math.min(width, MAX_PHOTO_WIDTH);
}

/**
 * Attribution is mandatory whenever Google returns a non-empty `authorAttributions`,
 * so the display name is carried through to the UI rather than dropped.
 */
export function mapAttributions(photo) {
  const attributions = Array.isArray(photo?.authorAttributions) ? photo.authorAttributions : [];

  return attributions
    .map((attribution) => {
      const name = attribution?.displayName;
      if (!name) return null;
      // Google returns protocol-relative uris like //maps.google.com/...
      const uri = attribution.uri ?? null;
      return { name, url: uri?.startsWith('//') ? `https:${uri}` : uri };
    })
    .filter(Boolean);
}

export function pickPhoto(details) {
  const photos = Array.isArray(details?.photos) ? details.photos : [];
  const photo = photos.find((candidate) => typeof candidate?.name === 'string' && candidate.name);
  if (!photo) return null;

  return { name: photo.name, attributions: mapAttributions(photo) };
}

export function buildPhotoMediaPath(photoName, maxWidthPx) {
  return `${photoName}/media?maxWidthPx=${clampPhotoWidth(maxWidthPx)}&skipHttpRedirect=true`;
}
