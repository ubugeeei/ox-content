import { describe, expect, it } from "vite-plus/test";
import type { ResolvedOptions } from "./types";
import { transformMarkdown } from "./transform";

describe("code annotations", () => {
  it("preserves pre and line classes after syntax highlighting", async () => {
    const markdown = `\`\`\`ts annotate="highlight:1;warning:2;error:3"
const first = 1;
const second = 2;
throw new Error("boom");
\`\`\`
`;

    const result = await transformMarkdown(
      markdown,
      "docs/code-annotations.md",
      createResolvedOptions(),
    );

    expect(result.html).toContain(
      'class="shiki github-dark ox-code-block ox-code-block--annotated"',
    );
    expect(result.html).toContain(
      'class="line ox-code-line ox-code-line--highlight" data-line="1"',
    );
    expect(result.html).toContain('class="line ox-code-line ox-code-line--warning" data-line="2"');
    expect(result.html).toContain('class="line ox-code-line ox-code-line--error" data-line="3"');
    expect(result.html).toContain('class="language-ts" data-language="ts"');
  });

  it("keeps non-annotated highlighted blocks unchanged", async () => {
    const markdown = `\`\`\`ts
const value = 1;
const next = 2;
\`\`\`
`;

    const result = await transformMarkdown(markdown, "docs/plain-code.md", createResolvedOptions());

    expect(result.html).not.toContain("ox-code-line--warning");
    expect(result.html).not.toContain("ox-code-block--annotated");
    expect(result.html).toContain('class="language-ts" data-language="ts"');
  });
});

function createResolvedOptions(): ResolvedOptions {
  return {
    srcDir: "content",
    outDir: "dist",
    base: "/",
    ssg: {
      enabled: true,
      extension: ".html",
      clean: false,
      bare: false,
      generateOgImage: false,
    },
    gfm: true,
    footnotes: true,
    tables: true,
    taskLists: true,
    strikethrough: true,
    highlight: true,
    highlightTheme: "github-dark",
    highlightLangs: [],
    codeAnnotations: {
      enabled: true,
      metaKey: "annotate",
    },
    mermaid: false,
    frontmatter: true,
    toc: true,
    tocMaxDepth: 3,
    ogImage: false,
    ogImageOptions: {
      width: 1200,
      height: 630,
      cache: true,
      concurrency: 1,
      vuePlugin: "vitejs",
    },
    transformers: [],
    docs: false,
    search: {
      enabled: true,
      limit: 10,
      prefix: true,
      placeholder: "Search documentation...",
      hotkey: "/",
    },
    ogViewer: false,
    i18n: false,
  };
}
