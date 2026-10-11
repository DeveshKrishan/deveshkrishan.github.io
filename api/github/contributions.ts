/* eslint-env node */
/**
 * GitHub GraphQL – contribution calendar for the homepage heatmap.
 *
 * Uses GITHUB_USERNAME (defaults to DeveshKrishan) and GITHUB_TOKEN.
 * A token is required; the GraphQL API does not serve this calendar anonymously.
 */

import type { ApiRequest, ApiResponse } from '../_http';
import {
  getCalendarFromGraphQL,
  mapContributionCalendar,
} from './_map-contributions';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

const CONTRIBUTION_QUERY = `
  query ContributionCalendar($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseGitHubErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const message = data?.message ?? data?.errors?.[0]?.message ?? text;
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
      ? Math.min(Number(retryAfter) * 1000, 60 * 1000)
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

  const username = process.env.GITHUB_USERNAME || 'DeveshKrishan';
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Missing GITHUB_TOKEN. Set it to load the contribution heatmap.',
    });
  }

  try {
    const graphRes = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { login: username },
      }),
    });

    const graphText = await graphRes.text();
    if (!graphRes.ok) {
      const message = parseGitHubErrorBody(graphText);
      const status = graphRes.status === 429 ? 429 : graphRes.status >= 500 ? 502 : 500;
      return res.status(status).json({
        error: 'Failed to fetch GitHub contributions',
        message,
      });
    }

    const payload = JSON.parse(graphText);
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      return res.status(502).json({
        error: 'Failed to fetch GitHub contributions',
        message: payload.errors[0]?.message || 'GraphQL error',
      });
    }

    const calendar = getCalendarFromGraphQL(payload);
    if (!calendar) {
      return res.status(404).json({
        error: 'GitHub user or contribution calendar not found',
      });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(mapContributionCalendar(calendar, username));
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected GitHub error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
