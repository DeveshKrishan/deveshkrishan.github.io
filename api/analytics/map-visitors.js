const VISIT_COUNT_URL = 'https://api.vercel.com/v1/query/web-analytics/visits/count';

export function resolveAnalyticsAuth(env = process.env) {
  const token = env.VERCEL_TOKEN;
  const projectId = env.VERCEL_PROJECT_ID;
  const explicitTeamId = env.VERCEL_TEAM_ID;
  const orgId = env.VERCEL_ORG_ID;
  const teamId =
    explicitTeamId ||
    (typeof orgId === 'string' && orgId.startsWith('team_') ? orgId : undefined);

  return { token, projectId, teamId };
}

export function buildVisitCountUrl({ projectId, teamId } = {}) {
  const url = new URL(VISIT_COUNT_URL);
  if (projectId) url.searchParams.set('projectId', projectId);
  if (teamId) url.searchParams.set('teamId', teamId);
  return url.toString();
}

export function mapVisitCount(payload) {
  const pageviews = Number(payload?.data?.pageviews);
  const visitors = Number(payload?.data?.visitors);

  if (!Number.isFinite(pageviews) || !Number.isFinite(visitors)) {
    return null;
  }

  return { pageviews, visitors };
}
