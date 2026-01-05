/**
 * Source documentation extraction and generation.
 *
 * Extracts JSDoc/TSDoc comments from source files and generates
 * Markdown documentation automatically.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ResolvedDocsOptions, ExtractedDocs, DocEntry, ParamDoc } from './types';
import { generateNavMetadata, generateNavCode } from './nav-generator';

// Regex patterns for JSDoc extraction
// Match JSDoc blocks that start at the beginning of a line (with optional whitespace)
// This avoids matching /** inside strings like glob patterns '**/*.ts'
const JSDOC_BLOCK = /^[ \t]*\/\*\*\s*([\s\S]*?)\s*\*\//gm;
const FUNCTION_DECL = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/;
const CONST_FUNC = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/;
const CLASS_DECL = /(?:export\s+)?class\s+(\w+)/;
const INTERFACE_DECL = /(?:export\s+)?interface\s+(\w+)/;
const TYPE_DECL = /(?:export\s+)?type\s+(\w+)/;

/**
 * Extracts documentation from source files in directories.
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
 * Finds all matching files in a directory.
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

  const cleanedLines = jsdoc
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter((l) => l);

  let currentExample = '';
  let inExample = false;

  for (const lineText of cleanedLines) {
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
      currentExample += lineText + '\n';
    } else if (!description) {
      description = lineText;
    } else {
      description += ' ' + lineText;
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

  if (options.groupBy === 'file') {
    const docToFile = new Map<ExtractedDocs, string>();

    for (const doc of docs) {
      let fileName = path.basename(doc.file, path.extname(doc.file));
      // Avoid conflict with the main index.md
      if (fileName === 'index') {
        fileName = 'index-module';
      }
      docToFile.set(doc, fileName);

      const markdown = generateFileMarkdown(doc, options);
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
      result[`${kind}s.md`] = generateCategoryMarkdown(kind, entries, options);
    }

    result['index.md'] = generateCategoryIndex(byKind);
  }

  return result;
}

function generateFileMarkdown(doc: ExtractedDocs, options: ResolvedDocsOptions): string {
  const fileName = path.basename(doc.file);
  let md = `# ${fileName}\n\n`;

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

  for (const entry of doc.entries) {
    md += generateEntryMarkdown(entry, options);
  }

  return md;
}

function generateEntryMarkdown(entry: DocEntry, options?: ResolvedDocsOptions): string {
  let md = `## ${entry.name}\n\n`;

  md += `\`${entry.kind}\`\n\n`;

  if (entry.description) {
    md += `${entry.description}\n\n`;
  }

  // Add source link if githubUrl is provided
  if (options?.githubUrl) {
    const sourceLink = generateSourceLink(entry.file, options.githubUrl, entry.line);
    if (sourceLink) {
      md += sourceLink + '\n\n';
    }
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
  options: ResolvedDocsOptions
): string {
  let md = `# ${kind.charAt(0).toUpperCase() + kind.slice(1)}s\n\n`;

  if (options.toc) {
    md += '## Table of Contents\n\n';
    for (const entry of entries) {
      md += `- [${entry.name}](#${entry.name.toLowerCase()})\n`;
    }
    md += '\n---\n\n';
  }

  for (const entry of entries) {
    md += generateEntryMarkdown(entry, options);
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
