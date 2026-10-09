import { describe, expect, it } from 'vitest';
import { getCategoryLabel, getPlaceUrl, mapBeliFeedItems } from './map-beli-visits';

function ratingItem(overrides = {}) {
  return {
    event_type: 'ADD',
    sent_dt: '2026-10-01T18:30:00Z',
    category: 'RES',
    score: 8.64,
    business: 7316,
    business_full: {
      id: 7316,
      place_id: 'ChIJtest',
      name: 'Test Diner',
      city: 'New York',
      neighborhood: 'SoHo',
      cuisines: [{ name: 'American' }],
    },
    ...overrides,
  };
}

describe('mapBeliFeedItems', () => {
  it('maps a rating event into a visit', () => {
    const [visit] = mapBeliFeedItems([ratingItem()]);

    expect(visit).toEqual({
      id: 7316,
      name: 'Test Diner',
      city: 'New York',
      neighborhood: 'SoHo',
      cuisines: ['American'],
      score: 8.6,
      category: 'restaurant',
      visitedAt: '2026-10-01T18:30:00Z',
      placeId: 'ChIJtest',
      url: 'https://www.google.com/maps/place/?q=place_id:ChIJtest',
    });
  });

  it('ignores events that are not ratings', () => {
    const items = [ratingItem({ event_type: 'BOOKMARK' }), ratingItem({ event_type: 'FOLLOW' })];

    expect(mapBeliFeedItems(items)).toEqual([]);
  });

  it('keeps only the first entry per restaurant', () => {
    const items = [ratingItem(), ratingItem({ sent_dt: '2026-09-01T12:00:00Z', score: 5 })];
    const visits = mapBeliFeedItems(items);

    expect(visits).toHaveLength(1);
    expect(visits[0].score).toBe(8.6);
  });

  it('respects the output limit', () => {
    const items = [1, 2, 3, 4].map((id) =>
      ratingItem({ business_full: { id, place_id: `ChIJ${id}`, name: `Place ${id}` } }),
    );

    expect(mapBeliFeedItems(items, 2)).toHaveLength(2);
  });

  it('skips entries without a usable business', () => {
    const items = [ratingItem({ business_full: {}, business: null })];

    expect(mapBeliFeedItems(items)).toEqual([]);
  });

  it('tolerates plain-string cuisines and a missing score', () => {
    const [visit] = mapBeliFeedItems([
      ratingItem({
        score: null,
        business_full: { id: 11, name: 'No Score Cafe', cuisines: ['Cafe'] },
      }),
    ]);

    expect(visit.cuisines).toEqual(['Cafe']);
    expect(visit.score).toBeNull();
    expect(visit.placeId).toBeNull();
    expect(visit.url).toBeNull();
  });

  it('returns an empty list when given non-array input', () => {
    expect(mapBeliFeedItems(null)).toEqual([]);
    expect(mapBeliFeedItems(undefined)).toEqual([]);
  });
});

describe('getCategoryLabel', () => {
  it('expands known category codes and lowercases unknown ones', () => {
    expect(getCategoryLabel('DES')).toBe('dessert');
    expect(getCategoryLabel('BAR')).toBe('bar');
    expect(getCategoryLabel('XYZ')).toBe('xyz');
    expect(getCategoryLabel(null)).toBeNull();
  });
});

describe('getPlaceUrl', () => {
  it('builds a Google Maps link and encodes the id', () => {
    expect(getPlaceUrl('ChIJ a+b')).toBe(
      'https://www.google.com/maps/place/?q=place_id:ChIJ%20a%2Bb',
    );
    expect(getPlaceUrl(null)).toBeNull();
  });
});
