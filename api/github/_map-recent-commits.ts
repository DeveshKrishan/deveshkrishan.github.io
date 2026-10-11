interface GitHubRepoJson {
  private?: boolean;
}

interface GitHubPushEvent {
  type?: string;
  public?: boolean;
  created_at?: string;
  ref?: string;
  repo?: { name?: string };
  payload?: {
    head?: string;
    ref?: string;
  };
}

interface GitHubCommitJson {
  html_url?: string;
  commit?: {
    message?: string;
    author?: { date?: string };
    committer?: { date?: string };
  };
}

export function formatCommitMessage(message: unknown) {
  const subject = String(message ?? '').split('\n')[0]?.trim();
  return subject || '';
}

export function getGitHubEventsPath(username: string) {
  return `/users/${encodeURIComponent(username)}/events/public?per_page=100`;
}

export function isPublicGitHubRepo(repoJson: GitHubRepoJson | null | undefined) {
  return repoJson?.private === false;
}

export function isPublicPushEvent(event: GitHubPushEvent | null | undefined) {
  if (event?.type !== 'PushEvent') return false;
  if (event.public === false) return false;
  return Boolean(event?.repo?.name && event?.payload?.head);
}

export function mapCommitFromPushEvent(
  event: GitHubPushEvent,
  commitJson: GitHubCommitJson | null | undefined,
) {
  if (!isPublicPushEvent(event)) return null;

  const repoName = event.repo?.name;
  const headSha = event.payload?.head;
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

export function getGitHubCommitsNote(commits: unknown[]) {
  if (commits.length > 0) return null;
  return 'No public PushEvents found.';
}

export function clampRequestLimit(limit: unknown, defaultLimit = 3, max = 50) {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), max);
}
