import { describe, expect, it } from 'vitest';
import {
  contributionCountToLevel,
  formatContributionMonth,
  getCalendarFromGraphQL,
  getContributionMonthLabels,
  mapContributionCalendar,
} from './_map-contributions.js';

describe('contributionCountToLevel', () => {
  it('maps counts onto five ink levels', () => {
    expect(contributionCountToLevel(0)).toBe(0);
    expect(contributionCountToLevel(1)).toBe(1);
    expect(contributionCountToLevel(2)).toBe(1);
    expect(contributionCountToLevel(5)).toBe(2);
    expect(contributionCountToLevel(9)).toBe(3);
    expect(contributionCountToLevel(10)).toBe(4);
  });
});

describe('formatContributionMonth', () => {
  it('formats a UTC date as a short month', () => {
    expect(formatContributionMonth('2026-01-04')).toBe('Jan');
    expect(formatContributionMonth('not-a-date')).toBe('');
  });
});

describe('getContributionMonthLabels', () => {
  it('emits a label when the month changes', () => {
    const weeks = [
      { days: [{ date: '2025-11-02' }] },
      { days: [{ date: '2025-11-09' }] },
      { days: [{ date: '2025-11-16' }] },
      { days: [{ date: '2025-12-07' }] },
      { days: [{ date: '2025-12-14' }] },
      { days: [{ date: '2026-01-04' }] },
    ];

    expect(getContributionMonthLabels(weeks)).toEqual([
      { index: 0, label: 'Nov' },
      { index: 3, label: 'Dec' },
      { index: 5, label: 'Jan' },
    ]);
  });

  it('skips a new month label when it would sit on the next column', () => {
    const weeks = [
      { days: [{ date: '2025-11-30' }] },
      { days: [{ date: '2025-12-07' }] },
    ];

    expect(getContributionMonthLabels(weeks)).toEqual([{ index: 0, label: 'Nov' }]);
  });
});

describe('getCalendarFromGraphQL', () => {
  it('reads the nested contribution calendar or returns null', () => {
    expect(getCalendarFromGraphQL(null)).toBeNull();
    expect(
      getCalendarFromGraphQL({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: { totalContributions: 12, weeks: [] },
            },
          },
        },
      }),
    ).toEqual({ totalContributions: 12, weeks: [] });
  });
});

describe('mapContributionCalendar', () => {
  it('maps GitHub calendar weeks into heatmap data', () => {
    const calendar = {
      totalContributions: 4,
      weeks: [
        {
          firstDay: '2026-04-05',
          contributionDays: [
            { date: '2026-04-05', contributionCount: 0 },
            { date: '2026-04-06', contributionCount: 3 },
          ],
        },
      ],
    };

    expect(mapContributionCalendar(calendar, 'DeveshKrishan')).toEqual({
      username: 'DeveshKrishan',
      profileUrl: 'https://github.com/DeveshKrishan',
      total: 4,
      weeks: [
        {
          firstDay: '2026-04-05',
          days: [
            { date: '2026-04-05', count: 0, level: 0 },
            { date: '2026-04-06', count: 3, level: 2 },
          ],
        },
      ],
      months: [{ index: 0, label: 'Apr' }],
    });
  });

  it('returns an empty calendar when the payload is missing', () => {
    expect(mapContributionCalendar(null, '')).toEqual({
      username: '',
      profileUrl: 'https://github.com',
      total: 0,
      weeks: [],
      months: [],
    });
  });
});
