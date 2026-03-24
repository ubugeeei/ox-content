import { createRequire } from "node:module";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vite-plus/test";
import type { ResolvedOptions } from "./types";

const require = createRequire(import.meta.url);
const napiId = require.resolve("@ox-content/napi");
const MAGIC = 0x3152444d;
const VERSION = 1;
const HEADER_LEN = 28;
const NODE_RECORD_LEN = 60;
const NONE_U32 = 0xffffffff;

const baseMdast = {
  type: "root" as const,
  children: [
    {
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: "Hello" }],
    },
    {
      type: "paragraph",
      children: [{ type: "text", value: "World" }],
    },
  ],
};

function createRawMdastBuffer(): Uint8Array {
  const encoder = new TextEncoder();
  const strings = ["Hello", "World"];
  const stringOffsets = new Map<string, [number, number]>();
  let stringBytesLength = 0;

  for (const value of strings) {
    const bytes = encoder.encode(value);
    stringOffsets.set(value, [stringBytesLength, bytes.length]);
    stringBytesLength += bytes.length;
  }

  const nodeCount = 5;
  const childCount = 4;
  const alignCount = 0;
  const nodesOffset = HEADER_LEN;
  const childIndicesOffset = nodesOffset + nodeCount * NODE_RECORD_LEN;
  const stringsOffset = childIndicesOffset + childCount * 4 + alignCount;
  const buffer = new Uint8Array(stringsOffset + stringBytesLength);
  const view = new DataView(buffer.buffer);

  const writeNode = (
    index: number,
    kind: number,
    childStart: number,
    childLen: number,
    num0 = 0,
    num1 = 0,
    str0?: string,
  ) => {
    const base = nodesOffset + index * NODE_RECORD_LEN;
    const [strOffset, strLen] = str0 ? stringOffsets.get(str0)! : [NONE_U32, 0];
    view.setUint8(base, kind);
    view.setUint8(base + 1, 0);
    view.setUint16(base + 2, 0, true);
    view.setUint32(base + 4, 0, true);
    view.setUint32(base + 8, 0, true);
    view.setUint32(base + 12, childStart, true);
    view.setUint32(base + 16, childLen, true);
    view.setUint32(base + 20, num0, true);
    view.setUint32(base + 24, num1, true);
    view.setUint32(base + 28, strOffset, true);
    view.setUint32(base + 32, strLen, true);
    view.setUint32(base + 36, NONE_U32, true);
    view.setUint32(base + 40, 0, true);
    view.setUint32(base + 44, NONE_U32, true);
    view.setUint32(base + 48, 0, true);
    view.setUint32(base + 52, NONE_U32, true);
    view.setUint32(base + 56, 0, true);
  };

  view.setUint32(0, MAGIC, true);
  view.setUint32(4, VERSION, true);
  view.setUint32(8, nodeCount, true);
  view.setUint32(12, childCount, true);
  view.setUint32(16, alignCount, true);
  view.setUint32(20, stringBytesLength, true);
  view.setUint32(24, 4, true);

  writeNode(0, 12, 0, 0, 0, 0, "Hello");
  writeNode(1, 2, 0, 1, 1);
  writeNode(2, 12, 0, 0, 0, 0, "World");
  writeNode(3, 1, 1, 1);
  writeNode(4, 0, 2, 2);

  view.setUint32(childIndicesOffset, 0, true);
  view.setUint32(childIndicesOffset + 4, 2, true);
  view.setUint32(childIndicesOffset + 8, 1, true);
  view.setUint32(childIndicesOffset + 12, 3, true);

  for (const value of strings) {
    const [offset] = stringOffsets.get(value)!;
    buffer.set(encoder.encode(value), stringsOffset + offset);
  }

  return buffer;
}

require.cache[napiId] = {
  exports: {
    parseMdastRaw: () => createRawMdastBuffer(),
    transform: () => ({
      html: "<h1>Hello</h1>\n<p>World</p>\n",
      frontmatter: "{}",
      toc: [{ depth: 1, text: "Hello", slug: "hello" }],
      errors: [],
    }),
  },
} as never;

const { defineMdastPlugin, oxContentMdast } = await import("./mdast");
const { transformMarkdown } = await import("./transform");

function createResolvedOptions(overrides?: Partial<ResolvedOptions>): ResolvedOptions {
  return {
    srcDir: "docs",
    gfm: true,
    footnotes: true,
    tables: true,
    taskLists: true,
    strikethrough: true,
    highlight: false,
    highlightTheme: "github-dark",
    mermaid: false,
    frontmatter: true,
    toc: true,
    tocMaxDepth: 3,
    extensions: [".md"],
    include: [],
    exclude: [],
    plugin: {
      oxContent: [],
      markdownIt: [],
      mdast: [],
      remark: [],
      rehype: [],
    },
    docs: {
      enabled: false,
      src: ["./src"],
      out: "docs/api",
      include: ["**/*.ts"],
      exclude: ["**/*.test.ts"],
      includePrivate: false,
      toc: true,
      groupBy: "file",
    },
    ...overrides,
  };
}

describe("mdast js plugin", () => {
  it("keeps the native fast path when no unified plugins are configured", async () => {
    const result = await transformMarkdown("# Hello", "docs/fast-path.md", createResolvedOptions());

    expect(result.html).toContain("<h1>Hello</h1>");
    expect(result.toc).toEqual([
      {
        depth: 1,
        text: "Hello",
        slug: "hello",
        children: [],
      },
    ]);
  });

  it("runs Ox Content-native mdast plugins and updates the TOC from the transformed tree", async () => {
    const result = await transformMarkdown(
      "# Hello",
      "docs/mdast-plugin.md",
      createResolvedOptions({
        plugin: {
          oxContent: [],
          markdownIt: [],
          mdast: [
            defineMdastPlugin("shout-heading", (tree) => {
              const heading = tree.children[0];
              const text = heading.children?.[0];
              if (text && typeof text.value === "string") {
                text.value = `${text.value}!!!`;
              }
            }),
          ],
          remark: [],
          rehype: [],
        },
      }),
    );

    expect(result.html).toContain("<h1>Hello!!!</h1>");
    expect(result.toc).toEqual([
      {
        depth: 1,
        text: "Hello!!!",
        slug: "hello",
        children: [],
      },
    ]);
  });

  it("runs existing unified remark plugins in the mdast stage", async () => {
    function remarkAppendParagraph() {
      return (tree: typeof baseMdast) => {
        tree.children.push({
          type: "paragraph",
          children: [{ type: "text", value: "From remark plugin" }],
        });
      };
    }

    const result = await transformMarkdown(
      "# Hello",
      "docs/remark-plugin.md",
      createResolvedOptions({
        plugin: {
          oxContent: [],
          markdownIt: [],
          mdast: [],
          remark: [remarkAppendParagraph],
          rehype: [],
        },
      }),
    );

    expect(result.html).toContain("<p>From remark plugin</p>");
  });

  it("exposes parsed frontmatter on vfile data for unified plugins", async () => {
    function remarkReadFrontmatter() {
      return (
        tree: typeof baseMdast,
        file: { data?: { matter?: { title?: string } } },
      ) => {
        tree.children = [
          {
            type: "heading",
            depth: 1,
            children: [
              {
                type: "text",
                value: file.data?.matter?.title ?? "missing-frontmatter",
              },
            ],
          },
        ];
      };
    }

    const result = await transformMarkdown(
      "---\ntitle: Frontmatter Title\n---\n# Ignored",
      "docs/frontmatter-data.md",
      createResolvedOptions({
        plugin: {
          oxContent: [],
          markdownIt: [],
          mdast: [],
          remark: [remarkReadFrontmatter],
          rehype: [],
        },
      }),
    );

    expect(result.html).toContain("<h1>Frontmatter Title</h1>");
  });

  it("falls back to remark-parse when remark syntax extensions are registered", async () => {
    function remarkForceRemarkParse(this: { data: (key: string, value?: unknown) => unknown }) {
      this.data("micromarkExtensions", []);
      this.data("fromMarkdownExtensions", []);
    }

    function remarkAnnotateHeading() {
      return (tree: typeof baseMdast) => {
        const heading = tree.children[0];
        const text = heading.children?.[0];
        if (text && typeof text.value === "string") {
          text.value = `${text.value} via remark-parse`;
        }
      };
    }

    const result = await transformMarkdown(
      "# Parsed by fallback",
      "docs/remark-fallback.md",
      createResolvedOptions({
        plugin: {
          oxContent: [],
          markdownIt: [],
          mdast: [],
          remark: [remarkForceRemarkParse, remarkAnnotateHeading],
          rehype: [],
        },
      }),
    );

    expect(result.html).toContain("<h1>Parsed by fallback via remark-parse</h1>");
    expect(result.html).not.toContain("<h1>Hello</h1>");
  });

  it("honors custom unified parsers without overriding them", async () => {
    function useCustomParser(this: { parser?: (document: string) => typeof baseMdast }) {
      this.parser = (document: string) => ({
        type: "root",
        children: [
          {
            type: "heading",
            depth: 1,
            children: [
              {
                type: "text",
                value: document.startsWith("---") ? "frontmatter-visible" : "frontmatter-hidden",
              },
            ],
          },
        ],
      });
    }

    const result = await transformMarkdown(
      "---\ntitle: Example\n---\n# Ignored by custom parser",
      "docs/custom-parser.md",
      createResolvedOptions({
        plugin: {
          oxContent: [],
          markdownIt: [],
          mdast: [],
          remark: [useCustomParser],
          rehype: [],
        },
      }),
    );

    expect(result.html).toContain("<h1>frontmatter-visible</h1>");
    expect(result.html).not.toContain("<h1>Hello</h1>");
  });

  it("can be used directly as a unified parser plugin", async () => {
    const file = await unified()
      .use(oxContentMdast, { gfm: true })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process("# Ignored by mock parser");

    expect(String(file)).toContain("<h1>Hello</h1>");
    expect(String(file)).toContain("<p>World</p>");
  });
});
