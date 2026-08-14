export function formatCommitMessage(message) {
  const subject = String(message ?? '').split('\n')[0]?.trim();
  return subject || '';
}

export function mapCommitFromPushEvent(event, commitJson) {
  if (event?.type !== 'PushEvent') return null;

  const repoName = event?.repo?.name ?? '';
  const headSha = event?.payload?.head ?? null;
  if (!repoName || !headSha) return null;

  const repoUrl = `https://github.com/${repoName}`;
  const message = formatCommitMessage(commitJson?.commit?.message);
  const htmlUrl = commitJson?.html_url ?? `${repoUrl}/commit/${headSha}`;
  const createdAt =
    event?.created_at ??
    commitJson?.commit?.author?.date ??
    commitJson?.commit?.committer?.date ??
    null;

  return {
    repo: repoName,
    repoUrl,
    message,
    sha: headSha,
    commitUrl: htmlUrl,
    createdAt,
    ref: event?.payload?.ref ?? event?.ref ?? null,
  };
}

export function getGitHubCommitsNote(commits, hasToken) {
  if (commits.length > 0) return null;

  return hasToken
    ? 'No recent PushEvents found yet.'
    : 'No public PushEvents found. Set GITHUB_TOKEN to include authenticated activity.';
}

export function clampRequestLimit(limit, defaultLimit = 3, max = 50) {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), max);
}
