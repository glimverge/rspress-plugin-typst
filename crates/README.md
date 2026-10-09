# Native crates

Compilation currently uses the published Rust N-API package

[`@myriaddreamin/typst-ts-node-compiler`](https://github.com/Myriad-Dreamin/typst.ts/tree/main/packages/typst.node)

which wraps the official Typst compiler (including experimental HTML export).

A first-party `typst-html-napi` crate can be added here later if this plugin needs
custom HTML post-processing or a tighter Typst version pin without depending on
`typst.ts`. Until then, keep the TypeScript plugin as the integration surface and
treat the Node compiler binding as the Rust engine.
