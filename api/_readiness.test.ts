import { describe, expect, it } from 'vitest';
import { getReadiness, type ReadinessEnv } from './_readiness';

const readyEnv: ReadinessEnv = {
  SPOTIFY_CLIENT_ID: 'id',
  SPOTIFY_CLIENT_SECRET: 'secret',
  SPOTIFY_REFRESH_TOKEN: 'refresh',
  YOUTUBE_API_KEY: 'yt',
  STEAM_WEB_API_KEY: 'steam',
  STEAM_ID: '7656119',
  GITHUB_TOKEN: 'gh',
  GOOGLE_PLACES_API_KEY: 'places',
  VERCEL_TOKEN: 'vercel',
  VERCEL_PROJECT_ID: 'prj_123',
};

describe('getReadiness', () => {
  it('is ok when every required integration is configured', () => {
    const report = getReadiness(readyEnv);
    expect(report.status).toBe('ok');
    expect(report.checks.find((check) => check.name === 'valorant')?.status).toBe('skipped');
    expect(report.checks.filter((check) => check.required && check.status !== 'ok')).toEqual([]);
  });

  it('accepts a Steam vanity URL in place of a SteamID', () => {
    const report = getReadiness({
      ...readyEnv,
      STEAM_ID: '   ',
      STEAM_VANITY_URL: 'devesh',
    });
    expect(report.checks.find((check) => check.name === 'steam')).toEqual({
      name: 'steam',
      status: 'ok',
      required: true,
    });
  });

  it('degrades when a required secret is missing and does not echo values', () => {
    const report = getReadiness({
      ...readyEnv,
      YOUTUBE_API_KEY: '',
      STEAM_ID: undefined,
      STEAM_VANITY_URL: undefined,
    });

    expect(report.status).toBe('degraded');
    expect(report.checks.find((check) => check.name === 'youtube')).toEqual({
      name: 'youtube',
      status: 'missing',
      required: true,
      missing: ['YOUTUBE_API_KEY'],
    });
    expect(report.checks.find((check) => check.name === 'steam')?.missing).toEqual([
      'STEAM_ID or STEAM_VANITY_URL',
    ]);
    expect(JSON.stringify(report)).not.toContain('prj_123');
    expect(JSON.stringify(report)).not.toContain('secret');
  });

  it('treats a partial Valorant config as not ready and a full one as ok', () => {
    const partial = getReadiness({ ...readyEnv, VALORANT_NAME: 'Devalisk' });
    expect(partial.status).toBe('degraded');
    expect(partial.checks.find((check) => check.name === 'valorant')).toEqual({
      name: 'valorant',
      status: 'missing',
      required: false,
      missing: ['HENRIKDEV_API_KEY', 'VALORANT_TAG'],
    });

    const configured = getReadiness({
      ...readyEnv,
      HENRIKDEV_API_KEY: 'hdev',
      VALORANT_NAME: 'Devalisk',
      VALORANT_TAG: 'NA1',
    });
    expect(configured.status).toBe('ok');
    expect(configured.checks.find((check) => check.name === 'valorant')?.status).toBe('ok');
  });
});
