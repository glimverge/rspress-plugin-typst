# rspress-plugin-typst

Use [Typst](https://github.com/typst/typst) `.typ` files as [Rspress](https://rspress.rs/) documentation pages.

**Docs:** https://glimverge.github.io/rspress-plugin-typst/

Typst's experimental HTML export is compiled through [`@myriaddreamin/typst-ts-node-compiler`](https://www.npmjs.com/package/@myriaddreamin/typst-ts-node-compiler), then rendered inside the Rspress theme.

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
| `include` | all `.typ` under docs root | Globs relative to the docs root |
| `exclude` | underscore-prefixed files/dirs | Ignore patterns |
| `fontPaths` | `undefined` | Extra font directories for the compiler |
| `inputs` | `undefined` | Extra `sys.inputs` string pairs |
| `workspace` | docs root | Typst workspace / package root |
| `className` | `'rspress-typst'` | Wrapper class on the rendered body |
| `routeExtensions` | `true` | Register extensions on `route.extensions` |

## How it works

1. **`config`** — registers `.typ` on Rspress `route.extensions`.
2. **`beforeBuild`** — compiles every Typst page once so titles, TOC, and search text are available to `extendPageData` / `modifySearchIndexData`.
3. **Rspack loader** — transforms each `.typ` route module into a React page that renders the HTML body through `TypstDoc`.
4. **Compiler** — `@myriaddreamin/typst-ts-node-compiler` embeds Typst via N-API.

```text
.typ  →  (Typst HTML via N-API)  →  React page  →  Rspress route
```

## Documentation site

The `playground/` package is this project's docs site (Rspress + Typst examples). It deploys to GitHub Pages on every push to `main` via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Local preview:

```bash
pnpm install
pnpm build
pnpm playground:dev
# with production base path:
pnpm playground:build && pnpm --filter playground preview
# then open http://localhost:4173/rspress-plugin-typst/
```

### Enable GitHub Pages (one-time)

In the repository settings:

1. **Settings → Pages**
2. **Build and deployment → Source**: GitHub Actions

After the first successful `Deploy docs to GitHub Pages` workflow on `main`, the site is available at:

https://glimverge.github.io/rspress-plugin-typst/

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT
