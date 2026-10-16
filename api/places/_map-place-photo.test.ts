import { describe, expect, it } from 'vitest';

import {
  firstPhotoName,
  isPlaceId,
  photoMediaUrl,
  photoUriFromMedia,
  placeDetailsUrl,
  placesRequestHeaders,
} from './_map-place-photo';

describe('isPlaceId', () => {
  it('accepts Google place ids and rejects unsafe values', () => {
    expect(isPlaceId('ChIJpWqjjHC7j4ARettvwSaXU6E')).toBe(true);
    expect(isPlaceId('short')).toBe(false);
    expect(isPlaceId('places/../secret')).toBe(false);
    expect(isPlaceId('https://evil.example')).toBe(false);
    expect(isPlaceId(null)).toBe(false);
  });
});

describe('place photo mapping', () => {
  it('builds a Place Details URL and field-mask headers', () => {
    expect(placeDetailsUrl('ChIJ a+b')).toBe(
      'https://places.googleapis.com/v1/places/ChIJ%20a%2Bb',
    );
    expect(placesRequestHeaders('key_123', 'photos')).toEqual({
      Accept: 'application/json',
      'X-Goog-Api-Key': 'key_123',
      'X-Goog-FieldMask': 'photos',
    });
  });

  it('reads the first Places photo name and ignores unsafe names', () => {
    expect(
      firstPhotoName({
        photos: [{ name: 'places/ChIJtest/photos/AWxabc' }, { name: 'places/other' }],
      }),
    ).toBe('places/ChIJtest/photos/AWxabc');
    expect(firstPhotoName({ photos: [{ name: 'places/../etc/passwd' }] })).toBeNull();
    expect(firstPhotoName({ photos: [] })).toBeNull();
    expect(firstPhotoName(null)).toBeNull();
  });

  it('builds a media URL and reads a https photo URI', () => {
    expect(photoMediaUrl('places/ChIJtest/photos/AWxabc')).toBe(
      'https://places.googleapis.com/v1/places/ChIJtest/photos/AWxabc/media?maxHeightPx=128&maxWidthPx=128&skipHttpRedirect=true',
    );
    expect(photoUriFromMedia({ photoUri: 'https://lh3.googleusercontent.com/p/abc' })).toBe(
      'https://lh3.googleusercontent.com/p/abc',
    );
    expect(photoUriFromMedia({ photoUri: 'javascript:alert(1)' })).toBeNull();
    expect(photoUriFromMedia({})).toBeNull();
  });
});
