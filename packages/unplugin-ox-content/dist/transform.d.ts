/**
 * Markdown transformation logic for unplugin-ox-content.
 *
 * Uses the Rust-based @ox-content/napi for high-performance processing.
 */
import type { ResolvedOptions, TransformResult } from './types';
/**
 * Transforms Markdown content into a JavaScript module.
 *
 * Uses the Rust-based NAPI bindings for:
 * - Frontmatter parsing
 * - Table of contents generation
 * - HTML rendering
 */
export declare function transformMarkdown(source: string, filePath: string, options: ResolvedOptions): Promise<TransformResult>;
