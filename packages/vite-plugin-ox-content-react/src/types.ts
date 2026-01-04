import type { OxContentOptions } from 'vite-plugin-ox-content';

export type ComponentsMap = Record<string, string>;

export interface ReactIntegrationOptions extends OxContentOptions {
  components?: ComponentsMap;
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
}
