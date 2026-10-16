const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,256}$/;
const PHOTO_NAME_PATTERN = /^places\/[A-Za-z0-9._~/-]+$/;
const PHOTO_URI_PATTERN = /^https:\/\//;

export const PLACES_API_BASE = 'https://places.googleapis.com/v1';
export const PLACE_PHOTO_SIZE = 128;

export function isPlaceId(value: unknown): value is string {
  return typeof value === 'string' && PLACE_ID_PATTERN.test(value);
}

export function isPhotoName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('places/') &&
    !value.includes('..') &&
    PHOTO_NAME_PATTERN.test(value)
  );
}

export function placeDetailsUrl(placeId: string) {
  return `${PLACES_API_BASE}/places/${encodeURIComponent(placeId)}`;
}

export function placesRequestHeaders(apiKey: string, fieldMask?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Goog-Api-Key': apiKey,
  };
  if (fieldMask) headers['X-Goog-FieldMask'] = fieldMask;
  return headers;
}

export function firstPhotoName(details: unknown) {
  const photos = (details as { photos?: Array<{ name?: string }> } | null)?.photos;
  const name = Array.isArray(photos) ? photos[0]?.name : undefined;
  return isPhotoName(name) ? name : null;
}

export function photoMediaUrl(photoName: string, size = PLACE_PHOTO_SIZE) {
  const params = new URLSearchParams({
    maxHeightPx: String(size),
    maxWidthPx: String(size),
    skipHttpRedirect: 'true',
  });
  return `${PLACES_API_BASE}/${photoName}/media?${params.toString()}`;
}

export function photoUriFromMedia(media: unknown) {
  const uri = (media as { photoUri?: string } | null)?.photoUri;
  return typeof uri === 'string' && PHOTO_URI_PATTERN.test(uri) ? uri : null;
}
