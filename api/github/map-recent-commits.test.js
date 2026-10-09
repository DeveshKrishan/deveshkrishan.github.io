import { describe, expect, it } from 'vitest';
import {
  clampRequestLimit,
  formatCommitMessage,
  getGitHubCommitsNote,
  getGitHubEventsPath,
  isPublicGitHubRepo,
  isPublicPushEvent,
  mapCommitFromPushEvent,
} from './map-recent-commits.js';

describe('formatCommitMessage', () => {
  it('returns only the first line of a multi-line commit message', () => {
    const message = [
      'ci: stop triggering checks on dependency and vite config changes',
      '',
      'Co-authored-by: Cursor <cursoragent@cursor.com>',
    ].join('\n');

    expect(formatCommitMessage(message)).toBe(
      'ci: stop triggering checks on dependency and vite config changes',
    );
  });

  it('trims whitespace and handles empty input', () => {
    expect(formatCommitMessage('  feat: add tests  \n\nbody')).toBe('feat: add tests');
    expect(formatCommitMessage('')).toBe('');
  });
});

describe('mapCommitFromPushEvent', () => {
  it('maps a PushEvent and commit payload into commit metadata', () => {
    const event = {
      type: 'PushEvent',
      repo: { name: 'DeveshKrishan/deveshkrishan.github.io' },
      payload: { head: 'abc123def456', ref: 'refs/heads/main' },
      created_at: '2026-08-13T17:00:00Z',
    };
    const commitJson = {
      html_url: 'https://github.com/DeveshKrishan/deveshkrishan.github.io/commit/abc123def456',
      commit: {
        message: 'feat: add API checks',
        author: { date: '2026-08-13T16:59:00Z' },
      },
    };

    expect(mapCommitFromPushEvent(event, commitJson)).toEqual({
      repo: 'DeveshKrishan/deveshkrishan.github.io',
      repoUrl: 'https://github.com/DeveshKrishan/deveshkrishan.github.io',
      message: 'feat: add API checks',
      sha: 'abc123def456',
      commitUrl: 'https://github.com/DeveshKrishan/deveshkrishan.github.io/commit/abc123def456',
      createdAt: '2026-08-13T17:00:00Z',
      ref: 'refs/heads/main',
    });
  });

  it('returns null for non-push events, private events, or missing repo/sha', () => {
    expect(mapCommitFromPushEvent({ type: 'WatchEvent' }, {})).toBeNull();
    expect(mapCommitFromPushEvent({ type: 'PushEvent', repo: { name: 'org/repo' } }, {})).toBeNull();
    expect(
      mapCommitFromPushEvent(
        {
          type: 'PushEvent',
          public: false,
          repo: { name: 'org/private-repo' },
          payload: { head: 'abc123' },
        },
        { commit: { message: 'secret work' } },
      ),
    ).toBeNull();
  });
});

describe('getGitHubEventsPath', () => {
  it('always uses the public events endpoint', () => {
    expect(getGitHubEventsPath('DeveshKrishan')).toBe(
      '/users/DeveshKrishan/events/public?per_page=100',
    );
  });
});

describe('isPublicGitHubRepo', () => {
  it('only treats repos that are explicitly public as public', () => {
    expect(isPublicGitHubRepo({ private: false })).toBe(true);
    expect(isPublicGitHubRepo({ private: true })).toBe(false);
    expect(isPublicGitHubRepo({})).toBe(false);
    expect(isPublicGitHubRepo(null)).toBe(false);
  });
});

describe('isPublicPushEvent', () => {
  const publicPushEvent = {
    type: 'PushEvent',
    public: true,
    repo: { name: 'DeveshKrishan/deveshkrishan.github.io' },
    payload: { head: 'abc123' },
  };

  it('accepts public PushEvents with a repo and head sha', () => {
    expect(isPublicPushEvent(publicPushEvent)).toBe(true);
    expect(isPublicPushEvent({ ...publicPushEvent, public: undefined })).toBe(true);
  });

  it('rejects private or incomplete events', () => {
    expect(isPublicPushEvent({ ...publicPushEvent, public: false })).toBe(false);
    expect(isPublicPushEvent({ ...publicPushEvent, type: 'WatchEvent' })).toBe(false);
    expect(isPublicPushEvent({ ...publicPushEvent, payload: {} })).toBe(false);
  });
});

describe('getGitHubCommitsNote', () => {
  it('returns null when commits exist', () => {
    expect(getGitHubCommitsNote([{ repo: 'org/repo' }])).toBeNull();
  });

  it('returns a public-only empty-state note', () => {
    expect(getGitHubCommitsNote([])).toBe('No public PushEvents found.');
  });
});

describe('clampRequestLimit', () => {
  it('clamps query limits between 1 and 50', () => {
    expect(clampRequestLimit(undefined)).toBe(3);
    expect(clampRequestLimit(0)).toBe(3);
    expect(clampRequestLimit(100)).toBe(50);
    expect(clampRequestLimit(5)).toBe(5);
  });
});
