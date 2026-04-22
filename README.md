<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/oxcontent-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/oxcontent-dark.svg">
    <img alt="Ox Content logo" src="./assets/oxcontent-dark.svg" height="60">
  </picture>
</p>

<p align="center">
  <strong>cargo doc for JavaScript</strong><br>
  Rust-powered document generator and high-performance Markdown toolkit
</p>

<p align="center">
  <a href="https://ubugeeei.github.io/ox-content/">Documentation</a> •
  <a href="https://ubugeeei.github.io/ox-content/getting-started">Getting Started</a> •
  <a href="https://ubugeeei.github.io/ox-content/playground/">Playground</a>
</p>

---

## Features

- **Blazing Fast** - Arena-allocated parser with zero-copy parsing
- **mdast Compatible** - Full compatibility with the unified ecosystem
- **GFM Support** - Tables, task lists, strikethrough, autolinks, footnotes
- **Multi-Runtime** - Node.js (NAPI), WebAssembly (WIP), Native Rust
- **Framework Agnostic** - Works with Vue, React, Svelte, and more
- **Built-in SSG** - Static site generation with theming, search, and OG images
- **API Docs Generation** - Generate docs from JSDoc/TypeScript (like `cargo doc`)
- **i18n** - ICU MessageFormat 2 parser, dictionary management, static checker, and LSP

## Quick Start

### Basic Usage (Node.js)

```bash
npm install @ox-content/napi
```

```javascript
import { parseAndRender } from "@ox-content/napi";

const { html } = parseAndRender("# Hello World", { gfm: true });
```

### Vite Plugin

```bash
npm install @ox-content/vite-plugin
```

`@ox-content/vite-plugin` already installs the native `@ox-content/napi` dependency it needs.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { oxContent } from "@ox-content/vite-plugin";

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: "docs",
      outDir: "dist/docs",
      highlight: true,
      ssg: {
        siteName: "My Docs",
      },
    }),
  ],
});
```

### Framework Integration

```bash
# Vue
npm install @ox-content/vite-plugin-vue

# React
npm install @ox-content/vite-plugin-react

# Svelte
npm install @ox-content/vite-plugin-svelte
```

### i18n Static Checker (CLI)

```bash
# Check for missing/unused translation keys
ox-content-i18n check --dict-dir content/i18n --src src

# Validate an ICU MessageFormat 2 message
ox-content-i18n validate "Hello {$name}"
```

**[Read the full documentation →](https://ubugeeei.github.io/ox-content/)**

## Performance

Ox Content is positioned both as a document generator and as a high-performance Markdown toolkit. The numbers below focus on the Markdown engine side.

Latest local benchmark sweep on 2026-04-22 with Node `v24.15.0` on Apple M5 Pro. The tables below show median results from 7 local runs of the benchmark harness for the large 48.7 KB case.

### Parse Only (48.7 KB)

| Library            | ops/sec | avg time | throughput |
| ------------------ | ------: | -------: | ---------: |
| `md4w (md4c)`      |    1092 |  0.92 ms | 51.98 MB/s |
| `markdown-it`      |    1018 |  0.98 ms | 48.46 MB/s |
| `marked`           |     534 |  1.87 ms | 25.39 MB/s |
| `@ox-content/napi` |     209 |  4.79 ms |  9.93 MB/s |
| `remark`           |      39 | 25.55 ms |  1.86 MB/s |

### Parse + Render (48.7 KB)

| Library             | ops/sec | avg time | throughput  |
| ------------------- | ------: | -------: | ----------: |
| `Bun.markdown.html` |    4261 |  0.23 ms | 202.77 MB/s |
| `md4w (md4c)`       |    2605 |  0.38 ms | 123.95 MB/s |
| `markdown-it`       |     739 |  1.35 ms |  35.17 MB/s |
| `marked`            |     462 |  2.16 ms |  22.00 MB/s |
| `@ox-content/napi`  |     202 |  4.95 ms |   9.61 MB/s |
| `micromark`         |      44 | 22.97 ms |   2.07 MB/s |
| `remark`            |      35 | 28.37 ms |   1.68 MB/s |

Ox Content is not the absolute fastest parser in this synthetic benchmark, but it stays far ahead of heavier AST-oriented JavaScript stacks like `remark` while also serving as the native core for the full documentation pipeline.

Run the benchmark with:

```bash
node benchmarks/bundle-size/parse-benchmark.mjs
```

The script now compares against `md4w (md4c)` by default and will include `Bun.markdown.html` automatically when `bun` is installed.

## Development

```bash
nix develop           # Enter the pinned dev shell
vp install             # Install JS dependencies through Vite+
vp run build:napi      # Build NAPI bindings
vp run build:npm       # Build npm packages
vp run test            # Run tests
```

The dev shell is pinned in `flake.nix`, the workspace task graph lives in `vite.config.ts`, and `.node-version` is kept for CI / non-Nix Node setup.

See the [documentation](https://ubugeeei.github.io/ox-content/) for more details.

## Sponsor

If you find Ox Content useful, please consider [sponsoring](https://github.com/sponsors/ubugeeei) the project.

## License

MIT License - see [LICENSE](./LICENSE)
