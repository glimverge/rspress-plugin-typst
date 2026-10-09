import type { TypstTocItem } from './types.js';

const TAG_RE = /<[^>]+>/g;
const HEADING_RE =
  /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
const ID_RE = /\bid\s*=\s*["']([^"']+)["']/i;

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Strip tags and collapse whitespace for search / plain text. */
export function htmlToPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(TAG_RE, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Plain text of a `<pre>` block. Typst HTML uses `<br>` for source lines;
 * those become newlines so search snippets can split on them.
 */
function prePlainText(inner: string): string {
  return decodeEntities(
    inner
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(TAG_RE, ''),
  )
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
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
  /** Block text joined with blank lines, aligned with `toc[].charIndex`. */
  textContent: string;
}

const SEARCH_BLOCK_RE =
  /<(h[1-6]|p|li|pre|tr|blockquote|figcaption|dt|dd|caption)\b[^>]*>([\s\S]*?)<\/\1>/gi;

function isHeadingTag(tag: string): boolean {
  return /^h[1-6]$/.test(tag);
}

/**
 * Build the search string Rspress indexes, and record each heading's
 * `charIndex` as the offset of that heading's text. Blocks are separated
 * by a blank line, matching `buildSearchContent` in Rspress.
 */
function withSearchOffsets(
  html: string,
  toc: Array<Omit<TypstTocItem, 'charIndex'>>,
): { textContent: string; toc: TypstTocItem[] } {
  const indexed: TypstTocItem[] = toc.map(item => ({ ...item, charIndex: 0 }));
  let textContent = '';
  let headingIndex = 0;

  for (const match of html.matchAll(SEARCH_BLOCK_RE)) {
    const tag = match[1].toLowerCase();
    const text = isHeadingTag(tag) ? htmlToPlainText(match[2]) : tag === 'pre'
      ? prePlainText(match[2])
      : htmlToPlainText(match[2]);
    if (!text) continue;

    if (textContent.length > 0) textContent += '\n\n';
    if (isHeadingTag(tag)) {
      const item = indexed[headingIndex];
      if (item) item.charIndex = textContent.length;
      headingIndex += 1;
    }
    textContent += text;
  }

  return { textContent, toc: indexed };
}

/**
 * Ensure every heading has an `id`, and build a TOC for Rspress outline/search.
 */
export function enhanceHeadings(html: string): HeadingEnhanceResult {
  const toc: Array<Omit<TypstTocItem, 'charIndex'>> = [];
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

  const indexed = withSearchOffsets(nextHtml, toc);
  return {
    html: nextHtml,
    toc: normalizeTocDepths(indexed.toc),
    textContent: indexed.textContent,
  };
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
