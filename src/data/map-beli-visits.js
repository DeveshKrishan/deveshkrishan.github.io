/**
 * Maps Beli profile-feed items into the visit list rendered by the Activity section.
 *
 * Feed items cover several event types; only rating events describe a place that
 * was actually visited, so bookmarks and the rest are dropped.
 */

const RATING_EVENT_TYPE = 'ADD';

const CATEGORY_LABELS = {
  RES: 'restaurant',
  DES: 'dessert',
  BAR: 'bar',
  BAK: 'bakery',
};

export function getCategoryLabel(category) {
  if (!category) return null;
  return CATEGORY_LABELS[category] ?? category.toLowerCase();
}

/**
 * Beli has no public place URLs, so link out to Google Maps using the
 * `place_id` Beli already stores for each business.
 */
export function getPlaceUrl(placeId) {
  if (!placeId) return null;
  return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
}

function toNumericScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.round(score * 10) / 10;
}

export function mapBeliFeedItems(items, outputLimit = 3) {
  if (!Array.isArray(items)) return [];

  const seenBusinessIds = new Set();
  const visits = [];

  for (const item of items) {
    if (item?.event_type !== RATING_EVENT_TYPE) continue;

    const business = item.business_full ?? {};
    const businessId = business.id ?? item.business;
    const name = business.name;
    if (!businessId || !name || seenBusinessIds.has(businessId)) continue;

    seenBusinessIds.add(businessId);

    const cuisines = Array.isArray(business.cuisines)
      ? business.cuisines.map((cuisine) => cuisine?.name ?? cuisine).filter(Boolean)
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
      url: getPlaceUrl(business.place_id),
    });

    if (visits.length >= outputLimit) break;
  }

  return visits;
}
