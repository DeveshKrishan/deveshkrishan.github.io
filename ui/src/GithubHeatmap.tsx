import { useEffect, useState, type CSSProperties } from 'react';
import { FaGithub } from 'react-icons/fa';
import DitherBackground from './DitherBackground';
import {
  formatDayTitle,
  formatHeatmapCaption,
  getContributionYear,
} from './github-heatmap-format';
import type { ContributionCalendar } from './types';

const SKELETON_WEEKS = 53;
const SKELETON_DAYS = 7;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function HeatmapSkeleton() {
  return (
    <div className="intro-heatmap-scroll">
      <div className="intro-heatmap-weeks intro-heatmap-weeks--skeleton" aria-hidden="true">
        {Array.from({ length: SKELETON_WEEKS * SKELETON_DAYS }, (_, index) => (
          <span key={index} className="intro-heatmap-cell" data-level="0" />
        ))}
      </div>
    </div>
  );
}

function HeatmapLegend() {
  return (
    <div className="intro-heatmap-legend" aria-hidden="true">
      <span>Less</span>
      {[0, 1, 2, 3, 4].map((level) => (
        <span key={level} className="intro-heatmap-cell" data-level={level} />
      ))}
      <span>More</span>
    </div>
  );
}

function GithubHeatmap() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadContributions() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch('/api/github/contributions');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const message = data?.error || `Request failed (${res.status})`;
          throw new Error(message);
        }

        if (isActive) setCalendar(data as ContributionCalendar);
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Failed to load contributions');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadContributions();
    return () => {
      isActive = false;
    };
  }, []);

  const total = calendar?.total ?? 0;
  const weeks = calendar?.weeks ?? [];
  const months = calendar?.months ?? [];
  const username = calendar?.username || 'DeveshKrishan';
  const profileUrl = calendar?.profileUrl ?? 'https://github.com/DeveshKrishan';
  const year = getContributionYear(weeks);
  const caption = formatHeatmapCaption({ isLoading, error, total, year });

  return (
    <article className="intro-heatmap" aria-labelledby="github-heatmap-caption">
      <DitherBackground />
      <header className="intro-heatmap-header">
        <h3 className="intro-heatmap-title" id="github-heatmap-caption">
          <FaGithub className="intro-heatmap-logo" aria-hidden="true" focusable="false" />
          <span>GitHub Activity</span>
          <span className="intro-heatmap-handle">@{username}</span>
        </h3>
        <a
          className="intro-heatmap-profile"
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          View Profile →
        </a>
      </header>

      {error ? <p className="intro-heatmap-error">{error}</p> : null}

      {isLoading ? (
        <HeatmapSkeleton />
      ) : weeks.length > 0 ? (
        <div className="intro-heatmap-scroll">
          <div
            className="intro-heatmap-chart"
            style={{ '--heatmap-weeks': weeks.length } as CSSProperties}
            aria-hidden="true"
          >
            <div className="intro-heatmap-months">
              {months.map((month) => (
                <span
                  key={`${month.label}-${month.index}`}
                  className="intro-heatmap-month"
                  style={{ gridColumn: month.index + 1 }}
                >
                  {month.label}
                </span>
              ))}
            </div>
            <div className="intro-heatmap-weekdays">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={`${label}-${index}`}>{index % 2 === 1 ? label : ''}</span>
              ))}
            </div>
            <div className="intro-heatmap-weeks">
              {weeks.map((week, weekIndex) =>
                week.days.map((day, dayIndex) => (
                  <span
                    key={day.date ?? `${weekIndex}-${dayIndex}`}
                    className="intro-heatmap-cell"
                    data-level={day.level}
                    title={formatDayTitle(day.date, day.count)}
                  />
                )),
              )}
            </div>
          </div>
        </div>
      ) : null}

      <footer className="intro-heatmap-footer">
        <p className="intro-heatmap-total">{caption}</p>
        <HeatmapLegend />
      </footer>

      <p className="sr-only">
        {isLoading
          ? 'Loading GitHub contributions for the last year.'
          : error
            ? `GitHub contributions failed to load. ${error}`
            : `${total} GitHub contributions in ${year}.`}
      </p>
    </article>
  );
}

export default GithubHeatmap;
