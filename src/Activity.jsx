import { useEffect, useMemo, useState } from 'react';

function Activity() {
  const [songs, setSongs] = useState([]);
  const [songsError, setSongsError] = useState(null);
  const [isSongsLoading, setIsSongsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadSongs() {
      try {
        setIsSongsLoading(true);
        setSongsError(null);

        const res = await fetch('/api/spotify/recently-played?limit=3');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const message = data?.error || `Request failed (${res.status})`;
          throw new Error(message);
        }

        const nextSongs = Array.isArray(data?.songs) ? data.songs : [];
        if (isActive) setSongs(nextSongs);
      } catch (err) {
        if (isActive) setSongsError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        if (isActive) setIsSongsLoading(false);
      }
    }

    loadSongs();
    return () => {
      isActive = false;
    };
  }, []);

  const songsToShow = useMemo(() => songs.slice(0, 3), [songs]);

  return (
    <section className="activity-section">
      <h2 className="activity-heading">what i&apos;ve been up to</h2>
      <div className="activity-grid">
        <div className="activity-column">
          <h3>recent songs listened to</h3>
          {songsError ? <p className="activity-error">spotify error: {songsError}</p> : null}
          {isSongsLoading ? <p className="activity-loading">loading…</p> : null}
          {!isSongsLoading && !songsError && songsToShow.length === 0 ? (
            <p className="activity-loading">no recent songs yet.</p>
          ) : null}
          {songsToShow.length > 0 ? (
            <ul>
              {songsToShow.map((song, index) => (
                <li key={index}>
                  <span className="activity-main">{song.title}</span>
                  <span className="activity-sub"> by {song.artist}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="activity-attribution">
            Recent tracks from{' '}
            <a
              href="https://www.spotify.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Spotify"
            >
              Spotify
            </a>
          </p>
        </div>
        <div className="activity-column">
          <h3>recent commits pushed</h3>
          <ul>
            <li>
              <span className="activity-main">deveshkrishan.github.io</span>
              <span className="activity-sub"> — site updates and new features</span>
            </li>
          </ul>
          <p className="activity-attribution-github">
            Recent commits from{' '}
            <a
              href="https://github.com/DeveshKrishan"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Activity;
