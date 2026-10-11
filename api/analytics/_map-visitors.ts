const VISIT_COUNT_URL = 'https://api.vercel.com/v1/query/web-analytics/visits/count';

interface AnalyticsEnv {
  VERCEL_TOKEN?: string;
  VERCEL_PROJECT_ID?: string;
  VERCEL_TEAM_ID?: string;
  VERCEL_ORG_ID?: string;
}

interface VisitCountUrlInput {
  projectId?: string;
  teamId?: string;
}

interface VisitCountPayload {
  data?: {
    pageviews?: unknown;
    visitors?: unknown;
  };
}

export function resolveAnalyticsAuth(env: AnalyticsEnv = process.env) {
  const token = env.VERCEL_TOKEN;
  const projectId = env.VERCEL_PROJECT_ID;
  const explicitTeamId = env.VERCEL_TEAM_ID;
  const orgId = env.VERCEL_ORG_ID;
  const teamId =
    explicitTeamId ||
    (typeof orgId === 'string' && orgId.startsWith('team_') ? orgId : undefined);

  return { token, projectId, teamId };
}

export function buildVisitCountUrl({ projectId, teamId }: VisitCountUrlInput = {}) {
  const url = new URL(VISIT_COUNT_URL);
  if (projectId) url.searchParams.set('projectId', projectId);
  if (teamId) url.searchParams.set('teamId', teamId);
  return url.toString();
}

export function mapVisitCount(payload: unknown) {
  const data = (payload as VisitCountPayload | null)?.data;
  const pageviews = Number(data?.pageviews);
  const visitors = Number(data?.visitors);

  if (!Number.isFinite(pageviews) || !Number.isFinite(visitors)) {
    return null;
  }

  return { pageviews, visitors };
}
