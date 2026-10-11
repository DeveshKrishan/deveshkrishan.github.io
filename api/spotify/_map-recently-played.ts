interface SpotifyArtist {
  name?: string;
  external_urls?: { spotify?: string };
}

interface SpotifyTrack {
  id?: string;
  name?: string;
  artists?: SpotifyArtist[];
  album?: { images?: Array<{ url?: string }> };
  external_urls?: { spotify?: string };
}

interface SpotifyRecentlyPlayedItem {
  played_at?: string;
  track?: SpotifyTrack;
}

export function mapRecentlyPlayedItems(items: unknown, outputLimit: number) {
  const list = Array.isArray(items) ? (items as SpotifyRecentlyPlayedItem[]) : [];
  const seenTrackIds = new Set<string>();
  const songs = [];

  for (const item of list) {
    const track = item?.track;
    if (!track?.id || seenTrackIds.has(track.id)) continue;

    seenTrackIds.add(track.id);

    const artists = Array.isArray(track.artists)
      ? track.artists
          .map((artist) => ({
            name: artist?.name ?? '',
            url: artist?.external_urls?.spotify ?? null,
          }))
          .filter((artist) => artist.name)
      : [];

    const albumImages = Array.isArray(track?.album?.images) ? track.album.images : [];
    const imageUrl = albumImages[albumImages.length - 1]?.url ?? albumImages[0]?.url ?? null;

    songs.push({
      id: track.id,
      title: track?.name ?? '',
      artist: artists.map((artist) => artist.name).join(', '),
      artists,
      url: track?.external_urls?.spotify ?? null,
      imageUrl,
      playedAt: item?.played_at ?? null,
    });

    if (songs.length >= outputLimit) break;
  }

  return songs;
}

export function getRecentlyPlayedFetchLimit(outputLimit: number) {
  return Math.min(Math.max(outputLimit * 10, outputLimit), 50);
}
