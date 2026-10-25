export const DEFAULT_YOUTUBE_CHANNEL_ID = 'UCqN3hQCQMaNG2lroc3uhfCQ';
export const DEFAULT_YOUTUBE_CHANNEL_HANDLE = 'devaliskedits';

interface YouTubeThumbnail {
  url?: string;
}

interface YouTubeVideoSnippet {
  title?: string;
  publishedAt?: string;
  liveBroadcastContent?: string;
  thumbnails?: {
    default?: YouTubeThumbnail;
    medium?: YouTubeThumbnail;
    high?: YouTubeThumbnail;
  };
}

interface YouTubeVideoResource {
  id?: string;
  snippet?: YouTubeVideoSnippet;
  statistics?: {
    viewCount?: string | number;
  };
  contentDetails?: {
    duration?: string;
  };
}

interface YouTubePlaylistItem {
  contentDetails?: { videoId?: string };
  snippet?: { resourceId?: { videoId?: string } };
}

interface YouTubeChannelResource {
  id?: string;
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  viewCount: number | null;
  durationSeconds: number | null;
  publishedAt: string | null;
}

export function clampRequestLimit(limit: unknown, defaultLimit = 3, max = 50) {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), max);
}

export function normalizeYouTubeHandle(handle: unknown) {
  if (typeof handle !== 'string') return '';
  return handle.trim().replace(/^@+/, '');
}

export function getUploadsPlaylistId(channelId: string | null | undefined) {
  if (typeof channelId !== 'string' || !channelId.startsWith('UC') || channelId.length < 3) {
    return null;
  }
  return `UU${channelId.slice(2)}`;
}

export function buildYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function buildYouTubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`;
}

export function readChannelFromList(payload: unknown) {
  const items = Array.isArray((payload as { items?: unknown })?.items)
    ? (payload as { items: YouTubeChannelResource[] }).items
    : [];
  const channel = items[0];
  const channelId = typeof channel?.id === 'string' && channel.id ? channel.id : null;
  const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
  const uploadsPlaylistId =
    typeof uploads === 'string' && uploads ? uploads : getUploadsPlaylistId(channelId);

  return { channelId, uploadsPlaylistId };
}

export function getVideoIdsFromPlaylistItems(items: unknown, limit: number) {
  const list = Array.isArray(items) ? (items as YouTubePlaylistItem[]) : [];
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const item of list) {
    const videoId = item?.contentDetails?.videoId || item?.snippet?.resourceId?.videoId;
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    ids.push(videoId);
    if (ids.length >= limit) break;
  }

  return ids;
}

export function parseYouTubeDuration(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('P')) return null;

  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return null;

  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);
  const total = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  return total > 0 || value.includes('T') ? total : null;
}

function parseViewCount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  }
  return null;
}

function pickThumbnailUrl(snippet: YouTubeVideoSnippet | undefined, videoId: string) {
  const thumbnails = snippet?.thumbnails;
  return (
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    thumbnails?.high?.url ||
    buildYouTubeThumbnailUrl(videoId)
  );
}

const HIDDEN_TITLES = new Set(['private video', 'deleted video']);

export function mapYouTubeVideo(
  item: YouTubeVideoResource | null | undefined,
): YouTubeVideo | null {
  const id = item?.id;
  const title = item?.snippet?.title?.trim() ?? '';
  const liveState = item?.snippet?.liveBroadcastContent;

  if (!id || !title) return null;
  if (HIDDEN_TITLES.has(title.toLowerCase())) return null;
  if (liveState === 'live' || liveState === 'upcoming') return null;

  return {
    id,
    title,
    url: buildYouTubeWatchUrl(id),
    thumbnailUrl: pickThumbnailUrl(item.snippet, id),
    viewCount: parseViewCount(item.statistics?.viewCount),
    durationSeconds: parseYouTubeDuration(item.contentDetails?.duration),
    publishedAt: item.snippet?.publishedAt ?? null,
  };
}

export function mapYouTubeVideos(items: unknown, orderedIds: string[], limit: number) {
  const list = Array.isArray(items) ? (items as YouTubeVideoResource[]) : [];
  const byId = new Map<string, YouTubeVideo>();

  for (const item of list) {
    const video = mapYouTubeVideo(item);
    if (video) byId.set(video.id, video);
  }

  const videos: YouTubeVideo[] = [];
  const idOrder = orderedIds.length > 0 ? orderedIds : list.map((item) => item?.id).filter(Boolean);
  for (const id of idOrder) {
    if (typeof id !== 'string') continue;
    const video = byId.get(id);
    if (!video) continue;
    videos.push(video);
    if (videos.length >= limit) break;
  }

  return videos;
}

export function isYouTubeQuotaError(payload: unknown) {
  if (!payload || typeof payload !== 'object') return false;
  const errors = (payload as { error?: { errors?: Array<{ reason?: string }> } }).error?.errors;
  if (!Array.isArray(errors)) return false;
  return errors.some((entry) => {
    const reason = entry?.reason;
    return (
      reason === 'quotaExceeded' ||
      reason === 'rateLimitExceeded' ||
      reason === 'dailyLimitExceeded'
    );
  });
}

export function getYouTubeVideosNote(videos: unknown[]) {
  if (videos.length > 0) return null;
  return 'No recent videos yet.';
}

export function getPlaylistFetchLimit(outputLimit: number) {
  return Math.min(Math.max(outputLimit + 5, outputLimit), 50);
}
