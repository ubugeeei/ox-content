/**
 * Markdown transformation logic.
 *
 * Transforms Markdown source into JavaScript modules
 * that can be imported by the application.
 */

import type { ResolvedOptions, TransformResult, TocEntry } from './types';
import { highlightCode } from './highlight';
import { transformMermaid, mermaidClientScript, mermaidStyles } from './mermaid';

// NAPI bindings interface
interface NapiBindings {
  parseAndRender: (source: string, options?: { gfm?: boolean }) => { html: string; errors: string[] };
}

// Cached NAPI bindings
let napiBindings: NapiBindings | null | undefined;
let napiLoadAttempted = false;

/**
 * Lazily load NAPI bindings.
 */
async function loadNapiBindings(): Promise<NapiBindings | null> {
  if (napiLoadAttempted) {
    return napiBindings ?? null;
  }
  napiLoadAttempted = true;

  try {
    // Dynamic import to handle cases where NAPI isn't built
    const mod = await import('@ox-content/napi');
    napiBindings = mod;
    return mod;
  } catch {
    // NAPI not available, will use fallback
    napiBindings = null;
    return null;
  }
}

/**
 * Transforms Markdown content into a JavaScript module.
 *
 * The generated module exports:
 * - `html`: The rendered HTML string
 * - `frontmatter`: Parsed YAML frontmatter object
 * - `toc`: Table of contents array
 * - `render`: Function to render with custom options
 */
export async function transformMarkdown(
  source: string,
  filePath: string,
  options: ResolvedOptions
): Promise<TransformResult> {
  // Parse frontmatter
  const { content, frontmatter } = parseFrontmatter(source);

  // Generate table of contents
  const toc = options.toc ? generateToc(content, options.tocMaxDepth) : [];

  // Render HTML using NAPI bindings (Rust parser) if available
  let html = await renderToHtml(content, options);

  // Apply syntax highlighting if enabled
  if (options.highlight) {
    html = await highlightCode(html, options.highlightTheme);
  }

  // Transform mermaid diagrams if enabled
  if (options.mermaid) {
    html = await transformMermaid(html);
  }

  // Generate JavaScript module code
  const code = generateModuleCode(html, frontmatter, toc, filePath, options);

  return {
    code,
    html,
    frontmatter,
    toc,
  };
}

/**
 * Parses YAML frontmatter from Markdown content.
 */
function parseFrontmatter(source: string): {
  content: string;
  frontmatter: Record<string, unknown>;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = source.match(frontmatterRegex);

  if (!match) {
    return { content: source, frontmatter: {} };
  }

  const frontmatterStr = match[1];
  const content = source.slice(match[0].length);

  // Simple YAML parsing (in production, use a proper YAML parser)
  const frontmatter: Record<string, unknown> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // Parse basic types
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return { content, frontmatter };
}

/**
 * Generates table of contents from Markdown content.
 */
function generateToc(content: string, maxDepth: number): TocEntry[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const entries: TocEntry[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    if (depth > maxDepth) continue;

    const text = match[2].trim();
    const slug = slugify(text);

    entries.push({
      depth,
      text,
      slug,
      children: [],
    });
  }

  // Build nested structure
  return buildTocTree(entries);
}

/**
 * Builds nested TOC tree from flat list.
 */
function buildTocTree(entries: TocEntry[]): TocEntry[] {
  const root: TocEntry[] = [];
  const stack: TocEntry[] = [];

  for (const entry of entries) {
    // Pop stack until we find a parent with smaller depth
    while (stack.length > 0 && stack[stack.length - 1].depth >= entry.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(entry);
    } else {
      stack[stack.length - 1].children.push(entry);
    }

    stack.push(entry);
  }

  return root;
}

/**
 * Converts text to URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Renders Markdown content to HTML.
 *
 * Uses @ox-content/napi for high-performance Rust-based rendering.
 * Falls back to a basic regex implementation if NAPI is not available.
 */
async function renderToHtml(content: string, options: ResolvedOptions): Promise<string> {
  // Load and use NAPI bindings if available (Rust-based parser)
  const napi = await loadNapiBindings();
  if (napi) {
    const result = napi.parseAndRender(content, {
      gfm: options.gfm,
    });
    if (result.errors.length > 0) {
      console.warn('[ox-content] Parse warnings:', result.errors);
    }
    return result.html;
  }

  // Fallback: basic regex-based rendering (for development when NAPI not built)
  console.warn('[ox-content] NAPI bindings not available, using fallback renderer');
  let html = content;

  // Code blocks first (to prevent interference with other patterns)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `\n<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>\n`;
  });

  // Tables (GFM)
  html = html.replace(/^\|(.+)\|\r?\n\|[-:| ]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm, (_, header, body) => {
    const headerCells = header.split('|').map((c: string) => c.trim()).filter(Boolean);
    const headerRow = headerCells.map((c: string) => `<th>${c}</th>`).join('');

    const bodyRows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
      return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`;
    }).join('\n');

    return `<table>\n<thead><tr>${headerRow}</tr></thead>\n<tbody>\n${bodyRows}\n</tbody>\n</table>\n`;
  });

  // Headers with IDs for linking (h4, h3, h2, h1 in order)
  html = html.replace(/^#### (.+)$/gm, (_, text) => `<h4 id="${slugify(text)}">${text}</h4>`);
  html = html.replace(/^### (.+)$/gm, (_, text) => `<h3 id="${slugify(text)}">${text}</h3>`);
  html = html.replace(/^## (.+)$/gm, (_, text) => `<h2 id="${slugify(text)}">${text}</h2>`);
  html = html.replace(/^# (.+)$/gm, (_, text) => `<h1 id="${slugify(text)}">${text}</h1>`);

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Bold and italic (order matters)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Strikethrough (GFM)
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code (after code blocks to prevent interference)
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Links and images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Task lists (GFM)
  html = html.replace(/^(\s*)- \[x\] (.+)$/gm, '$1<li class="task-list-item"><input type="checkbox" checked disabled> $2</li>');
  html = html.replace(/^(\s*)- \[ \] (.+)$/gm, '$1<li class="task-list-item"><input type="checkbox" disabled> $2</li>');

  // Unordered lists
  html = html.replace(/^(\s*)- (.+)$/gm, '$1<li>$2</li>');

  // Ordered lists
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, '$1<li>$2</li>');

  // Wrap consecutive <li> elements in <ul> or <ol>
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, (match) => {
    // Check if it's a task list or regular list
    if (match.includes('task-list-item')) {
      return `<ul class="task-list">\n${match}</ul>\n`;
    }
    return `<ul>\n${match}</ul>\n`;
  });

  // Split into blocks and wrap paragraphs
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap if it's already a block element
    if (/^<(h[1-6]|p|div|ul|ol|li|table|thead|tbody|tr|th|td|pre|blockquote|hr|img)[\s>]/i.test(block)) {
      return block;
    }
    // Don't wrap if it ends with a block element
    if (/<\/(h[1-6]|p|div|ul|ol|table|pre|blockquote)>$/i.test(block)) {
      return block;
    }
    return `<p>${block}</p>`;
  }).join('\n\n');

  // Clean up extra line breaks within paragraphs
  html = html.replace(/<p>([\s\S]*?)<\/p>/g, (_, content) => {
    return `<p>${content.replace(/\n/g, '<br>')}</p>`;
  });

  return `<div class="ox-content">${html}</div>`;
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates the JavaScript module code.
 */
function generateModuleCode(
  html: string,
  frontmatter: Record<string, unknown>,
  toc: TocEntry[],
  filePath: string,
  _options: ResolvedOptions
): string {
  const htmlJson = JSON.stringify(html);
  const frontmatterJson = JSON.stringify(frontmatter);
  const tocJson = JSON.stringify(toc);

  return `
// Generated by vite-plugin-ox-content
// Source: ${filePath}

/**
 * Rendered HTML content.
 */
export const html = ${htmlJson};

/**
 * Parsed frontmatter.
 */
export const frontmatter = ${frontmatterJson};

/**
 * Table of contents.
 */
export const toc = ${tocJson};

/**
 * Default export with all data.
 */
export default {
  html,
  frontmatter,
  toc,
};

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // Trigger re-render with new content
      import.meta.hot.invalidate();
    }
  });
}
`;
}

/**
 * Extracts imports from Markdown content.
 *
 * Supports importing components for interactive islands.
 */
export function extractImports(content: string): string[] {
  const importRegex = /^import\s+.+\s+from\s+['"](.+)['"]/gm;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}
