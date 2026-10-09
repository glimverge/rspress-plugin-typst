import path from 'node:path';
import fg from 'fast-glob';
import type { TypstPluginOptions } from './types.js';

const DEFAULT_INCLUDE = ['**/*.typ'];
const DEFAULT_EXCLUDE = ['**/_*', '**/_*/**'];

export interface ScannedTypstPage {
  absolutePath: string;
  relativePath: string;
  routePath: string;
}

function toPosix(input: string): string {
  return input.split(path.sep).join('/');
}

function stripExtension(filePath: string, extensions: string[]): string {
  const lower = filePath.toLowerCase();
  for (const ext of extensions) {
    if (lower.endsWith(ext.toLowerCase())) {
      return filePath.slice(0, -ext.length);
    }
  }
  return filePath;
}

/**
 * Convert a docs-relative file path to a Rspress route path.
 * Mirrors conventional routing: `guide/index.typ` → `/guide/`, `a.typ` → `/a`.
 */
export function filePathToRoutePath(
  relativePath: string,
  extensions: string[],
): string {
  let route = toPosix(stripExtension(relativePath, extensions));
  if (route === 'index' || route.endsWith('/index')) {
    route = route.replace(/\/?index$/, '') || '';
  }
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }
  if (route !== '/' && route.endsWith('/')) {
    route = route.slice(0, -1);
  }
  return route || '/';
}

export async function scanTypstPages(
  docsRoot: string,
  options: TypstPluginOptions,
): Promise<ScannedTypstPage[]> {
  const extensions = options.extensions ?? ['.typ'];
  const include = options.include ?? DEFAULT_INCLUDE;
  const exclude = options.exclude ?? DEFAULT_EXCLUDE;

  const files = await fg(include, {
    cwd: docsRoot,
    absolute: true,
    onlyFiles: true,
    ignore: exclude,
    dot: false,
  });

  const extSet = new Set(extensions.map(e => e.toLowerCase()));

  return files
    .filter(file => extSet.has(path.extname(file).toLowerCase()))
    .map(absolutePath => {
      const relativePath = toPosix(path.relative(docsRoot, absolutePath));
      return {
        absolutePath,
        relativePath,
        routePath: filePathToRoutePath(relativePath, extensions),
      };
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
