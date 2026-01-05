/**
 * unplugin-ox-content
 *
 * Universal plugin for Ox Content - Markdown processing for
 * webpack, rollup, esbuild, vite, and more.
 */
import type { OxContentOptions } from './types';
export type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult } from './types';
export { transformMarkdown } from './transform';
/**
 * The unplugin instance.
 */
export declare const unplugin: import("unplugin").UnpluginInstance<OxContentOptions | undefined, boolean>;
export default unplugin;
