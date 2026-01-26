# @ox-content/napi

Node.js bindings for Ox Content's Rust core.

## Installation

```bash
pnpm add @ox-content/napi
```

## Usage

### Parse Markdown to AST

```ts
import { parseMarkdown } from '@ox-content/napi';

const markdown = '# Hello World\n\nThis is **bold** text.';
const ast = parseMarkdown(markdown, { gfm: true });

console.log(JSON.stringify(ast, null, 2));
```

### Parse and Render

```ts
import { parseAndRender } from '@ox-content/napi';

const markdown = `
# Welcome

- Item 1
- Item 2
- Item 3

| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |
`;

const result = parseAndRender(markdown, {
  gfm: true,
  footnotes: true,
  tables: true,
});

console.log(result.html);
```

## API

### parseMarkdown(content, options?)

Parses Markdown content and returns the AST.

#### Parameters

- `content`: `string` - Markdown content to parse
- `options`: `ParseOptions` (optional)

#### Returns

`MarkdownAst` - The parsed AST

### parseAndRender(content, options?)

Parses and renders Markdown to HTML in a single call.

#### Parameters

- `content`: `string` - Markdown content to parse
- `options`: `ParseOptions` (optional)

#### Returns

```ts
interface RenderResult {
  html: string;
  frontmatter?: Record<string, unknown>;
  toc?: TocEntry[];
}
```

## Options

```ts
interface ParseOptions {
  /** Enable GitHub Flavored Markdown */
  gfm?: boolean;

  /** Enable footnotes */
  footnotes?: boolean;

  /** Enable tables */
  tables?: boolean;

  /** Enable task lists */
  taskLists?: boolean;

  /** Enable strikethrough */
  strikethrough?: boolean;
}
```

## AST Types

The AST follows the [mdast](https://github.com/syntax-tree/mdast) specification:

```ts
interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  value?: string;
  // Additional properties based on node type
}

// Block nodes
type BlockNode =
  | 'root'
  | 'paragraph'
  | 'heading'
  | 'codeBlock'
  | 'blockquote'
  | 'list'
  | 'listItem'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'thematicBreak'
  | 'html';

// Inline nodes
type InlineNode =
  | 'text'
  | 'emphasis'
  | 'strong'
  | 'inlineCode'
  | 'link'
  | 'image'
  | 'break'
  | 'delete'
  | 'footnoteReference';
```

## Search API

The NAPI bindings include a full-text search engine.

### buildSearchIndex(documents)

Builds a search index from an array of documents.

```ts
import { buildSearchIndex } from '@ox-content/napi';

const documents = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    url: '/getting-started',
    body: 'Welcome to the documentation...',
    headings: ['Installation', 'Quick Start'],
    code: ['npm install package'],
  },
];

const indexJson = buildSearchIndex(documents);
```

### searchIndex(indexJson, query, options?)

Searches a serialized index.

```ts
import { searchIndex } from '@ox-content/napi';

const results = searchIndex(indexJson, 'getting started', {
  limit: 10,
  prefix: true,
});

// results: Array<{
//   id: string;
//   title: string;
//   url: string;
//   score: number;
//   matches: string[];
//   snippet: string;
// }>
```

### extractSearchContent(source, id, url, options?)

Extracts searchable content from Markdown source.

```ts
import { extractSearchContent } from '@ox-content/napi';

const markdown = '# Hello World\n\nThis is content.';
const doc = extractSearchContent(markdown, 'hello', '/hello', { gfm: true });

// doc: {
//   id: 'hello',
//   title: 'Hello World',
//   url: '/hello',
//   body: 'This is content.',
//   headings: ['Hello World'],
//   code: [],
// }
```

## Performance

The NAPI bindings provide near-native performance:

| Operation | Time |
|-----------|------|
| Parse 1KB | ~50μs |
| Parse 10KB | ~200μs |
| Parse 100KB | ~1.5ms |
| Parse + Render 10KB | ~300μs |

Benchmarks run on Apple M1 Pro.
