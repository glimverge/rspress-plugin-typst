#set document(
  title: "Hello Typst",
  description: "Example Typst documentation page rendered by rspress-plugin-typst",
)

#metadata((
  title: "Hello Typst",
  description: "Example Typst documentation page rendered by rspress-plugin-typst",
)) <frontmatter>

= Hello Typst

This page is authored as a `.typ` file and compiled to HTML with Typst's
experimental HTML export, then served by Rspress.

== What you get

- Conventional routing: `docs/guide/hello.typ` → `/guide/hello`
- Document title / description from `#set document(...)`
- Optional frontmatter via `#metadata(...) <frontmatter>`
- Searchable plain-text content extracted from the HTML body

== Sample content

You can mix *emphasis*, _stress_, and `inline code`.

#quote[
  Typst makes typesetting feel like programming — and now it can power your docs site too.
]
