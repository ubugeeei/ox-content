/**
 * Type definitions for unplugin-ox-content
 */

/**
 * Plugin options.
 */
export interface OxContentOptions {
  /**
   * Source directory for Markdown files.
   * @default 'docs'
   */
  srcDir?: string;

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
   * File extensions to process.
   * @default ['.md', '.markdown']
   */
  extensions?: string[];

  /**
   * Files/patterns to include.
   */
  include?: string | RegExp | (string | RegExp)[];

  /**
   * Files/patterns to exclude.
   */
  exclude?: string | RegExp | (string | RegExp)[];
}

/**
 * Resolved options with all defaults applied.
 */
export interface ResolvedOptions {
  srcDir: string;
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
  extensions: string[];
  include: (string | RegExp)[];
  exclude: (string | RegExp)[];
}

/**
 * Transform result.
 */
export interface TransformResult {
  code: string;
  html: string;
  frontmatter: Record<string, unknown>;
  toc: TocEntry[];
}

/**
 * Table of contents entry.
 */
export interface TocEntry {
  depth: number;
  text: string;
  slug: string;
  children: TocEntry[];
}
