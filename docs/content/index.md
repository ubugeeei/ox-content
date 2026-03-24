---
layout: entry
title: Ox Content
description: High-performance documentation toolkit built in Rust. Framework-agnostic, zero-copy parsing, NAPI bindings for Node.js.
hero:
  name: Ox Content
  text: High-performance documentation framework
  tagline: Built with Rust. Framework-agnostic. Blazing fast.
  image:
    src: logo.svg
    alt: Ox Content Logo
  actions:
    - theme: brand
      text: Get Started
      link: getting-started.md
    - theme: alt
      text: View on GitHub
      link: https://github.com/ubugeeei/ox-content
    - theme: alt
      text: Sponsor
      link: https://github.com/sponsors/ubugeeei
features:
  - icon: "mdi:lightning-bolt"
    title: Blazing Fast
    details: Arena-based allocation with Rust core for maximum performance
    link: architecture.md
  - icon: "mdi:package-variant"
    title: Framework Agnostic
    details: Works with Vue, React, Svelte, and more via NAPI bindings
  - icon: "mdi:magnify"
    title: Built-in Search
    details: Full-text search with BM25 scoring and CJK support
  - icon: "mdi:palette"
    title: Customizable Themes
    details: VitePress-like theming with CSS variables
    link: theming.md
---

## Core Philosophy

1. **Performance First** - Arena-based allocation for zero-copy parsing
2. **Standards Compliant** - Full CommonMark + GFM support with mdast-compatible AST
3. **Framework Agnostic** - Works with any JavaScript framework via NAPI
4. **Developer Experience** - Excellent TypeScript types and error messages

## Quick Links

- [Getting Started](./getting-started.md) - Installation and first steps
- [Architecture](./architecture.md) - Deep dive into the design
- [unplugin mdast Bridge Example](./examples/unplugin-mdast-bridge.md) - Native parser plus unified-compatible mdast plugins
- [Theming](./theming.md) - Customize your documentation site
- [GitHub](https://github.com/ubugeeei/ox-content) - Source code and issues

## Benchmarks

Latest local `parse-benchmark` run on 2026-03-07 with Node `v24.14.0` on Apple M2 Max:

### Parse Only (48.7 KB)

| Library            | ops/sec |  throughput |      relative |
| ------------------ | ------: | ----------: | ------------: |
| `@ox-content/napi` |    2463 | 117.22 MB/s |         1.00x |
| `md4w (md4c)`      |     735 |  34.99 MB/s |  3.35x slower |
| `markdown-it`      |     639 |  30.43 MB/s |  3.85x slower |
| `marked`           |     362 |  17.25 MB/s |  6.80x slower |
| `remark`           |      32 |   1.51 MB/s | 77.86x slower |

### Parse + Render (48.7 KB)

| Library            | ops/sec |  throughput |      relative |
| ------------------ | ------: | ----------: | ------------: |
| `@ox-content/napi` |    2122 | 100.97 MB/s |         1.00x |
| `md4w (md4c)`      |    1903 |  90.54 MB/s |  1.12x slower |
| `markdown-it`      |     532 |  25.31 MB/s |  3.99x slower |
| `marked`           |     345 |  16.42 MB/s |  6.15x slower |
| `micromark`        |      34 |   1.62 MB/s | 62.35x slower |
| `remark`           |      28 |   1.33 MB/s | 75.81x slower |

Reproduce with:

```bash
node benchmarks/bundle-size/parse-benchmark.mjs
```

The benchmark includes `md4w (md4c)` by default and adds `Bun.markdown.html` automatically when `bun` is available.
