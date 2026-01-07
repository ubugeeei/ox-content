/**
 * Parse/Render speed benchmark
 * Measures parse and render throughput for markdown libraries
 */

import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Sample markdown content for benchmarking
const sampleMarkdown = `
# Heading 1

This is a paragraph with **bold** and *italic* text.

## Heading 2

- List item 1
- List item 2
  - Nested item
- List item 3

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote
> with multiple lines

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

Here's a [link](https://example.com) and an image: ![alt](image.png)

---

Final paragraph with \`inline code\` and more text.
`;

// Repeat the sample to create larger documents
const sizes = {
  small: sampleMarkdown,
  medium: Array(10).fill(sampleMarkdown).join("\n\n"),
  large: Array(100).fill(sampleMarkdown).join("\n\n"),
};

/**
 * Benchmark a sync function
 */
function benchmark(name, fn, input, iterations = 100) {
  // Warmup
  for (let i = 0; i < 5; i++) {
    fn(input);
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(input);
  }
  const elapsed = performance.now() - start;

  const avgMs = elapsed / iterations;
  const opsPerSec = 1000 / avgMs;

  return {
    name,
    opsPerSec,
    avgMs,
    throughputMBs: (input.length / 1024 / 1024) * opsPerSec,
  };
}

/**
 * Benchmark an async function
 */
async function benchmarkAsync(name, fn, input, iterations = 100) {
  // Warmup
  for (let i = 0; i < 5; i++) {
    await fn(input);
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn(input);
  }
  const elapsed = performance.now() - start;

  const avgMs = elapsed / iterations;
  const opsPerSec = 1000 / avgMs;

  return {
    name,
    opsPerSec,
    avgMs,
    throughputMBs: (input.length / 1024 / 1024) * opsPerSec,
  };
}

/**
 * Print benchmark results table
 */
function printTable(title, results) {
  console.log(`\n### ${title}\n`);
  console.log("| Library              | ops/sec    | avg time  | throughput  | ratio   |");
  console.log("|----------------------|------------|-----------|-------------|---------|");

  // Find the fastest (highest ops/sec) for ratio calculation
  const validResults = results.filter((r) => !r.error && r.opsPerSec > 0);
  const fastest = Math.max(...validResults.map((r) => r.opsPerSec));

  for (const result of results) {
    if (result.error) {
      console.log(`| ${result.name.padEnd(20)} | Error      | -         | -           | -       |`);
      continue;
    }
    const name = result.name.padEnd(20);
    const opsPerSec = result.opsPerSec.toFixed(0).padStart(10);
    const avgMs = (result.avgMs.toFixed(2) + "ms").padStart(9);
    const throughput = (result.throughputMBs.toFixed(2) + " MB/s").padStart(11);
    const ratio = (fastest / result.opsPerSec).toFixed(2) + "x";
    console.log(`| ${name} | ${opsPerSec} | ${avgMs} | ${throughput} | ${ratio.padStart(7)} |`);
  }
}

async function runBenchmarks() {
  console.log("Parse/Render Speed Benchmark");
  console.log("============================\n");

  // Import libraries
  const { marked } = await import("marked");
  const { Lexer: MarkedLexer } = await import("marked");
  const MarkdownIt = (await import("markdown-it")).default;
  const { micromark } = await import("micromark");
  const { unified } = await import("unified");
  const remarkParse = (await import("remark-parse")).default;
  const remarkHtml = (await import("remark-html")).default;

  // Try to import NAPI
  let napi = null;
  try {
    napi = await import("@ox-content/napi");
    console.log("Using @ox-content/napi (Native)\n");
  } catch (e) {
    console.log("@ox-content/napi not available\n");
  }

  const md = new MarkdownIt();
  const remarkParseProcessor = unified().use(remarkParse);
  const remarkFullProcessor = unified().use(remarkParse).use(remarkHtml);

  // Define parsers (parse only)
  const parsers = [];

  if (napi) {
    parsers.push({
      name: "@ox-content/napi",
      fn: (input) => napi.parse(input),
    });
  }

  parsers.push(
    { name: "marked", fn: (input) => MarkedLexer.lex(input) },
    { name: "markdown-it", fn: (input) => md.parse(input, {}) },
    { name: "remark", fn: (input) => remarkParseProcessor.parse(input) }
  );

  // Define renderers (parse + render)
  const renderers = [];

  if (napi) {
    renderers.push({
      name: "@ox-content/napi",
      fn: (input) => napi.parseAndRender(input).html,
    });
  }

  renderers.push(
    { name: "marked", fn: (input) => marked(input) },
    { name: "markdown-it", fn: (input) => md.render(input) },
    { name: "micromark", fn: (input) => micromark(input) },
    { name: "remark", fn: (input) => remarkFullProcessor.processSync(input).toString() }
  );

  // Define async renderers
  const asyncRenderers = [];

  if (napi?.parseAndRenderAsync) {
    asyncRenderers.push({
      name: "@ox-content/napi (async)",
      fn: (input) => napi.parseAndRenderAsync(input),
    });
  }

  for (const [sizeName, content] of Object.entries(sizes)) {
    const sizeKB = (content.length / 1024).toFixed(1);
    console.log(`\n## ${sizeName.toUpperCase()} (${sizeKB} KB)`);

    const iterations =
      sizeName === "large" ? 20 : sizeName === "medium" ? 50 : 100;

    // Parse only benchmark
    const parseResults = [];
    for (const parser of parsers) {
      try {
        const result = benchmark(parser.name, parser.fn, content, iterations);
        parseResults.push(result);
      } catch (e) {
        parseResults.push({ name: parser.name, error: true });
      }
    }
    parseResults.sort((a, b) => (b.opsPerSec || 0) - (a.opsPerSec || 0));
    printTable("Parse Only", parseResults);

    // Parse + Render benchmark
    const renderResults = [];
    for (const renderer of renderers) {
      try {
        const result = benchmark(renderer.name, renderer.fn, content, iterations);
        renderResults.push(result);
      } catch (e) {
        renderResults.push({ name: renderer.name, error: true });
      }
    }
    renderResults.sort((a, b) => (b.opsPerSec || 0) - (a.opsPerSec || 0));
    printTable("Parse + Render", renderResults);

    // Async benchmark (only for large)
    if (asyncRenderers.length > 0 && sizeName === "large") {
      const asyncResults = [];
      for (const renderer of asyncRenderers) {
        try {
          const result = await benchmarkAsync(renderer.name, renderer.fn, content, iterations);
          asyncResults.push(result);
        } catch (e) {
          asyncResults.push({ name: renderer.name, error: true });
        }
      }
      asyncResults.sort((a, b) => (b.opsPerSec || 0) - (a.opsPerSec || 0));
      printTable("Parse + Render (Async/Worker Thread)", asyncResults);
    }
  }

  console.log("\n\n*Higher ops/sec and throughput = better.*");
}

runBenchmarks().catch(console.error);
