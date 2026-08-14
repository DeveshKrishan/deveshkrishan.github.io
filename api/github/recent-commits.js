/* eslint-env node */
/**
 * GitHub API - recent commits via PushEvent activity.
 *
 * This is a lightweight homepage widget, so it uses user events when a token is
 * available and public events otherwise. It only returns commit metadata
 * (repo, message, sha, url, timestamp). PushEvent payloads do not include
 * line-diff counts.
 */

import {
  clampRequestLimit,
  getGitHubCommitsNote,
  mapCommitFromPushEvent,
} from './map-recent-commits.js';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseGitHubErrorBody(text) {
  try {
    const data = JSON.parse(text);
    const message = data?.message ?? text;
    return typeof message === 'string' ? message : JSON.stringify(message);
  } catch {
    return text || 'Unknown error';
  }
}

async function fetchWithRetry(url, options, retriesLeft = MAX_RETRIES) {
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

async function buildRecentCommits(events, limit, headers) {
  const commits = [];

  for (const event of events) {
    if (event?.type !== 'PushEvent') continue;

    const repoName = event?.repo?.name ?? '';
    const headSha = event?.payload?.head ?? null;
    if (!repoName || !headSha) continue;

    const commitApiUrl = `${GITHUB_API_BASE}/repos/${repoName}/commits/${headSha}`;

    try {
      const commitRes = await fetchWithRetry(commitApiUrl, { headers });
      const commitText = await commitRes.text();
      if (!commitRes.ok) {
        continue;
      }

      const commitJson = JSON.parse(commitText);
      const commit = mapCommitFromPushEvent(event, commitJson);
      if (!commit) continue;

      commits.push(commit);

      if (commits.length >= limit) break;
    } catch {
      continue;
    }
  }

  return commits;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const username = process.env.GITHUB_USERNAME || 'DeveshKrishan';
  const token = process.env.GITHUB_TOKEN;
  const limit = clampRequestLimit(req.query?.limit);

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const eventsPath = token
      ? `/users/${encodeURIComponent(username)}/events?per_page=100`
      : `/users/${encodeURIComponent(username)}/events/public?per_page=100`;
    const eventsRes = await fetchWithRetry(`${GITHUB_API_BASE}${eventsPath}`, { headers });

    const eventsText = await eventsRes.text();
    if (!eventsRes.ok) {
      const message = parseGitHubErrorBody(eventsText);
      const status = eventsRes.status === 429 ? 429 : eventsRes.status >= 500 ? 502 : 500;
      return res.status(status).json({
        error: 'Failed to fetch GitHub activity',
        message,
      });
    }

    const events = JSON.parse(eventsText);
    const commits = await buildRecentCommits(Array.isArray(events) ? events : [], limit, headers);
    const note = getGitHubCommitsNote(commits, Boolean(token));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ commits, note });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected GitHub error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
