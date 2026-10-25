export interface ReadinessEnv {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REFRESH_TOKEN?: string;
  YOUTUBE_API_KEY?: string;
  STEAM_WEB_API_KEY?: string;
  STEAM_ID?: string;
  STEAM_VANITY_URL?: string;
  HENRIKDEV_API_KEY?: string;
  VALORANT_NAME?: string;
  VALORANT_TAG?: string;
  GITHUB_TOKEN?: string;
  GOOGLE_PLACES_API_KEY?: string;
  VERCEL_TOKEN?: string;
  VERCEL_PROJECT_ID?: string;
}

export interface ReadinessCheck {
  name: string;
  status: 'ok' | 'missing' | 'skipped';
  required: boolean;
  missing?: string[];
}

export interface ReadinessReport {
  status: 'ok' | 'degraded';
  checks: ReadinessCheck[];
}

function isSet(value: string | undefined) {
  return Boolean(value?.trim());
}

function missingKeys(env: ReadinessEnv, keys: Array<keyof ReadinessEnv>) {
  return keys.filter((key) => !isSet(env[key]));
}

function requiredCheck(
  name: string,
  env: ReadinessEnv,
  keys: Array<keyof ReadinessEnv>,
): ReadinessCheck {
  const missing = missingKeys(env, keys);
  if (missing.length === 0) return { name, status: 'ok', required: true };
  return { name, status: 'missing', required: true, missing };
}

function steamCheck(env: ReadinessEnv): ReadinessCheck {
  const missing: string[] = [];
  if (!isSet(env.STEAM_WEB_API_KEY)) missing.push('STEAM_WEB_API_KEY');
  if (!isSet(env.STEAM_ID) && !isSet(env.STEAM_VANITY_URL)) {
    missing.push('STEAM_ID or STEAM_VANITY_URL');
  }
  if (missing.length === 0) return { name: 'steam', status: 'ok', required: true };
  return { name: 'steam', status: 'missing', required: true, missing };
}

const VALORANT_KEYS = ['HENRIKDEV_API_KEY', 'VALORANT_NAME', 'VALORANT_TAG'] as const;

function valorantCheck(env: ReadinessEnv): ReadinessCheck {
  const missing = missingKeys(env, [...VALORANT_KEYS]);
  if (missing.length === VALORANT_KEYS.length) {
    return { name: 'valorant', status: 'skipped', required: false };
  }
  if (missing.length === 0) return { name: 'valorant', status: 'ok', required: false };
  return { name: 'valorant', status: 'missing', required: false, missing };
}

export function getReadiness(env: ReadinessEnv): ReadinessReport {
  const checks: ReadinessCheck[] = [
    requiredCheck('spotify', env, [
      'SPOTIFY_CLIENT_ID',
      'SPOTIFY_CLIENT_SECRET',
      'SPOTIFY_REFRESH_TOKEN',
    ]),
    requiredCheck('youtube', env, ['YOUTUBE_API_KEY']),
    steamCheck(env),
    valorantCheck(env),
    requiredCheck('github', env, ['GITHUB_TOKEN']),
    requiredCheck('places', env, ['GOOGLE_PLACES_API_KEY']),
    requiredCheck('visitors', env, ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID']),
  ];

  const status = checks.some((check) => check.status === 'missing') ? 'degraded' : 'ok';
  return { status, checks };
}
