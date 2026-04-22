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
| `@ox-content/napi` |    2933 |  0.34 ms | 139.55 MB/s |
| `md4w (md4c)`      |    1054 |  0.95 ms |  50.16 MB/s |
| `markdown-it`      |     807 |  1.24 ms |  38.42 MB/s |
| `marked`           |     512 |  1.95 ms |  24.36 MB/s |
| `remark`           |      42 | 23.89 ms |   1.99 MB/s |

### Parse + Render (48.7 KB)

| Library             | ops/sec | avg time | throughput  |
| ------------------- | ------: | -------: | ----------: |
| `@ox-content/napi`  |    3273 |  0.31 ms | 155.73 MB/s |
| `Bun.markdown.html` |    2848 |  0.35 ms | 135.52 MB/s |
| `md4w (md4c)`       |    2608 |  0.38 ms | 124.13 MB/s |
| `markdown-it`       |     787 |  1.27 ms |  37.44 MB/s |
| `marked`            |     489 |  2.04 ms |  23.28 MB/s |
| `micromark`         |      44 | 22.62 ms |   2.10 MB/s |
| `remark`            |      36 | 28.16 ms |   1.69 MB/s |

Reproduce with:

```bash
node benchmarks/bundle-size/parse-benchmark.mjs
```

In this latest local release-build sweep, Ox Content came out on top for both parse-only and parse+render in the large 48.7 KB case while still serving as the native core for the full documentation pipeline.

The benchmark includes `md4w (md4c)` by default and adds `Bun.markdown.html` automatically when `bun` is available.
