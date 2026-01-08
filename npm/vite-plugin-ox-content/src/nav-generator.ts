/**
 * Navigation Metadata Generator for API Documentation
 *
 * This module provides utilities for generating sidebar navigation structures
 * from extracted documentation. It automatically:
 *
 * - **Extracts file information**: Gets display names and file paths
 * - **Formats names**: Converts technical names to readable titles
 * - **Generates TypeScript**: Creates importable nav.ts files
 * - **Maintains hierarchy**: Supports nested navigation structures
 *
 * ## Generated Navigation Format
 *
 * The generated navigation is TypeScript-based for type safety and IDE support:
 *
 * ```typescript
 * export const apiNav: NavItem[] = [
 *   { title: 'Overview', path: '/api/index' },
 *   { title: 'Transform', path: '/api/transform' },
 *   { title: 'Types', path: '/api/types' },
 *   // ... auto-generated from documentation
 * ] as const;
 * ```
 *
 * ## Integration
 *
 * The generated nav.ts file can be imported directly:
 *
 * ```typescript
 * // In your Vue/React component
 * import { apiNav } from '../api/nav';
 *
 * const apiItems = apiNav.map(item => ({
 *   ...item,
 *   file: () => import(`../api/${item.path.split('/').pop()}.md`)
 * }));
 * ```
 *
 * @example
 * ```typescript
 * import { generateNavMetadata, generateNavCode } from './nav-generator';
 *
 * const extracted = [
 *   { file: 'transform.ts', entries: [...] },
 *   { file: 'types.ts', entries: [...] },
 * ];
 *
 * const navItems = generateNavMetadata(extracted);
 * // => [
 * //   { title: 'Transform', path: '/api/transform' },
 * //   { title: 'Types', path: '/api/types' },
 * // ]
 *
 * const code = generateNavCode(navItems);
 * // => TypeScript code ready to write to nav.ts
 * ```
 */

import path from 'path';
import type { ExtractedDocs, NavItem } from './types';

/**
 * Generates sidebar navigation metadata from extracted documentation.
 *
 * Takes an array of extracted documentation and produces a flat navigation
 * structure suitable for sidebar menus. Items are:
 * - Sorted alphabetically by display name
 * - Formatted with readable titles
 * - Prefixed with the specified base path
 *
 * ## Naming Conventions
 *
 * - `transform.ts` → `{ title: 'Transform', path: '/api/transform' }`
 * - `nav-generator.ts` → `{ title: 'Nav Generator', path: '/api/nav-generator' }`
 * - `index.ts` or `index-module.ts` → `{ title: 'Overview', path: '/api/index' }`
 * - `types.ts` → `{ title: 'Types', path: '/api/types' }`
 *
 * ## Sorting
 *
 * Items are sorted alphabetically by display title for consistent ordering.
 * Special item 'Overview' sorts naturally with others (O comes after most letters).
 *
 * ## Path Generation
 *
 * The generated paths are used to import corresponding Markdown files:
 * - Path `/api/transform` → Import from `../api/transform.md`
 * - Path `/api/index` → Import from `../api/index.md`
 *
 * @param docs - Array of extracted documentation (file + entries)
 * @param basePath - Base path prefix for navigation URLs (default: '/api')
 *                   Use '/api' for main API docs, '/helpers' for utilities, etc.
 *
 * @returns Array of navigation items ready to use or export to TypeScript
 *
 * @example
 * ```typescript
 * const navItems = generateNavMetadata(
 *   [
 *     { file: 'transform.ts', entries: [...] },
 *     { file: 'docs.ts', entries: [...] },
 *     { file: 'types.ts', entries: [...] },
 *   ],
 *   '/api'
 * );
 *
 * // Returns:
 * // [
 * //   { title: 'Docs', path: '/api/docs' },
 * //   { title: 'Transform', path: '/api/transform' },
 * //   { title: 'Types', path: '/api/types' },
 * // ]
 * ```
 *
 * @see generateNavCode For converting these items to TypeScript code
 */
export function generateNavMetadata(docs: ExtractedDocs[], basePath: string = '/api'): NavItem[] {
  // Sort docs by filename for consistent ordering
  const sortedDocs = [...docs].sort((a, b) => {
    const aName = getDocDisplayName(a.file);
    const bName = getDocDisplayName(b.file);
    return aName.localeCompare(bName);
  });

  return sortedDocs.map((doc) => ({
    title: getDocDisplayName(doc.file),
    path: `${basePath}/${getDocFileName(doc.file)}`,
  }));
}

/**
 * Gets the human-readable display name for a documentation file.
 *
 * Transforms file paths and names into proper title case:
 * - Extracts base name (e.g., 'transform.ts' → 'transform')
 * - Converts kebab-case to Title Case (e.g., 'nav-generator' → 'Nav Generator')
 * - Converts camelCase to Title Case (e.g., 'transformMarkdown' → 'Transform Markdown')
 * - Handles special cases (index → 'Overview')
 *
 * ## Examples
 *
 * - `'/path/to/transform.ts'` → `'Transform'`
 * - `'nav-generator.ts'` → `'Nav Generator'`
 * - `'index.ts'` → `'Overview'`
 * - `'index-module.ts'` → `'Overview'`
 * - `'myFunction.ts'` → `'My Function'` (with camelCase handling)
 *
 * @param filePath - Full or relative file path
 * @returns Formatted display name suitable for UI labels
 *
 * @internal
 */
function getDocDisplayName(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));

  // Handle special cases
  if (fileName === 'index' || fileName === 'index-module') {
    return 'Overview';
  }

  // Convert kebab-case and snake_case to Title Case
  // Also handles camelCase transitions
  return fileName
    .replace(/[-_]([a-z])/g, (_, char) => ' ' + char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Gets the file name (without extension) for use in navigation paths.
 *
 * This handles filename conflicts that may occur during generation:
 * - Preserves most names as-is
 * - Special handling for index files to maintain consistency
 *
 * @param filePath - Source file path
 * @returns File name without extension, ready for URL paths
 *
 * @internal
 */
function getDocFileName(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));

  // Handle filename conflicts
  // The docs generator renames 'index' to 'index-module' to avoid conflicts
  if (fileName === 'index') {
    return 'index';
  }

  return fileName;
}

/**
 * Generates TypeScript code for navigation metadata export.
 *
 * Creates a complete, self-contained TypeScript file that:
 * - Defines the NavItem interface
 * - Exports navigation items as a const
 * - Uses `as const` for type-safe literal types
 * - Includes auto-generation notice
 *
 * The generated code is production-ready and suitable for direct import
 * in Vue, React, or vanilla TypeScript applications.
 *
 * ## Generated Code Example
 *
 * ```typescript
 * export interface NavItem {
 *   title: string;
 *   path: string;
 *   children?: NavItem[];
 * }
 *
 * export const apiNav: NavItem[] = [
 *   { "title": "Docs", "path": "/api/docs" },
 *   { "title": "Transform", "path": "/api/transform" },
 *   // ...
 * ] as const;
 * ```
 *
 * ## Features
 *
 * - **Type Safety**: Includes NavItem interface definition
 * - **Readonly**: Uses `as const` to ensure immutability
 * - **IDE Support**: Full IntelliSense and autocomplete
 * - **Self-Documenting**: Includes notice that file is auto-generated
 *
 * @param navItems - Array of navigation items to export
 * @param exportName - Name of the exported const (default: 'apiNav')
 *                     Use custom names for different navigation sections
 *
 * @returns Complete TypeScript source code as string,
 *          ready to write to a .ts file
 *
 * @example
 * ```typescript
 * const navItems = [
 *   { title: 'Home', path: '/api/index' },
 *   { title: 'Transform', path: '/api/transform' },
 * ];
 *
 * const code = generateNavCode(navItems, 'apiNav');
 * await fs.promises.writeFile('docs/api/nav.ts', code, 'utf-8');
 * ```
 *
 * @see generateNavMetadata For generating NavItem arrays from extracted docs
 */
export function generateNavCode(navItems: NavItem[], exportName: string = 'apiNav'): string {
  const json = JSON.stringify(navItems, null, 2);
  return `/**
 * Auto-generated API documentation navigation.
 * This file is automatically generated by the docs plugin.
 * Do not edit manually.
 */

export interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

export const ${exportName}: NavItem[] = ${json} as const;
`;
}
