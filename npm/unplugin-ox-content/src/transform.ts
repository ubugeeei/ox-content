/**
 * Markdown transformation logic for @ox-content/unplugin.
 *
 * Uses Rust-based parser via NAPI bindings for optimal performance.
 */

import { createRequire } from "node:module";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import {
  createMdastPluginContext,
  extractTocFromMdast,
  oxContentMdast,
  toUnifiedMdastPlugin,
} from "./mdast";
import type { MdastRoot, OxContentMdastPlugin, ResolvedOptions, TransformResult, TocEntry } from "./types";

const require = createRequire(import.meta.url);

interface NapiBindings {
  transform: (
    source: string,
    options?: {
      gfm?: boolean;
      footnotes?: boolean;
      taskLists?: boolean;
      tables?: boolean;
      strikethrough?: boolean;
      autolinks?: boolean;
      tocMaxDepth?: number;
    },
  ) => {
    html: string;
    frontmatter: string;
    toc: { depth: number; text: string; slug: string }[];
    errors: string[];
  };
}

let cachedNapiBindings: NapiBindings | null | undefined;
type UnifiedProcessor = ReturnType<typeof unified>;
type UnifiedParserStrategy = "native" | "remark" | "custom";

/**
 * Transforms Markdown content into a JavaScript module.
 * Uses Rust-based parsing, and switches to a unified/mdast pipeline when
 * JavaScript mdast/remark/rehype plugins are configured.
 *
 * Note: This requires the @ox-content/napi package to be built.
 */
export async function transformMarkdown(
  source: string,
  filePath: string,
  options: ResolvedOptions,
): Promise<TransformResult> {
  const napi = loadNapiBindings();
  const { content, frontmatter } = splitFrontmatter(source, options.frontmatter);

  const { html, toc } = hasUnifiedPlugins(options)
    ? await transformWithUnified(source, content, filePath, frontmatter, options)
    : transformWithNativePipeline(napi, content, options);

  let nextHtml = html;
  for (const plugin of options.plugin.oxContent) {
    nextHtml = await plugin(nextHtml);
  }

  const code = generateModuleCode(nextHtml, frontmatter, toc, filePath);

  return {
    code,
    html: nextHtml,
    frontmatter,
    toc,
  };
}

function loadNapiBindings(): NapiBindings {
  if (cachedNapiBindings) {
    return cachedNapiBindings;
  }

  if (cachedNapiBindings === null) {
    throw new Error(
      "[ox-content] Failed to load @ox-content/napi. Please ensure the NAPI module is built. " +
        "Run: mise run build:napi",
    );
  }

  try {
    cachedNapiBindings = require("@ox-content/napi") as NapiBindings;
    return cachedNapiBindings;
  } catch {
    cachedNapiBindings = null;
    throw new Error(
      "[ox-content] Failed to load @ox-content/napi. Please ensure the NAPI module is built. " +
        "Run: mise run build:napi",
    );
  }
}

function splitFrontmatter(
  source: string,
  enabled: boolean,
): { content: string; frontmatter: Record<string, unknown> } {
  if (!enabled) {
    return {
      content: source,
      frontmatter: {},
    };
  }

  const parsed = matter(source);
  return {
    content: parsed.content,
    frontmatter: parsed.data as Record<string, unknown>,
  };
}

function hasUnifiedPlugins(options: ResolvedOptions): boolean {
  return (
    options.plugin.mdast.length > 0 ||
    options.plugin.remark.length > 0 ||
    options.plugin.rehype.length > 0
  );
}

function transformWithNativePipeline(
  napi: NapiBindings,
  source: string,
  options: ResolvedOptions,
): { html: string; toc: TocEntry[] } {
  const result = napi.transform(source, {
    gfm: options.gfm,
    footnotes: options.footnotes,
    taskLists: options.taskLists,
    tables: options.tables,
    strikethrough: options.strikethrough,
    autolinks: options.gfm,
    tocMaxDepth: options.tocMaxDepth,
  });

  if (result.errors.length > 0) {
    console.warn("[ox-content] Transform warnings:", result.errors);
  }

  const flatToc: TocEntry[] = result.toc.map(
    (item: { depth: number; text: string; slug: string }) => ({
      ...item,
      children: [],
    }),
  );

  return {
    html: result.html,
    toc: options.toc ? buildTocTree(flatToc) : [],
  };
}

async function transformWithUnified(
  fullSource: string,
  markdownContent: string,
  filePath: string,
  frontmatter: Record<string, unknown>,
  options: ResolvedOptions,
): Promise<{ html: string; toc: TocEntry[] }> {
  const mdastContext = createMdastPluginContext(filePath, fullSource, frontmatter, options);
  const processor = unified();

  applyUnifiedPlugins(
    processor,
    options.plugin.mdast.map((plugin) =>
      isOxContentMdastPlugin(plugin) ? toUnifiedMdastPlugin(plugin, mdastContext) : plugin,
    ),
  );
  applyUnifiedPlugins(processor, options.plugin.remark);
  const parserStrategy = resolveUnifiedParserStrategy(processor);
  installUnifiedParser(processor, parserStrategy, options);

  let toc: TocEntry[] = [];
  processor.use(() => {
    return (tree: MdastRoot) => {
      if (options.toc) {
        toc = extractTocFromMdast(tree, options.tocMaxDepth);
      }
      return tree;
    };
  });

  processor.use(remarkRehype, { allowDangerousHtml: true });
  applyUnifiedPlugins(processor, options.plugin.rehype);
  processor.use(rehypeStringify, { allowDangerousHtml: true });

  const file = await processor.process({
    path: filePath,
    value: selectUnifiedInput(parserStrategy, fullSource, markdownContent),
  } as never);

  return {
    html: String(file),
    toc,
  };
}

/**
 * Builds nested TOC tree from flat list.
 */
function buildTocTree(entries: Array<{ depth: number; text: string; slug: string }>): TocEntry[] {
  const result: TocEntry[] = [];
  const stack: TocEntry[] = [];

  for (const entry of entries) {
    const tocEntry: TocEntry = {
      depth: entry.depth,
      text: entry.text,
      slug: entry.slug,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].depth >= entry.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(tocEntry);
    } else {
      stack[stack.length - 1].children.push(tocEntry);
    }

    stack.push(tocEntry);
  }

  return result;
}

function applyUnifiedPlugins(
  processor: UnifiedProcessor,
  plugins: unknown[],
): void {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      const [attacher, ...pluginOptions] = plugin;
      if (pluginOptions.length === 0) {
        processor.use(attacher as never);
      } else if (pluginOptions.length === 1) {
        processor.use(attacher as never, pluginOptions[0] as never);
      } else {
        processor.use(attacher as never, pluginOptions as never);
      }
      continue;
    }

    processor.use(plugin as never);
  }
}

function isOxContentMdastPlugin(plugin: unknown): plugin is OxContentMdastPlugin {
  return Boolean(plugin) && typeof plugin === "object" && "transform" in plugin;
}

function installUnifiedParser(
  processor: UnifiedProcessor,
  strategy: UnifiedParserStrategy,
  options: ResolvedOptions,
): void {
  if (strategy === "custom") {
    return;
  }

  if (strategy === "remark") {
    processor.use(remarkParse);
    return;
  }

  processor.use(oxContentMdast, {
    gfm: options.gfm,
    footnotes: options.footnotes,
    taskLists: options.taskLists,
    tables: options.tables,
    strikethrough: options.strikethrough,
    autolinks: options.gfm,
  });
}

function resolveUnifiedParserStrategy(processor: UnifiedProcessor): UnifiedParserStrategy {
  if (hasUnifiedCustomParser(processor)) {
    return "custom";
  }

  if (hasRemarkSyntaxExtensions(processor)) {
    return "remark";
  }

  return "native";
}

function selectUnifiedInput(
  strategy: UnifiedParserStrategy,
  fullSource: string,
  markdownContent: string,
): string {
  return strategy === "native" ? markdownContent : fullSource;
}

function hasUnifiedCustomParser(processor: UnifiedProcessor): boolean {
  const candidate = processor as UnifiedProcessor & {
    Parser?: unknown;
    parser?: unknown;
  };

  return typeof candidate.Parser === "function" || typeof candidate.parser === "function";
}

function hasRemarkSyntaxExtensions(processor: UnifiedProcessor): boolean {
  const data = processor.data() as Record<string, unknown>;

  return (
    hasOwnDataField(data, "micromarkExtensions") ||
    hasOwnDataField(data, "fromMarkdownExtensions")
  );
}

function hasOwnDataField(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key);
}

/**
 * Generates the JavaScript module code.
 */
function generateModuleCode(
  html: string,
  frontmatter: Record<string, unknown>,
  toc: TocEntry[],
  filePath: string,
): string {
  const htmlJson = JSON.stringify(html);
  const frontmatterJson = JSON.stringify(frontmatter);
  const tocJson = JSON.stringify(toc);

  return `
// Generated by @ox-content/unplugin
// Source: ${filePath}

export const html = ${htmlJson};
export const frontmatter = ${frontmatterJson};
export const toc = ${tocJson};

export default {
  html,
  frontmatter,
  toc,
};
`;
}
