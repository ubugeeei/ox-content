# Ox Content

<p align="center">
  <img src="./assets/logo.svg" alt="Ox Content Logo" width="200" height="200" />
</p>

<p align="center">
  <strong>Framework-agnostic documentation tooling</strong><br>
  High-performance Markdown parser built in Rust
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
- **Multi-Runtime** - Node.js (NAPI), WebAssembly, Native Rust
- **Framework Agnostic** - Works with Vite, Webpack, Rollup, esbuild via unplugin
- **Plugin Compatible** - Works with markdown-it, remark, rehype ecosystems
- **API Docs Generation** - Generate docs from JSDoc/TypeScript (like `cargo doc`)

## Benchmarks

### Parse/Render Speed

| Library              | Small (0.5KB)        | Large (48.7KB)     | Throughput       | Ratio    |
|----------------------|----------------------|--------------------|------------------|----------|
| **@ox-content/napi** | **157,367 ops/s**    | **2,380 ops/s**    | **113.24 MB/s**  | **1.00x**|
| marked               | 14,297 ops/s         | 294 ops/s          | 13.99 MB/s       | 8.09x    |
| markdown-it          | 10,285 ops/s         | 402 ops/s          | 19.15 MB/s       | 5.91x    |
| remark               | 1,839 ops/s          | 17 ops/s           | 0.82 MB/s        | 138.76x  |

*Higher ops/sec is better. Lower ratio is better.*

### Build Output Size

| Framework          | Gzipped      | Ratio       |
|--------------------|--------------|-------------|
| **ox-content**     | **2.7 KB**   | **1.00x**   |
| Astro              | 3.5 KB       | 1.30x       |
| ox-content + Vue   | 25.5 KB      | 9.34x       |
| Astro + Vue        | 33.2 KB      | 12.18x      |
| VitePress          | 721.8 KB     | 264.92x     |

*Same 4 Markdown pages. Lower is better.*

## Quick Start

```bash
npm install @ox-content/napi
```

```javascript
import { parseAndRender } from '@ox-content/napi';

const { html } = parseAndRender('# Hello World', { gfm: true });
```

**[Read the full documentation →](https://ubugeeei.github.io/ox-content/)**

## Packages

| Package | Description |
| ------- | ----------- |
| [`@ox-content/napi`](./crates/ox_content_napi) | Node.js bindings |
| [`@ox-content/wasm`](./crates/ox_content_wasm) | WebAssembly bindings |
| [`unplugin-ox-content`](./packages/unplugin-ox-content) | Universal plugin (Vite/Webpack/Rollup/esbuild) |

## License

MIT License - see [LICENSE](./LICENSE)
