export const API_ERROR_CODE = {
  missingConfig: 'missing_config',
  rateLimited: 'rate_limited',
  upstream: 'upstream',
  notFound: 'not_found',
  unexpected: 'unexpected',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

export function codeForStatus(status: number): ApiErrorCode {
  if (status === 429) return API_ERROR_CODE.rateLimited;
  if (status === 404) return API_ERROR_CODE.notFound;
  if (status === 502 || status === 503 || status === 504) return API_ERROR_CODE.upstream;
  return API_ERROR_CODE.unexpected;
}

export function apiError(status: number, error: string, extra?: Record<string, unknown>) {
  return { error, code: codeForStatus(status), ...extra };
}
