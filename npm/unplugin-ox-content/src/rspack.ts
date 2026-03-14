/**
 * Rspack plugin export for @ox-content/unplugin
 */

import oxContentUnplugin from "./index";
import type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult } from "./types";

export default oxContentUnplugin.rspack;
export { oxContentUnplugin as unplugin };
export type { OxContentOptions, ResolvedOptions, TocEntry, TransformResult };
