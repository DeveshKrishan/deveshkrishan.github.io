import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HOBBY_FUNCTION_LIMIT, listVercelFunctions } from './_vercel-functions';

const apiDir = fileURLToPath(new URL('.', import.meta.url));

describe('listVercelFunctions', () => {
  it('stays under the Vercel Hobby function limit', () => {
    const functions = listVercelFunctions(apiDir);

    expect(functions).toEqual([
      'analytics/visitors.ts',
      'github/contributions.ts',
      'github/recent-commits.ts',
      'health.ts',
      'places/photo.ts',
      'spotify/recently-played.ts',
      'steam/recent-games.ts',
      'youtube/recent-videos.ts',
    ]);
    expect(functions.length).toBeLessThan(HOBBY_FUNCTION_LIMIT);
  });
});
