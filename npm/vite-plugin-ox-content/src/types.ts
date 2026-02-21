/**
 * Type definitions for @ox-content/vite-plugin
 */

import type { ThemeConfig, ResolvedThemeConfig } from "./theme";

// =============================================================================
// Entry Page Types (VitePress-like)
// =============================================================================

/**
 * Hero section action button.
 */
export interface HeroAction {
  /** Button theme: 'brand' (primary) or 'alt' (secondary) */
  theme?: "brand" | "alt";
  /** Button text */
  text: string;
  /** Link URL */
  link: string;
}

/**
 * Hero section image configuration.
 */
export interface HeroImage {
  /** Image source URL */
  src: string;
  /** Alt text */
  alt?: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
}

/**
 * Hero section configuration for entry page.
 */
export interface HeroConfig {
  /** Main title (large, gradient text) */
  name?: string;
  /** Secondary text (medium size) */
  text?: string;
  /** Tagline (smaller, muted) */
  tagline?: string;
  /** Hero image */
  image?: HeroImage;
  /** Action buttons */
  actions?: HeroAction[];
}

/**
 * Feature card for entry page.
 */
export interface FeatureConfig {
  /** Icon - supports: "mdi:icon-name" (Iconify), image URL, or emoji */
  icon?: string;
  /** Feature title */
  title: string;
  /** Feature description */
  details?: string;
  /** Optional link */
  link?: string;
  /** Link text */
  linkText?: string;
}

/**
 * Entry page frontmatter configuration.
 */
export interface EntryPageConfig {
  /** Layout type - set to 'entry' for entry page */
  layout: "entry";
  /** Hero section */
  hero?: HeroConfig;
  /** Feature cards */
  features?: FeatureConfig[];
}

/**
 * SSG (Static Site Generation) options.
 */
export interface SsgOptions {
  /**
   * Enable SSG mode.
   * @default true
   */
  enabled?: boolean;

  /**
   * Output file extension.
   * @default '.html'
   */
  extension?: string;

  /**
   * Clean output directory before build.
   * @default false
   */
  clean?: boolean;

  /**
   * Bare HTML output (no navigation, no styles).
   * Useful for benchmarking or when using custom layouts.
   * @default false
   */
  bare?: boolean;

  /**
   * Site name for header and title suffix.
   */
  siteName?: string;

  /**
   * OG image URL for social sharing (static URL).
   * If generateOgImage is enabled, this serves as the fallback.
   */
  ogImage?: string;

  /**
   * Generate OG images per page using Rust-based generator.
   * When enabled, each page will have a unique OG image.
   * @default false
   */
  generateOgImage?: boolean;

  /**
   * Site URL for generating absolute OG image URLs.
   * Required for proper SNS sharing.
   * Example: 'https://example.com'
   */
  siteUrl?: string;

  /**
   * Theme configuration for customizing the SSG output.
   * Use defineTheme() to create a theme configuration.
   */
  theme?: ThemeConfig;
}

/**
 * Resolved SSG options.
 */
export interface ResolvedSsgOptions {
  enabled: boolean;
  extension: string;
  clean: boolean;
  bare: boolean;
  siteName?: string;
  ogImage?: string;
  generateOgImage: boolean;
  siteUrl?: string;
  theme?: ResolvedThemeConfig;
}

/**
 * Plugin options.
 */
export interface OxContentOptions {
  /**
   * Source directory for Markdown files.
   * @default 'content'
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
   * SSG (Static Site Generation) options.
   * Set to false to disable SSG completely.
   * @default { enabled: true }
   */
  ssg?: SsgOptions | boolean;

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

  /**
   * Full-text search options.
   * Set to false to disable search.
   * @default { enabled: true }
   */
  search?: SearchOptions | boolean;

  /**
   * Enable OG Viewer dev tool.
   * Accessible at /__og-viewer during development.
   * @default true
   */
  ogViewer?: boolean;
}

/**
 * Resolved options with all defaults applied.
 */
export interface ResolvedOptions {
  srcDir: string;
  outDir: string;
  base: string;
  ssg: ResolvedSsgOptions;
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
  ogImageOptions: ResolvedOgImageOptions;
  transformers: MarkdownTransformer[];
  docs: ResolvedDocsOptions | false;
  search: ResolvedSearchOptions;
  ogViewer: boolean;
}

/**
 * OG image generation options.
 * Uses Chromium-based rendering with customizable templates.
 */
export interface OgImageOptions {
  /**
   * Path to a custom template file (.ts, .vue, .svelte, .tsx/.jsx).
   * - `.ts`: default-export a function `(props) => string`
   * - `.vue`: Vue SFC, rendered via SSR
   * - `.svelte`: Svelte SFC, rendered via SSR
   * - `.tsx`/`.jsx`: React Server Component, rendered via SSR
   * If not specified, the built-in default template is used.
   */
  template?: string;

  /**
   * Vue plugin to use for compiling `.vue` templates.
   * - `'vitejs'`: Use `@vue/compiler-sfc` (official, default)
   * - `'vizejs'`: Use `@vizejs/vite-plugin` (Rust-based)
   * @default 'vitejs'
   */
  vuePlugin?: "vitejs" | "vizejs";

  /**
   * Image width in pixels.
   * @default 1200
   */
  width?: number;

  /**
   * Image height in pixels.
   * @default 630
   */
  height?: number;

  /**
   * Enable content-hash based caching.
   * Skips rendering when content hasn't changed.
   * @default true
   */
  cache?: boolean;

  /**
   * Number of concurrent page instances for parallel rendering.
   * @default 1
   */
  concurrency?: number;
}

/**
 * Resolved OG image options with all defaults applied.
 */
export interface ResolvedOgImageOptions {
  template?: string;
  vuePlugin: "vitejs" | "vizejs";
  width: number;
  height: number;
  cache: boolean;
  concurrency: number;
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
  format?: "markdown" | "json" | "html";

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
  groupBy?: "file" | "category";

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
  format: "markdown" | "json" | "html";
  private: boolean;
  toc: boolean;
  groupBy: "file" | "category";
  githubUrl?: string;
  generateNav: boolean;
}

/**
 * A single documentation entry extracted from source.
 */
export interface DocEntry {
  name: string;
  kind: "function" | "class" | "interface" | "type" | "variable" | "module";
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

// ============================================
// Search Types
// ============================================

/**
 * Options for full-text search.
 */
export interface SearchOptions {
  /**
   * Enable search functionality.
   * @default true
   */
  enabled?: boolean;

  /**
   * Maximum number of search results.
   * @default 10
   */
  limit?: number;

  /**
   * Enable prefix matching for autocomplete.
   * @default true
   */
  prefix?: boolean;

  /**
   * Placeholder text for the search input.
   * @default 'Search documentation...'
   */
  placeholder?: string;

  /**
   * Keyboard shortcut to focus search (without modifier).
   * @default '/'
   */
  hotkey?: string;
}

/**
 * Resolved search options.
 */
export interface ResolvedSearchOptions {
  enabled: boolean;
  limit: number;
  prefix: boolean;
  placeholder: string;
  hotkey: string;
}

/**
 * Search document structure.
 */
export interface SearchDocument {
  id: string;
  title: string;
  url: string;
  body: string;
  headings: string[];
  code: string[];
}

/**
 * Search result structure.
 */
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  score: number;
  matches: string[];
  snippet: string;
}
