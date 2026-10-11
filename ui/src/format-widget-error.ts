export const WIDGET_ERROR_CODES = {
  rateLimited: 'rate_limited',
  notFound: 'not_found',
  upstream: 'upstream',
} as const;

export type WidgetErrorCode = (typeof WIDGET_ERROR_CODES)[keyof typeof WIDGET_ERROR_CODES];

export type WidgetSource = 'spotify' | 'steam' | 'github' | 'commits';

const SOURCE_LABELS = {
  spotify: 'recent songs',
  steam: 'recent games',
  github: 'github activity',
  commits: 'recent commits',
} as const satisfies Record<WidgetSource, string>;

const SOURCE_NAMES = {
  spotify: 'spotify',
  steam: 'steam',
  github: 'github',
  commits: 'github',
} as const satisfies Record<WidgetSource, string>;

interface WidgetErrorInput {
  source: WidgetSource;
  status?: number;
  code?: string | null;
}

function resolveErrorKind(status?: number, code?: string | null) {
  if (code === WIDGET_ERROR_CODES.rateLimited || status === 429) {
    return WIDGET_ERROR_CODES.rateLimited;
  }
  if (code === WIDGET_ERROR_CODES.notFound || status === 404) {
    return WIDGET_ERROR_CODES.notFound;
  }
  if (
    code === WIDGET_ERROR_CODES.upstream ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return WIDGET_ERROR_CODES.upstream;
  }
  return null;
}

export function formatWidgetError({ source, status, code }: WidgetErrorInput) {
  const kind = resolveErrorKind(status, code);
  const name = SOURCE_NAMES[source];
  const label = SOURCE_LABELS[source];

  if (kind === WIDGET_ERROR_CODES.rateLimited) {
    return `${name} is rate-limited. try again soon.`;
  }
  if (kind === WIDGET_ERROR_CODES.notFound) {
    return source === 'github' || source === 'commits'
      ? "couldn't find that github profile."
      : `couldn't find ${label}.`;
  }
  if (kind === WIDGET_ERROR_CODES.upstream) {
    return `couldn't reach ${name} right now.`;
  }

  return `couldn't load ${label} right now.`;
}

export function readWidgetErrorCode(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('code' in payload)) return null;
  const code = payload.code;
  return typeof code === 'string' ? code : null;
}

export function formatWidgetResponseError(
  source: WidgetSource,
  res: Pick<Response, 'status'>,
  payload?: unknown,
) {
  return formatWidgetError({
    source,
    status: res.status,
    code: readWidgetErrorCode(payload),
  });
}
