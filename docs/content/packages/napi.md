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

Ox Content is positioned both as a document generator and as a high-performance Markdown toolkit. The numbers below focus on the Markdown engine side.

Latest local benchmark sweep on 2026-04-22 with Node `v24.15.0` on Apple M5 Pro. The tables below show median results from 7 local runs of the benchmark harness for the large 48.7 KB case.

### Parse Only (48.7 KB)

| Library            | ops/sec | avg time | throughput |
| ------------------ | ------: | -------: | ---------: |
| `md4w (md4c)`      |    1092 |  0.92 ms | 51.98 MB/s |
| `markdown-it`      |    1018 |  0.98 ms | 48.46 MB/s |
| `marked`           |     534 |  1.87 ms | 25.39 MB/s |
| `@ox-content/napi` |     209 |  4.79 ms |  9.93 MB/s |
| `remark`           |      39 | 25.55 ms |  1.86 MB/s |

### Parse + Render (48.7 KB)

| Library             | ops/sec | avg time | throughput  |
| ------------------- | ------: | -------: | ----------: |
| `Bun.markdown.html` |    4261 |  0.23 ms | 202.77 MB/s |
| `md4w (md4c)`       |    2605 |  0.38 ms | 123.95 MB/s |
| `markdown-it`       |     739 |  1.35 ms |  35.17 MB/s |
| `marked`            |     462 |  2.16 ms |  22.00 MB/s |
| `@ox-content/napi`  |     202 |  4.95 ms |   9.61 MB/s |
| `micromark`         |      44 | 22.97 ms |   2.07 MB/s |
| `remark`            |      35 | 28.37 ms |   1.68 MB/s |

Reproduce with:

```bash
node benchmarks/bundle-size/parse-benchmark.mjs
```

Ox Content is not the absolute fastest parser in this synthetic benchmark, but it stays far ahead of heavier AST-oriented JavaScript stacks like `remark` while also serving as the native core for the full documentation pipeline.

The benchmark includes `md4w (md4c)` by default and adds `Bun.markdown.html` automatically when `bun` is available.
