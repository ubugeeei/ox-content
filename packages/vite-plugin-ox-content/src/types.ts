/**
 * Type definitions for vite-plugin-ox-content
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
export interface ResolvedOptions {
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
export interface OgImageOptions {
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
export interface MarkdownTransformer {
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
export interface TransformContext {
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
export interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  value?: string;
  [key: string]: unknown;
}

/**
 * Transform result.
 */
export interface TransformResult {
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
export interface TocEntry {
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

// ============================================
// Source Documentation Types
// ============================================

/**
 * Options for source documentation generation.
 */
export interface DocsOptions {
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

  /**
   * GitHub repository URL for source code links.
   * When provided, generated documentation will include links to source code.
   * Example: 'https://github.com/ubugeeei/ox-content'
   */
  githubUrl?: string;

  /**
   * Generate navigation metadata file.
   * @default true
   */
  generateNav?: boolean;
}

/**
 * Resolved docs options with all defaults applied.
 */
export interface ResolvedDocsOptions {
  enabled: boolean;
  src: string[];
  out: string;
  include: string[];
  exclude: string[];
  format: 'markdown' | 'json' | 'html';
  private: boolean;
  toc: boolean;
  groupBy: 'file' | 'category';
  githubUrl?: string;
  generateNav: boolean;
}

/**
 * A single documentation entry extracted from source.
 */
export interface DocEntry {
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
  signature?: string; // Full function/type signature (for functions and type aliases)
}

/**
 * Parameter documentation.
 */
export interface ParamDoc {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  default?: string;
}

/**
 * Return type documentation.
 */
export interface ReturnDoc {
  type: string;
  description: string;
}

/**
 * Extracted documentation for a single file.
 */
export interface ExtractedDocs {
  file: string;
  entries: DocEntry[];
}

/**
 * Navigation item for sidebar navigation.
 */
export interface NavItem {
  /**
   * Display title for the navigation item.
   */
  title: string;

  /**
   * Path to the documentation page.
   */
  path: string;

  /**
   * Child navigation items (optional).
   */
  children?: NavItem[];
}
