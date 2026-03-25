/**
 * Markdown transformation logic for @ox-content/unplugin.
 *
 * Uses Rust-based parser via NAPI bindings for optimal performance.
 */

import { createRequire } from "node:module";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
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
import type {
  MdastRoot,
  MarkdownItPlugin,
  OxContentMdastPlugin,
  ResolvedOptions,
  TransformResult,
  TocEntry,
} from "./types";

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
type UnifiedCompilerStrategy = "default" | "custom";
type TransformParserKind = UnifiedParserStrategy | "markdown-it";

interface UnifiedFileInput {
  path: string;
  value: string;
  data: Record<string, unknown>;
}

interface MarkdownItEnv extends Record<string, unknown> {
  filePath: string;
  frontmatter: Record<string, unknown>;
  matter: Record<string, unknown>;
  oxContent: {
    parser: "markdown-it";
    frontmatter: Record<string, unknown>;
    source: string;
    content: string;
    html?: string;
  };
}

interface MarkdownItTokenLike {
  type: string;
  tag?: string;
  content?: string;
  attrs?: Array<[string, string]> | null;
  children?: MarkdownItTokenLike[];
}

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
  const { content, frontmatter } = splitFrontmatter(source, options.frontmatter);

  const { html, toc } = hasMarkdownItPlugins(options)
    ? await transformWithMarkdownIt(source, content, filePath, frontmatter, options)
    : hasUnifiedPlugins(options)
      ? await transformWithUnified(source, content, filePath, frontmatter, options)
      : transformWithNativePipeline(loadNapiBindings(), content, options);

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

function hasMarkdownItPlugins(options: ResolvedOptions): boolean {
  return options.plugin.markdownIt.length > 0;
}

function hasMdastOrRemarkPlugins(options: ResolvedOptions): boolean {
  return options.plugin.mdast.length > 0 || options.plugin.remark.length > 0;
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

async function transformWithMarkdownIt(
  fullSource: string,
  markdownContent: string,
  filePath: string,
  frontmatter: Record<string, unknown>,
  options: ResolvedOptions,
): Promise<{ html: string; toc: TocEntry[] }> {
  const markdownIt = createMarkdownItRenderer(options);
  applyMarkdownItPlugins(markdownIt, options.plugin.markdownIt);

  const env = createMarkdownItEnv(filePath, fullSource, markdownContent, frontmatter);
  const tokens = markdownIt.parse(markdownContent, env);
  const html = markdownIt.renderer.render(tokens, markdownIt.options, env);

  if (hasMdastOrRemarkPlugins(options)) {
    return transformMarkdownItWithUnified(
      html,
      fullSource,
      markdownContent,
      filePath,
      frontmatter,
      options,
    );
  }

  if (options.plugin.rehype.length > 0) {
    return {
      html: await transformHtmlWithRehype(
        html,
        filePath,
        fullSource,
        markdownContent,
        frontmatter,
        options,
        "markdown-it",
      ),
      toc: options.toc ? extractTocFromMarkdownItTokens(tokens, options.tocMaxDepth) : [],
    };
  }

  return {
    html,
    toc: options.toc ? extractTocFromMarkdownItTokens(tokens, options.tocMaxDepth) : [],
  };
}

async function transformMarkdownItWithUnified(
  html: string,
  fullSource: string,
  markdownContent: string,
  filePath: string,
  frontmatter: Record<string, unknown>,
  options: ResolvedOptions,
): Promise<{ html: string; toc: TocEntry[] }> {
  const mdastContext = createMdastPluginContext(filePath, fullSource, frontmatter, options);
  const { plugins: remarkPlugins, options: remarkRehypeOptions } = extractUnifiedPluginWithOptions(
    options.plugin.remark,
    remarkRehype,
  );
  const { plugins: rehypePlugins, options: rehypeStringifyOptions } =
    extractUnifiedPluginWithOptions(options.plugin.rehype, rehypeStringify);
  const processor = unified();

  processor.use(rehypeParse, {
    fragment: true,
  } as never);
  processor.use(rehypeRemark);
  applyUnifiedPlugins(
    processor,
    options.plugin.mdast.map((plugin) =>
      isOxContentMdastPlugin(plugin) ? toUnifiedMdastPlugin(plugin, mdastContext) : plugin,
    ),
  );
  applyUnifiedPlugins(processor, remarkPlugins);

  let toc: TocEntry[] = [];
  processor.use(() => {
    return (tree: MdastRoot) => {
      if (options.toc) {
        toc = extractTocFromMdast(tree, options.tocMaxDepth);
      }
      return tree;
    };
  });

  const frozenMdastProcessor = processor.freeze();
  if (resolveUnifiedCompilerStrategy(frozenMdastProcessor) === "custom") {
    const { processor: compiledProcessor, input } = processorFromMarkdownItProcessor(
      frozenMdastProcessor(),
      html,
      filePath,
      fullSource,
      markdownContent,
      frontmatter,
      "markdown-it",
    );

    return {
      html: await processUnifiedFile(compiledProcessor, input),
      toc,
    };
  }

  const hastProcessor = frozenMdastProcessor();
  hastProcessor.use(remarkRehype, {
    allowDangerousHtml: true,
    ...remarkRehypeOptions,
  } as never);
  applyUnifiedPlugins(hastProcessor, rehypePlugins);

  const frozenHastProcessor = hastProcessor.freeze();
  const finalProcessor = frozenHastProcessor();
  if (resolveUnifiedCompilerStrategy(frozenHastProcessor) === "default") {
    finalProcessor.use(rehypeStringify, {
      allowDangerousHtml: true,
      ...rehypeStringifyOptions,
    } as never);
  }

  const { processor: compiledProcessor, input } = processorFromMarkdownItProcessor(
    finalProcessor,
    html,
    filePath,
    fullSource,
    markdownContent,
    frontmatter,
    "markdown-it",
  );

  return {
    html: await processUnifiedFile(compiledProcessor, input),
    toc,
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
  const { plugins: remarkPlugins, options: remarkRehypeOptions } = extractUnifiedPluginWithOptions(
    options.plugin.remark,
    remarkRehype,
  );
  const { plugins: rehypePlugins, options: rehypeStringifyOptions } =
    extractUnifiedPluginWithOptions(options.plugin.rehype, rehypeStringify);

  const stagedProcessor = unified();

  applyUnifiedPlugins(
    stagedProcessor,
    options.plugin.mdast.map((plugin) =>
      isOxContentMdastPlugin(plugin) ? toUnifiedMdastPlugin(plugin, mdastContext) : plugin,
    ),
  );
  applyUnifiedPlugins(stagedProcessor, remarkPlugins);

  const frozenParserPhaseProcessor = stagedProcessor.freeze();
  const parserStrategy = resolveUnifiedParserStrategy(frozenParserPhaseProcessor);
  const processor = frozenParserPhaseProcessor();

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

  const frozenMdastProcessor = processor.freeze();
  if (resolveUnifiedCompilerStrategy(frozenMdastProcessor) === "custom") {
    return {
      html: await processUnifiedFile(
        frozenMdastProcessor(),
        createUnifiedFileInput(parserStrategy, fullSource, markdownContent, filePath, frontmatter),
      ),
      toc,
    };
  }

  const hastProcessor = frozenMdastProcessor();
  hastProcessor.use(remarkRehype, {
    allowDangerousHtml: true,
    ...remarkRehypeOptions,
  } as never);
  applyUnifiedPlugins(hastProcessor, rehypePlugins);

  const frozenHastProcessor = hastProcessor.freeze();
  const finalProcessor = frozenHastProcessor();
  if (resolveUnifiedCompilerStrategy(frozenHastProcessor) === "default") {
    finalProcessor.use(rehypeStringify, {
      allowDangerousHtml: true,
      ...rehypeStringifyOptions,
    } as never);
  }

  return {
    html: await processUnifiedFile(
      finalProcessor,
      createUnifiedFileInput(parserStrategy, fullSource, markdownContent, filePath, frontmatter),
    ),
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

function applyUnifiedPlugins(processor: UnifiedProcessor, plugins: unknown[]): void {
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

function applyMarkdownItPlugins(markdownIt: MarkdownIt, plugins: MarkdownItPlugin[]): void {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      const [fn, ...pluginOptions] = plugin;
      markdownIt.use(fn, ...pluginOptions);
      continue;
    }

    markdownIt.use(plugin);
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

function resolveUnifiedCompilerStrategy(processor: UnifiedProcessor): UnifiedCompilerStrategy {
  return hasUnifiedCustomCompiler(processor) ? "custom" : "default";
}

function selectUnifiedInput(
  strategy: UnifiedParserStrategy,
  fullSource: string,
  markdownContent: string,
): string {
  return strategy === "native" ? markdownContent : fullSource;
}

function createUnifiedFileInput(
  strategy: TransformParserKind,
  fullSource: string,
  markdownContent: string,
  filePath: string,
  frontmatter: Record<string, unknown>,
): UnifiedFileInput {
  return {
    path: filePath,
    value:
      strategy === "markdown-it"
        ? markdownContent
        : selectUnifiedInput(strategy, fullSource, markdownContent),
    data: createUnifiedFileData(strategy, fullSource, markdownContent, frontmatter),
  };
}

function createUnifiedFileData(
  parser: TransformParserKind,
  fullSource: string,
  markdownContent: string,
  frontmatter: Record<string, unknown>,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    frontmatter,
    matter: frontmatter,
    oxContent: {
      parser,
      frontmatter,
      source: fullSource,
      content: markdownContent,
      ...extra,
    },
  };
}

function hasUnifiedCustomParser(processor: UnifiedProcessor): boolean {
  const candidate = processor as UnifiedProcessor & {
    Parser?: unknown;
    parser?: unknown;
  };

  return typeof candidate.Parser === "function" || typeof candidate.parser === "function";
}

function hasUnifiedCustomCompiler(processor: UnifiedProcessor): boolean {
  const candidate = processor as UnifiedProcessor & {
    Compiler?: unknown;
    compiler?: unknown;
  };

  return typeof candidate.Compiler === "function" || typeof candidate.compiler === "function";
}

async function processUnifiedFile(
  processor: UnifiedProcessor,
  input: UnifiedFileInput,
): Promise<string> {
  const file = await processor.process(input as never);
  return String(file);
}

function processorFromMarkdownItProcessor(
  processor: UnifiedProcessor,
  html: string,
  filePath: string,
  fullSource: string,
  markdownContent: string,
  frontmatter: Record<string, unknown>,
  parser: TransformParserKind,
): { processor: UnifiedProcessor; input: UnifiedFileInput } {
  return {
    processor,
    input: {
      path: filePath,
      value: html,
      data: createUnifiedFileData(parser, fullSource, markdownContent, frontmatter, { html }),
    },
  };
}

function createMarkdownItRenderer(options: ResolvedOptions): MarkdownIt {
  const markdownIt = new MarkdownIt({
    html: true,
    linkify: options.gfm,
  });

  if (!options.tables) {
    markdownIt.disable("table");
  }

  if (!options.strikethrough) {
    markdownIt.disable("strikethrough");
  }

  return markdownIt;
}

function createMarkdownItEnv(
  filePath: string,
  fullSource: string,
  markdownContent: string,
  frontmatter: Record<string, unknown>,
): MarkdownItEnv {
  return {
    filePath,
    frontmatter,
    matter: frontmatter,
    oxContent: {
      parser: "markdown-it",
      frontmatter,
      source: fullSource,
      content: markdownContent,
    },
  };
}

function extractTocFromMarkdownItTokens(
  tokens: MarkdownItTokenLike[],
  maxDepth: number,
): TocEntry[] {
  const headings: TocEntry[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const openToken = tokens[index];
    if (openToken?.type !== "heading_open") {
      continue;
    }

    const depth = Number.parseInt(openToken.tag?.replace(/^h/i, "") ?? "", 10);
    if (!Number.isFinite(depth) || depth < 1 || depth > maxDepth) {
      continue;
    }

    const inlineToken = tokens[index + 1];
    if (inlineToken?.type !== "inline") {
      continue;
    }

    const text = collectMarkdownItText(inlineToken);
    if (text.length === 0) {
      continue;
    }

    headings.push({
      depth,
      text,
      slug: getMarkdownItTokenAttr(openToken, "id") ?? slugify(text),
      children: [],
    });
  }

  return buildTocTree(headings);
}

function collectMarkdownItText(token: MarkdownItTokenLike): string {
  if (Array.isArray(token.children) && token.children.length > 0) {
    return token.children.map((child) => collectMarkdownItText(child)).join("");
  }

  return typeof token.content === "string" ? token.content : "";
}

function getMarkdownItTokenAttr(token: MarkdownItTokenLike, name: string): string | undefined {
  if (!Array.isArray(token.attrs)) {
    return undefined;
  }

  const entry = token.attrs.find(([key]) => key === name);
  return entry?.[1];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join("-");
}

async function transformHtmlWithRehype(
  html: string,
  filePath: string,
  fullSource: string,
  markdownContent: string,
  frontmatter: Record<string, unknown>,
  options: ResolvedOptions,
  parser: TransformParserKind,
): Promise<string> {
  const { plugins: rehypePlugins, options: rehypeStringifyOptions } =
    extractUnifiedPluginWithOptions(options.plugin.rehype, rehypeStringify);
  const stagedProcessor = unified();

  stagedProcessor.use(rehypeParse, {
    fragment: true,
  } as never);
  applyUnifiedPlugins(stagedProcessor, rehypePlugins);

  const frozenProcessor = stagedProcessor.freeze();
  const processor = frozenProcessor();
  if (resolveUnifiedCompilerStrategy(frozenProcessor) === "default") {
    processor.use(rehypeStringify, {
      allowDangerousHtml: true,
      ...rehypeStringifyOptions,
    } as never);
  }

  return processUnifiedFile(processor, {
    path: filePath,
    value: html,
    data: createUnifiedFileData(parser, fullSource, markdownContent, frontmatter, { html }),
  });
}

function hasRemarkSyntaxExtensions(processor: UnifiedProcessor): boolean {
  const data = processor.data() as Record<string, unknown>;

  return (
    hasOwnDataField(data, "micromarkExtensions") || hasOwnDataField(data, "fromMarkdownExtensions")
  );
}

function hasOwnDataField(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function extractUnifiedPluginWithOptions(
  plugins: unknown[],
  targetPlugin: unknown,
): {
  plugins: unknown[];
  options?: Record<string, unknown>;
} {
  let extractedOptions: Record<string, unknown> | undefined;
  const nextPlugins: unknown[] = [];

  for (const plugin of plugins) {
    const result = filterUnifiedPlugin(plugin, targetPlugin);
    extractedOptions = mergeUnifiedPluginOptions(extractedOptions, result.options);
    if (result.keep) {
      nextPlugins.push(result.plugin);
    }
  }

  return {
    plugins: nextPlugins,
    options: extractedOptions,
  };
}

function filterUnifiedPlugin(
  plugin: unknown,
  targetPlugin: unknown,
): {
  keep: boolean;
  plugin: unknown;
  options?: Record<string, unknown>;
} {
  if (isUnifiedPreset(plugin)) {
    const { plugins: _plugins, ...rest } = plugin;
    let extractedOptions: Record<string, unknown> | undefined;
    const nextPlugins: unknown[] = [];

    for (const nestedPlugin of plugin.plugins ?? []) {
      const result = filterUnifiedPlugin(nestedPlugin, targetPlugin);
      extractedOptions = mergeUnifiedPluginOptions(extractedOptions, result.options);
      if (result.keep) {
        nextPlugins.push(result.plugin);
      }
    }

    if (nextPlugins.length === 0 && plugin.settings === undefined) {
      return {
        keep: false,
        plugin,
        options: extractedOptions,
      };
    }

    return {
      keep: true,
      plugin: {
        ...rest,
        ...(nextPlugins.length > 0 ? { plugins: nextPlugins } : {}),
      },
      options: extractedOptions,
    };
  }

  const { attacher, options } = splitUnifiedPlugin(plugin);
  if (attacher === targetPlugin) {
    return {
      keep: false,
      plugin,
      options,
    };
  }

  return {
    keep: true,
    plugin,
  };
}

function mergeUnifiedPluginOptions(
  left?: Record<string, unknown>,
  right?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (left === undefined) {
    return right;
  }

  if (right === undefined) {
    return left;
  }

  return {
    ...left,
    ...right,
  };
}

function isUnifiedPreset(plugin: unknown): plugin is {
  plugins?: unknown[];
  settings?: Record<string, unknown>;
} {
  return (
    Boolean(plugin) &&
    typeof plugin === "object" &&
    !Array.isArray(plugin) &&
    ("plugins" in plugin || "settings" in plugin)
  );
}

function splitUnifiedPlugin(plugin: unknown): {
  attacher: unknown;
  options?: Record<string, unknown>;
} {
  if (!Array.isArray(plugin)) {
    return { attacher: plugin };
  }

  const [attacher, firstOption] = plugin;
  return {
    attacher,
    options:
      firstOption && typeof firstOption === "object"
        ? (firstOption as Record<string, unknown>)
        : undefined,
  };
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
