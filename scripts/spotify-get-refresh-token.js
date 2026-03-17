/* eslint-env node */
/**
 * One-time script: get Spotify refresh_token via Authorization Code flow.
 * Run from project root with .env or .env.local containing SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.
 *
 * Usage: node scripts/spotify-get-refresh-token.js
 */

import http from 'node:http';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCOPE = 'user-read-recently-played';

function loadEnv() {
  const root = path.resolve(__dirname, '..');
  for (const file of ['.env.local', '.env']) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
    return env;
  }
  return {};
}

const env = loadEnv();
const clientId = env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI =
  env.SPOTIFY_REDIRECT_URI ||
  process.env.SPOTIFY_REDIRECT_URI ||
  'http://127.0.0.1:8888/callback';

if (!clientId || !clientSecret) {
  console.error(
    'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET. Set them in .env or .env.local, or in the environment.',
  );
  process.exit(1);
}

console.log('Using redirect_uri:', REDIRECT_URI);
console.log('If you get "Invalid redirect URI", add that EXACT value in Spotify Dashboard → your app → Settings → Redirect URIs (no trailing slash).\n');

const authorizeUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:8888`);
  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end('Not found. Use /callback.');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('Missing "code" in URL. Try the authorize link again.');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(
    '<!DOCTYPE html><html><body><p>Success. You can close this tab and check the terminal for your refresh_token.</p></body></html>',
  );

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error('Token exchange failed:', data);
    const isRedirectError =
      data?.error === 'invalid_grant' ||
      data?.error === 'invalid_client' ||
      (data?.error_description && /redirect|uri/i.test(data.error_description));
    if (isRedirectError) {
      console.error('\n→ Invalid redirect URI:');
      console.error('  Spotify Dashboard → your app → Settings → Redirect URIs');
      console.error('  Add this EXACT value (no trailing slash):');
      console.error('    ' + REDIRECT_URI);
      console.error('  Or set SPOTIFY_REDIRECT_URI in .env to match what you already added.');
    }
    process.exit(1);
  }

  console.log('\nAdd this to .env.local and to Vercel Environment Variables:\n');
  console.log('SPOTIFY_REFRESH_TOKEN=' + (data.refresh_token || ''));
  console.log('\n');
  server.close();
  process.exit(0);
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Open this URL in your browser, log in, and approve:\n');
  console.log(authorizeUrl);
  console.log('\nWaiting for callback on http://127.0.0.1:8888/callback ...\n');
  try {
    execSync(
      process.platform === 'darwin' ? 'open "' + authorizeUrl + '"' : 'xdg-open "' + authorizeUrl + '"',
      { stdio: 'ignore' },
    );
  } catch {
    // open failed; user can paste URL manually
  }
});
