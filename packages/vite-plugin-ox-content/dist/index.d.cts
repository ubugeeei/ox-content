import { EnvironmentOptions, Plugin } from 'vite';

/**
 * Type definitions for vite-plugin-ox-content
 */
/**
 * Plugin options.
 */
interface OxContentOptions {
    /**
     * Source directory for Markdown files.
     * @default 'docs'
     */
    srcDir?: string;
    /**
     * Output directory for built files.
     * @default 'dist'
     */
    outDir?: string;
    /**
     * Base path for the site.
     * @default '/'
     */
    base?: string;
    /**
     * Enable GitHub Flavored Markdown extensions.
     * @default true
     */
    gfm?: boolean;
    /**
     * Enable footnotes.
     * @default true
     */
    footnotes?: boolean;
    /**
     * Enable tables.
     * @default true
     */
    tables?: boolean;
    /**
     * Enable task lists.
     * @default true
     */
    taskLists?: boolean;
    /**
     * Enable strikethrough.
     * @default true
     */
    strikethrough?: boolean;
    /**
     * Enable syntax highlighting for code blocks.
     * @default false
     */
    highlight?: boolean;
    /**
     * Syntax highlighting theme.
     * @default 'github-dark'
     */
    highlightTheme?: string;
    /**
     * Enable mermaid diagram rendering.
     * @default false
     */
    mermaid?: boolean;
    /**
     * Parse YAML frontmatter.
     * @default true
     */
    frontmatter?: boolean;
    /**
     * Generate table of contents.
     * @default true
     */
    toc?: boolean;
    /**
     * Maximum heading depth for TOC.
     * @default 3
     */
    tocMaxDepth?: number;
    /**
     * Enable OG image generation.
     * @default false
     */
    ogImage?: boolean;
    /**
     * OG image generation options.
     */
    ogImageOptions?: OgImageOptions;
    /**
     * Custom AST transformers.
     */
    transformers?: MarkdownTransformer[];
    /**
     * Source documentation generation options.
     * Set to false to disable (opt-out).
     * @default { enabled: true }
     */
    docs?: DocsOptions | false;
}
/**
 * Resolved options with all defaults applied.
 */
interface ResolvedOptions {
    srcDir: string;
    outDir: string;
    base: string;
    gfm: boolean;
    footnotes: boolean;
    tables: boolean;
    taskLists: boolean;
    strikethrough: boolean;
    highlight: boolean;
    highlightTheme: string;
    mermaid: boolean;
    frontmatter: boolean;
    toc: boolean;
    tocMaxDepth: number;
    ogImage: boolean;
    ogImageOptions: OgImageOptions;
    transformers: MarkdownTransformer[];
    docs: ResolvedDocsOptions | false;
}
/**
 * OG image generation options.
 */
interface OgImageOptions {
    /**
     * Background color.
     * @default '#1a1a2e'
     */
    background?: string;
    /**
     * Text color.
     * @default '#ffffff'
     */
    textColor?: string;
    /**
     * Accent color.
     * @default '#e94560'
     */
    accentColor?: string;
    /**
     * Font family.
     */
    fontFamily?: string;
    /**
     * Image width.
     * @default 1200
     */
    width?: number;
    /**
     * Image height.
     * @default 630
     */
    height?: number;
}
/**
 * Custom AST transformer.
 */
interface MarkdownTransformer {
    /**
     * Transformer name.
     */
    name: string;
    /**
     * Transform function.
     */
    transform: (ast: MarkdownNode, context: TransformContext) => MarkdownNode | Promise<MarkdownNode>;
}
/**
 * Transform context passed to transformers.
 */
interface TransformContext {
    /**
     * File path being processed.
     */
    filePath: string;
    /**
     * Frontmatter data.
     */
    frontmatter: Record<string, unknown>;
    /**
     * Resolved plugin options.
     */
    options: ResolvedOptions;
}
/**
 * Markdown AST node (simplified for TypeScript).
 */
interface MarkdownNode {
    type: string;
    children?: MarkdownNode[];
    value?: string;
    [key: string]: unknown;
}
/**
 * Transform result.
 */
interface TransformResult {
    /**
     * Generated JavaScript code.
     */
    code: string;
    /**
     * Source map (null means no source map).
     */
    map?: null;
    /**
     * Rendered HTML.
     */
    html: string;
    /**
     * Parsed frontmatter.
     */
    frontmatter: Record<string, unknown>;
    /**
     * Table of contents.
     */
    toc: TocEntry[];
}
/**
 * Table of contents entry.
 */
interface TocEntry {
    /**
     * Heading depth (1-6).
     */
    depth: number;
    /**
     * Heading text.
     */
    text: string;
    /**
     * Slug/ID for linking.
     */
    slug: string;
    /**
     * Child entries.
     */
    children: TocEntry[];
}
/**
 * Options for source documentation generation.
 */
interface DocsOptions {
    /**
     * Enable/disable docs generation.
     * @default true (opt-out)
     */
    enabled?: boolean;
    /**
     * Source directories to scan for documentation.
     * @default ['./src']
     */
    src?: string[];
    /**
     * Output directory for generated documentation.
     * @default 'docs/api'
     */
    out?: string;
    /**
     * Glob patterns for files to include.
     * @default ['**\/*.ts', '**\/*.tsx']
     */
    include?: string[];
    /**
     * Glob patterns for files to exclude.
     * @default ['**\/*.test.*', '**\/*.spec.*', 'node_modules']
     */
    exclude?: string[];
    /**
     * Output format.
     * @default 'markdown'
     */
    format?: 'markdown' | 'json' | 'html';
    /**
     * Include private members in documentation.
     * @default false
     */
    private?: boolean;
    /**
     * Generate table of contents for each file.
     * @default true
     */
    toc?: boolean;
    /**
     * Group documentation by file or category.
     * @default 'file'
     */
    groupBy?: 'file' | 'category';
}
/**
 * Resolved docs options with all defaults applied.
 */
interface ResolvedDocsOptions {
    enabled: boolean;
    src: string[];
    out: string;
    include: string[];
    exclude: string[];
    format: 'markdown' | 'json' | 'html';
    private: boolean;
    toc: boolean;
    groupBy: 'file' | 'category';
}
/**
 * A single documentation entry extracted from source.
 */
interface DocEntry {
    name: string;
    kind: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'module';
    description: string;
    params?: ParamDoc[];
    returns?: ReturnDoc;
    examples?: string[];
    tags?: Record<string, string>;
    private?: boolean;
    file: string;
    line: number;
}
/**
 * Parameter documentation.
 */
interface ParamDoc {
    name: string;
    type: string;
    description: string;
    optional?: boolean;
    default?: string;
}
/**
 * Return type documentation.
 */
interface ReturnDoc {
    type: string;
    description: string;
}
/**
 * Extracted documentation for a single file.
 */
interface ExtractedDocs {
    file: string;
    entries: DocEntry[];
}

/**
 * Vite Environment API integration for Ox Content.
 *
 * Creates a dedicated environment for Markdown processing,
 * enabling SSG-style rendering with separate client/server contexts.
 */

/**
 * Creates the Markdown processing environment configuration.
 *
 * This environment is used for:
 * - Server-side rendering of Markdown files
 * - Static site generation
 * - Pre-rendering at build time
 *
 * @example
 * ```ts
 * // In your vite.config.ts
 * export default defineConfig({
 *   environments: {
 *     markdown: createMarkdownEnvironment({
 *       srcDir: 'docs',
 *       gfm: true,
 *     }),
 *   },
 * });
 * ```
 */
declare function createMarkdownEnvironment(options: ResolvedOptions): EnvironmentOptions;

/**
 * Markdown transformation logic.
 *
 * Transforms Markdown source into JavaScript modules
 * that can be imported by the application.
 */

/**
 * Transforms Markdown content into a JavaScript module.
 *
 * The generated module exports:
 * - `html`: The rendered HTML string
 * - `frontmatter`: Parsed YAML frontmatter object
 * - `toc`: Table of contents array
 * - `render`: Function to render with custom options
 */
declare function transformMarkdown(source: string, filePath: string, options: ResolvedOptions): Promise<TransformResult>;

/**
 * Extracts documentation from source files in directories.
 */
declare function extractDocs(srcDirs: string[], options: ResolvedDocsOptions): Promise<ExtractedDocs[]>;
/**
 * Generates Markdown documentation from extracted docs.
 */
declare function generateMarkdown(docs: ExtractedDocs[], options: ResolvedDocsOptions): Record<string, string>;
/**
 * Writes generated documentation to the output directory.
 */
declare function writeDocs(docs: Record<string, string>, outDir: string): Promise<void>;
/**
 * Resolves docs options with defaults.
 */
declare function resolveDocsOptions(options: DocsOptions | false | undefined): ResolvedDocsOptions | false;

/**
 * Vite Plugin for Ox Content
 *
 * Uses Vite's Environment API for SSG-focused Markdown processing.
 * Provides separate environments for client and server rendering.
 */

/**
 * Creates the Ox Content Vite plugin.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { oxContent } from 'vite-plugin-ox-content';
 *
 * export default defineConfig({
 *   plugins: [
 *     oxContent({
 *       srcDir: 'docs',
 *       gfm: true,
 *     }),
 *   ],
 * });
 * ```
 */
declare function oxContent(options?: OxContentOptions): Plugin[];

export { type DocEntry, type DocsOptions, type ExtractedDocs, type MarkdownNode, type MarkdownTransformer, type OgImageOptions, type OxContentOptions, type ParamDoc, type ResolvedDocsOptions, type ResolvedOptions, type ReturnDoc, type TocEntry, type TransformContext, type TransformResult, createMarkdownEnvironment, extractDocs, generateMarkdown, oxContent, resolveDocsOptions, transformMarkdown, writeDocs };
