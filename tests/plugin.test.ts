import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  compileTypstFile,
  generateTypstPageModule,
  pluginTypst,
} from '../dist/index.js';

function headerAt(toc, contentIndex) {
  const offsets = toc.map(item => item.charIndex);
  const index = offsets.findIndex((offset, position) => {
    if (position >= toc.length - 1) return offset < contentIndex;
    const next = offsets[position + 1];
    return offset <= contentIndex && next >= contentIndex;
  });
  return toc[index];
}

describe('plugin page data', () => {
  it('publishes heading toc for search and the generated page module', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rspress-typst-toc-'));
    const filepath = path.join(dir, 'guide.typ');
    fs.writeFileSync(
      filepath,
      `
#set document(title: "Alpha")

= Alpha

alpha body unique

== Beta

beta body unique
`,
      'utf8',
    );

    const plugin = pluginTypst();
    await plugin.beforeBuild({ root: dir }, true);

    const page = {
      _filepath: filepath,
      title: '',
      content: '',
      toc: [],
      routePath: '/guide',
      frontmatter: {},
      lang: '',
      version: '',
      _relativePath: 'guide.typ',
    };

    await plugin.modifySearchIndexData([page], true);
    assert.equal(page.title, 'Alpha');
    assert.deepEqual(
      page.toc.map(item => item.text),
      ['Alpha', 'Beta'],
    );
    assert.equal(page.toc[0].charIndex, 0);
    assert.ok(page.toc[1].charIndex > page.toc[0].charIndex);
    assert.equal(
      headerAt(page.toc, page.content.indexOf('alpha body unique')).text,
      'Alpha',
    );
    assert.equal(
      headerAt(page.toc, page.content.indexOf('beta body unique')).text,
      'Beta',
    );

    await plugin.extendPageData(page, true);
    assert.equal(page.title, 'Alpha');
    assert.equal(page.toc[1].id, 'beta');
    assert.equal(page.toc[1].charIndex > 0, true);

    const result = compileTypstFile(filepath, '/guide', { workspace: dir });
    const code = generateTypstPageModule(result, 'rspress-typst');
    assert.match(code, /export const title = "Alpha"/);
    assert.match(code, /export const headingTitle = "Alpha"/);
    assert.match(code, /export const toc = \[[\s\S]*"charIndex":/);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});
