import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  extractToc,
  filePathToRoutePath,
  htmlToPlainText,
  normalizeTocDepths,
} from '../dist/index.js';

describe('htmlToPlainText', () => {
  it('strips tags and decodes entities', () => {
    assert.equal(
      htmlToPlainText('<p>Hello&nbsp;<strong>Typst</strong> &amp; friends</p>'),
      'Hello Typst & friends',
    );
  });
});

describe('extractToc / normalizeTocDepths', () => {
  it('builds toc from headings and normalizes depths', () => {
    const html = `
      <h2 id="intro">Intro</h2>
      <p>text</p>
      <h3>Details</h3>
    `;
    const toc = normalizeTocDepths(extractToc(html));
    // "Intro\n\ntext\n\n" is 13 characters, so Details starts at 13.
    assert.deepEqual(toc, [
      { id: 'intro', text: 'Intro', depth: 2, charIndex: 0 },
      { id: 'details', text: 'Details', depth: 3, charIndex: 13 },
    ]);
  });

  it('records charIndex across lists and pre blocks', () => {
    const html = `
      <h2>Title</h2>
      <ul><li>item one</li><li>item two</li></ul>
      <pre><code>line1<br>line2</code></pre>
      <h3>Next</h3>
      <p>after</p>
    `;
    const toc = extractToc(html);
    assert.equal(toc[0].charIndex, 0);
    // "Title\n\nitem one\n\nitem two\n\nline1\nline2\n\n"
    assert.equal(toc[1].id, 'next');
    assert.equal(toc[1].charIndex, 40);
  });

  it('preserves charIndex when shifting depths', () => {
    assert.deepEqual(
      normalizeTocDepths([
        { id: 'a', text: 'A', depth: 1, charIndex: 0 },
        { id: 'b', text: 'B', depth: 2, charIndex: 4 },
      ]),
      [
        { id: 'a', text: 'A', depth: 2, charIndex: 0 },
        { id: 'b', text: 'B', depth: 3, charIndex: 4 },
      ],
    );
  });
});

describe('filePathToRoutePath', () => {
  it('maps conventional typst paths', () => {
    assert.equal(filePathToRoutePath('index.typ', ['.typ']), '/');
    assert.equal(filePathToRoutePath('guide/hello.typ', ['.typ']), '/guide/hello');
    assert.equal(filePathToRoutePath('guide/index.typ', ['.typ']), '/guide');
  });
});
