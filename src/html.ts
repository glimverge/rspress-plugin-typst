import type { TypstTocItem } from './types.js';

const TAG_RE = /<[^>]+>/g;
const HEADING_RE =
  /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
const ID_RE = /\bid\s*=\s*["']([^"']+)["']/i;

/** Strip tags and collapse whitespace for search / plain text. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(TAG_RE, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface HeadingEnhanceResult {
  html: string;
  toc: TypstTocItem[];
}

/**
 * Ensure every heading has an `id`, and build a TOC for Rspress outline/search.
 */
export function enhanceHeadings(html: string): HeadingEnhanceResult {
  const toc: TypstTocItem[] = [];
  const seen = new Map<string, number>();

  const nextHtml = html.replace(
    HEADING_RE,
    (full, depthRaw: string, attrsRaw: string | undefined, inner: string) => {
      const depth = Number(depthRaw);
      const attrs = attrsRaw ?? '';
      const text = htmlToPlainText(inner);
      if (!text) return full;

      let id = attrs.match(ID_RE)?.[1];
      if (!id) {
        const base = slugify(text) || `heading-${toc.length}`;
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        id = count === 0 ? base : `${base}-${count}`;
      }

      toc.push({ id, text, depth });

      if (ID_RE.test(attrs)) {
        return full;
      }
      const spacer = attrs.length > 0 ? attrs : '';
      return `<h${depth}${spacer} id="${id}">${inner}</h${depth}>`;
    },
  );

  return { html: nextHtml, toc: normalizeTocDepths(toc) };
}

/** Extract heading TOC from Typst HTML body. */
export function extractToc(html: string): TypstTocItem[] {
  return enhanceHeadings(html).toc;
}

/**
 * Typst's HTML export currently maps `#=` to `<h2>`. Remap depths so Rspress
 * TOC treats the first content heading level as depth 2 (matching MDX).
 */
export function normalizeTocDepths(toc: TypstTocItem[]): TypstTocItem[] {
  if (toc.length === 0) return toc;
  const min = Math.min(...toc.map(item => item.depth));
  const shift = 2 - min;
  if (shift === 0) return toc;
  return toc.map(item => ({
    ...item,
    depth: Math.min(6, Math.max(1, item.depth + shift)),
  }));
}
