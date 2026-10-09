import fs from 'node:fs';
import path from 'node:path';
import type { TypstCompileResult } from './types.js';

export type TypstPageCache = Record<
  string,
  Pick<
    TypstCompileResult,
    | 'title'
    | 'description'
    | 'textContent'
    | 'toc'
    | 'frontmatter'
    | 'routePath'
    | 'filepath'
  >
>;

export function defaultCachePath(docsRoot: string): string {
  return path.join(docsRoot, '.rspress', 'typst-page-cache.json');
}

export function writePageCache(cachePath: string, cache: TypstPageCache): void {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

export function readPageCache(cachePath: string): TypstPageCache {
  try {
    if (!fs.existsSync(cachePath)) return {};
    return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as TypstPageCache;
  } catch {
    return {};
  }
}

export function cacheKey(filepath: string): string {
  return path.resolve(filepath);
}
