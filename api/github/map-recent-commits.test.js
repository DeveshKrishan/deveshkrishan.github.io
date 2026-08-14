import { describe, expect, it } from 'vitest';
import {
  clampRequestLimit,
  getGitHubCommitsNote,
  mapCommitFromPushEvent,
} from './map-recent-commits.js';

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

  it('returns null for non-push events or missing repo/sha', () => {
    expect(mapCommitFromPushEvent({ type: 'WatchEvent' }, {})).toBeNull();
    expect(mapCommitFromPushEvent({ type: 'PushEvent', repo: { name: 'org/repo' } }, {})).toBeNull();
  });
});

describe('getGitHubCommitsNote', () => {
  it('returns null when commits exist', () => {
    expect(getGitHubCommitsNote([{ repo: 'org/repo' }], false)).toBeNull();
  });

  it('returns token-aware empty-state notes', () => {
    expect(getGitHubCommitsNote([], true)).toBe('No recent PushEvents found yet.');
    expect(getGitHubCommitsNote([], false)).toBe(
      'No public PushEvents found. Set GITHUB_TOKEN to include authenticated activity.',
    );
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
