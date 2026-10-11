export function contributionCountToLevel(count) {
  const value = Number(count) || 0;
  if (value <= 0) return 0;
  if (value <= 2) return 1;
  if (value <= 5) return 2;
  if (value <= 9) return 3;
  return 4;
}

export function formatContributionMonth(date) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
}

export function getContributionMonthLabels(weeks, minGap = 2) {
  const labels = [];
  let lastIndex = null;

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

export function getCalendarFromGraphQL(payload) {
  return payload?.data?.user?.contributionsCollection?.contributionCalendar ?? null;
}

export function mapContributionCalendar(calendar, username) {
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
