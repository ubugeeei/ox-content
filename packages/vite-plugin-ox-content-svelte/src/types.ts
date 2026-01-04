import type { OxContentOptions } from 'vite-plugin-ox-content';

export type ComponentsMap = Record<string, string>;

export interface SvelteIntegrationOptions extends OxContentOptions {
  components?: ComponentsMap;
  runes?: boolean;
}

export interface ResolvedSvelteOptions {
  srcDir: string;
  outDir: string;
  base: string;
  gfm: boolean;
  frontmatter: boolean;
  toc: boolean;
  tocMaxDepth: number;
  components: ComponentsMap;
  runes: boolean;
}

export interface SvelteTransformResult {
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
}
