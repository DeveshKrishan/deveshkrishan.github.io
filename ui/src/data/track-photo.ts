import { track } from '@vercel/analytics';

import { formatPhotoCaption, type Photo } from './photos';

export const PHOTO_OPEN_EVENT = 'photo_open';

export const PHOTO_OPEN_SOURCES = {
  grid: 'grid',
  viewer: 'viewer',
} as const;

export type PhotoOpenSource = (typeof PHOTO_OPEN_SOURCES)[keyof typeof PHOTO_OPEN_SOURCES];

export function getPhotoOpenProperties(
  photo: Photo,
  source: PhotoOpenSource,
): Record<string, string> {
  return {
    id: photo.id,
    location: formatPhotoCaption(photo),
    city: photo.location.city,
    state: photo.location.state,
    source,
    ...(photo.location.place ? { place: photo.location.place } : {}),
  };
}

export function trackPhotoOpen(photo: Photo, source: PhotoOpenSource): void {
  track(PHOTO_OPEN_EVENT, getPhotoOpenProperties(photo, source));
}
