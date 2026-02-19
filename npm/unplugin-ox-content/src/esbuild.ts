/**
 * esbuild plugin export for @ox-content/unplugin
 */

import unplugin from "./index";
import type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult } from "./types";

export default unplugin.esbuild;
export { unplugin };
export type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult };
