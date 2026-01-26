# Playground Example

Interactive web playground for testing Markdown parsing.

## Setup

```bash
cd examples/playground
pnpm install
pnpm dev
```

## Features

- **Live Preview**: See rendered HTML as you type
- **AST Viewer**: Inspect the parsed AST structure
- **Performance Metrics**: View parsing and rendering times
- **GFM Toggle**: Enable/disable GitHub Flavored Markdown
- **Syntax Highlighting**: Code blocks with highlighting

## Architecture

The playground uses the `@ox-content/napi` package directly:

```ts
import { parseMarkdown, parseAndRender } from '@ox-content/napi';

// Get AST for visualization
const ast = parseMarkdown(input, { gfm: true });

// Get rendered HTML for preview
const { html } = parseAndRender(input, { gfm: true });
```

## UI Components

- **Editor**: Monaco Editor for Markdown input
- **Preview**: Rendered HTML output
- **AST Tree**: Collapsible AST visualization
- **Toolbar**: Options and performance stats

## Running

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```
