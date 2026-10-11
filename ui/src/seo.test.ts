import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../index.html'), 'utf8');

describe('homepage SEO metadata', () => {
  it('includes title, description, and social preview tags', () => {
    expect(html).toContain('<title>Devesh Krishan — Software Engineer</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('rel="canonical" href="https://deveshkrishan.com/"');
    expect(html).toContain('property="og:image" content="https://deveshkrishan.com/og.png"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });
});
