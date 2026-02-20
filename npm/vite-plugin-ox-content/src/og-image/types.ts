/**
 * Type definitions for Chromium-based OG image generation.
 */

/**
 * Props passed to OG image template functions.
 */
export interface OgImageTemplateProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Site name */
  siteName?: string;
  /** Author name */
  author?: string;
  /** Tags/categories */
  tags?: string[];
  /** Custom data from frontmatter (arbitrary key-value pairs) */
  [key: string]: unknown;
}

/**
 * Template function that receives page metadata and returns an HTML string.
 */
export type OgImageTemplateFn = (
  props: OgImageTemplateProps,
) => string | Promise<string>;

/**
 * OG image generation options (user-facing).
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
