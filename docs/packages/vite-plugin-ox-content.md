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

```ts
import config from 'virtual:ox-content/config';
import { useMarkdown } from 'virtual:ox-content/runtime';
```
