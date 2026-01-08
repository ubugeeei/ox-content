# vite-plugin-ox-content

Base Vite plugin for Ox Content with Environment API support.

## Installation

```bash
pnpm add vite-plugin-ox-content
```

## Basic Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { oxContent } from 'vite-plugin-ox-content';

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: 'docs',
    }),
  ],
});
```

## Options

### srcDir

- Type: `string`
- Default: `'docs'`

Source directory for Markdown files.

### outDir

- Type: `string`
- Default: `'dist'`

Output directory for built files.

### ssg

- Type: `SsgOptions | boolean`
- Default: `{ enabled: true }`

SSG (Static Site Generation) options. By default, ox-content generates static HTML files for each Markdown file during build.

```ts
oxContent({
  ssg: {
    enabled: true,
    extension: '.html',
    clean: false,
  },
})
```

#### SsgOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable SSG mode |
| `extension` | `string` | `'.html'` | Output file extension |
| `clean` | `boolean` | `false` | Clean output directory before build |
| `bare` | `boolean` | `false` | Bare HTML output (no navigation, no styles) |

### Bare Mode (for benchmarking)

```ts
oxContent({
  ssg: {
    bare: true, // Output minimal HTML without navigation/styles
  },
})
```

### Disabling SSG

```ts
oxContent({
  ssg: false, // Disable SSG, use as module transformer only
})
```

### gfm

- Type: `boolean`
- Default: `true`

Enable GitHub Flavored Markdown extensions.

### toc

- Type: `boolean`
- Default: `true`

Generate table of contents.

### docs

- Type: `DocsOptions | false`
- Default: `{ enabled: true }`

Source documentation generation options. Set to `false` to disable.

```ts
oxContent({
  docs: {
    enabled: true,
    src: ['./src'],
    out: 'docs/api',
    include: ['**/*.ts'],
    exclude: ['**/*.test.*'],
    format: 'markdown',
    toc: true,
    groupBy: 'file',
  },
})
```

#### DocsOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable docs generation |
| `src` | `string[]` | `['./src']` | Source directories to scan |
| `out` | `string` | `'docs/api'` | Output directory |
| `include` | `string[]` | `['**/*.ts', '**/*.tsx']` | Files to include |
| `exclude` | `string[]` | `['**/*.test.*', '**/*.spec.*']` | Files to exclude |
| `format` | `'markdown' \| 'json' \| 'html'` | `'markdown'` | Output format |
| `private` | `boolean` | `false` | Include @private members |
| `toc` | `boolean` | `true` | Generate table of contents |
| `groupBy` | `'file' \| 'category'` | `'file'` | Group docs by file or category |

## Disabling Docs Generation

```ts
oxContent({
  docs: false, // Opt-out of builtin docs generation
})
```

### search

- Type: `SearchOptions | boolean`
- Default: `{ enabled: true }`

Full-text search options. Ox Content includes a built-in search engine powered by Rust with BM25 scoring.

```ts
oxContent({
  search: {
    enabled: true,
    limit: 10,
    prefix: true,
    placeholder: 'Search documentation...',
    hotkey: '/',
  },
})
```

#### SearchOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable search functionality |
| `limit` | `number` | `10` | Maximum number of search results |
| `prefix` | `boolean` | `true` | Enable prefix matching for autocomplete |
| `placeholder` | `string` | `'Search documentation...'` | Placeholder text for search input |
| `hotkey` | `string` | `'/'` | Keyboard shortcut to open search |

#### How It Works

1. **Build Time**: The plugin scans all Markdown files and builds a search index using the Rust-based search engine
2. **Index Storage**: The index is written to `search-index.json` in the output directory
3. **Client-Side Search**: The search index is loaded on-demand and searched entirely client-side

#### Features

- **BM25 Scoring**: Industry-standard relevance ranking algorithm
- **Multi-field Search**: Title, headings, body, and code are indexed with different weights
- **Japanese/CJK Support**: Proper tokenization for CJK characters
- **Prefix Matching**: Type-ahead suggestions for autocomplete
- **Zero Dependencies**: No external search service required

### Disabling Search

```ts
oxContent({
  search: false, // Disable built-in search
})
```

### Using with Custom Search UI

You can access the search index programmatically via the virtual module:

```ts
import { search, searchOptions } from 'virtual:ox-content/search';

// Search the index
const results = await search('query text', { limit: 5 });

// Results include:
// - id: document ID
// - title: document title
// - url: document URL
// - score: relevance score
// - snippet: text snippet with context
```

## Environment API

The plugin creates a `markdown` environment using Vite's Environment API for SSG-focused rendering.

## HMR Support

Markdown files are hot-reloaded during development. The plugin sends custom HMR events:

```ts
// Client-side
if (import.meta.hot) {
  import.meta.hot.on('ox-content:update', (data) => {
    console.log('Markdown updated:', data.file);
  });
}
```

## Virtual Modules

The plugin provides virtual modules:

- `virtual:ox-content/config` - Resolved plugin configuration
- `virtual:ox-content/runtime` - Runtime utilities
- `virtual:ox-content/search` - Search functionality

```ts
import config from 'virtual:ox-content/config';
import { useMarkdown } from 'virtual:ox-content/runtime';
import { search, searchOptions } from 'virtual:ox-content/search';

// Use the search function
const results = await search('query', { limit: 10 });
```
