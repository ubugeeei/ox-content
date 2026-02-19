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

### Basic Usage (Node.js)

```bash
npm install @ox-content/napi
```

```javascript
import { parseAndRender } from '@ox-content/napi';

const { html } = parseAndRender('# Hello World', { gfm: true });
```

### Vite Plugin

```bash
npm install @ox-content/vite-plugin @ox-content/napi
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { oxContent } from '@ox-content/vite-plugin';

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: 'docs',
      outDir: 'dist/docs',
      highlight: true,
      ssg: {
        siteName: 'My Docs',
      },
    }),
  ],
});
```

### Framework Integration

```bash
# Vue
npm install @ox-content/vite-plugin-vue @ox-content/napi

# React
npm install @ox-content/vite-plugin-react @ox-content/napi

# Svelte
npm install @ox-content/vite-plugin-svelte @ox-content/napi
```

```typescript
// vite.config.ts (Vue example)
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { oxContentVue } from '@ox-content/vite-plugin-vue';

export default defineConfig({
  plugins: [vue(), oxContentVue()],
});
```

**[Read the full documentation →](https://ubugeeei.github.io/ox-content/)**

## Packages

| Package | Description |
| ------- | ----------- |
| [`@ox-content/napi`](./crates/ox_content_napi) | Node.js bindings |
| [`@ox-content/wasm`](./crates/ox_content_wasm) | WebAssembly bindings |
| [`@ox-content/vite-plugin`](./npm/vite-plugin-ox-content) | Vite plugin with SSG support |
| [`@ox-content/vite-plugin-vue`](./npm/vite-plugin-ox-content-vue) | Vue integration |
| [`@ox-content/vite-plugin-react`](./npm/vite-plugin-ox-content-react) | React integration |
| [`@ox-content/vite-plugin-svelte`](./npm/vite-plugin-ox-content-svelte) | Svelte integration |
| [`@ox-content/unplugin`](./npm/unplugin-ox-content) | Universal plugin (Vite/Webpack/Rollup/esbuild) |

## Development

### Requirements

- Node.js 24+
- pnpm 9+
- Rust 1.92+
- [mise](https://mise.jdx.dev/) (optional, for task running)

### Commands

```bash
# Install dependencies
pnpm install

# Build NAPI bindings
mise run napi-build

# Build npm packages (uses tsdown)
mise run npm-build

# Run tests
mise run test          # Rust tests
mise run test:ts       # TypeScript tests (vitest)

# Lint
mise run lint          # Rust + TypeScript
mise run lint:ts       # TypeScript only (oxlint --type-aware)

# Typecheck
pnpm check             # Uses @typescript/native-preview (tsgo)

# Release a new version
mise run release -- patch  # or minor, major, x.y.z
```

### Tooling

- **Build**: [tsdown](https://github.com/nicepkg/tsdown) (Rolldown-powered bundler)
- **Test**: [vitest](https://vitest.dev/)
- **Lint**: [oxlint](https://oxc.rs/docs/guide/usage/linter.html) with type-aware mode
- **Typecheck**: [@typescript/native-preview](https://github.com/nicepkg/typescript-native-preview) (tsgo)

## License

MIT License - see [LICENSE](./LICENSE)
