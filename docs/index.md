---
title: Ox Content
description: High-performance documentation toolkit built in Rust. Framework-agnostic, zero-copy parsing, NAPI bindings for Node.js.
---

# Ox Content

**A framework-agnostic documentation tooling for Vite+**

![Ox Content Logo](/ox-content/logo.svg)

---

## Vision

Ox Content brings **Rust-level performance** to the JavaScript documentation ecosystem. We believe that building documentation should be as fast as building your code.

### The Problem

Modern documentation tools often sacrifice performance for features:
- Heavy JavaScript bundles slow down page loads
- Markdown parsing becomes a bottleneck in large projects
- Build times grow linearly with content size

### Our Solution

Ox Content leverages the [Oxc](https://oxc.rs/) philosophy:
- **Arena-based allocation** - Zero-copy parsing with bumpalo
- **Native performance** - Rust core with NAPI bindings
- **Minimal output** - SSG-first approach, ship only what you need

![Architecture](/ox-content/architecture.svg)

## Core Philosophy

1. **Performance First** - Arena-based allocation for zero-copy parsing
2. **Standards Compliant** - Full CommonMark + GFM support with mdast-compatible AST
3. **Framework Agnostic** - Works with any JavaScript framework via NAPI
4. **Developer Experience** - Excellent TypeScript types and error messages

## Features

### Blazing Fast Markdown Parser

The parser uses [bumpalo](https://docs.rs/bumpalo) arena allocation for maximum performance:

```rust
use ox_content_allocator::Allocator;
use ox_content_parser::Parser;

let allocator = Allocator::new();
let parser = Parser::new(&allocator, "# Hello World");
let doc = parser.parse().unwrap();
// All AST nodes are allocated in the arena
// Freed all at once when allocator is dropped
```

### mdast-Compatible AST

The AST follows the [mdast](https://github.com/syntax-tree/mdast) specification, making it compatible with the unified ecosystem:

**Block Nodes:**
- `Document` - Root node containing all content
- `Paragraph` - Block of text
- `Heading` - h1-h6 headings with depth
- `CodeBlock` - Fenced (```) or indented code blocks
- `BlockQuote` - Quoted content (>)
- `List` / `ListItem` - Ordered and unordered lists
- `Table` / `TableRow` / `TableCell` - GFM tables
- `ThematicBreak` - Horizontal rules (---, ***, ___)
- `Html` - Raw HTML blocks

**Inline Nodes:**
- `Text` - Plain text content
- `Emphasis` - Italic (*text* or _text_)
- `Strong` - Bold (**text** or __text__)
- `InlineCode` - Inline code spans (`code`)
- `Link` - Hyperlinks [text](url)
- `Image` - Images ![alt](url)
- `Break` - Hard line breaks
- `Delete` - Strikethrough (~~text~~) (GFM)
- `FootnoteReference` - Footnote references (GFM)

### GFM Extensions

Full support for GitHub Flavored Markdown:

```markdown
| Feature | Status |
|---------|--------|
| Tables | ✅ |
| Task Lists | ✅ |
| Strikethrough | ✅ |
| Autolinks | ✅ |
| Footnotes | ✅ |

- [x] Completed task
- [ ] Pending task

~~deleted text~~

www.example.com (autolinked)

Here is a footnote[^1].

[^1]: Footnote content.
```

### Vite Environment API Integration

SSG-focused rendering with Astro-like islands architecture:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { oxContent } from 'vite-plugin-ox-content';

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: 'docs',
      // Auto-generate API docs from source
      docs: {
        src: ['./src'],
        out: 'docs/api',
      },
    })
  ]
});
```

### Node.js Bindings

High-performance NAPI bindings for seamless JavaScript integration:

```javascript
import { parse, parseAndRender, parseAndRenderAsync } from '@ox-content/napi';

// Parse to AST
const { ast } = parse('# Hello', { gfm: true });

// Parse and render in one call (sync)
const { html } = parseAndRender(content, { gfm: true });

// Parse and render async (runs on worker thread, non-blocking)
const result = await parseAndRenderAsync(content, { gfm: true });
```

The async API (`parseAndRenderAsync`, `transformAsync`) runs on a worker thread, keeping the main thread responsive for large documents.

---

## Benchmarks

### Parse Speed

![Parse Benchmark](/ox-content/benchmark-parse.svg)

### Render Speed

![Render Benchmark](/ox-content/benchmark-render.svg)

### Build Output Size

![Bundle Size Benchmark](/ox-content/benchmark-bundle.svg)

### Production Build Time

![Build Time Benchmark](/ox-content/benchmark-build.svg)

> **Note:** ox-content (bare) produces pure HTML without JavaScript/CSS, ideal for custom themes or benchmarking. VitePress always includes Vue runtime for client-side hydration.

---

## Packages

### Rust Crates

| Crate | Description | Key Features |
|-------|-------------|--------------|
| `ox_content_allocator` | Arena allocator | bumpalo wrapper, Vec/Box/String types |
| `ox_content_ast` | AST definitions | mdast-compatible nodes, Visitor pattern |
| `ox_content_parser` | Markdown parser | CommonMark + GFM, streaming support |
| `ox_content_renderer` | HTML renderer | Customizable, XHTML support, sanitization |
| `ox_content_napi` | Node.js bindings | napi-rs, TypeScript types |
| `ox_content_wasm` | WebAssembly bindings | wasm-bindgen, Browser & Deno support |
| `ox_content_og_image` | OG images | SVG-based, customizable templates |

### Unplugin

| Package | Description | Key Features |
|---------|-------------|--------------|
| [unplugin-ox-content](./packages/unplugin-ox-content.md) | Universal plugin | Vite, Webpack, Rollup, esbuild support |

### Vite Plugins

| Package | Description | Key Features |
|---------|-------------|--------------|
| [vite-plugin-ox-content](./packages/vite-plugin-ox-content.md) | Base Vite plugin | Environment API, HMR, Builtin docs generation |
| [vite-plugin-ox-content-vue](./packages/vite-plugin-ox-content-vue.md) | Vue integration | Embed Vue components in Markdown |
| [vite-plugin-ox-content-react](./packages/vite-plugin-ox-content-react.md) | React integration | Embed React components in Markdown |
| [vite-plugin-ox-content-svelte](./packages/vite-plugin-ox-content-svelte.md) | Svelte integration | Embed Svelte 5 components in Markdown |

### Plugin Compatibility

Ox Content supports plugins from existing Markdown ecosystems via unplugin:

```typescript
// vite.config.ts
import oxContent from 'unplugin-ox-content/vite';

// markdown-it plugins
import markdownItToc from 'markdown-it-toc-done-right';

// remark plugins
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

// rehype plugins
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';

export default defineConfig({
  plugins: [
    oxContent({
      plugin: {
        // markdown-it plugins
        markdownIt: [markdownItToc],
        // remark plugins (unified)
        remark: [remarkGfm, remarkToc],
        // rehype plugins (unified)
        rehype: [rehypeHighlight, rehypeSlug],
        // native ox-content plugins
        oxContent: [(html) => html.replace(/foo/g, 'bar')],
      },
    }),
  ],
});
```

See the [examples](https://github.com/ubugeeei/ox-content/tree/main/examples) for complete integration samples.

### API Documentation Generation

Generate API documentation from your TypeScript/JavaScript source code (similar to `cargo doc` for Rust):

```typescript
// vite.config.ts
import oxContent from 'unplugin-ox-content/vite';

export default defineConfig({
  plugins: [
    oxContent({
      // Enable API docs generation
      docs: {
        enabled: true,
        src: ['./src'],           // Source directories
        out: 'docs/api',          // Output directory
        include: ['**/*.ts'],     // Files to include
        exclude: ['**/*.test.*'], // Files to exclude
        includePrivate: false,    // Skip private items (_prefixed)
        toc: true,                // Generate table of contents
        groupBy: 'file',          // Group by 'file' or 'kind'
      },
    }),
  ],
});
```

Documentation is extracted from:
- **JSDoc comments** (`/** ... */`)
- **Type signatures** (function parameters, return types)
- **TypeScript types** (interfaces, type aliases, enums)

```typescript
/**
 * Adds two numbers together.
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 * @example
 * add(1, 2) // => 3
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

## Quick Links

- [Getting Started](./getting-started.md) - Installation and first steps
- [Architecture](./architecture.md) - Deep dive into the design
- [API Reference](./api/index.md) - Generated API documentation
- [Playground](/ox-content/playground/) - Try it in your browser
- [GitHub](https://github.com/ubugeeei/ox-content) - Source code and issues

## License

MIT License - Free for personal and commercial use.
