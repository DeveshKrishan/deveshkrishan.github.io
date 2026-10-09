/* eslint-env node */
/**
 * Beli – refresh the committed list of recently visited restaurants.
 *
 * Beli has no public API. This talks to the private backend the mobile app uses,
 * following the community contract at https://github.com/ProjectBarks/beli-api.
 * It is unofficial and can break without notice.
 *
 * Run it locally and commit the generated JSON. The deployed site reads only that
 * file, so no Beli credentials ever reach Vercel and the site cannot break when
 * Beli changes an endpoint.
 *
 * Usage:
 *   node scripts/beli-fetch-visits.js            # refresh src/data/beli-visits.json
 *   node scripts/beli-fetch-visits.js --raw      # print the raw feed response instead
 *   node scripts/beli-fetch-visits.js --limit 5
 *
 * Requires SPOTIFY-style credentials in .env (gitignored):
 *   BELI_EMAIL (or BELI_USERNAME), BELI_PASSWORD
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnv } from './load-env.js';
import { mapBeliFeedItems } from '../src/data/map-beli-visits.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'src/data/beli-visits.json');

const ONBOARD_HOST = 'https://backoffice-service-onboarding-t57o3dxfca-nn.a.run.app';
const API_HOST = 'https://backoffice-service-t57o3dxfca-nn.a.run.app';

// The backend 403s any request without an Origin, and throttles bursts.
const ORIGIN = 'https://localhost';
const REQUEST_SPACING_MS = 350;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

function parseArgs(argv) {
  const limitFlag = argv.indexOf('--limit');
  return {
    isRaw: argv.includes('--raw'),
    limit: limitFlag === -1 ? 3 : Math.max(Number(argv[limitFlag + 1]) || 3, 1),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(url, { token, method = 'GET', body } = {}) {
  const headers = {
    Accept: 'application/json',
    Origin: ORIGIN,
    Referer: `${ORIGIN}/`,
    'User-Agent': USER_AGENT,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${method} ${url} failed (${res.status}): ${text.slice(0, 200)}`);
  }

  await sleep(REQUEST_SPACING_MS);

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${method} ${url} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

/** Beli returns several envelope shapes; normalise them to a plain array. */
function toResults(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

async function main() {
  const { isRaw, limit } = parseArgs(process.argv.slice(2));
  const env = { ...loadEnv(ROOT), ...process.env };

  const email = env.BELI_EMAIL || env.BELI_USERNAME;
  const password = env.BELI_PASSWORD;

  if (!email || !password) {
    console.error('Missing BELI_EMAIL (or BELI_USERNAME) and BELI_PASSWORD. Add them to .env (gitignored).');
    process.exit(1);
  }

  // Beli's login serializer only accepts `email` or `phone_no`, never a display name.
  if (!email.includes('@')) {
    console.error('Beli logs in with an email address, but the configured value is not one.');
    process.exit(1);
  }

  const tokens = await request(`${ONBOARD_HOST}/api/token/`, {
    method: 'POST',
    body: { email, password },
  });

  const accessToken = tokens?.access;
  if (!accessToken) throw new Error('Login succeeded but no access token was returned.');

  const profile = await request(`${ONBOARD_HOST}/api/user/logged-in/`, { token: accessToken });
  const uuid = toResults(profile)[0]?.id ?? profile?.id;
  if (!uuid) throw new Error('Could not determine the logged-in user id.');

  const feed = await request(`${API_HOST}/api/profile-newsfeed-data/${uuid}/`, {
    token: accessToken,
  });

  if (isRaw) {
    console.log(JSON.stringify(feed, null, 2));
    return;
  }

  const visits = mapBeliFeedItems(toResults(feed), limit);
  if (visits.length === 0) {
    throw new Error('No rating events found in the profile feed; refusing to write an empty file.');
  }

  const payload = { generatedAt: new Date().toISOString(), visits };
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Wrote ${visits.length} visit(s) to ${path.relative(ROOT, OUTPUT_PATH)}:`);
  for (const visit of visits) {
    console.log(`  - ${visit.name}${visit.score == null ? '' : ` (${visit.score})`}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
