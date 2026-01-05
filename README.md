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
