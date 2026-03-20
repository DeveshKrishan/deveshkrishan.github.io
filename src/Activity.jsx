import { useEffect, useMemo, useState } from 'react';

function Activity() {
  const [songs, setSongs] = useState([]);
  const [songsError, setSongsError] = useState(null);
  const [isSongsLoading, setIsSongsLoading] = useState(true);
  const [commits, setCommits] = useState([]);
  const [commitsError, setCommitsError] = useState(null);
  const [commitsNote, setCommitsNote] = useState(null);
  const [isCommitsLoading, setIsCommitsLoading] = useState(true);

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
  const commitsToShow = useMemo(() => commits.slice(0, 3), [commits]);
  const formatCommitDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    let isActive = true;

    async function loadCommits() {
      try {
        setIsCommitsLoading(true);
        setCommitsError(null);
        setCommitsNote(null);

        const res = await fetch('/api/github/recent-commits?limit=3');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const message = data?.error || `Request failed (${res.status})`;
          throw new Error(message);
        }

        const nextCommits = Array.isArray(data?.commits) ? data.commits : [];
        if (isActive) {
          setCommits(nextCommits);
          setCommitsNote(typeof data?.note === 'string' ? data.note : null);
        }
      } catch (err) {
        if (isActive) {
          setCommitsError(err instanceof Error ? err.message : 'Failed to load commits');
        }
      } finally {
        if (isActive) setIsCommitsLoading(false);
      }
    }

    loadCommits();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="activity-section" id="about">
      <h2 className="activity-heading">what i&apos;ve been up to</h2>
      <p className="skills-lede">what&apos;s he doing now</p>
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
          {commitsError ? <p className="activity-error">github error: {commitsError}</p> : null}
          {isCommitsLoading ? <p className="activity-loading">loading…</p> : null}
          {!isCommitsLoading && commitsNote ? <p className="activity-loading">{commitsNote}</p> : null}
          {!isCommitsLoading && !commitsError && commitsToShow.length === 0 ? (
            <p className="activity-loading">no recent commits yet.</p>
          ) : null}
          {commitsToShow.length > 0 ? (
            <ul>
              {commitsToShow.map((commit, index) => (
                <li key={`${commit.sha || commit.message}-${index}`}>
                  <span className="activity-main">
                    {commit.repoUrl ? (
                      <a href={commit.repoUrl} target="_blank" rel="noreferrer noopener">
                        {commit.repo}
                      </a>
                    ) : (
                      commit.repo
                    )}
                  </span>
                  <span className="activity-sub"> — </span>
                  {commit.commitUrl ? (
                    <a href={commit.commitUrl} target="_blank" rel="noreferrer noopener">
                      {commit.message}
                    </a>
                  ) : (
                    <span className="activity-sub">{commit.message}</span>
                  )}
                  {commit.sha ? (
                    <span className="activity-sub"> ({commit.sha.slice(0, 7)})</span>
                  ) : null}
                  {formatCommitDate(commit.createdAt) ? (
                    <div className="activity-sub">{formatCommitDate(commit.createdAt)}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
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
