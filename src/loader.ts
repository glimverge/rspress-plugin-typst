import {
  cacheKey,
  readPageCache,
  writePageCache,
  type TypstPageCache,
} from './cache.js';
import { generateTypstPageModule } from './codegen.js';
import { compileTypstFile, createCompilerContext } from './compiler.js';
import { filePathToRoutePath } from './scan.js';
import type { TypstLoaderOptions } from './types.js';

interface AsyncLoaderContext {
  cacheable: (flag?: boolean) => void;
  async: () => (
    error: Error | null,
    content?: string | Buffer,
  ) => void;
  getOptions: () => TypstLoaderOptions;
  resourcePath: string;
}

function updateCache(
  cachePath: string,
  filepath: string,
  entry: TypstPageCache[string],
): void {
  const cache = readPageCache(cachePath);
  cache[cacheKey(filepath)] = entry;
  writePageCache(cachePath, cache);
}

export default function typstLoader(this: AsyncLoaderContext) {
  this.cacheable(true);
  const callback = this.async();
  const options = this.getOptions();
  const filepath = this.resourcePath;

  try {
    const ctx = createCompilerContext(options.workspace, {
      workspace: options.workspace,
      fontPaths: options.fontPaths,
      inputs: options.inputs,
    });

    const relative = filepath.startsWith(options.workspace)
      ? filepath.slice(options.workspace.length).replace(/^[/\\]/, '')
      : filepath;
    const routePath = filePathToRoutePath(relative, ['.typ']);

    const result = compileTypstFile(filepath, routePath, ctx);
    updateCache(options.cachePath, filepath, {
      title: result.title,
      description: result.description,
      textContent: result.textContent,
      toc: result.toc,
      frontmatter: result.frontmatter,
      routePath: result.routePath,
      filepath: result.filepath,
    });

    const code = generateTypstPageModule(result, options.className);
    callback(null, code);
  } catch (error) {
    callback(error instanceof Error ? error : new Error(String(error)));
  }
}
