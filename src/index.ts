import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RspressPlugin } from '@rspress/core';
import {
  cacheKey,
  defaultCachePath,
  readPageCache,
  writePageCache,
  type TypstPageCache,
} from './cache.js';
import { compileTypstFile, createCompilerContext } from './compiler.js';
import { scanTypstPages } from './scan.js';
import type { TypstPluginOptions, TypstTocItem } from './types.js';

export type {
  TypstCompileResult,
  TypstFrontmatter,
  TypstPluginOptions,
  TypstTocItem,
} from './types.js';

export { compileTypstFile, createCompilerContext } from './compiler.js';
export {
  extractToc,
  htmlToPlainText,
  normalizeTocDepths,
} from './html.js';
export { filePathToRoutePath, scanTypstPages } from './scan.js';
export { generateTypstPageModule } from './codegen.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toPageHeaders(toc: TypstTocItem[]) {
  return toc.map(item => ({
    id: item.id,
    text: item.text,
    depth: item.depth,
    charIndex: item.charIndex,
  }));
}

function uniqExtensions(
  current: string[] | undefined,
  extra: string[],
): string[] {
  const base = current ?? ['.md', '.mdx', '.js', '.jsx', '.ts', '.tsx'];
  return [...new Set([...base, ...extra])];
}

/**
 * Use Typst (`.typ`) files as Rspress documentation pages.
 *
 * Compilation uses Typst's experimental HTML export through the Rust-powered
 * `@myriaddreamin/typst-ts-node-compiler` Node-API binding.
 *
 * @example
 * ```ts
 * import { defineConfig } from '@rspress/core';
 * import { pluginTypst } from 'rspress-plugin-typst';
 *
 * export default defineConfig({
 *   root: 'docs',
 *   plugins: [pluginTypst()],
 * });
 * ```
 */
export function pluginTypst(
  options: TypstPluginOptions = {},
): RspressPlugin {
  const extensions = options.extensions ?? ['.typ'];
  const className = options.className ?? 'rspress-typst';
  const enableRouteExtensions = options.routeExtensions !== false;

  let docsRoot = '';
  let cachePath = '';
  let pageCache: TypstPageCache = {};

  return {
    name: 'rspress-plugin-typst',

    globalStyles: path.join(__dirname, 'runtime/typst.css'),

    config(config) {
      docsRoot = path.resolve(config.root ?? 'docs');
      cachePath = defaultCachePath(docsRoot);

      const next = { ...config };

      if (enableRouteExtensions) {
        next.route = {
          ...next.route,
          extensions: uniqExtensions(next.route?.extensions, extensions),
        };
      }

      return next;
    },

    async beforeBuild(config) {
      docsRoot = path.resolve(config.root ?? (docsRoot || 'docs'));
      cachePath = defaultCachePath(docsRoot);
      const ctx = createCompilerContext(docsRoot, options);
      const pages = await scanTypstPages(docsRoot, options);
      const nextCache: TypstPageCache = {};

      for (const page of pages) {
        const result = compileTypstFile(page.absolutePath, page.routePath, ctx);
        nextCache[cacheKey(page.absolutePath)] = {
          title: result.title,
          description: result.description,
          textContent: result.textContent,
          toc: result.toc,
          frontmatter: result.frontmatter,
          routePath: result.routePath,
          filepath: result.filepath,
        };
      }

      pageCache = nextCache;
      writePageCache(cachePath, pageCache);
    },

    async extendPageData(pageData) {
      const filepath = pageData._filepath;
      if (!filepath || !extensions.some(ext => filepath.endsWith(ext))) {
        return;
      }

      if (!Object.keys(pageCache).length && cachePath) {
        pageCache = readPageCache(cachePath);
      }

      const cached = pageCache[cacheKey(filepath)];
      if (!cached) return;

      pageData.title = cached.title;
      if (cached.description) {
        pageData.description = cached.description;
      }
      pageData.toc = toPageHeaders(cached.toc);
      pageData.content = cached.textContent;
      pageData.frontmatter = {
        ...pageData.frontmatter,
        ...cached.frontmatter,
        title: cached.title,
        ...(cached.description ? { description: cached.description } : {}),
      };
    },

    async modifySearchIndexData(pages) {
      if (!Object.keys(pageCache).length && cachePath) {
        pageCache = readPageCache(cachePath);
      }

      for (const page of pages) {
        const filepath = page._filepath;
        if (!filepath) continue;
        const cached = pageCache[cacheKey(filepath)];
        if (!cached) continue;
        page.title = cached.title;
        page.content = cached.textContent;
        // Search index is snapshotted before extendPageData, so the TOC
        // (including charIndex) has to be copied here.
        page.toc = toPageHeaders(cached.toc);
        if (cached.description) {
          page.description = cached.description;
        }
      }
    },

    builderConfig: {
      tools: {
        rspack(config) {
          config.resolve ??= {};
          config.resolve.extensions = uniqExtensions(
            config.resolve.extensions as string[] | undefined,
            extensions,
          );

          config.module ??= {};
          config.module.rules ??= [];
          config.module.rules.unshift({
            test: /\.typ$/,
            type: 'javascript/auto',
            use: [
              {
                loader: path.join(__dirname, 'loader.js'),
                options: {
                  workspace:
                    options.workspace != null
                      ? path.resolve(options.workspace)
                      : docsRoot || path.resolve('docs'),
                  fontPaths: options.fontPaths,
                  inputs: options.inputs,
                  className,
                  cachePath: cachePath || defaultCachePath(docsRoot || 'docs'),
                },
              },
            ],
          });
        },
      },
      source: {
        include: [/rspress-plugin-typst/],
      },
    },
  };
}

export default pluginTypst;
