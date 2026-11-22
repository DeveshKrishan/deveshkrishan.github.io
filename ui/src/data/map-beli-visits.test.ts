import { describe, expect, it } from 'vitest';
import { getPlacePhotoUrl } from './map-beli-visits';

describe('getPlacePhotoUrl', () => {
  it('points at the Places photo proxy and encodes the id', () => {
    expect(getPlacePhotoUrl('ChIJ a+b')).toBe('/api/places/photo?placeId=ChIJ%20a%2Bb');
    expect(getPlacePhotoUrl(null)).toBeNull();
  });
});
