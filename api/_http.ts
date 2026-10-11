/**
 * Minimal Node serverless types for `/api` handlers.
 *
 * Do not import `@vercel/node` here. Its `Response` type shadows the Fetch
 * Response and Vercel's per-function `tsc` then fails on `res.ok` / `text()`.
 */

export interface ApiRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  setHeader(name: string, value: string): this;
  status(code: number): this;
  json(body: unknown): unknown;
}
