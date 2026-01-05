/**
 * Vite plugin export for unplugin-ox-content
 */
import unplugin from './index';
import type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult } from './types';
declare const _default: (options?: OxContentOptions | undefined) => import("unplugin").VitePlugin<any> | import("unplugin").VitePlugin<any>[];
export default _default;
export { unplugin };
export type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult };
