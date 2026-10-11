import { describe, expect, it } from 'vitest';

import {
  formatWidgetError,
  readWidgetErrorCode,
  WIDGET_ERROR_CODES,
} from './format-widget-error';

describe('formatWidgetError', () => {
  it('maps rate limits from status or code', () => {
    expect(formatWidgetError({ source: 'spotify', status: 429 })).toBe(
      'spotify is rate-limited. try again soon.',
    );
    expect(
      formatWidgetError({ source: 'steam', code: WIDGET_ERROR_CODES.rateLimited }),
    ).toBe('steam is rate-limited. try again soon.');
  });

  it('maps missing remotes and not-found responses', () => {
    expect(formatWidgetError({ source: 'github', status: 502 })).toBe(
      "couldn't reach github right now.",
    );
    expect(formatWidgetError({ source: 'commits', status: 404 })).toBe(
      "couldn't find that github profile.",
    );
  });

  it('hides raw server messages behind a generic fallback', () => {
    expect(formatWidgetError({ source: 'spotify', status: 500 })).toBe(
      "couldn't load recent songs right now.",
    );
    expect(formatWidgetError({ source: 'steam' })).toBe(
      "couldn't load recent games right now.",
    );
  });
});

describe('readWidgetErrorCode', () => {
  it('reads a string code from an API payload', () => {
    expect(readWidgetErrorCode({ code: 'rate_limited' })).toBe('rate_limited');
    expect(readWidgetErrorCode({ error: 'Missing token' })).toBeNull();
  });
});
