#set document(
  title: "Math & Code",
  description: "Typst math and code samples in Rspress",
)

= Math and Code

Typst is especially pleasant for technical notes.

== Math

The quadratic formula:

$ x = (-b plus.minus sqrt(b^2 - 4 a c)) / (2 a) $

Inline math works too: $e^(i pi) + 1 = 0$.

== Code listing

```rust
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}
```

== Sys inputs

Site name from plugin `inputs`: #sys.inputs.at("site", default: "unknown")
