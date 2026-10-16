import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const welcome = readFileSync(resolve(root, 'src/Welcome.tsx'), 'utf8');
const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
const vercelConfig = JSON.parse(
  readFileSync(resolve(root, '../vercel.json'), 'utf8'),
) as {
  redirects?: Array<{
    source: string;
    destination: string;
    permanent?: boolean;
    has?: Array<{ type: string; value: string }>;
  }>;
};

describe('homepage SEO metadata', () => {
  it('includes title, description, and social preview tags', () => {
    expect(html).toContain('<title>Devesh Krishan — Software Engineer at GEICO</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('Devesh Krishan is a software engineer');
    expect(html).toContain('name="author" content="Devesh Krishan"');
    expect(html).toContain('rel="canonical" href="https://deveshkrishan.com/"');
    expect(html).toContain('property="og:type" content="profile"');
    expect(html).toContain('property="og:image" content="https://deveshkrishan.com/og.jpg"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml"');
  });

  it('allows Google to use a large photo preview in search results', () => {
    expect(html).toContain('max-image-preview:large');
    expect(html).toContain('rel="icon" href="/favicon.png" type="image/png" sizes="48x48"');
    expect(html).toContain('type="application/ld+json"');

    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(jsonLdMatch).not.toBeNull();
    const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '') as {
      '@graph': Array<Record<string, unknown>>;
    };
    const webPage = jsonLd['@graph'].find((node) => {
      const type = node['@type'];
      return type === 'WebPage' || (Array.isArray(type) && type.includes('WebPage'));
    });
    const person = jsonLd['@graph'].find((node) => node['@type'] === 'Person');
    const primaryImage = webPage?.primaryImageOfPage as { url?: string };

    expect(primaryImage?.url).toBe('https://deveshkrishan.com/og.jpg');
    expect(person?.name).toBe('Devesh Krishan');
    expect(person?.givenName).toBe('Devesh');
    expect(person?.familyName).toBe('Krishan');
    expect(person?.image).toBe('https://deveshkrishan.com/devesh-krishan.jpg');
    expect(person?.sameAs).toEqual([
      'https://github.com/DeveshKrishan',
      'https://www.linkedin.com/in/deveshkrishan/',
    ]);
  });

  it('uses a visible name heading and identity links', () => {
    expect(welcome).toContain('<h1 className="hero-wordmark"');
    expect(welcome).toContain('Devesh Krishan');
    expect(welcome).toContain('rel="me noreferrer"');
  });

  it('exposes robots.txt and a homepage sitemap', () => {
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain('Sitemap: https://deveshkrishan.com/sitemap.xml');
    expect(sitemap).toContain('<loc>https://deveshkrishan.com/</loc>');
    expect(sitemap).toContain('<image:loc>https://deveshkrishan.com/og.jpg</image:loc>');
    expect(sitemap).toContain('<image:loc>https://deveshkrishan.com/devesh-krishan.jpg</image:loc>');
  });

  it('sends the default Vercel host to the custom domain', () => {
    const vercelHostRedirects = (vercelConfig.redirects ?? []).filter((redirect) =>
      redirect.has?.some(
        (rule) => rule.type === 'host' && rule.value === 'deveshkrishan-github-io.vercel.app',
      ),
    );

    expect(vercelHostRedirects.length).toBeGreaterThan(0);
    expect(
      vercelHostRedirects.every(
        (redirect) =>
          redirect.permanent === true && redirect.destination.startsWith('https://deveshkrishan.com/'),
      ),
    ).toBe(true);
  });
});
