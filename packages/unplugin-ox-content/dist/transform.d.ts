/**
 * Markdown transformation logic for unplugin-ox-content.
 */
import type { ResolvedOptions, TransformResult } from './types';
/**
 * Transforms Markdown content into a JavaScript module.
 */
export declare function transformMarkdown(source: string, filePath: string, options: ResolvedOptions): Promise<TransformResult>;
