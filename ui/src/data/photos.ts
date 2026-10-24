export interface PhotoLocation {
  place?: string;
  city: string;
  state: string;
}

export interface Photo {
  id: string;
  alt: string;
  location: PhotoLocation;
  /** ISO datetime (`2025-10-12T15:41:00`) or date (`YYYY-MM-DD`). */
  takenAt?: string;
  fullSrc: string;
  thumbSrc: string;
}

export const PHOTOS = [
  {
    id: 'alcatraz-island',
    alt: 'An abandoned concrete building behind a chain-link fence on Alcatraz Island',
    location: { place: 'alcatraz island', city: 'san francisco', state: 'ca' },
    fullSrc: '/photos/alcatraz-island.jpeg',
    thumbSrc: '/photos/thumbs/alcatraz-island.jpeg',
  },
  {
    id: 'berryessa-bart',
    alt: 'A BART train at a shaded platform under a clear sky',
    location: { place: 'berryessa bart', city: 'san jose', state: 'ca' },
    fullSrc: '/photos/berryessa-bart.jpeg',
    thumbSrc: '/photos/thumbs/berryessa-bart.jpeg',
  },
  {
    id: '100_0246',
    alt: 'A grassy hill and rock outcrop under trees in a city park',
    location: { place: 'central park', city: 'new york', state: 'ny' },
    fullSrc: '/photos/100_0246.jpeg',
    thumbSrc: '/photos/thumbs/100_0246.jpeg',
  },
  {
    id: '100_0229',
    alt: 'People walking through Times Square at night',
    location: { place: 'times square', city: 'new york', state: 'ny' },
    fullSrc: '/photos/100_0229.jpeg',
    thumbSrc: '/photos/thumbs/100_0229.jpeg',
  },
  {
    id: '100_0188',
    alt: 'The lower Manhattan skyline across the water from a grassy park',
    location: { place: 'governors island', city: 'new york', state: 'ny' },
    fullSrc: '/photos/100_0188.jpeg',
    thumbSrc: '/photos/thumbs/100_0188.jpeg',
  },
  {
    id: '100_0186',
    alt: 'A red brick civic building on a street corner',
    location: { place: 'cooper square', city: 'new york', state: 'ny' },
    fullSrc: '/photos/100_0186.jpeg',
    thumbSrc: '/photos/thumbs/100_0186.jpeg',
  },
  {
    id: '100_0106',
    alt: 'The Taco Bell on Coast Highway with a palm tree in front',
    location: { place: 'taco bell', city: 'pacifica', state: 'ca' },
    fullSrc: '/photos/100_0106.jpeg',
    thumbSrc: '/photos/thumbs/100_0106.jpeg',
  },
  {
    id: '100_0104',
    alt: 'People sitting and walking on a wide beach under a clear sky',
    location: { place: 'pacifica state beach', city: 'pacifica', state: 'ca' },
    fullSrc: '/photos/100_0104.jpeg',
    thumbSrc: '/photos/thumbs/100_0104.jpeg',
  },
  {
    id: '100_0083',
    alt: 'A line of horses walking along the shore',
    location: { place: 'half moon bay beach', city: 'half moon bay', state: 'ca' },
    fullSrc: '/photos/100_0083.jpeg',
    thumbSrc: '/photos/thumbs/100_0083.jpeg',
  },
] as const satisfies readonly Photo[];

export function formatPhotoLocation(location: PhotoLocation): string {
  return [location.place, location.city, location.state].filter(Boolean).join(', ');
}

export function formatPhotoCapturedAt(value?: string): string | null {
  if (!value) return null;

  const yearMonthDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (yearMonthDay) {
    const date = new Date(
      Number(yearMonthDay[1]),
      Number(yearMonthDay[2]) - 1,
      Number(yearMonthDay[3]),
    );
    if (Number.isNaN(date.getTime())) return null;
    return formatCapturedDate(date, { includeTime: false });
  }

  const yearMonth = /^(\d{4})-(\d{2})$/.exec(value);
  if (yearMonth) {
    const date = new Date(Number(yearMonth[1]), Number(yearMonth[2]) - 1, 1);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    })
      .format(date)
      .toLowerCase();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatCapturedDate(date, { includeTime: /T\d{2}:\d{2}/.test(value) });
}

export function formatPhotoCaption(photo: Pick<Photo, 'location' | 'takenAt'>): string {
  return [formatPhotoLocation(photo.location), formatPhotoCapturedAt(photo.takenAt)]
    .filter(Boolean)
    .join(' · ');
}

/** Preview width for the 3-up grid (~760px cells on 1440p). */
export const PHOTO_THUMB_WIDTH = 1280;
export const PHOTO_THUMB_HEIGHT = 960;
export const PHOTOS_PER_PAGE = 6;
export const PHOTO_ZOOM_MIN = 1;
export const PHOTO_ZOOM_MAX = 4;
export const PHOTO_ZOOM_STEP = 1;

export function stepPhotoZoom(zoom: number, delta: number): number {
  return Math.min(PHOTO_ZOOM_MAX, Math.max(PHOTO_ZOOM_MIN, zoom + delta));
}

export function getWrappedPhotoIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
}

export function getPhotoPageCount(length: number, perPage = PHOTOS_PER_PAGE): number {
  if (length <= 0) return 1;
  return Math.ceil(length / perPage);
}

export function slicePhotoPage<T>(items: readonly T[], page: number, perPage = PHOTOS_PER_PAGE): readonly T[] {
  const start = Math.max(0, page) * perPage;
  return items.slice(start, start + perPage);
}

export function padPhotoPage<T>(items: readonly T[], page: number, perPage = PHOTOS_PER_PAGE): readonly (T | null)[] {
  const slice = slicePhotoPage(items, page, perPage);
  return Array.from({ length: perPage }, (_, index) => slice[index] ?? null);
}

function formatCapturedDate(date: Date, options: { includeTime: boolean }): string {
  return new Intl.DateTimeFormat(
    'en-US',
    options.includeTime
      ? {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }
      : {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        },
  )
    .format(date)
    .toLowerCase();
}
