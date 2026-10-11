export function formatCommitMessage(message) {
  const subject = String(message ?? '').split('\n')[0]?.trim();
  return subject || '';
}

export function getGitHubEventsPath(username) {
  return `/users/${encodeURIComponent(username)}/events/public?per_page=100`;
}

export function isPublicGitHubRepo(repoJson) {
  return repoJson?.private === false;
}

export function isPublicPushEvent(event) {
  if (event?.type !== 'PushEvent') return false;
  if (event.public === false) return false;
  return Boolean(event?.repo?.name && event?.payload?.head);
}

export function mapCommitFromPushEvent(event, commitJson) {
  if (!isPublicPushEvent(event)) return null;

  const repoName = event.repo.name;
  const headSha = event.payload.head;

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

export function getGitHubCommitsNote(commits) {
  if (commits.length > 0) return null;
  return 'No public PushEvents found.';
}

export function clampRequestLimit(limit, defaultLimit = 3, max = 50) {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), max);
}
