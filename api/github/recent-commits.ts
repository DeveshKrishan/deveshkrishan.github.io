/* eslint-env node */
/**
 * GitHub API - recent commits via public PushEvent activity.
 *
 * This homepage widget only surfaces commits from public repositories. A token
 * is optional and used only to raise GitHub rate limits — never to include
 * private activity. It returns commit metadata (repo, message, sha, url,
 * timestamp). PushEvent payloads do not include line-diff counts.
 */

import type { ApiRequest, ApiResponse } from '../_http';
import {
  clampRequestLimit,
  getGitHubCommitsNote,
  getGitHubEventsPath,
  isPublicGitHubRepo,
  isPublicPushEvent,
  mapCommitFromPushEvent,
} from './_map-recent-commits';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseGitHubErrorBody(text: string) {
  try {
    const data = JSON.parse(text);
    const message = data?.message ?? text;
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

async function isPublicRepo(
  repoName: string,
  headers: Record<string, string>,
  repoVisibility: Map<string, boolean>,
) {
  if (repoVisibility.has(repoName)) {
    return repoVisibility.get(repoName);
  }

  try {
    const repoRes = await fetchWithRetry(`${GITHUB_API_BASE}/repos/${repoName}`, { headers });
    const repoText = await repoRes.text();
    if (!repoRes.ok) {
      repoVisibility.set(repoName, false);
      return false;
    }

    const isPublic = isPublicGitHubRepo(JSON.parse(repoText));
    repoVisibility.set(repoName, isPublic);
    return isPublic;
  } catch {
    repoVisibility.set(repoName, false);
    return false;
  }
}

async function buildRecentCommits(
  events: unknown[],
  limit: number,
  headers: Record<string, string>,
) {
  const commits = [];
  const repoVisibility = new Map();

  for (const rawEvent of events) {
    const event = rawEvent as Parameters<typeof isPublicPushEvent>[0];
    if (!isPublicPushEvent(event) || !event?.repo?.name || !event.payload?.head) continue;

    const repoName = event.repo.name;
    const headSha = event.payload.head;
    const isPublic = await isPublicRepo(repoName, headers, repoVisibility);
    if (!isPublic) continue;

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const username = process.env.GITHUB_USERNAME || 'DeveshKrishan';
  const token = process.env.GITHUB_TOKEN;
  const limit = clampRequestLimit(
    Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit,
  );

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const eventsPath = getGitHubEventsPath(username);
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
    const note = getGitHubCommitsNote(commits);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ commits, note });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected GitHub error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
