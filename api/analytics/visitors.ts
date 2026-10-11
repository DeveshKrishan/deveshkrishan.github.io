/* eslint-env node */
/**
 * Vercel Web Analytics – lifetime production visitor and pageview totals.
 *
 * Uses VERCEL_TOKEN plus VERCEL_PROJECT_ID (injected on Vercel).
 * Team projects also need VERCEL_TEAM_ID, or VERCEL_ORG_ID when it is a team_ id.
 */

import type { ApiRequest, ApiResponse } from '../_http';
import {
  buildVisitCountUrl,
  mapVisitCount,
  resolveAnalyticsAuth,
} from './_map-visitors';

const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseVercelErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const message = data?.error?.message ?? data?.message ?? text;
    return typeof message === 'string' ? message : JSON.stringify(message);
  } catch {
    return text || 'Unknown error';
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retriesLeft = MAX_RETRIES) {
  const res = await fetch(url, options);

  if (res.status === 429 && retriesLeft > 0) {
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter
      ? Math.min(Number(retryAfter) * 1000, 60_000)
      : DEFAULT_BACKOFF_MS * Math.pow(2, MAX_RETRIES - retriesLeft);
    await sleep(waitMs);
    return fetchWithRetry(url, options, retriesLeft - 1);
  }

  return res;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, projectId, teamId } = resolveAnalyticsAuth();

  if (!token) {
    return res.status(500).json({
      error: 'Missing VERCEL_TOKEN. Create a Vercel access token to load visitor counts.',
    });
  }

  if (!projectId) {
    return res.status(500).json({
      error: 'Missing VERCEL_PROJECT_ID. Set it locally, or deploy so Vercel injects it.',
    });
  }

  try {
    const analyticsRes = await fetchWithRetry(buildVisitCountUrl({ projectId, teamId }), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const analyticsText = await analyticsRes.text();
    if (!analyticsRes.ok) {
      const message = parseVercelErrorBody(analyticsText);
      const status = analyticsRes.status === 429 ? 429 : analyticsRes.status >= 500 ? 502 : 500;
      return res.status(status).json({
        error: 'Failed to fetch Vercel visitor counts',
        message,
      });
    }

    const payload = JSON.parse(analyticsText);
    const counts = mapVisitCount(payload);
    if (!counts) {
      return res.status(502).json({
        error: 'Failed to fetch Vercel visitor counts',
        message: 'Unexpected analytics response',
      });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(counts);
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected Vercel analytics error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
