# Getting Started

This guide will help you set up Ox Content and start using it in your projects.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Installation                          |
| ----------- | ------- | ------------------------------------- |
| **Rust**    | 1.83+   | [rustup.rs](https://rustup.rs/)       |
| **Node.js** | 24+     | [nodejs.org](https://nodejs.org/)     |
| **mise**    | Latest  | [mise.jdx.dev](https://mise.jdx.dev/) |

## Installation

### For Development (Building from Source)

```bash
# Clone the repository
git clone https://github.com/ubugeeei/ox-content.git
cd ox-content

# Setup with mise (recommended)
mise trust
mise install
mise run install

# Build all crates
mise run build

# Run tests to verify installation
mise run test
```

### As a Rust Dependency

Add to your `Cargo.toml`:

```toml
[dependencies]
ox_content_allocator = "0.1"
ox_content_ast = "0.1"
ox_content_parser = "0.1"
ox_content_renderer = "0.1"
```

### As an npm Package

```bash
npm install @ox-content/napi
# or
pnpm add @ox-content/napi
# or
yarn add @ox-content/napi
```

## Quick Start Examples

### Basic Parsing and Rendering (Rust)

```rust
use ox_content_allocator::Allocator;
use ox_content_parser::Parser;
use ox_content_renderer::HtmlRenderer;

fn main() {
    // Step 1: Create an arena allocator
    let allocator = Allocator::new();

    // Step 2: Define your Markdown content
    let markdown = r#"
# Welcome to Ox Content

This is a **fast** Markdown parser written in Rust.

## Features

- Zero-copy parsing
- Arena allocation
- GFM support
"#;

    // Step 3: Parse the Markdown
    let parser = Parser::new(&allocator, markdown);
    let document = parser.parse().expect("Failed to parse");

    // Step 4: Render to HTML
    let mut renderer = HtmlRenderer::new();
    let html = renderer.render(&document);

    println!("{}", html);
}
```

### With GFM Extensions (Rust)

```rust
use ox_content_allocator::Allocator;
use ox_content_parser::{Parser, ParserOptions};
use ox_content_renderer::HtmlRenderer;

fn main() {
    let allocator = Allocator::new();

    let markdown = r#"
# Task List

- [x] Learn Rust
- [x] Build a parser
- [ ] Conquer the world

## Data Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

## Formatting

~~deleted~~ text and www.example.com autolink
"#;

    // Enable GFM extensions
    let options = ParserOptions::gfm();
    let parser = Parser::with_options(&allocator, markdown, options);
    let document = parser.parse().unwrap();

    let mut renderer = HtmlRenderer::new();
    let html = renderer.render(&document);

    println!("{}", html);
}
```

### Node.js Usage

```javascript
import { parseMarkdown, parseAndRender } from "@ox-content/napi";

// Option 1: Get AST only
const markdown = "# Hello World\n\nThis is **bold** text.";
const ast = parseMarkdown(markdown, { gfm: true });
console.log(JSON.stringify(ast, null, 2));

// Option 2: Parse and render in one call
const result = parseAndRender(markdown, {
  gfm: true,
});
console.log(result.html);
// Output: <h1>Hello World</h1>\n<p>This is <strong>bold</strong> text.</p>\n
```

### TypeScript with Types

```typescript
import {
  parseMarkdown,
  parseAndRender,
  type ParseOptions,
  type RenderResult,
} from "@ox-content/napi";

const options: ParseOptions = {
  gfm: true,
  footnotes: true,
  tables: true,
};

const markdown = `
# API Documentation

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /users | List users |
| POST | /users | Create user |
`;

const result: RenderResult = parseAndRender(markdown, options);
console.log(result.html);
```

### With Vite

```bash
npm install @ox-content/vite-plugin @ox-content/napi
```

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { oxContent, defineTheme, defaultTheme } from "@ox-content/vite-plugin";

export default defineConfig({
  plugins: [
    oxContent({
      // Source directory (default: 'content')
      srcDir: "content",
      outDir: "dist",
      // Enable syntax highlighting
      highlight: true,
      // SSG with themes and OG images
      ssg: {
        siteName: "My Docs",
        ogImage: "https://example.com/og-image.png",
        theme: defineTheme({
          extends: defaultTheme,
          socialLinks: {
            github: "https://github.com/your/repo",
          },
        }),
      },
      // Built-in full-text search (enabled by default)
      search: {
        enabled: true,
        placeholder: "Search docs...",
      },
    }),
  ],
});
```

### With Framework Integration

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
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { oxContentVue } from "@ox-content/vite-plugin-vue";

export default defineConfig({
  plugins: [vue(), oxContentVue()],
});
```

## Development Workflow

### Available Workspace Tasks

`mise.toml` delegates to the Vite+ task graph defined in `vite.config.ts`, so you can use `mise run <task>` as a thin wrapper around the canonical Vite+ tasks.

```bash
# Setup
mise run install        # Install JS dependencies with Vite+

# Building
mise run build          # Build everything (Rust + NAPI + npm packages)
mise run build:rust     # Build Rust crates
mise run build:rust-release
mise run build:napi
mise run build:npm

# Testing
mise run test           # Run all tests
mise run test:rust
mise run test:rust-verbose
mise run test:ts
mise run watch          # Watch for changes and run tests

# Code Quality
mise run fmt            # Format Rust + JavaScript/TypeScript
mise run fmt:check      # Check formatting (CI mode)
mise run clippy         # Run clippy lints
mise run lint           # Run all lints

# Pre-commit Check
mise run ready          # Run format, lint, and tests

# Documentation
mise run doc:cargo      # Generate Rust documentation
mise run doc:cargo-open # Generate and open in browser

# Docs and examples
mise run dev            # Start docs + playground
mise run dev:docs
mise run dev:playground
mise run playground
mise run integ-vue
mise run integ-react
mise run integ-svelte
mise run ssg-vite

# Benchmarks
mise run bench              # Run all benchmarks (Rust + JS)
mise run bench:rust         # Run Rust benchmarks only
mise run bench:parse        # Run parse/render speed benchmarks
mise run bench:bundle       # Run bundle size benchmarks
```

### Project Structure

```
ox-content/
├── Cargo.toml              # Workspace configuration
├── vite.config.ts          # Vite+ workspace task graph
├── mise.toml               # Thin mise wrappers around Vite+ tasks
├── crates/                 # Rust crates
│   ├── ox_content_allocator/   # Arena allocator
│   ├── ox_content_ast/         # AST node definitions
│   ├── ox_content_parser/      # Markdown parser
│   ├── ox_content_renderer/    # HTML renderer
│   ├── ox_content_search/      # Full-text search engine
│   ├── ox_content_napi/        # Node.js NAPI bindings
│   ├── ox_content_wasm/        # WebAssembly bindings
│   └── ox_content_og_image/    # OG image generation
├── npm/                    # npm packages
│   ├── vite-plugin-ox-content/       # @ox-content/vite-plugin
│   ├── vite-plugin-ox-content-vue/   # @ox-content/vite-plugin-vue
│   ├── vite-plugin-ox-content-react/ # @ox-content/vite-plugin-react
│   ├── vite-plugin-ox-content-svelte/# @ox-content/vite-plugin-svelte
│   └── unplugin-ox-content/          # @ox-content/unplugin
├── examples/               # Usage examples
├── content/                # Markdown content (default srcDir)
└── .github/workflows/      # CI/CD
    ├── ci.yml              # Continuous integration
    └── publish.yml         # npm release automation
```

## Running Tests

### All Tests

```bash
# With mise
mise run test

# With cargo directly
cargo test --workspace
```

### Specific Crate

```bash
cargo test -p ox_content_parser
cargo test -p ox_content_renderer
```

### With Output

```bash
cargo test --workspace -- --nocapture
```

### Watch Mode

```bash
mise run watch
# or
cargo watch -x "test --workspace"
```

## Running Benchmarks

Ox Content includes comprehensive benchmarks to measure performance:

```bash
# Run all benchmarks
mise run bench

# Run only Rust benchmarks (cargo bench)
mise run bench:rust

# Run parse/render speed benchmarks (compares with marked, markdown-it, md4w/md4c, and Bun when available)
mise run bench:parse

# Run bundle size benchmarks (compares with VitePress, Astro, etc.)
mise run bench:bundle
```

### Benchmark Results

See the [Benchmarks section](./index.md#benchmarks) for the latest results and the current comparison set.

## Using the Playground

The playground provides an interactive environment to test the parser:

```bash
# Start docs and playground together
mise run dev

# Or run only the playground
mise run playground

# Or manually
cd examples/playground
npm run dev
```

Then open [http://127.0.0.1:5173](http://127.0.0.1:5173) for the playground and
[http://127.0.0.1:4173](http://127.0.0.1:4173) for the docs site.

**Features:**

- Live Markdown preview
- HTML output inspection
- Pseudo AST visualization
- Simple split-pane editor
- Copy actions for source and output

## Troubleshooting

### Common Issues

#### "cargo: command not found"

Ensure Rust is installed and in your PATH:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### mise Not Recognized

Install mise:

```bash
curl https://mise.run | sh

# Add to your shell config
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
# or for zsh
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
```

#### Build Fails with Linking Errors

On Linux, you may need to install build essentials:

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"
```

On macOS, install Xcode Command Line Tools:

```bash
xcode-select --install
```

#### NAPI Build Fails

Ensure you have the correct Node.js version:

```bash
mise use node@24
# or
nvm use 24
```

### Getting Help

- [GitHub Issues](https://github.com/ubugeeei/ox-content/issues) - Bug reports and feature requests
- [Discussions](https://github.com/ubugeeei/ox-content/discussions) - Questions and ideas

## API Documentation Generation

Ox Content can generate API documentation from your TypeScript/JavaScript source code, similar to `cargo doc` for Rust.

### Configuration

```typescript
// vite.config.ts
import oxContent from "@ox-content/unplugin/vite";

export default defineConfig({
  plugins: [
    oxContent({
      docs: {
        enabled: true,
        src: ["./src"],
        out: "docs/api",
      },
    }),
  ],
});
```

### Options

| Option           | Type               | Default                | Description                          |
| ---------------- | ------------------ | ---------------------- | ------------------------------------ |
| `enabled`        | `boolean`          | `false`                | Enable API docs generation           |
| `src`            | `string[]`         | `['./src']`            | Source directories to scan           |
| `out`            | `string`           | `'docs/api'`           | Output directory                     |
| `include`        | `string[]`         | `['**/*.ts', ...]`     | File patterns to include             |
| `exclude`        | `string[]`         | `['**/*.test.*', ...]` | File patterns to exclude             |
| `includePrivate` | `boolean`          | `false`                | Include private items (`_` prefixed) |
| `toc`            | `boolean`          | `true`                 | Generate table of contents           |
| `groupBy`        | `'file' \| 'kind'` | `'file'`               | How to group documentation           |

### Writing Documentation

Use JSDoc comments to document your code:

```typescript
/**
 * A user in the system.
 */
export interface User {
  /** The user's unique identifier */
  id: string;
  /** The user's display name */
  name: string;
  /** The user's email address */
  email: string;
}

/**
 * Creates a new user.
 * @param name - The user's name
 * @param email - The user's email
 * @returns The created user object
 * @example
 * const user = createUser('Alice', 'alice@example.com');
 */
export function createUser(name: string, email: string): User {
  return { id: crypto.randomUUID(), name, email };
}
```

Supported JSDoc tags:

- `@param` - Parameter description
- `@returns` / `@return` - Return value description
- `@example` - Usage examples
- `@deprecated` - Mark as deprecated
- `@see` - Reference to related items

## Next Steps

- [Architecture Overview](./architecture.md) - Learn about the design
- [API Reference](./api/) - Explore the Rust API
- [Playground](/playground/) - Try it interactively
