import { describe, expect, it } from 'vitest';
import {
  buildYouTubeThumbnailUrl,
  buildYouTubeWatchUrl,
  clampRequestLimit,
  getPlaylistFetchLimit,
  getUploadsPlaylistId,
  getVideoIdsFromPlaylistItems,
  getYouTubeVideosNote,
  isYouTubeQuotaError,
  mapYouTubeVideo,
  mapYouTubeVideos,
  normalizeYouTubeHandle,
  parseYouTubeDuration,
  readChannelFromList,
} from './_map-recent-videos';

function makeVideo(
  id: string,
  title: string,
  overrides: {
    viewCount?: string | number;
    publishedAt?: string;
    liveBroadcastContent?: string;
    thumbnails?: Record<string, { url?: string }>;
    duration?: string;
  } = {},
) {
  return {
    id,
    snippet: {
      title,
      publishedAt: overrides.publishedAt ?? '2026-10-20T17:00:00.000Z',
      liveBroadcastContent: overrides.liveBroadcastContent ?? 'none',
      thumbnails: overrides.thumbnails ?? {
        medium: { url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` },
      },
    },
    statistics: {
      viewCount: overrides.viewCount ?? '1234',
    },
    contentDetails: {
      duration: overrides.duration ?? 'PT5M58S',
    },
  };
}

describe('normalizeYouTubeHandle', () => {
  it('strips a leading @ and whitespace', () => {
    expect(normalizeYouTubeHandle(' @devaliskedits ')).toBe('devaliskedits');
  });
});

describe('getUploadsPlaylistId', () => {
  it('converts a channel id to the uploads playlist id', () => {
    expect(getUploadsPlaylistId('UCqN3hQCQMaNG2lroc3uhfCQ')).toBe('UUqN3hQCQMaNG2lroc3uhfCQ');
  });

  it('returns null for invalid channel ids', () => {
    expect(getUploadsPlaylistId('')).toBeNull();
    expect(getUploadsPlaylistId('not-a-channel')).toBeNull();
  });
});

describe('clampRequestLimit', () => {
  it('defaults to 3 and caps at 50', () => {
    expect(clampRequestLimit(undefined)).toBe(3);
    expect(clampRequestLimit('12')).toBe(12);
    expect(clampRequestLimit(99)).toBe(50);
  });
});

describe('readChannelFromList', () => {
  it('reads the channel and uploads playlist from a channels.list payload', () => {
    expect(
      readChannelFromList({
        items: [
          {
            id: 'UCqN3hQCQMaNG2lroc3uhfCQ',
            contentDetails: { relatedPlaylists: { uploads: 'UUqN3hQCQMaNG2lroc3uhfCQ' } },
          },
        ],
      }),
    ).toEqual({
      channelId: 'UCqN3hQCQMaNG2lroc3uhfCQ',
      uploadsPlaylistId: 'UUqN3hQCQMaNG2lroc3uhfCQ',
    });
  });

  it('derives the uploads playlist when YouTube omits relatedPlaylists', () => {
    expect(readChannelFromList({ items: [{ id: 'UCabc123' }] })).toEqual({
      channelId: 'UCabc123',
      uploadsPlaylistId: 'UUabc123',
    });
  });
});

describe('getVideoIdsFromPlaylistItems', () => {
  it('keeps playlist order and de-duplicates ids', () => {
    const ids = getVideoIdsFromPlaylistItems(
      [
        { contentDetails: { videoId: 'vid-1' } },
        { snippet: { resourceId: { videoId: 'vid-1' } } },
        { contentDetails: { videoId: 'vid-2' } },
        { contentDetails: { videoId: 'vid-3' } },
      ],
      2,
    );

    expect(ids).toEqual(['vid-1', 'vid-2']);
  });
});

describe('mapYouTubeVideo', () => {
  it('maps title, url, thumbnail, views, duration, and published date', () => {
    expect(
      mapYouTubeVideo(makeVideo('abc12345678', 'My Edit', { viewCount: '2048', duration: 'PT5M58S' })),
    ).toEqual({
      id: 'abc12345678',
      title: 'My Edit',
      url: 'https://www.youtube.com/watch?v=abc12345678',
      thumbnailUrl: 'https://i.ytimg.com/vi/abc12345678/mqdefault.jpg',
      viewCount: 2048,
      durationSeconds: 358,
      publishedAt: '2026-10-20T17:00:00.000Z',
    });
  });

  it('skips live, upcoming, private, and untitled videos', () => {
    expect(
      mapYouTubeVideo(makeVideo('live1234567', 'Live', { liveBroadcastContent: 'live' })),
    ).toBeNull();
    expect(
      mapYouTubeVideo(makeVideo('soon1234567', 'Soon', { liveBroadcastContent: 'upcoming' })),
    ).toBeNull();
    expect(mapYouTubeVideo(makeVideo('priv1234567', 'Private video'))).toBeNull();
    expect(mapYouTubeVideo({ id: 'noidtitle00', snippet: { title: '   ' } })).toBeNull();
  });

  it('falls back to the standard thumbnail when snippet images are missing', () => {
    const video = mapYouTubeVideo(makeVideo('thumb123456', 'Clip', { thumbnails: {} }));
    expect(video?.thumbnailUrl).toBe(buildYouTubeThumbnailUrl('thumb123456'));
    expect(buildYouTubeWatchUrl('thumb123456')).toContain('thumb123456');
  });
});

describe('parseYouTubeDuration', () => {
  it('parses hour, minute, and second ISO durations', () => {
    expect(parseYouTubeDuration('PT5M58S')).toBe(358);
    expect(parseYouTubeDuration('PT45S')).toBe(45);
    expect(parseYouTubeDuration('PT1H2M3S')).toBe(3723);
    expect(parseYouTubeDuration('not-a-duration')).toBeNull();
  });
});

describe('mapYouTubeVideos', () => {
  it('reorders videos.list results to match the uploads playlist', () => {
    const videos = mapYouTubeVideos(
      [makeVideo('vid-2', 'Second'), makeVideo('vid-1', 'First'), makeVideo('vid-3', 'Third')],
      ['vid-1', 'vid-2', 'vid-3'],
      2,
    );

    expect(videos.map((video) => video.id)).toEqual(['vid-1', 'vid-2']);
  });
});

describe('isYouTubeQuotaError', () => {
  it('detects quota and rate-limit reasons', () => {
    expect(isYouTubeQuotaError({ error: { errors: [{ reason: 'quotaExceeded' }] } })).toBe(true);
    expect(isYouTubeQuotaError({ error: { errors: [{ reason: 'forbidden' }] } })).toBe(false);
  });
});

describe('getYouTubeVideosNote', () => {
  it('only notes an empty list', () => {
    expect(getYouTubeVideosNote([])).toBe('No recent videos yet.');
    expect(getYouTubeVideosNote([{ id: 'vid-1' }])).toBeNull();
  });
});

describe('getPlaylistFetchLimit', () => {
  it('fetches a few extra items so live videos can be skipped', () => {
    expect(getPlaylistFetchLimit(3)).toBe(8);
    expect(getPlaylistFetchLimit(50)).toBe(50);
  });
});
