interface ContributionDayInput {
  date?: string;
  contributionCount?: unknown;
}

interface ContributionWeekInput {
  firstDay?: string;
  contributionDays?: ContributionDayInput[];
  days?: Array<{ date?: string | null; count?: number; level?: number }>;
}

interface ContributionCalendarInput {
  totalContributions?: unknown;
  weeks?: ContributionWeekInput[];
}

interface GraphQLContributionPayload {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendarInput;
      };
    };
  };
}

export function contributionCountToLevel(count: unknown) {
  const value = Number(count) || 0;
  if (value <= 0) return 0;
  if (value <= 2) return 1;
  if (value <= 5) return 2;
  if (value <= 9) return 3;
  return 4;
}

export function formatContributionMonth(date: string | null | undefined) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
}

export function getContributionMonthLabels(
  weeks: Array<{ days?: Array<{ date?: string | null }> }> | null | undefined,
  minGap = 2,
) {
  const labels: Array<{ index: number; label: string }> = [];
  let lastIndex: number | null = null;

  (weeks ?? []).forEach((week, index) => {
    const firstDate = week?.days?.[0]?.date;
    const label = formatContributionMonth(firstDate);
    if (!label) return;
    if (labels.at(-1)?.label === label) return;
    if (lastIndex !== null && index - lastIndex < minGap) return;

    labels.push({ index, label });
    lastIndex = index;
  });

  return labels;
}

export function getCalendarFromGraphQL(payload: unknown) {
  return (payload as GraphQLContributionPayload)?.data?.user?.contributionsCollection
    ?.contributionCalendar ?? null;
}

export function mapContributionCalendar(
  calendar: ContributionCalendarInput | null | undefined,
  username: string,
) {
  const login = String(username ?? '').trim();
  const weeks = Array.isArray(calendar?.weeks)
    ? calendar.weeks.map((week) => ({
        firstDay: week?.firstDay ?? week?.contributionDays?.[0]?.date ?? null,
        days: (week?.contributionDays ?? []).map((day) => ({
          date: day?.date ?? null,
          count: Number(day?.contributionCount) || 0,
          level: contributionCountToLevel(day?.contributionCount),
        })),
      }))
    : [];

  return {
    username: login,
    profileUrl: login ? `https://github.com/${encodeURIComponent(login)}` : 'https://github.com',
    total: Number(calendar?.totalContributions) || 0,
    weeks,
    months: getContributionMonthLabels(weeks),
  };
}
