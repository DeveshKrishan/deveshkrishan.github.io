import { describe, expect, it } from 'vitest';

import {
  formatPhotoCaption,
  formatPhotoCapturedAt,
  formatPhotoLocation,
  getPhotoPageCount,
  getWrappedPhotoIndex,
  padPhotoPage,
  PHOTOS,
  PHOTO_THUMB_HEIGHT,
  PHOTO_THUMB_WIDTH,
  PHOTOS_PER_PAGE,
  slicePhotoPage,
  stepPhotoZoom,
} from './photos';

describe('getWrappedPhotoIndex', () => {
  it('wraps forward and backward around the roll', () => {
    expect(getWrappedPhotoIndex(5, 1, 6)).toBe(0);
    expect(getWrappedPhotoIndex(0, -1, 6)).toBe(5);
    expect(getWrappedPhotoIndex(2, 1, 6)).toBe(3);
  });

  it('returns 0 when the list is empty', () => {
    expect(getWrappedPhotoIndex(0, 1, 0)).toBe(0);
  });
});

describe('photo pages', () => {
  it('slices six photos per page', () => {
    expect(PHOTOS_PER_PAGE).toBe(6);
    expect(getPhotoPageCount(8)).toBe(2);
    expect(slicePhotoPage(PHOTOS, 0)).toHaveLength(6);
    expect(slicePhotoPage(PHOTOS, 1)).toHaveLength(3);
  });

  it('pads a short last page so the pager stays put', () => {
    const lastPage = padPhotoPage(PHOTOS, 1);
    expect(lastPage).toHaveLength(PHOTOS_PER_PAGE);
    expect(lastPage.filter(Boolean)).toHaveLength(3);
    expect(lastPage.slice(3).every((slot) => slot === null)).toBe(true);
  });
});

describe('stepPhotoZoom', () => {
  it('steps between 1x and 4x', () => {
    expect(stepPhotoZoom(1, 1)).toBe(2);
    expect(stepPhotoZoom(4, 1)).toBe(4);
    expect(stepPhotoZoom(1, -1)).toBe(1);
    expect(stepPhotoZoom(3, -1)).toBe(2);
  });
});

describe('PHOTOS', () => {
  it('uses 1280px preview thumbs so the grid stays sharp on 1440p', () => {
    expect(PHOTO_THUMB_WIDTH).toBe(1280);
    expect(PHOTO_THUMB_HEIGHT).toBe(960);
  });

  it('keeps thumbs and full files on separate paths', () => {
    expect(PHOTOS.length).toBeGreaterThan(0);
    for (const photo of PHOTOS) {
      expect(photo.thumbSrc).toContain('/thumbs/');
      expect(photo.fullSrc).not.toContain('/thumbs/');
      expect(photo.location.city.length).toBeGreaterThan(0);
      expect(photo.location.state.length).toBeGreaterThan(0);
      expect('takenAt' in photo).toBe(false);
    }
  });

  it('uses location-only captions and omits dates', () => {
    for (const photo of PHOTOS) {
      expect(formatPhotoCaption(photo)).toBe(formatPhotoLocation(photo.location));
      expect(formatPhotoCaption(photo)).not.toMatch(/\d{4}|am|pm/);
    }
  });

  it('labels the new alcatraz island and berryessa frames', () => {
    expect(PHOTOS[0]).toMatchObject({
      id: 'alcatraz-island',
      location: { place: 'alcatraz island', city: 'san francisco', state: 'ca' },
    });
    expect(PHOTOS[1]).toMatchObject({
      id: 'berryessa-bart',
      location: { place: 'berryessa bart', city: 'san jose', state: 'ca' },
    });
    expect(formatPhotoCaption(PHOTOS[0])).toBe('alcatraz island, san francisco, ca');
    expect(formatPhotoCaption(PHOTOS[1])).toBe('berryessa bart, san jose, ca');
  });

  it('labels the horses frame as half moon bay beach', () => {
    const horses = PHOTOS.find((photo) => photo.id === '100_0083');
    expect(horses).toMatchObject({
      location: { place: 'half moon bay beach', city: 'half moon bay', state: 'ca' },
    });
    expect(formatPhotoCaption(horses!)).toBe('half moon bay beach, half moon bay, ca');
    expect(formatPhotoCaption(horses!)).not.toMatch(/pacifica/i);
  });

  it('does not include the removed harbor frame', () => {
    expect(PHOTOS.map((photo) => photo.id)).not.toContain('100_0057');
  });
});

describe('formatPhotoCaption', () => {
  it('joins place, city, and state without a date when none is set', () => {
    expect(formatPhotoLocation({ place: 'central park', city: 'new york', state: 'ny' })).toBe(
      'central park, new york, ny',
    );
    expect(formatPhotoLocation({ city: 'half moon bay', state: 'ca' })).toBe('half moon bay, ca');
    expect(
      formatPhotoCaption({
        location: { place: 'half moon bay beach', city: 'half moon bay', state: 'ca' },
      }),
    ).toBe('half moon bay beach, half moon bay, ca');
  });

  it('joins location and the time captured when a date is present', () => {
    expect(formatPhotoCapturedAt('2025-10-12T15:41:00')).toBe('oct 12, 2025, 3:41 pm');
    expect(formatPhotoCapturedAt('2025-10-12')).toBe('oct 12, 2025');
    expect(formatPhotoCapturedAt('2025-10')).toBe('oct 2025');
    expect(formatPhotoCapturedAt()).toBeNull();
    expect(formatPhotoCapturedAt('not-a-date')).toBeNull();
    expect(
      formatPhotoCaption({
        location: { place: 'central park', city: 'new york', state: 'ny' },
        takenAt: '2025-10-12T15:41:00',
      }),
    ).toBe('central park, new york, ny · oct 12, 2025, 3:41 pm');
  });
});
