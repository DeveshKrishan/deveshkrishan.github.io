import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');

describe('homepage SEO metadata', () => {
  it('includes title, description, and social preview tags', () => {
    expect(html).toContain('<title>Devesh Krishan — Software Engineer</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('rel="canonical" href="https://deveshkrishan.com/"');
    expect(html).toContain('property="og:image" content="https://deveshkrishan.com/og.png"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml"');
  });

  it('exposes robots.txt and a homepage sitemap', () => {
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain('Sitemap: https://deveshkrishan.com/sitemap.xml');
    expect(sitemap).toContain('<loc>https://deveshkrishan.com/</loc>');
  });
});
