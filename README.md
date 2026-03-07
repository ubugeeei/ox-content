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

### i18n Static Checker (CLI)

```bash
# Check for missing/unused translation keys
ox-content-i18n check --dict-dir content/i18n --src src

# Validate an ICU MessageFormat 2 message
ox-content-i18n validate "Hello {$name}"
```

**[Read the full documentation →](https://ubugeeei.github.io/ox-content/)**

## Performance

Latest local `parse-benchmark` run on 2026-03-07 with Node `v24.14.0` on Apple M2 Max:

### Parse Only (48.7 KB)

| Library | ops/sec | throughput | relative |
|---------|--------:|-----------:|---------:|
| `@ox-content/napi` | 2463 | 117.22 MB/s | 1.00x |
| `md4w (md4c)` | 735 | 34.99 MB/s | 3.35x slower |
| `markdown-it` | 639 | 30.43 MB/s | 3.85x slower |
| `marked` | 362 | 17.25 MB/s | 6.80x slower |
| `remark` | 32 | 1.51 MB/s | 77.86x slower |

### Parse + Render (48.7 KB)

| Library | ops/sec | throughput | relative |
|---------|--------:|-----------:|---------:|
| `@ox-content/napi` | 2122 | 100.97 MB/s | 1.00x |
| `md4w (md4c)` | 1903 | 90.54 MB/s | 1.12x slower |
| `markdown-it` | 532 | 25.31 MB/s | 3.99x slower |
| `marked` | 345 | 16.42 MB/s | 6.15x slower |
| `micromark` | 34 | 1.62 MB/s | 62.35x slower |
| `remark` | 28 | 1.33 MB/s | 75.81x slower |

Run the benchmark with:

```bash
node benchmarks/bundle-size/parse-benchmark.mjs
```

The script now compares against `md4w (md4c)` by default and will include `Bun.markdown.html` automatically when `bun` is installed.

## Development

```bash
pnpm install            # Install dependencies
mise run napi-build     # Build NAPI bindings
mise run npm-build      # Build npm packages
mise run test           # Run tests
```

See the [documentation](https://ubugeeei.github.io/ox-content/) for more details.

## Sponsor

If you find Ox Content useful, please consider [sponsoring](https://github.com/sponsors/ubugeeei) the project.

## License

MIT License - see [LICENSE](./LICENSE)
