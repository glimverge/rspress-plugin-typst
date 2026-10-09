import path from 'node:path';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { enhanceHeadings, htmlToPlainText } from './html.js';
import type {
  TypstCompileResult,
  TypstFrontmatter,
  TypstPluginOptions,
} from './types.js';

export interface CompilerContext {
  workspace: string;
  fontPaths?: string[];
  inputs?: Record<string, string>;
}

let sharedCompiler: NodeCompiler | null = null;
let sharedKey = '';

function compilerKey(ctx: CompilerContext): string {
  return JSON.stringify({
    workspace: ctx.workspace,
    fontPaths: ctx.fontPaths ?? [],
    inputs: ctx.inputs ?? {},
  });
}

export function getCompiler(ctx: CompilerContext): NodeCompiler {
  const key = compilerKey(ctx);
  if (!sharedCompiler || sharedKey !== key) {
    sharedCompiler = NodeCompiler.create({
      workspace: ctx.workspace,
      fontArgs: ctx.fontPaths?.length
        ? [{ fontPaths: ctx.fontPaths }]
        : undefined,
      inputs: ctx.inputs,
    });
    sharedKey = key;
  }
  return sharedCompiler;
}

export function resetCompiler(): void {
  sharedCompiler = null;
  sharedKey = '';
}

function asFrontmatter(value: unknown): TypstFrontmatter {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as TypstFrontmatter;
}

function queryFrontmatter(
  compiler: NodeCompiler,
  mainFilePath: string,
): TypstFrontmatter {
  try {
    const result = compiler.query(
      { mainFilePath },
      { selector: '<frontmatter>', field: 'value' },
    );
    if (Array.isArray(result) && result.length > 0) {
      return asFrontmatter(result[0]);
    }
  } catch {
    // Optional metadata label — ignore when absent.
  }
  return {};
}

export function compileTypstFile(
  filepath: string,
  routePath: string,
  ctx: CompilerContext,
): TypstCompileResult {
  const compiler = getCompiler(ctx);
  const mainFilePath = path.resolve(filepath);
  const exec = compiler.tryHtml({ mainFilePath });

  if (exec.hasError()) {
    exec.printDiagnostics();
    throw new Error(
      `[rspress-plugin-typst] Failed to compile Typst document: ${mainFilePath}`,
    );
  }

  const output = exec.result;
  if (!output) {
    throw new Error(
      `[rspress-plugin-typst] Empty HTML output for ${mainFilePath}`,
    );
  }

  const frontmatter = queryFrontmatter(compiler, mainFilePath);
  const { html: body, toc } = enhanceHeadings(output.body());
  const html = output.html();
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    output.title() ||
    path.basename(filepath, path.extname(filepath));
  const description =
    (typeof frontmatter.description === 'string' &&
      frontmatter.description) ||
    output.description() ||
    undefined;

  const textContent = htmlToPlainText(body);

  // Keep memory bounded across many pages in watch mode.
  compiler.evictCache(10);

  return {
    filepath: mainFilePath,
    routePath,
    title,
    description,
    body,
    html,
    frontmatter: {
      ...frontmatter,
      title,
      ...(description ? { description } : {}),
    },
    textContent,
    toc,
  };
}

export function createCompilerContext(
  docsRoot: string,
  options: TypstPluginOptions,
): CompilerContext {
  return {
    workspace: options.workspace
      ? path.resolve(options.workspace)
      : path.resolve(docsRoot),
    fontPaths: options.fontPaths,
    inputs: options.inputs,
  };
}
