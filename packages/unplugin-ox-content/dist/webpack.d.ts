/**
 * Webpack plugin export for unplugin-ox-content
 */
import unplugin from './index';
import type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult } from './types';
declare const _default: (options?: OxContentOptions | undefined) => import("unplugin").WebpackPluginInstance;
export default _default;
export { unplugin };
export type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult };
