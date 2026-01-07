/**
 * SSG (Static Site Generation) module for ox-content
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { transformMarkdown, generateOgImageSvg } from './transform';
import type { OgImageData, OgImageConfig } from './transform';
import type {
  ResolvedOptions,
  ResolvedSsgOptions,
  SsgOptions,
  TocEntry,
} from './types';

/**
 * Navigation item for SSG.
 */
export interface SsgNavItem {
  title: string;
  path: string;
  href: string;
  children?: SsgNavItem[];
}

/**
 * Page data for SSG.
 */
export interface SsgPageData {
  title: string;
  description?: string;
  content: string;
  toc: TocEntry[];
  frontmatter: Record<string, unknown>;
  path: string;
  href: string;
}

/**
 * Default HTML template for SSG pages with navigation.
 */
export const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}{{#siteName}} - {{siteName}}{{/siteName}}</title>
  {{#description}}<meta name="description" content="{{description}}">{{/description}}
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="{{title}}{{#siteName}} - {{siteName}}{{/siteName}}">
  {{#description}}<meta property="og:description" content="{{description}}">{{/description}}
  {{#ogImage}}<meta property="og:image" content="{{ogImage}}">{{/ogImage}}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{title}}{{#siteName}} - {{siteName}}{{/siteName}}">
  {{#description}}<meta name="twitter:description" content="{{description}}">{{/description}}
  {{#ogImage}}<meta name="twitter:image" content="{{ogImage}}">{{/ogImage}}
  <style>
    :root {
      --sidebar-width: 260px;
      --header-height: 60px;
      --max-content-width: 800px;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      --color-bg: #ffffff;
      --color-bg-alt: #f8f9fa;
      --color-text: #1a1a1a;
      --color-text-muted: #666666;
      --color-border: #e5e7eb;
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-code-bg: #1e293b;
      --color-code-text: #e2e8f0;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg: #0f172a;
        --color-bg-alt: #1e293b;
        --color-text: #e2e8f0;
        --color-text-muted: #94a3b8;
        --color-border: #334155;
        --color-primary: #60a5fa;
        --color-primary-hover: #93c5fd;
        --color-code-bg: #0f172a;
        --color-code-text: #e2e8f0;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      line-height: 1.7;
      color: var(--color-text);
      background: var(--color-bg);
    }
    a { color: var(--color-primary); text-decoration: none; }
    a:hover { color: var(--color-primary-hover); text-decoration: underline; }

    /* Header */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      z-index: 100;
    }
    .header-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }
    .header-title:hover { text-decoration: none; }

    /* Layout */
    .layout {
      display: flex;
      padding-top: var(--header-height);
      min-height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      top: var(--header-height);
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--color-bg-alt);
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
      padding: 1.5rem 1rem;
    }
    .nav-section { margin-bottom: 1.5rem; }
    .nav-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
      padding: 0 0.75rem;
    }
    .nav-list { list-style: none; }
    .nav-item { margin: 0.125rem 0; }
    .nav-link {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--color-text);
      font-size: 0.875rem;
      transition: background 0.15s;
    }
    .nav-link:hover {
      background: var(--color-border);
      text-decoration: none;
    }
    .nav-link.active {
      background: var(--color-primary);
      color: white;
    }

    /* Main content */
    .main {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: 2rem;
    }
    .content {
      max-width: var(--max-content-width);
      margin: 0 auto;
    }

    /* TOC (right sidebar) */
    .toc {
      position: fixed;
      top: calc(var(--header-height) + 2rem);
      right: 2rem;
      width: 200px;
      font-size: 0.8125rem;
    }
    .toc-title {
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--color-text-muted);
    }
    .toc-list { list-style: none; }
    .toc-item { margin: 0.375rem 0; }
    .toc-link {
      color: var(--color-text-muted);
      display: block;
      padding-left: calc((var(--depth, 1) - 1) * 0.75rem);
    }
    .toc-link:hover { color: var(--color-primary); }
    @media (max-width: 1200px) { .toc { display: none; } }

    /* Typography */
    .content h1 { font-size: 2.25rem; margin-bottom: 1rem; line-height: 1.2; }
    .content h2 { font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
    .content h3 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; }
    .content h4 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .content p { margin-bottom: 1rem; }
    .content ul, .content ol { margin: 1rem 0; padding-left: 1.5rem; }
    .content li { margin: 0.375rem 0; }
    .content blockquote {
      border-left: 4px solid var(--color-primary);
      padding: 0.5rem 1rem;
      margin: 1rem 0;
      background: var(--color-bg-alt);
      border-radius: 0 6px 6px 0;
    }
    .content code {
      font-family: var(--font-mono);
      font-size: 0.875em;
      background: var(--color-bg-alt);
      padding: 0.2em 0.4em;
      border-radius: 4px;
    }
    .content pre {
      background: var(--color-code-bg);
      color: var(--color-code-text);
      padding: 1rem 1.25rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      line-height: 1.5;
    }
    .content pre code {
      background: transparent;
      padding: 0;
      font-size: 0.8125rem;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.875rem;
    }
    .content th, .content td {
      border: 1px solid var(--color-border);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    .content th { background: var(--color-bg-alt); font-weight: 600; }
    .content img { max-width: 100%; height: auto; border-radius: 8px; }
    .content hr { border: none; border-top: 1px solid var(--color-border); margin: 2rem 0; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { margin-left: 0; }
    }
  </style>
</head>
<body>
  <header class="header">
    <a href="{{base}}index.html" class="header-title">{{siteName}}</a>
  </header>
  <div class="layout">
    <aside class="sidebar">
      <nav>
        <div class="nav-section">
          <div class="nav-title">Documentation</div>
          <ul class="nav-list">
{{navigation}}
          </ul>
        </div>
      </nav>
    </aside>
    <main class="main">
      <article class="content">
{{content}}
      </article>
    </main>
{{#hasToc}}
    <aside class="toc">
      <div class="toc-title">On this page</div>
      <ul class="toc-list">
{{toc}}
      </ul>
    </aside>
{{/hasToc}}
  </div>
</body>
</html>`;

/**
 * Bare HTML template (no navigation, no styles).
 */
export const BARE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
</head>
<body>
{{content}}
</body>
</html>`;

/**
 * Resolves SSG options with defaults.
 */
export function resolveSsgOptions(ssg: SsgOptions | boolean | undefined): ResolvedSsgOptions {
  if (ssg === false) {
    return {
      enabled: false,
      extension: '.html',
      clean: false,
      bare: false,
      generateOgImage: false,
    };
  }

  if (ssg === true || ssg === undefined) {
    return {
      enabled: true,
      extension: '.html',
      clean: false,
      bare: false,
      generateOgImage: false,
    };
  }

  return {
    enabled: ssg.enabled ?? true,
    extension: ssg.extension ?? '.html',
    clean: ssg.clean ?? false,
    bare: ssg.bare ?? false,
    siteName: ssg.siteName,
    ogImage: ssg.ogImage,
    generateOgImage: ssg.generateOgImage ?? false,
  };
}

/**
 * Simple mustache-like template rendering.
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;

  // Handle conditionals: {{#key}}content{{/key}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    return data[key] ? content : '';
  });

  // Handle simple replacements: {{key}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : '';
  });

  return result;
}

/**
 * Extracts title from content or frontmatter.
 */
function extractTitle(
  content: string,
  frontmatter: Record<string, unknown>
): string {
  if (frontmatter.title && typeof frontmatter.title === 'string') {
    return frontmatter.title;
  }

  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }

  return 'Untitled';
}

/**
 * Generates navigation HTML from nav items.
 */
function generateNavHtml(navItems: SsgNavItem[], currentPath: string): string {
  return navItems
    .map((item) => {
      const isActive = item.path === currentPath;
      const activeClass = isActive ? ' active' : '';
      return `            <li class="nav-item"><a href="${item.href}" class="nav-link${activeClass}">${item.title}</a></li>`;
    })
    .join('\n');
}

/**
 * Generates TOC HTML from toc entries.
 */
function generateTocHtml(toc: TocEntry[]): string {
  const flattenToc = (entries: TocEntry[], depth = 1): string[] => {
    const items: string[] = [];
    for (const entry of entries) {
      items.push(
        `        <li class="toc-item"><a href="#${entry.slug}" class="toc-link" style="--depth: ${depth}">${entry.text}</a></li>`
      );
      if (entry.children && entry.children.length > 0) {
        items.push(...flattenToc(entry.children, depth + 1));
      }
    }
    return items;
  };
  return flattenToc(toc).join('\n');
}

/**
 * Generates bare HTML page (no navigation, no styles).
 */
export function generateBareHtmlPage(
  content: string,
  title: string
): string {
  return renderTemplate(BARE_HTML_TEMPLATE, {
    title,
    content,
  });
}

/**
 * Generates HTML page with navigation.
 */
export function generateHtmlPage(
  pageData: SsgPageData,
  navItems: SsgNavItem[],
  siteName: string,
  base: string,
  ogImage?: string
): string {
  const navigationHtml = generateNavHtml(navItems, pageData.path);
  const tocHtml = generateTocHtml(pageData.toc);

  return renderTemplate(DEFAULT_HTML_TEMPLATE, {
    title: pageData.title,
    description: pageData.description,
    siteName,
    base,
    ogImage,
    content: pageData.content,
    navigation: navigationHtml,
    toc: tocHtml,
    hasToc: pageData.toc.length > 0,
  });
}

/**
 * Converts a markdown file path to its corresponding HTML output path.
 */
export function getOutputPath(
  inputPath: string,
  srcDir: string,
  outDir: string,
  extension: string
): string {
  const relativePath = path.relative(srcDir, inputPath);
  const baseName = relativePath.replace(/\.(?:md|markdown)$/i, extension);

  if (baseName.endsWith(`index${extension}`)) {
    return path.join(outDir, baseName);
  }

  const dirName = baseName.replace(new RegExp(`\\${extension}$`), '');
  return path.join(outDir, dirName, `index${extension}`);
}

/**
 * Converts a markdown file path to a relative URL path.
 */
function getUrlPath(inputPath: string, srcDir: string): string {
  const relativePath = path.relative(srcDir, inputPath);
  const baseName = relativePath.replace(/\.(?:md|markdown)$/i, '');

  if (baseName === 'index' || baseName.endsWith('/index')) {
    return baseName.replace(/\/?index$/, '') || '/';
  }

  return baseName;
}

/**
 * Converts a markdown file path to an href.
 */
function getHref(inputPath: string, srcDir: string, base: string, extension: string): string {
  const urlPath = getUrlPath(inputPath, srcDir);
  if (urlPath === '/' || urlPath === '') {
    return `${base}index${extension}`;
  }
  return `${base}${urlPath}/index${extension}`;
}

/**
 * Gets the OG image output path for a given markdown file.
 */
function getOgImagePath(inputPath: string, srcDir: string, outDir: string): string {
  const relativePath = path.relative(srcDir, inputPath);
  const baseName = relativePath.replace(/\.(?:md|markdown)$/i, '');

  if (baseName === 'index' || baseName.endsWith('/index')) {
    const dirPath = baseName.replace(/\/?index$/, '') || '';
    return path.join(outDir, dirPath, 'og-image.svg');
  }

  return path.join(outDir, baseName, 'og-image.svg');
}

/**
 * Gets the OG image URL for use in meta tags.
 */
function getOgImageUrl(inputPath: string, srcDir: string, base: string): string {
  const urlPath = getUrlPath(inputPath, srcDir);
  if (urlPath === '/' || urlPath === '') {
    return `${base}og-image.svg`;
  }
  return `${base}${urlPath}/og-image.svg`;
}

/**
 * Gets display title from file path.
 */
function getDisplayTitle(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));

  if (fileName === 'index') {
    const dirName = path.basename(path.dirname(filePath));
    if (dirName && dirName !== '.') {
      return formatTitle(dirName);
    }
    return 'Home';
  }

  return formatTitle(fileName);
}

/**
 * Formats a file/dir name as a title.
 */
function formatTitle(name: string): string {
  return name
    .replace(/[-_]([a-z])/g, (_, char) => ' ' + char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Collects all markdown files from the source directory.
 */
export async function collectMarkdownFiles(srcDir: string): Promise<string[]> {
  const pattern = path.join(srcDir, '**/*.{md,markdown}');
  const files = await glob(pattern, { nodir: true });
  return files.sort();
}

/**
 * Builds navigation items from markdown files.
 */
function buildNavItems(
  markdownFiles: string[],
  srcDir: string,
  base: string,
  extension: string
): SsgNavItem[] {
  return markdownFiles.map((file) => ({
    title: getDisplayTitle(file),
    path: getUrlPath(file, srcDir),
    href: getHref(file, srcDir, base, extension),
  }));
}

/**
 * Builds all markdown files to static HTML.
 */
export async function buildSsg(
  options: ResolvedOptions,
  root: string
): Promise<{ files: string[]; errors: string[] }> {
  const ssgOptions = options.ssg;
  if (!ssgOptions.enabled) {
    return { files: [], errors: [] };
  }

  const srcDir = path.resolve(root, options.srcDir);
  const outDir = path.resolve(root, options.outDir);
  const base = options.base.endsWith('/') ? options.base : options.base + '/';
  const generatedFiles: string[] = [];
  const errors: string[] = [];

  // Clean output directory if requested
  if (ssgOptions.clean) {
    try {
      await fs.rm(outDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  }

  // Collect markdown files
  const markdownFiles = await collectMarkdownFiles(srcDir);

  // Build navigation
  const navItems = buildNavItems(markdownFiles, srcDir, base, ssgOptions.extension);

  // Get site name from options or package.json
  let siteName = ssgOptions.siteName ?? 'Documentation';
  if (!ssgOptions.siteName) {
    try {
      const pkgPath = path.join(root, 'package.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
      if (pkg.name) {
        siteName = formatTitle(pkg.name);
      }
    } catch {
      // Use default
    }
  }

  // Process each file
  for (const inputPath of markdownFiles) {
    try {
      const content = await fs.readFile(inputPath, 'utf-8');
      // Pass SSG options to transform for .md -> .html link conversion in Rust
      const result = await transformMarkdown(content, inputPath, options, {
        convertMdLinks: true,
        baseUrl: base,
      });

      const title = extractTitle(result.html, result.frontmatter);
      const description = result.frontmatter.description as string | undefined;

      // Determine OG image URL for this page
      let pageOgImage = ssgOptions.ogImage; // fallback to static URL

      // Generate per-page OG image if enabled (uses Rust)
      if (ssgOptions.generateOgImage && !ssgOptions.bare) {
        const ogImageData: OgImageData = {
          title,
          description,
          siteName,
          author: result.frontmatter.author as string | undefined,
        };

        // Use OG image options from the main options if available
        const ogImageConfig: OgImageConfig | undefined = options.ogImageOptions
          ? {
              width: options.ogImageOptions.width,
              height: options.ogImageOptions.height,
              backgroundColor: options.ogImageOptions.background,
              textColor: options.ogImageOptions.textColor,
            }
          : undefined;

        const svg = await generateOgImageSvg(ogImageData, ogImageConfig);
        if (svg) {
          const ogImageOutputPath = getOgImagePath(inputPath, srcDir, outDir);
          await fs.mkdir(path.dirname(ogImageOutputPath), { recursive: true });
          await fs.writeFile(ogImageOutputPath, svg, 'utf-8');
          generatedFiles.push(ogImageOutputPath);

          // Use per-page OG image URL
          pageOgImage = getOgImageUrl(inputPath, srcDir, base);
        }
      }

      // Generate HTML based on bare option
      let html: string;
      if (ssgOptions.bare) {
        html = generateBareHtmlPage(result.html, title);
      } else {
        const pageData: SsgPageData = {
          title,
          description,
          content: result.html,
          toc: result.toc,
          frontmatter: result.frontmatter,
          path: getUrlPath(inputPath, srcDir),
          href: getHref(inputPath, srcDir, base, ssgOptions.extension),
        };
        html = generateHtmlPage(pageData, navItems, siteName, base, pageOgImage);
      }

      // Write output file
      const outputPath = getOutputPath(
        inputPath,
        srcDir,
        outDir,
        ssgOptions.extension
      );

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html, 'utf-8');

      generatedFiles.push(outputPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to process ${inputPath}: ${errorMessage}`);
    }
  }

  return { files: generatedFiles, errors };
}
