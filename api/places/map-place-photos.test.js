import { describe, expect, it } from 'vitest';
import {
  buildPhotoMediaPath,
  clampPhotoWidth,
  mapAttributions,
  parsePlaceIds,
  pickPhoto,
} from './map-place-photos';

describe('parsePlaceIds', () => {
  it('splits, trims, and dedupes a comma separated list', () => {
    expect(parsePlaceIds('ChIJaaaaaaaaaa, ChIJbbbbbbbbbb ,ChIJaaaaaaaaaa')).toEqual([
      'ChIJaaaaaaaaaa',
      'ChIJbbbbbbbbbb',
    ]);
  });

  it('accepts an array of values', () => {
    expect(parsePlaceIds(['ChIJaaaaaaaaaa', 'ChIJbbbbbbbbbb'])).toEqual([
      'ChIJaaaaaaaaaa',
      'ChIJbbbbbbbbbb',
    ]);
  });

  it('rejects ids that are not google place ids', () => {
    // Beli also stores Apple place keys, which Places cannot resolve.
    expect(parsePlaceIds('APPLE:1234567890,short,ChIJ../../etc')).toEqual([]);
  });

  it('caps the number of ids', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((letter) => letter.repeat(12));

    expect(parsePlaceIds(ids.join(','))).toHaveLength(6);
    expect(parsePlaceIds(ids.join(','), 2)).toHaveLength(2);
  });

  it('returns an empty list for unusable input', () => {
    expect(parsePlaceIds(null)).toEqual([]);
    expect(parsePlaceIds('')).toEqual([]);
  });
});

describe('clampPhotoWidth', () => {
  it('falls back to the default for unusable values', () => {
    expect(clampPhotoWidth(undefined)).toBe(96);
    expect(clampPhotoWidth('abc')).toBe(96);
    expect(clampPhotoWidth(0)).toBe(96);
    expect(clampPhotoWidth(-10)).toBe(96);
  });

  it('clamps to the range places accepts', () => {
    expect(clampPhotoWidth('200')).toBe(200);
    expect(clampPhotoWidth(99999)).toBe(4800);
  });
});

describe('mapAttributions', () => {
  it('normalises protocol relative author uris', () => {
    const attributions = mapAttributions({
      authorAttributions: [{ displayName: 'Jane', uri: '//maps.google.com/maps/contrib/1' }],
    });

    expect(attributions).toEqual([
      { name: 'Jane', url: 'https://maps.google.com/maps/contrib/1' },
    ]);
  });

  it('keeps attributions without a uri and drops nameless ones', () => {
    const attributions = mapAttributions({
      authorAttributions: [{ displayName: 'Jane' }, { uri: '//maps.google.com/x' }],
    });

    expect(attributions).toEqual([{ name: 'Jane', url: null }]);
  });

  it('tolerates a missing attributions array', () => {
    expect(mapAttributions({})).toEqual([]);
    expect(mapAttributions(null)).toEqual([]);
  });
});

describe('pickPhoto', () => {
  it('returns the first usable photo with its attributions', () => {
    const photo = pickPhoto({
      photos: [
        { widthPx: 100 },
        { name: 'places/abc/photos/xyz', authorAttributions: [{ displayName: 'Jane' }] },
      ],
    });

    expect(photo).toEqual({
      name: 'places/abc/photos/xyz',
      attributions: [{ name: 'Jane', url: null }],
    });
  });

  it('returns null when the place has no photos', () => {
    expect(pickPhoto({ photos: [] })).toBeNull();
    expect(pickPhoto({})).toBeNull();
    expect(pickPhoto(null)).toBeNull();
  });
});

describe('buildPhotoMediaPath', () => {
  it('requests json instead of an image redirect so the api key stays server side', () => {
    expect(buildPhotoMediaPath('places/abc/photos/xyz', 120)).toBe(
      'places/abc/photos/xyz/media?maxWidthPx=120&skipHttpRedirect=true',
    );
  });
});
