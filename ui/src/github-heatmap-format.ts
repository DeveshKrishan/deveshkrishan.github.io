import type { ContributionWeek } from './types';

export function getContributionYear(
  weeks: ContributionWeek[],
  fallbackYear = new Date().getUTCFullYear(),
) {
  for (let weekIndex = weeks.length - 1; weekIndex >= 0; weekIndex -= 1) {
    const days = weeks[weekIndex]?.days ?? [];
    for (let dayIndex = days.length - 1; dayIndex >= 0; dayIndex -= 1) {
      const year = Number(days[dayIndex]?.date?.slice(0, 4));
      if (year) return year;
    }
  }

  return fallbackYear;
}

interface HeatmapCaptionInput {
  isLoading: boolean;
  error: string | null;
  total: number;
  year: number;
}

export function formatHeatmapCaption({ isLoading, error, total, year }: HeatmapCaptionInput) {
  if (isLoading) return 'loading contributions';
  if (error) return 'contributions unavailable';

  const noun = total === 1 ? 'contribution' : 'contributions';
  return `${total} ${noun} in ${year}`;
}

export function formatDayTitle(date: string | null | undefined, count: number) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';

  const when = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const noun = count === 1 ? 'contribution' : 'contributions';
  return `${count} ${noun} on ${when}`;
}
