/* eslint-env node */
/**
 * Production readiness for the homepage integrations.
 *
 * Checks that required env vars are set. It does not call Spotify, YouTube,
 * Steam, GitHub, Places, or Vercel, so it does not spend API quota.
 *
 * This is one Hobby function. Helpers live in `_readiness.ts`.
 */

import { apiError } from './_errors.js';
import type { ApiRequest, ApiResponse } from './_http.js';
import { getReadiness } from './_readiness.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json(apiError(405, 'Method not allowed'));
  }

  const report = getReadiness(process.env);
  const status = report.status === 'ok' ? 200 : 503;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'HEAD') return res.status(status).end();
  return res.status(status).json(report);
}
