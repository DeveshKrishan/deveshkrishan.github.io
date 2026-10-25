import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { IconType } from 'react-icons';
import { SiGithub, SiGoogle, SiSpotify, SiSteam, SiValorant, SiYoutube } from 'react-icons/si';

import beliLogo from './assets/beli_logo.webp';
import beliVisitsData from './data/beli-visits.json';
import { getPlacePhotoUrl } from './data/map-beli-visits';
import { formatWidgetError, formatWidgetResponseError } from './format-widget-error';
import { Photos } from './Photos';
import { WidgetBoundary, WidgetContent } from './WidgetBoundary';
import type { BeliVisitsFile, Commit, Game, Song, Video, Visit } from './types';

const SHOW_RECENT_COMMITS = false;
const ACTIVITY_SKELETON_ROWS = 3;

function ActivitySkeleton() {
  return (
    <ul className="activity-skeleton" role="status" aria-busy="true" aria-label="loading">
      {Array.from({ length: ACTIVITY_SKELETON_ROWS }, (_, index) => (
        <li key={index} className="activity-skeleton-row" aria-hidden="true">
          <span className="activity-skeleton-icon" />
          <span className="activity-skeleton-lines">
            <span className="activity-skeleton-line activity-skeleton-line--title" />
            <span className="activity-skeleton-line activity-skeleton-line--sub" />
            <span className="activity-skeleton-line activity-skeleton-line--meta" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Activity() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsError, setSongsError] = useState<string | null>(null);
  const [isSongsLoading, setIsSongsLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitsError, setCommitsError] = useState<string | null>(null);
  const [commitsNote, setCommitsNote] = useState<string | null>(null);
  const [isCommitsLoading, setIsCommitsLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [gamesNote, setGamesNote] = useState<string | null>(null);
  const [gamesSources, setGamesSources] = useState<string[]>(['steam']);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [isVideosLoading, setIsVideosLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadSongs() {
      try {
        setIsSongsLoading(true);
        setSongsError(null);

        const res = await fetch('/api/spotify/recently-played?limit=3');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (isActive) setSongsError(formatWidgetResponseError('spotify', res, data));
          return;
        }

        const nextSongs = Array.isArray(data?.songs) ? data.songs : [];
        if (isActive) setSongs(nextSongs);
      } catch {
        if (isActive) setSongsError(formatWidgetError({ source: 'spotify' }));
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
  const gamesToShow = useMemo(() => games.slice(0, 3), [games]);
  const videosToShow = useMemo(() => videos.slice(0, 3), [videos]);
  const visitsToShow = useMemo(
    () => ((beliVisitsData as BeliVisitsFile).visits ?? []).slice(0, 3),
    [],
  );

  const formatAchievementProgress = (achievements?: Game['achievements']) => {
    if (!achievements || achievements.total <= 0) return null;
    return `${achievements.unlocked} / ${achievements.total} achievements`;
  };

  const getAchievementFillPercent = (achievements?: Game['achievements']) => {
    if (!achievements || achievements.total <= 0) return null;
    return Math.min(100, Math.max(0, (achievements.unlocked / achievements.total) * 100));
  };

  const formatPlaytime = (minutes?: number | null) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatShortDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatPublishedDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatVisitPlace = (visit: Visit) =>
    [visit.neighborhood, visit.city].filter(Boolean).join(', ') || null;

  const formatViewCount = (count?: number | null) => {
    if (count == null || !Number.isFinite(count) || count < 0) return null;
    const formatted = new Intl.NumberFormat('en-US').format(Math.floor(count));
    return count === 1 ? '1 view' : `${formatted} views`;
  };

  const formatVideoDuration = (seconds?: number | null) => {
    if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const pad = (value: number) => String(value).padStart(2, '0');
    if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`;
    return `${minutes}:${pad(secs)}`;
  };

  const formatCommitDate = (value?: string | null) => {
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
    if (!SHOW_RECENT_COMMITS) return undefined;

    let isActive = true;

    async function loadCommits() {
      try {
        setIsCommitsLoading(true);
        setCommitsError(null);
        setCommitsNote(null);

        const res = await fetch('/api/github/recent-commits?limit=3');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (isActive) setCommitsError(formatWidgetResponseError('commits', res, data));
          return;
        }

        const nextCommits = Array.isArray(data?.commits) ? data.commits : [];
        if (isActive) {
          setCommits(nextCommits);
          setCommitsNote(typeof data?.note === 'string' ? data.note : null);
        }
      } catch {
        if (isActive) setCommitsError(formatWidgetError({ source: 'commits' }));
      } finally {
        if (isActive) setIsCommitsLoading(false);
      }
    }

    loadCommits();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadGames() {
      try {
        setIsGamesLoading(true);
        setGamesError(null);
        setGamesNote(null);
        setGamesSources(['steam']);

        const res = await fetch('/api/steam/recent-games?limit=3');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (isActive) setGamesError(formatWidgetResponseError('steam', res, data));
          return;
        }

        const nextGames = Array.isArray(data?.games) ? data.games : [];
        const nextSources = Array.isArray(data?.sources)
          ? data.sources.filter((source: unknown): source is string => typeof source === 'string')
          : ['steam'];
        if (isActive) {
          setGames(nextGames);
          setGamesNote(typeof data?.note === 'string' ? data.note : null);
          setGamesSources(nextSources.length > 0 ? nextSources : ['steam']);
        }
      } catch {
        if (isActive) setGamesError(formatWidgetError({ source: 'steam' }));
      } finally {
        if (isActive) setIsGamesLoading(false);
      }
    }

    loadGames();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadVideos() {
      try {
        setIsVideosLoading(true);
        setVideosError(null);

        const res = await fetch('/api/youtube/recent-videos?limit=3');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (isActive) setVideosError(formatWidgetResponseError('youtube', res, data));
          return;
        }

        const nextVideos = Array.isArray(data?.videos) ? data.videos : [];
        if (isActive) setVideos(nextVideos);
      } catch {
        if (isActive) setVideosError(formatWidgetError({ source: 'youtube' }));
      } finally {
        if (isActive) setIsVideosLoading(false);
      }
    }

    loadVideos();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="activity-section" id="about" data-reveal>
      <h2 className="activity-heading">what i&apos;ve been up to</h2>
      <div className="activity-grid">
        <WidgetBoundary label="recent songs" className="activity-column">
          <WidgetContent
            render={() => (
              <div className="activity-column">
                <h3>recent songs listened to</h3>
                {songsError ? <p className="activity-error">{songsError}</p> : null}
                {isSongsLoading ? <ActivitySkeleton /> : null}
                {!isSongsLoading && !songsError && songsToShow.length === 0 ? (
                  <p className="activity-loading">no recent songs yet.</p>
                ) : null}
                {songsToShow.length > 0 ? (
                  <ul>
                    {songsToShow.map((song) => (
                      <li
                        key={song.id || `${song.title}-${song.playedAt}`}
                        className="activity-song-row"
                      >
                        <div className="activity-song-title-row">
                          {song.imageUrl ? (
                            <img
                              src={song.imageUrl}
                              alt=""
                              className="activity-song-icon"
                              width={32}
                              height={32}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {song.url ? (
                            <a href={song.url} target="_blank" rel="noreferrer noopener">
                              <span className="activity-main">{song.title}</span>
                            </a>
                          ) : (
                            <span className="activity-main">{song.title}</span>
                          )}
                        </div>
                        {Array.isArray(song.artists) && song.artists.length > 0 ? (
                          <div className="activity-sub">
                            by{' '}
                            {song.artists.map((artist, index) => (
                              <span key={artist.url || artist.name}>
                                {index > 0 ? ', ' : null}
                                {artist.url ? (
                                  <a href={artist.url} target="_blank" rel="noreferrer noopener">
                                    {artist.name}
                                  </a>
                                ) : (
                                  artist.name
                                )}
                              </span>
                            ))}
                          </div>
                        ) : song.artist ? (
                          <div className="activity-sub">by {song.artist}</div>
                        ) : null}
                        {formatCommitDate(song.playedAt) ? (
                          <div className="activity-sub">
                            played {formatCommitDate(song.playedAt)}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="activity-attribution">{renderSourceCredit('spotify')}</p>
              </div>
            )}
          />
        </WidgetBoundary>
        <WidgetBoundary label="recent videos" className="activity-column">
          <WidgetContent
            render={() => (
              <div className="activity-column">
                <h3>recent videos published</h3>
                {videosError ? <p className="activity-error">{videosError}</p> : null}
                {isVideosLoading ? <ActivitySkeleton /> : null}
                {!isVideosLoading && !videosError && videosToShow.length === 0 ? (
                  <p className="activity-loading">no recent videos yet.</p>
                ) : null}
                {videosToShow.length > 0 ? (
                  <ul>
                    {videosToShow.map((video) => {
                      const views = formatViewCount(video.viewCount);
                      const duration = formatVideoDuration(video.durationSeconds);
                      const videoMeta = [views, duration].filter(Boolean).join(' · ');
                      const published = formatPublishedDate(video.publishedAt);

                      return (
                        <li
                          key={video.id || `${video.title}-${video.publishedAt}`}
                          className="activity-video-row"
                        >
                          <div className="activity-video-title-row">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt=""
                                className="activity-video-icon"
                                width={40}
                                height={40}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {video.url ? (
                              <a href={video.url} target="_blank" rel="noreferrer noopener">
                                <span className="activity-main">{video.title}</span>
                              </a>
                            ) : (
                              <span className="activity-main">{video.title}</span>
                            )}
                          </div>
                          {videoMeta ? <div className="activity-sub">{videoMeta}</div> : null}
                          {published ? (
                            <div className="activity-sub">published {published}</div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                <p className="activity-attribution">{renderSourceCredit('youtube')}</p>
              </div>
            )}
          />
        </WidgetBoundary>
        {SHOW_RECENT_COMMITS ? (
          <WidgetBoundary label="recent commits" className="activity-column">
            <WidgetContent
              render={() => (
                <div className="activity-column">
                  <h3>recent commits pushed</h3>
                  {commitsError ? <p className="activity-error">{commitsError}</p> : null}
                  {isCommitsLoading ? <p className="activity-loading">loading…</p> : null}
                  {!isCommitsLoading && commitsNote ? (
                    <p className="activity-loading">{commitsNote}</p>
                  ) : null}
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
                  <p className="activity-attribution">{renderSourceCredit('github')}</p>
                </div>
              )}
            />
          </WidgetBoundary>
        ) : null}
        <WidgetBoundary label="recent games" className="activity-column">
          <WidgetContent
            render={() => (
              <div className="activity-column">
                <h3>recent games played in last 2 weeks</h3>
                {gamesError ? <p className="activity-error">{gamesError}</p> : null}
                {isGamesLoading ? <ActivitySkeleton /> : null}
                {!isGamesLoading && gamesNote ? (
                  <p className="activity-loading">{gamesNote}</p>
                ) : null}
                {!isGamesLoading && !gamesError && gamesToShow.length === 0 ? (
                  <p className="activity-loading">no recent games yet.</p>
                ) : null}
                {gamesToShow.length > 0 ? (
                  <ul>
                    {gamesToShow.map((game, index) => {
                      const lastPlayed = formatShortDate(game.lastPlayedAt);
                      const playtime = formatPlaytime(game.playtimeMinutes);
                      const progress = formatAchievementProgress(game.achievements);
                      const fillPercent = getAchievementFillPercent(game.achievements);

                      return (
                        <li
                          key={`${game.source || 'game'}-${game.name}-${index}`}
                          className="activity-game-row"
                        >
                          <a href={game.storeUrl} target="_blank" rel="noreferrer noopener">
                            {game.source === 'valorant' ? (
                              <SiValorant
                                className="activity-game-icon activity-valorant-logo"
                                aria-hidden="true"
                                focusable="false"
                              />
                            ) : game.iconUrl ? (
                              <img
                                src={game.iconUrl}
                                alt=""
                                className="activity-game-icon"
                                width={32}
                                height={32}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="activity-main">{game.name}</span>
                          </a>
                          {lastPlayed || playtime || progress ? (
                            <div className="activity-game-meta">
                              {lastPlayed ? (
                                <div className="activity-sub activity-last-played">
                                  last played {lastPlayed}
                                </div>
                              ) : null}
                              {playtime ? (
                                <div className="activity-sub activity-playtime">
                                  {lastPlayed ? ` · ${playtime}` : playtime}
                                </div>
                              ) : null}
                              {progress ? (
                                <div className="activity-sub activity-achievement-count">
                                  {progress}
                                </div>
                              ) : null}
                              {fillPercent !== null ? (
                                <div
                                  className="activity-achievement-meter"
                                  aria-hidden="true"
                                  style={
                                    {
                                      '--achievement-fill': `${fillPercent}%`,
                                    } as CSSProperties
                                  }
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                <p className="activity-attribution">
                  {gamesSources.includes('steam') ? renderSourceCredit('steam') : null}
                  {gamesSources.includes('steam') && gamesSources.includes('valorant') ? (
                    <span className="activity-attribution-sep" aria-hidden="true">
                      {' · '}
                    </span>
                  ) : null}
                  {gamesSources.includes('valorant') ? renderSourceCredit('valorant') : null}
                </p>
              </div>
            )}
          />
        </WidgetBoundary>
        <WidgetBoundary label="recent restaurants" className="activity-column">
          <WidgetContent
            render={() => (
              <div className="activity-column">
                <h3>recent restaurants rated</h3>
                {visitsToShow.length === 0 ? (
                  <p className="activity-loading">no recent visits yet.</p>
                ) : (
                  <ul>
                    {visitsToShow.map((visit) => {
                      const photoUrl = getPlacePhotoUrl(visit.placeId);
                      return (
                        <li key={visit.id} className="activity-visit-row">
                          <div className="activity-visit-title-row">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt=""
                                className="activity-visit-icon"
                                width={40}
                                height={40}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span>
                              {visit.url ? (
                                <a href={visit.url} target="_blank" rel="noreferrer noopener">
                                  <span className="activity-main">{visit.name}</span>
                                </a>
                              ) : (
                                <span className="activity-main">{visit.name}</span>
                              )}
                              {visit.score == null ? null : (
                                <span className="activity-sub"> — {visit.score}/10</span>
                              )}
                            </span>
                          </div>
                          {Array.isArray(visit.cuisines) && visit.cuisines.length > 0 ? (
                            <ul className="activity-cuisine-chips">
                              {visit.cuisines.map((cuisine) => (
                                <li key={cuisine} className="activity-cuisine-chip">
                                  {cuisine}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {formatVisitPlace(visit) ? (
                            <div className="activity-sub">{formatVisitPlace(visit)}</div>
                          ) : null}
                          {formatShortDate(visit.visitedAt) ? (
                            <div className="activity-sub">
                              visited {formatShortDate(visit.visitedAt)}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="activity-attribution">
                  {renderSourceCredit('beli')}
                  {visitsToShow.some((visit) => visit.placeId) ? (
                    <>
                      <span className="activity-attribution-sep" aria-hidden="true">
                        {' · '}
                      </span>
                      {renderSourceCredit('google')}
                    </>
                  ) : null}
                </p>
              </div>
            )}
          />
        </WidgetBoundary>
      </div>
      <WidgetBoundary label="recent shots">
        <Photos />
      </WidgetBoundary>
    </section>
  );
}

/**
 * Brand colours follow each service's own guidelines. GitHub's mark may only be
 * black or white; black reads on this light page.
 */
interface ActivitySource {
  name: string;
  href: string;
  color: string;
  Icon?: IconType;
  iconSrc?: string;
}

const ACTIVITY_SOURCES: Record<string, ActivitySource> = {
  spotify: {
    name: 'Spotify',
    href: 'https://www.spotify.com',
    color: '#1db954',
    Icon: SiSpotify,
  },
  github: {
    name: 'GitHub',
    href: 'https://github.com/DeveshKrishan',
    color: '#111111',
    Icon: SiGithub,
  },
  steam: {
    name: 'Steam',
    href: 'https://store.steampowered.com',
    color: '#66c0f4',
    Icon: SiSteam,
  },
  valorant: {
    name: 'VALORANT',
    href: 'https://playvalorant.com',
    color: '#ff4655',
    Icon: SiValorant,
  },
  beli: {
    name: 'Beli',
    href: 'https://beliapp.com',
    color: '#ff5252',
    iconSrc: beliLogo,
  },
  google: {
    name: 'Google Places',
    href: 'https://developers.google.com/maps/documentation/places/web-service/policies',
    color: '#4285f4',
    Icon: SiGoogle,
  },
  youtube: {
    name: 'YouTube',
    href: 'https://www.youtube.com/@devaliskedits',
    color: '#ff0000',
    Icon: SiYoutube,
  },
};

function renderSourceCredit(sourceKey: string) {
  const source = ACTIVITY_SOURCES[sourceKey];
  if (!source) return null;

  const { name, href, color, Icon, iconSrc } = source;

  return (
    <a
      className="activity-source"
      style={{ '--source-color': color } as CSSProperties}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {Icon ? (
        <Icon className="activity-source-icon" aria-hidden="true" focusable="false" />
      ) : iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className="activity-source-icon"
          width={16}
          height={16}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      {name}
    </a>
  );
}

export default Activity;
