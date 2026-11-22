/**
 * Helpers for the committed Beli visits list in `beli-visits.json`.
 *
 * Visits are edited by hand in that file — nothing calls Beli at build or
 * runtime. Photo resource names expire, so thumbnails are resolved later from
 * the stored Google `placeId` via `/api/places/photo`.
 */

/** Resolved at request time so expired Places photo names are never committed. */
export function getPlacePhotoUrl(placeId: string | null | undefined) {
  if (!placeId) return null;
  return `/api/places/photo?placeId=${encodeURIComponent(placeId)}`;
}
