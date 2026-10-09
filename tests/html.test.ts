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
    assert.deepEqual(toc, [
      { id: 'intro', text: 'Intro', depth: 2 },
      { id: 'details', text: 'Details', depth: 3 },
    ]);
  });
});

describe('filePathToRoutePath', () => {
  it('maps conventional typst paths', () => {
    assert.equal(filePathToRoutePath('index.typ', ['.typ']), '/');
    assert.equal(filePathToRoutePath('guide/hello.typ', ['.typ']), '/guide/hello');
    assert.equal(filePathToRoutePath('guide/index.typ', ['.typ']), '/guide');
  });
});
