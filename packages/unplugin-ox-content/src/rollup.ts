/**
 * Rollup plugin export for unplugin-ox-content
 */

import unplugin from './index';
import type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult } from './types';

export default unplugin.rollup;
export { unplugin };
export type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult };
