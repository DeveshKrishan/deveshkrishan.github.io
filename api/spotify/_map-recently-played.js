/**
 * Maps Spotify recently-played API items into a deduplicated song list.
 * Keeps the first occurrence of each track (most recently played).
 */
export function mapRecentlyPlayedItems(items, outputLimit) {
  const seenTrackIds = new Set();
  const songs = [];

  for (const item of items) {
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
      artist: artists.map((a) => a.name).join(', '),
      artists,
      url: track?.external_urls?.spotify ?? null,
      imageUrl,
      playedAt: item?.played_at ?? null,
    });

    if (songs.length >= outputLimit) break;
  }

  return songs;
}

export function getRecentlyPlayedFetchLimit(outputLimit) {
  return Math.min(Math.max(outputLimit * 10, outputLimit), 50);
}
