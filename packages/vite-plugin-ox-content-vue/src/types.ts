/**
 * Type definitions for Vue integration plugin.
 */

import type { OxContentOptions } from 'vite-plugin-ox-content';

/**
 * Component registration map.
 * Key is the component name to use in Markdown, value is the import path.
 */
export type ComponentsMap = Record<string, string>;

/**
 * Vue integration plugin options.
 */
export interface VueIntegrationOptions extends OxContentOptions {
  /**
   * Map of component names to their import paths.
   *
   * @example
   * ```ts
   * components: {
   *   Counter: './src/components/Counter.vue',
   *   Alert: './src/components/Alert.vue',
   * }
   * ```
   */
  components?: ComponentsMap;

  /**
   * Enable Vue Reactivity Transform.
   * @default false
   */
  reactivityTransform?: boolean;

  /**
   * Enable custom blocks in Markdown (e.g., `:::tip`).
   * @default true
   */
  customBlocks?: boolean;
}

/**
 * Resolved Vue integration options with all defaults applied.
 */
export interface ResolvedVueOptions {
  srcDir: string;
  outDir: string;
  base: string;
  gfm: boolean;
  frontmatter: boolean;
  toc: boolean;
  tocMaxDepth: number;
  components: ComponentsMap;
  reactivityTransform: boolean;
  customBlocks: boolean;
}

/**
 * Transform result with Vue component information.
 */
export interface VueTransformResult {
  code: string;
  map: null;
  /**
   * List of components used in the Markdown.
   */
  usedComponents: string[];
  /**
   * Extracted frontmatter.
   */
  frontmatter: Record<string, unknown>;
}

/**
 * Slot information for component rendering.
 */
export interface ComponentSlot {
  /**
   * Component name.
   */
  name: string;
  /**
   * Props to pass to the component.
   */
  props: Record<string, unknown>;
  /**
   * Position in the HTML output.
   */
  position: number;
  /**
   * Slot placeholder ID.
   */
  id: string;
}

/**
 * Parsed Markdown content with Vue component slots.
 */
export interface ParsedMarkdownContent {
  /**
   * HTML content with slot placeholders.
   */
  html: string;
  /**
   * Component slots to render.
   */
  slots: ComponentSlot[];
  /**
   * Frontmatter data.
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
  level: number;
  text: string;
  slug: string;
  children?: TocEntry[];
}
