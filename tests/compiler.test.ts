import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { compileTypstFile } from '../dist/index.js';

describe('compileTypstFile', () => {
  it('compiles a typst document to HTML body and metadata', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rspress-typst-'));
    const filepath = path.join(dir, 'hello.typ');
    fs.writeFileSync(
      filepath,
      `
#set document(title: "Compiler Test", description: "from typst")

#metadata((
  title: "Frontmatter Title",
  draft: false,
)) <frontmatter>

= Welcome

Hello from *Typst*.
`,
      'utf8',
    );

    const result = compileTypstFile(filepath, '/hello', { workspace: dir });
    assert.equal(result.title, 'Frontmatter Title');
    assert.equal(result.description, 'from typst');
    assert.match(result.body, /Welcome/);
    assert.match(result.body, /Hello from/);
    assert.equal(result.frontmatter.draft, false);
    assert.ok(result.textContent.includes('Welcome'));
  });
});
