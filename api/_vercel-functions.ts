import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/** Vercel Hobby plan serverless function cap. Files and folders starting with `_` do not count. */
export const HOBBY_FUNCTION_LIMIT = 12;

const FUNCTION_EXTENSIONS = new Set(['.js', '.ts', '.mjs', '.cjs', '.mts']);

const IGNORED_DIRECTORIES = new Set(['node_modules', '.vercel']);

function isIgnoredName(name: string) {
  return name.startsWith('_') || name.startsWith('.') || IGNORED_DIRECTORIES.has(name);
}

export function listVercelFunctions(apiDir: string) {
  const functions: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      if (isIgnoredName(entry)) continue;
      const fullPath = path.join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!FUNCTION_EXTENSIONS.has(path.extname(entry))) continue;
      functions.push(path.relative(apiDir, fullPath));
    }
  }

  walk(apiDir);
  return functions.sort();
}
