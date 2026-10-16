import { beforeEach, describe, expect, it, vi } from 'vitest';
import { track } from '@vercel/analytics';

import { formatPhotoCaption, PHOTOS } from './photos';
import { getPhotoOpenProperties, PHOTO_OPEN_EVENT, trackPhotoOpen } from './track-photo';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('getPhotoOpenProperties', () => {
  it('sends id, location, and source for each photo', () => {
    const horses = PHOTOS.find((photo) => photo.id === '100_0083');
    expect(horses).toBeDefined();
    expect(getPhotoOpenProperties(horses!, 'grid')).toEqual({
      id: '100_0083',
      location: 'half moon bay beach, half moon bay, ca',
      place: 'half moon bay beach',
      city: 'half moon bay',
      state: 'ca',
      source: 'grid',
    });
  });

  it('omits place when the photo only has city and state', () => {
    expect(
      getPhotoOpenProperties(
        {
          id: 'city-only',
          alt: 'A city street',
          location: { city: 'pacifica', state: 'ca' },
          fullSrc: '/photos/city-only.jpeg',
          thumbSrc: '/photos/thumbs/city-only.jpeg',
        },
        'viewer',
      ),
    ).toEqual({
      id: 'city-only',
      location: 'pacifica, ca',
      city: 'pacifica',
      state: 'ca',
      source: 'viewer',
    });
  });
});

describe('trackPhotoOpen', () => {
  beforeEach(() => {
    vi.mocked(track).mockClear();
  });

  it('tracks a photo_open event with the photo properties', () => {
    trackPhotoOpen(PHOTOS[0], 'grid');

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(PHOTO_OPEN_EVENT, {
      id: PHOTOS[0].id,
      location: formatPhotoCaption(PHOTOS[0]),
      place: PHOTOS[0].location.place,
      city: PHOTOS[0].location.city,
      state: PHOTOS[0].location.state,
      source: 'grid',
    });
  });
});
