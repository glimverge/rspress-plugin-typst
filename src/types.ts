export interface TypstPluginOptions {
  /**
   * File extensions treated as Typst documents.
   * @default ['.typ']
   */
  extensions?: string[];

  /**
   * Glob patterns (relative to the docs root) to include.
   * @default all `.typ` files under the docs root
   */
  include?: string[];

  /**
   * Glob patterns (relative to the docs root) to exclude.
   * @default underscore-prefixed files and directories
   */
  exclude?: string[];

  /**
   * Extra font directories passed to the Typst compiler.
   */
  fontPaths?: string[];

  /**
   * Extra `sys.inputs` string pairs for Typst compilation.
   */
  inputs?: Record<string, string>;

  /**
   * Typst workspace root. Defaults to the Rspress docs root.
   */
  workspace?: string;

  /**
   * CSS class applied to the rendered Typst body wrapper.
   * @default 'rspress-typst'
   */
  className?: string;

  /**
   * When true, also register `.typ` on `route.extensions` so conventional
   * routing discovers pages without `addPages`.
   * Prefer leaving this enabled.
   * @default true
   */
  routeExtensions?: boolean;
}

export interface TypstFrontmatter {
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export interface TypstCompileResult {
  filepath: string;
  routePath: string;
  title: string;
  description?: string;
  body: string;
  html: string;
  frontmatter: TypstFrontmatter;
  /** Plain text used for search indexing. */
  textContent: string;
  /** Table of contents extracted from HTML headings. */
  toc: TypstTocItem[];
}

export interface TypstTocItem {
  id: string;
  text: string;
  depth: number;
  /**
   * Start offset of this heading in `textContent`.
   * Rspress search uses it to attach a content hit to a heading.
   */
  charIndex: number;
}

export interface TypstLoaderOptions {
  workspace: string;
  fontPaths?: string[];
  inputs?: Record<string, string>;
  className: string;
  /**
   * Absolute path to a JSON cache written by the plugin so `extendPageData`
   * can enrich page metadata without recompiling.
   */
  cachePath: string;
}
