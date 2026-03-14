# @ox-content/napi

Node.js bindings for Ox Content's Rust core.

## Installation

```bash
pnpm add @ox-content/napi
```

## Usage

### Parse Markdown to AST

```ts
import { parseMarkdown } from "@ox-content/napi";

const markdown = "# Hello World\n\nThis is **bold** text.";
const ast = parseMarkdown(markdown, { gfm: true });

console.log(JSON.stringify(ast, null, 2));
```

### Parse and Render

```ts
import { parseAndRender } from "@ox-content/napi";

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
  | "root"
  | "paragraph"
  | "heading"
  | "codeBlock"
  | "blockquote"
  | "list"
  | "listItem"
  | "table"
  | "tableRow"
  | "tableCell"
  | "thematicBreak"
  | "html";

// Inline nodes
type InlineNode =
  | "text"
  | "emphasis"
  | "strong"
  | "inlineCode"
  | "link"
  | "image"
  | "break"
  | "delete"
  | "footnoteReference";
```

## Search API

The NAPI bindings include a full-text search engine.

### buildSearchIndex(documents)

Builds a search index from an array of documents.

```ts
import { buildSearchIndex } from "@ox-content/napi";

const documents = [
  {
    id: "getting-started",
    title: "Getting Started",
    url: "/getting-started",
    body: "Welcome to the documentation...",
    headings: ["Installation", "Quick Start"],
    code: ["npm install package"],
  },
];

const indexJson = buildSearchIndex(documents);
```

### searchIndex(indexJson, query, options?)

Searches a serialized index.

```ts
import { searchIndex } from "@ox-content/napi";

const results = searchIndex(indexJson, "getting started", {
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
import { extractSearchContent } from "@ox-content/napi";

const markdown = "# Hello World\n\nThis is content.";
const doc = extractSearchContent(markdown, "hello", "/hello", { gfm: true });

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

Latest local `parse-benchmark` run on 2026-03-07 with Node `v24.14.0` on Apple M2 Max:

| Size    |     Parse Only | Parse + Render |
| ------- | -------------: | -------------: |
| 0.5 KB  | 222758 ops/sec | 153955 ops/sec |
| 4.9 KB  |  25640 ops/sec |  19403 ops/sec |
| 48.7 KB |   2463 ops/sec |   2122 ops/sec |

For the 48.7 KB case, the same benchmark measured:

| Library            |   Parse Only | Parse + Render |
| ------------------ | -----------: | -------------: |
| `@ox-content/napi` | 2463 ops/sec |   2122 ops/sec |
| `md4w (md4c)`      |  735 ops/sec |   1903 ops/sec |
| `markdown-it`      |  639 ops/sec |    532 ops/sec |
| `marked`           |  362 ops/sec |    345 ops/sec |
| `remark`           |   32 ops/sec |     28 ops/sec |

Reproduce with:

```bash
node benchmarks/bundle-size/parse-benchmark.mjs
```

The benchmark includes `md4w (md4c)` by default and adds `Bun.markdown.html` automatically when `bun` is available.
