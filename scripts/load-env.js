/* eslint-env node */
/**
 * Shared env-file reader for local scripts.
 */

import fs from 'node:fs';
import path from 'node:path';

function parseEnvFile(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

export function loadEnv(root) {
  const env = {};
  // .env.local is read last so it overrides .env, matching Vite/Vercel precedence.
  for (const file of ['.env', '.env.local']) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    Object.assign(env, parseEnvFile(filePath));
  }
  return env;
}
