import { describe, expect, it } from 'vitest';

import { buildVisitCountUrl, mapVisitCount, resolveAnalyticsAuth } from './_map-visitors.js';

describe('resolveAnalyticsAuth', () => {
  it('reads the token and project id', () => {
    expect(
      resolveAnalyticsAuth({
        VERCEL_TOKEN: 'token',
        VERCEL_PROJECT_ID: 'prj_123',
      }),
    ).toEqual({
      token: 'token',
      projectId: 'prj_123',
      teamId: undefined,
    });
  });

  it('prefers an explicit team id and accepts team-shaped org ids', () => {
    expect(
      resolveAnalyticsAuth({
        VERCEL_TOKEN: 'token',
        VERCEL_PROJECT_ID: 'prj_123',
        VERCEL_TEAM_ID: 'team_explicit',
        VERCEL_ORG_ID: 'team_org',
      }),
    ).toEqual({
      token: 'token',
      projectId: 'prj_123',
      teamId: 'team_explicit',
    });

    expect(
      resolveAnalyticsAuth({
        VERCEL_TOKEN: 'token',
        VERCEL_PROJECT_ID: 'prj_123',
        VERCEL_ORG_ID: 'team_org',
      }).teamId,
    ).toBe('team_org');

    expect(
      resolveAnalyticsAuth({
        VERCEL_TOKEN: 'token',
        VERCEL_PROJECT_ID: 'prj_123',
        VERCEL_ORG_ID: 'user_abc',
      }).teamId,
    ).toBeUndefined();
  });
});

describe('buildVisitCountUrl', () => {
  it('adds project and optional team query params', () => {
    expect(buildVisitCountUrl({ projectId: 'prj_123' })).toBe(
      'https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=prj_123',
    );
    expect(buildVisitCountUrl({ projectId: 'prj_123', teamId: 'team_1' })).toBe(
      'https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=prj_123&teamId=team_1',
    );
  });
});

describe('mapVisitCount', () => {
  it('maps pageviews and visitors from a count response', () => {
    expect(
      mapVisitCount({
        data: { pageviews: 1250, visitors: 980 },
      }),
    ).toEqual({ pageviews: 1250, visitors: 980 });
  });

  it('returns null when counts are missing or invalid', () => {
    expect(mapVisitCount(null)).toBeNull();
    expect(mapVisitCount({ data: { visitors: 4 } })).toBeNull();
    expect(mapVisitCount({ data: { pageviews: 'nope', visitors: 1 } })).toBeNull();
  });
});
