/**
 * Source Documentation Extraction and Generation
 *
 * This module provides comprehensive tools for extracting JSDoc/TSDoc comments
 * from TypeScript/JavaScript source files and automatically generating Markdown
 * documentation.
 *
 * ## Features
 *
 * - **Automatic Extraction**: Parses JSDoc comments from functions, classes, interfaces, and types
 * - **Flexible Filtering**: Include/exclude patterns for selective documentation
 * - **Markdown Generation**: Converts extracted docs to organized Markdown files
 * - **Navigation Generation**: Auto-generates sidebar navigation metadata
 * - **GitHub Links**: Includes clickable links to source code on GitHub
 *
 * ## Supported JSDoc Tags
 *
 * - `@param {type} name - description` - Function parameter documentation
 * - `@returns {type} description` - Return value documentation
 * - `@example` - Code examples (multi-line blocks)
 * - `@private` - Mark item as private (excluded from docs if private=false)
 * - `@default value` - Default parameter value
 * - Custom tags are preserved in the `tags` field
 *
 * ## Usage Flow
 *
 * 1. Call `extractDocs()` to parse source files
 * 2. Call `generateMarkdown()` to create Markdown content
 * 3. Call `writeDocs()` to write files to output directory
 * 4. Generated nav.ts can be imported for sidebar navigation
 *
 * @example
 * ```typescript
 * import { extractDocs, generateMarkdown, writeDocs } from './docs';
 *
 * const docsOptions = {
 *   enabled: true,
 *   src: ['./src'],
 *   out: './docs/api',
 *   include: ['**\/*.ts'],
 *   exclude: ['**\/*.test.ts'],
 *   groupBy: 'file',
 *   githubUrl: 'https://github.com/user/project',
 * };
 *
 * const extracted = await extractDocs(['./src'], docsOptions);
 * const markdown = generateMarkdown(extracted, docsOptions);
 * await writeDocs(markdown, './docs/api', extracted, docsOptions);
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ResolvedDocsOptions, ExtractedDocs, DocEntry, ParamDoc } from './types';
import { generateNavMetadata, generateNavCode } from './nav-generator';

/**
 * Regex pattern for matching JSDoc comment blocks.
 *
 * Matches `/** ... */` comments that start at the beginning of a line
 * (with optional leading whitespace). This pattern avoids false matches
 * with `/**` inside strings like glob patterns.
 *
 * @internal
 */
const JSDOC_BLOCK = /^[ \t]*\/\*\*\s*([\s\S]*?)\s*\*\//gm;

/**
 * Regex pattern for matching function declarations.
 * Matches: `function name`, `export function name`, `async function name`
 * @internal
 */
const FUNCTION_DECL = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/;

/**
 * Regex pattern for matching const arrow/async functions.
 * Matches: `const name = () => {}`, `const name = async () => {}`
 * @internal
 */
const CONST_FUNC = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/;

/**
 * Regex pattern for matching class declarations.
 * Matches: `class Name`, `export class Name`
 * @internal
 */
const CLASS_DECL = /(?:export\s+)?class\s+(\w+)/;

/**
 * Regex pattern for matching interface declarations.
 * Matches: `interface Name`, `export interface Name`
 * @internal
 */
const INTERFACE_DECL = /(?:export\s+)?interface\s+(\w+)/;

/**
 * Regex pattern for matching type alias declarations.
 * Matches: `type Name = ...`, `export type Name = ...`
 * @internal
 */
const TYPE_DECL = /(?:export\s+)?type\s+(\w+)/;

/**
 * Extracts JSDoc documentation from source files in specified directories.
 *
 * This function recursively searches directories for source files matching
 * the include/exclude patterns, then extracts all documented items (functions,
 * classes, interfaces, types) from those files.
 *
 * ## Process
 *
 * 1. **File Discovery**: Recursively walks directories, applying filters
 * 2. **File Reading**: Loads each matching file's content
 * 3. **JSDoc Extraction**: Parses JSDoc comments using regex patterns
 * 4. **Declaration Matching**: Pairs JSDoc comments with source declarations
 * 5. **Result Collection**: Aggregates extracted documentation by file
 *
 * ## Include/Exclude Patterns
 *
 * Patterns support:
 * - `**` - Match any directory structure
 * - `*` - Match any filename
 * - Standard glob patterns (e.g., `**\/*.test.ts`)
 *
 * ## Performance Considerations
 *
 * - Uses filesystem I/O which can be slow for large codebases
 * - Consider using more specific include patterns to reduce file scanning
 * - Results are not cached; call once per build/dev session
 *
 * @param srcDirs - Array of source directory paths to scan
 * @param options - Documentation extraction options (filters, grouping, etc.)
 *
 * @returns Promise resolving to array of extracted documentation by file.
 *          Each ExtractedDocs object contains file path and array of DocEntry items.
 *
 * @example
 * ```typescript
 * const docs = await extractDocs(
 *   ['./packages/vite-plugin/src'],
 *   {
 *     enabled: true,
 *     src: [],
 *     out: 'docs',
 *     include: ['**\/*.ts'],
 *     exclude: ['**\/*.test.ts', '**\/*.spec.ts'],
 *     format: 'markdown',
 *     private: false,
 *     toc: true,
 *     groupBy: 'file',
 *     generateNav: true,
 *   }
 * );
 *
 * // Returns:
 * // [
 * //   {
 * //     file: '/path/to/transform.ts',
 * //     entries: [
 * //       { name: 'transformMarkdown', kind: 'function', ... },
 * //       { name: 'loadNapiBindings', kind: 'function', ... },
 * //     ]
 * //   },
 * //   ...
 * // ]
 * ```
 */
export async function extractDocs(
  srcDirs: string[],
  options: ResolvedDocsOptions
): Promise<ExtractedDocs[]> {
  const results: ExtractedDocs[] = [];

  for (const srcDir of srcDirs) {
    const files = await findFiles(srcDir, options);

    for (const file of files) {
      const content = await fs.promises.readFile(file, 'utf-8');
      const entries = extractFromContent(content, file, options);

      if (entries.length > 0) {
        results.push({ file, entries });
      }
    }
  }

  return results;
}

/**
 * Recursively finds all source files matching include/exclude patterns.
 *
 * @internal
 */
async function findFiles(dir: string, options: ResolvedDocsOptions): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    let entries;
    try {
      entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!isExcluded(fullPath, options.exclude)) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (isIncluded(fullPath, options.include) && !isExcluded(fullPath, options.exclude)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return files;
}

function isIncluded(file: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.includes('**')) {
      const ext = pattern.split('.').pop();
      return file.endsWith(`.${ext}`);
    }
    return file.endsWith(pattern.replace('*', ''));
  });
}

function isExcluded(file: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.includes('node_modules')) {
      return file.includes('node_modules');
    }
    if (pattern.includes('.test.') || pattern.includes('.spec.')) {
      return file.includes('.test.') || file.includes('.spec.');
    }
    return false;
  });
}

/**
 * Extracts documentation entries from file content.
 */
function extractFromContent(
  content: string,
  file: string,
  options: ResolvedDocsOptions
): DocEntry[] {
  const entries: DocEntry[] = [];

  let match: RegExpExecArray | null;
  JSDOC_BLOCK.lastIndex = 0;

  while ((match = JSDOC_BLOCK.exec(content)) !== null) {
    const jsdocContent = match[1];
    const jsdocEnd = match.index + match[0].length;

    const afterJsdoc = content.slice(jsdocEnd).trim();
    const lineNumber = content.slice(0, match.index).split('\n').length;

    const entry = parseJsdocBlock(jsdocContent, afterJsdoc, file, lineNumber);

    if (entry && (options.private || !entry.private)) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Extracts the complete function signature for display.
 *
 * Captures the full function declaration from `export/async/function name(...): ReturnType`
 * or `export const name = (...): ReturnType => {}`, handling multi-line signatures.
 *
 * @param signature - Multi-line function declaration text
 * @returns Cleaned function signature or undefined if not found
 *
 * @internal
 */
function extractFunctionSignature(signature: string): string | undefined {
  // Match function declarations: export/async function, export const, etc.
  // Capture everything from the start until the opening brace or arrow
  const match = signature.match(
    /(?:export\s+)?(?:async\s+)?(?:function\s+\w+|\w+\s*=\s*(?:async\s*)?\()\([^{]*?\)(?:\s*:\s*[^{;]+)?/s
  );

  if (match) {
    let sig = match[0].trim();
    // Clean up excessive whitespace while preserving structure
    // Replace multiple spaces with single space, but keep newlines in readable format
    sig = sig
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n  ');
    return sig;
  }

  return undefined;
}

/**
 * Extracts parameter and return types from a TypeScript function signature.
 *
 * Parses function signatures to extract:
 * - Parameter names and their type annotations
 * - Return type annotation
 *
 * Handles various function declaration styles:
 * - `function name(param: type): ReturnType`
 * - `const name = (param: type): ReturnType => {}`
 * - `export async function name(param: type): Promise<ReturnType>`
 *
 * @param signature - Multi-line function signature text
 * @param params - Array of parameter docs with names already extracted
 * @returns Object with extracted parameter types and return type
 *
 * @internal
 */
function extractTypesFromSignature(
  signature: string,
  params: ParamDoc[]
): { paramTypes: string[]; returnType?: string } {
  const paramTypes: string[] = [];

  // Extract the parameter list from the signature
  // Match everything between the first `(` and the closing `)` before `=>` or `{`
  const paramListMatch = signature.match(/\(([^)]*)\)(?:\s*:\s*([^{=>]+))?/s);

  if (paramListMatch && paramListMatch[1]) {
    const paramListStr = paramListMatch[1];

    // Split by comma, but be careful about nested generics
    const paramParts = splitParameters(paramListStr);

    for (const part of paramParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // Extract type from "name: type" or "name: type = default"
      // Handle nested generics properly
      const typeMatch = /:\s*(.+?)(?:\s*=|$)/.exec(trimmed);
      if (typeMatch) {
        let typeStr = typeMatch[1].trim();
        // Remove trailing equals and everything after it (default value)
        if (typeStr.includes('=')) {
          typeStr = typeStr.split('=')[0].trim();
        }
        paramTypes.push(typeStr);
      }
    }
  }

  // Extract return type
  let returnType: string | undefined;

  // Look for return type annotation `: Type` or `: Promise<Type>`
  // This comes after the closing parenthesis
  // Need to handle nested angle brackets in generics
  const returnTypeMatch = signature.match(/\)\s*:\s*(.+?)(?={|$)/);
  if (returnTypeMatch) {
    returnType = returnTypeMatch[1].trim();
  }

  return {
    paramTypes,
    returnType,
  };
}

/**
 * Splits function parameters while respecting nested angle brackets (generics).
 *
 * Handles cases like:
 * - `a: string, b: number` → `["a: string", "b: number"]`
 * - `a: Promise<string>, b: Record<string, any>` → `["a: Promise<string>", "b: Record<string, any>"]`
 *
 * @param paramListStr - String containing all parameters
 * @returns Array of individual parameter strings
 *
 * @internal
 */
function splitParameters(paramListStr: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0; // Track nested angle brackets

  for (const char of paramListStr) {
    if (char === '<') {
      depth++;
      current += char;
    } else if (char === '>') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

/**
 * Parses a JSDoc block and the following declaration.
 * Only matches if the declaration is immediately after the JSDoc (with only whitespace/keywords between).
 */
function parseJsdocBlock(
  jsdoc: string,
  declaration: string,
  file: string,
  line: number
): DocEntry | null {
  const params: ParamDoc[] = [];
  const examples: string[] = [];
  const tags: Record<string, string> = {};
  let description = '';
  let returns: { type: string; description: string } | undefined;
  let isPrivate = false;

  // Split lines and remove JSDoc markers but preserve indentation for code examples
  const rawLines = jsdoc.split('\n').map((l) => l.replace(/^\s*\*\s?/, ''));
  const cleanedLines = rawLines.map((l) => l.trim()).filter((l) => l);

  let currentExample = '';
  let inExample = false;
  let rawLineIndex = 0;

  for (const lineText of cleanedLines) {
    // Find the corresponding raw line to get original indentation for examples
    while (rawLineIndex < rawLines.length && rawLines[rawLineIndex].trim() !== lineText) {
      rawLineIndex++;
    }
    const rawLine = rawLineIndex < rawLines.length ? rawLines[rawLineIndex] : lineText;
    rawLineIndex++;

    if (lineText.startsWith('@')) {
      if (inExample) {
        examples.push(currentExample.trim());
        currentExample = '';
        inExample = false;
      }

      const tagMatch = /@(\w+)\s*(?:\{([^}]*)\})?(.*)/.exec(lineText);
      if (tagMatch) {
        const [, tagName, tagType, tagRest] = tagMatch;

        switch (tagName) {
          case 'param':
            const paramMatch = /(\w+)\s*-?\s*(.*)/.exec(tagRest.trim());
            if (paramMatch) {
              params.push({
                name: paramMatch[1],
                type: tagType || 'unknown',
                description: paramMatch[2],
              });
            }
            break;
          case 'returns':
          case 'return':
            returns = {
              type: tagType || 'unknown',
              description: tagRest.trim(),
            };
            break;
          case 'example':
            inExample = true;
            break;
          case 'private':
            isPrivate = true;
            break;
          default:
            tags[tagName] = tagRest.trim();
        }
      }
    } else if (inExample) {
      // Use raw line to preserve indentation in code examples
      currentExample += rawLine + '\n';
    } else if (!description) {
      description = lineText;
    } else {
      description += '\n' + lineText;
    }
  }

  if (inExample && currentExample) {
    examples.push(currentExample.trim());
  }

  // Only look at the first few lines after the JSDoc to find the declaration
  // This prevents module-level JSDoc from matching distant declarations
  const firstFewLines = declaration.split('\n').slice(0, 5).join('\n');

  let name = '';
  let kind: DocEntry['kind'] = 'function';

  // Use anchored patterns to match at the start (after optional whitespace/keywords)
  const ANCHORED_FUNCTION = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/;
  const ANCHORED_CONST_FUNC = /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/;
  const ANCHORED_CLASS = /^(?:export\s+)?class\s+(\w+)/;
  const ANCHORED_INTERFACE = /^(?:export\s+)?interface\s+(\w+)/;
  const ANCHORED_TYPE = /^(?:export\s+)?type\s+(\w+)/;

  let declMatch: RegExpExecArray | null;

  if ((declMatch = ANCHORED_FUNCTION.exec(firstFewLines))) {
    name = declMatch[1];
    kind = 'function';
  } else if ((declMatch = ANCHORED_CONST_FUNC.exec(firstFewLines))) {
    name = declMatch[1];
    kind = 'function';
  } else if ((declMatch = ANCHORED_CLASS.exec(firstFewLines))) {
    name = declMatch[1];
    kind = 'class';
  } else if ((declMatch = ANCHORED_INTERFACE.exec(firstFewLines))) {
    name = declMatch[1];
    kind = 'interface';
  } else if ((declMatch = ANCHORED_TYPE.exec(firstFewLines))) {
    name = declMatch[1];
    kind = 'type';
  }

  if (!name) return null;

  // Extract full signature and types from function signature if needed
  let signature: string | undefined;
  if (kind === 'function') {
    const signatureTypes = extractTypesFromSignature(firstFewLines, params);

    // Update params with extracted types if JSDoc types were missing
    if (signatureTypes.paramTypes.length > 0) {
      for (let i = 0; i < params.length && i < signatureTypes.paramTypes.length; i++) {
        if (params[i].type === 'unknown') {
          params[i].type = signatureTypes.paramTypes[i];
        }
      }
    }

    // Update return type if JSDoc return type was missing
    if (signatureTypes.returnType && (!returns || returns.type === 'unknown')) {
      if (returns) {
        returns.type = signatureTypes.returnType;
      } else {
        returns = {
          type: signatureTypes.returnType,
          description: '',
        };
      }
    }

    // Extract the complete function signature
    signature = extractFunctionSignature(firstFewLines);
  }

  return {
    name,
    kind,
    description,
    params: params.length > 0 ? params : undefined,
    returns,
    examples: examples.length > 0 ? examples : undefined,
    tags: Object.keys(tags).length > 0 ? tags : undefined,
    private: isPrivate,
    file,
    line,
    signature,
  };
}

/**
 * Generates Markdown documentation from extracted docs.
 */
export function generateMarkdown(
  docs: ExtractedDocs[],
  options: ResolvedDocsOptions
): Record<string, string> {
  const result: Record<string, string> = {};
  const symbolMap = buildSymbolMap(docs);

  if (options.groupBy === 'file') {
    const docToFile = new Map<ExtractedDocs, string>();

    for (const doc of docs) {
      let fileName = path.basename(doc.file, path.extname(doc.file));
      // Avoid conflict with the main index.md
      if (fileName === 'index') {
        fileName = 'index-module';
      }
      docToFile.set(doc, fileName);

      const markdown = generateFileMarkdown(doc, options, fileName, symbolMap);
      result[`${fileName}.md`] = markdown;
    }

    result['index.md'] = generateIndex(docs, docToFile);
  } else {
    const byKind = new Map<string, DocEntry[]>();

    for (const doc of docs) {
      for (const entry of doc.entries) {
        const existing = byKind.get(entry.kind) || [];
        existing.push(entry);
        byKind.set(entry.kind, existing);
      }
    }

    for (const [kind, entries] of byKind) {
      result[`${kind}s.md`] = generateCategoryMarkdown(kind, entries, options, symbolMap);
    }

    result['index.md'] = generateCategoryIndex(byKind);
  }

  return result;
}

function generateFileMarkdown(
  doc: ExtractedDocs,
  options: ResolvedDocsOptions,
  currentFileName: string,
  symbolMap: Map<string, SymbolLocation>
): string {
  const displayName = path.basename(doc.file);
  let md = `# ${displayName}\n\n`;

  // Add source link if githubUrl is provided
  if (options.githubUrl) {
    const sourceLink = generateSourceLink(doc.file, options.githubUrl);
    if (sourceLink) {
      md += sourceLink + '\n\n';
    }
  }

  if (options.toc && doc.entries.length > 1) {
    md += '## Table of Contents\n\n';
    for (const entry of doc.entries) {
      md += `- [${entry.name}](#${entry.name.toLowerCase()})\n`;
    }
    md += '\n---\n\n';
  }

  // Pass symbol map for cross-file link resolution
  for (const entry of doc.entries) {
    md += generateEntryMarkdown(entry, options, currentFileName, symbolMap);
  }

  return md;
}

function generateEntryMarkdown(
  entry: DocEntry,
  options?: ResolvedDocsOptions,
  currentFileName?: string,
  symbolMap?: Map<string, SymbolLocation>
): string {
  let md = `## ${entry.name}\n\n`;

  md += `\`${entry.kind}\`\n\n`;

  if (entry.description) {
    // Convert symbol links [SymbolName] to markdown links
    const processedDescription = currentFileName && symbolMap
      ? convertSymbolLinks(entry.description, currentFileName, symbolMap)
      : entry.description;
    md += `${processedDescription}\n\n`;
  }

  // Add source link if githubUrl is provided
  if (options?.githubUrl) {
    const sourceLink = generateSourceLink(entry.file, options.githubUrl, entry.line);
    if (sourceLink) {
      md += sourceLink + '\n\n';
    }
  }

  // Add function signature if available
  if (entry.signature && entry.kind === 'function') {
    md += '```typescript\n';
    md += entry.signature + '\n';
    md += '```\n\n';
  }

  if (entry.params && entry.params.length > 0) {
    md += '### Parameters\n\n';
    md += '| Name | Type | Description |\n';
    md += '|------|------|-------------|\n';
    for (const param of entry.params) {
      md += `| \`${param.name}\` | \`${param.type}\` | ${param.description} |\n`;
    }
    md += '\n';
  }

  if (entry.returns) {
    md += '### Returns\n\n';
    md += `\`${entry.returns.type}\` - ${entry.returns.description}\n\n`;
  }

  if (entry.examples && entry.examples.length > 0) {
    md += '### Examples\n\n';
    for (const example of entry.examples) {
      md += '```ts\n';
      md += example.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      md += '\n```\n\n';
    }
  }

  md += '---\n\n';

  return md;
}

function generateIndex(docs: ExtractedDocs[], docToFile?: Map<ExtractedDocs, string>): string {
  let md = '# API Documentation\n\n';
  md += 'Generated by [Ox Content](https://github.com/ubugeeei/ox-content)\n\n';

  md += '## Modules\n\n';

  for (const doc of docs) {
    const displayName = path.basename(doc.file, path.extname(doc.file));
    let fileName = displayName;

    if (docToFile && docToFile.has(doc)) {
      fileName = docToFile.get(doc)!;
    } else if (fileName === 'index') {
      fileName = 'index-module';
    }

    md += `### [${displayName}](./${fileName}.md)\n\n`;

    for (const entry of doc.entries) {
      const desc = entry.description?.slice(0, 80) || '';
      const ellipsis = entry.description && entry.description.length > 80 ? '...' : '';
      md += `- \`${entry.kind}\` **${entry.name}** - ${desc}${ellipsis}\n`;
    }
    md += '\n';
  }

  return md;
}

function generateCategoryMarkdown(
  kind: string,
  entries: DocEntry[],
  options: ResolvedDocsOptions,
  symbolMap: Map<string, SymbolLocation>
): string {
  const categoryFileName = `${kind}s`;
  let md = `# ${kind.charAt(0).toUpperCase() + kind.slice(1)}s\n\n`;

  if (options.toc) {
    md += '## Table of Contents\n\n';
    for (const entry of entries) {
      md += `- [${entry.name}](#${entry.name.toLowerCase()})\n`;
    }
    md += '\n---\n\n';
  }

  for (const entry of entries) {
    md += generateEntryMarkdown(entry, options, categoryFileName, symbolMap);
  }

  return md;
}

function generateCategoryIndex(byKind: Map<string, DocEntry[]>): string {
  let md = '# API Documentation\n\n';
  md += 'Generated by [Ox Content](https://github.com/ubugeeei/ox-content)\n\n';

  for (const [kind, entries] of byKind) {
    const kindTitle = kind.charAt(0).toUpperCase() + kind.slice(1) + 's';
    md += `## [${kindTitle}](./${kind}s.md)\n\n`;

    for (const entry of entries) {
      const desc = entry.description?.slice(0, 60) || '';
      md += `- **${entry.name}** - ${desc}...\n`;
    }
    md += '\n';
  }

  return md;
}

/**
 * Symbol location info for cross-file linking.
 */
interface SymbolLocation {
  name: string;
  file: string;
  fileName: string;
}

/**
 * Converts symbol links [SymbolName] to markdown links.
 *
 * Processes description text to convert cargo-docs-style symbol references
 * `[SymbolName]` into clickable markdown links pointing to the appropriate
 * documentation page.
 *
 * ## Examples
 *
 * Input: "See [transformMarkdown] for usage" (same file)
 * Output: "See [transformMarkdown](#transformmarkdown) for usage"
 *
 * Input: "Uses [NavItem] interface" (different file: types.ts)
 * Output: "Uses [NavItem](./types.md#navitem) interface"
 *
 * @param text - Description text containing symbol references
 * @param currentFileName - Current file name (without extension) for same-file detection
 * @param symbolMap - Map of symbol names to their file locations
 * @returns Text with symbol references converted to markdown links
 *
 * @internal
 */
function convertSymbolLinks(
  text: string,
  currentFileName: string,
  symbolMap: Map<string, SymbolLocation>
): string {
  // Match [SymbolName] pattern where SymbolName starts with uppercase or underscore
  // Negative lookahead (?!\() ensures we don't match [Name] that's already part of [Name](url)
  return text.replace(/\[([A-Z_]\w*)\](?!\()/g, (match, symbolName) => {
    const location = symbolMap.get(symbolName);
    if (!location) {
      // Symbol not found, keep original text
      return match;
    }

    if (location.fileName === currentFileName) {
      // Same file - use anchor only
      return `[${symbolName}](#${symbolName.toLowerCase()})`;
    } else {
      // Different file - use cross-file link
      return `[${symbolName}](./${location.fileName}.md#${symbolName.toLowerCase()})`;
    }
  });
}

/**
 * Builds a map of all symbols to their file locations.
 */
function buildSymbolMap(docs: ExtractedDocs[]): Map<string, SymbolLocation> {
  const map = new Map<string, SymbolLocation>();

  for (const doc of docs) {
    let fileName = path.basename(doc.file, path.extname(doc.file));
    if (fileName === 'index') {
      fileName = 'index-module';
    }

    for (const entry of doc.entries) {
      map.set(entry.name, {
        name: entry.name,
        file: doc.file,
        fileName,
      });
    }
  }

  return map;
}

/**
 * Writes generated documentation to the output directory.
 */
export async function writeDocs(
  docs: Record<string, string>,
  outDir: string,
  extractedDocs?: ExtractedDocs[],
  options?: ResolvedDocsOptions
): Promise<void> {
  await fs.promises.mkdir(outDir, { recursive: true });

  for (const [fileName, content] of Object.entries(docs)) {
    const filePath = path.join(outDir, fileName);
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  // Generate and write navigation metadata if enabled
  if (extractedDocs && options?.generateNav && options.groupBy === 'file') {
    const navItems = generateNavMetadata(extractedDocs, '/api');
    const navCode = generateNavCode(navItems, 'apiNav');
    const navFilePath = path.join(outDir, 'nav.ts');
    await fs.promises.writeFile(navFilePath, navCode, 'utf-8');
  }
}

/**
 * Resolves docs options with defaults.
 */
/**
 * Generates a GitHub source link for a file and optional line number.
 *
 * @param filePath - Full path to the source file
 * @param githubUrl - Base GitHub repository URL
 * @param lineNumber - Optional line number to link to
 * @returns Markdown link to source code
 */
function generateSourceLink(filePath: string, githubUrl: string, lineNumber?: number): string {
  // Convert absolute path to relative path from repository root
  // Assume the file path contains the relative structure we need
  const relativePath = filePath.replace(/^.*?(packages|crates)/, '$1');

  const fragment = lineNumber ? `#L${lineNumber}` : '';
  const link = `${githubUrl}/blob/main/${relativePath}${fragment}`;

  return `**[Source](${link})**`;
}

export function resolveDocsOptions(
  options: import('./types').DocsOptions | false | undefined
): ResolvedDocsOptions | false {
  if (options === false) {
    return false;
  }

  const opts = options || {};

  return {
    enabled: opts.enabled ?? true,
    src: opts.src ?? ['./src'],
    out: opts.out ?? 'docs/api',
    include: opts.include ?? ['**/*.ts', '**/*.tsx'],
    exclude: opts.exclude ?? ['**/*.test.*', '**/*.spec.*', 'node_modules'],
    format: opts.format ?? 'markdown',
    private: opts.private ?? false,
    toc: opts.toc ?? true,
    groupBy: opts.groupBy ?? 'file',
    githubUrl: opts.githubUrl,
    generateNav: opts.generateNav ?? true,
  };
}
