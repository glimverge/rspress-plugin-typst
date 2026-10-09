# rspress-plugin-typst

Use [Typst](https://github.com/typst/typst) `.typ` files as [Rspress](https://rspress.rs/) documentation pages.

Typst's experimental HTML export is compiled through the Rust-powered Node-API package [`@myriaddreamin/typst-ts-node-compiler`](https://www.npmjs.com/package/@myriaddreamin/typst-ts-node-compiler), then rendered inside the Rspress theme.

> Typst HTML export is still experimental (`--features html`). Behavior may change; do not rely on it for production-critical publishing yet.

## Install

```bash
pnpm add rspress-plugin-typst
```

## Usage

```ts
// rspress.config.ts
import { defineConfig } from '@rspress/core';
import { pluginTypst } from 'rspress-plugin-typst';

export default defineConfig({
  root: 'docs',
  plugins: [pluginTypst()],
});
```

Add Typst pages next to your Markdown docs:

```text
docs/
  index.mdx
  guide/
    hello.typ   →  /guide/hello
    math.typ    →  /guide/math
```

### Frontmatter

Prefer Typst document metadata:

```typ
#set document(
  title: "Hello Typst",
  description: "Rendered by rspress-plugin-typst",
)
```

Optional Rspress-oriented frontmatter via a labeled metadata block:

```typ
#metadata((
  title: "Hello Typst",
  description: "Rendered by rspress-plugin-typst",
  outline: true,
)) <frontmatter>
```

## Options

```ts
pluginTypst({
  extensions: ['.typ'],
  include: ['**/*.typ'],
  exclude: ['**/_*', '**/_*/**'],
  fontPaths: ['assets/fonts'],
  inputs: { site: 'My Docs' }, // → sys.inputs.site
  workspace: undefined, // defaults to docs root
  className: 'rspress-typst',
  routeExtensions: true,
})
```

| Option | Default | Description |
| --- | --- | --- |
| `extensions` | `['.typ']` | File extensions treated as Typst docs |
| `include` | `['**/*.typ']` | Globs relative to the docs root |
| `exclude` | `['**/_*', '**/_*/**']` | Ignore patterns (underscore convention) |
| `fontPaths` | `undefined` | Extra font directories for the compiler |
| `inputs` | `undefined` | Extra `sys.inputs` string pairs |
| `workspace` | docs root | Typst workspace / package root |
| `className` | `'rspress-typst'` | Wrapper class on the rendered body |
| `routeExtensions` | `true` | Register extensions on `route.extensions` |

## How it works

1. **`config`** — registers `.typ` on Rspress `route.extensions`.
2. **`beforeBuild`** — compiles every Typst page once so titles, TOC, and search text are available to `extendPageData` / `modifySearchIndexData`.
3. **Rspack loader** — transforms each `.typ` route module into a React page that renders the HTML body through `TypstDoc`.
4. **Rust compiler** — `@myriaddreamin/typst-ts-node-compiler` embeds Typst via N-API (same engine family as the official Typst CLI HTML target).

```text
.typ  →  (Rust / N-API Typst HTML)  →  React page  →  Rspress route
```

## Playground

```bash
pnpm install
pnpm build
pnpm playground:dev
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT
