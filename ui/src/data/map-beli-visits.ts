/**
 * Maps Beli profile-feed items into the visit list rendered by the Activity section.
 *
 * Feed items cover several event types; only rating events describe a place that
 * was actually visited, so bookmarks and the rest are dropped.
 */

import type { Visit } from '../types';

const RATING_EVENT_TYPE = 'ADD';

const CATEGORY_LABELS = {
  RES: 'restaurant',
  DES: 'dessert',
  BAR: 'bar',
  BAK: 'bakery',
} as const;

type CategoryCode = keyof typeof CATEGORY_LABELS;

interface BeliCuisine {
  name?: string;
}

interface BeliBusiness {
  id?: string | number;
  name?: string;
  city?: string | null;
  neighborhood?: string | null;
  cuisines?: Array<BeliCuisine | string>;
  place_id?: string | null;
  default_category?: string;
}

interface BeliFeedItem {
  event_type?: string;
  business?: string | number | null;
  business_full?: BeliBusiness;
  score?: number | string | null;
  category?: string;
  sent_dt?: string | null;
}

export function getCategoryLabel(category: string | null | undefined) {
  if (!category) return null;
  return CATEGORY_LABELS[category as CategoryCode] ?? category.toLowerCase();
}

/**
 * Beli has no public place URLs, so link out to Google Maps using the
 * `place_id` Beli already stores for each business.
 */
export function getPlaceUrl(placeId: string | null | undefined) {
  if (!placeId) return null;
  return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
}

/** Resolved at request time so expired Places photo names are never committed. */
export function getPlacePhotoUrl(placeId: string | null | undefined) {
  if (!placeId) return null;
  return `/api/places/photo?placeId=${encodeURIComponent(placeId)}`;
}

function toNumericScore(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.round(score * 10) / 10;
}

export function mapBeliFeedItems(items: unknown, outputLimit = 3): Visit[] {
  if (!Array.isArray(items)) return [];

  const seenBusinessIds = new Set<string | number>();
  const visits: Visit[] = [];

  for (const rawItem of items) {
    const item = rawItem as BeliFeedItem;
    if (item?.event_type !== RATING_EVENT_TYPE) continue;

    const business = item.business_full ?? {};
    const businessId = business.id ?? item.business;
    const name = business.name;
    if (!businessId || !name || seenBusinessIds.has(businessId)) continue;

    seenBusinessIds.add(businessId);

    const cuisines = Array.isArray(business.cuisines)
      ? business.cuisines
          .map((cuisine) => (typeof cuisine === 'string' ? cuisine : cuisine?.name))
          .filter((cuisine): cuisine is string => Boolean(cuisine))
      : [];

    visits.push({
      id: businessId,
      name,
      city: business.city ?? null,
      neighborhood: business.neighborhood ?? null,
      cuisines,
      score: toNumericScore(item.score),
      category: getCategoryLabel(item.category ?? business.default_category),
      visitedAt: item.sent_dt ?? null,
      // Place ids may be stored indefinitely; photo names may not, so the photo
      // lookup happens at request time from this id rather than being baked in.
      placeId: business.place_id ?? null,
      url: getPlaceUrl(business.place_id),
    });

    if (visits.length >= outputLimit) break;
  }

  return visits;
}
