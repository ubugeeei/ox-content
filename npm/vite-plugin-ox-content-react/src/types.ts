import type { OxContentOptions } from 'vite-plugin-ox-content';

export type ComponentsMap = Record<string, string>;

/**
 * Component registration options.
 * Can be a map, a glob pattern, or an array of glob patterns.
 */
export type ComponentsOption = ComponentsMap | string | string[];

export interface ReactIntegrationOptions extends OxContentOptions {
  /**
   * Components to register for use in Markdown.
   * Can be a map of names to paths, a glob pattern, or an array of globs.
   * When using glob patterns, component names are derived from file names.
   *
   * @example
   * ```ts
   * // Glob pattern (recommended)
   * components: './src/components/*.tsx'
   *
   * // Explicit map
   * components: { Counter: './src/components/Counter.tsx' }
   * ```
   */
  components?: ComponentsOption;
  jsxRuntime?: 'automatic' | 'classic';
}

export interface ResolvedReactOptions {
  srcDir: string;
  outDir: string;
  base: string;
  gfm: boolean;
  frontmatter: boolean;
  toc: boolean;
  tocMaxDepth: number;
  components: ComponentsMap;
  jsxRuntime: 'automatic' | 'classic';
  root?: string;
}

export interface ReactTransformResult {
  code: string;
  map: null;
  usedComponents: string[];
  frontmatter: Record<string, unknown>;
}

export interface ComponentSlot {
  name: string;
  props: Record<string, unknown>;
  position: number;
  id: string;
  content?: string;
}
