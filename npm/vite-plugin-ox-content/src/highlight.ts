/**
 * Syntax highlighting with Shiki via rehype.
 */

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import type { Root, Element } from 'hast';
import { createHighlighter, type Highlighter, type BundledTheme } from 'shiki';

// Cached highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create the Shiki highlighter.
 */
async function getHighlighter(theme: string): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme as BundledTheme],
      langs: [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'vue',
        'svelte',
        'html',
        'css',
        'scss',
        'json',
        'yaml',
        'markdown',
        'bash',
        'shell',
        'rust',
        'python',
        'go',
        'java',
        'c',
        'cpp',
        'sql',
        'graphql',
        'diff',
        'toml',
      ],
    });
  }
  return highlighterPromise;
}

/**
 * Rehype plugin for syntax highlighting with Shiki.
 */
function rehypeShikiHighlight(options: { theme: string }) {
  const { theme } = options;

  return async (tree: Root) => {
    const highlighter = await getHighlighter(theme);

    // Find all pre > code elements
    const visit = async (node: Root | Element) => {
      if ('children' in node) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (child.type === 'element' && child.tagName === 'pre') {
            const codeElement = child.children.find(
              (c): c is Element => c.type === 'element' && c.tagName === 'code'
            );

            if (codeElement) {
              // Extract language from class
              const className = codeElement.properties?.className;
              let lang = 'text';

              if (Array.isArray(className)) {
                const langClass = className.find(
                  (c: string | number) => typeof c === 'string' && c.startsWith('language-')
                );
                if (langClass && typeof langClass === 'string') {
                  lang = langClass.replace('language-', '');
                }
              }

              // Get code text
              const codeText = getTextContent(codeElement);

              // Highlight with Shiki
              try {
                const highlighted = highlighter.codeToHtml(codeText, {
                  lang: lang as any,
                  theme: theme as BundledTheme,
                });

                // Parse the highlighted HTML and replace the pre element
                const parsed = unified()
                  .use(rehypeParse, { fragment: true })
                  .parse(highlighted);

                // Replace the pre element with the highlighted one
                if (parsed.children[0]) {
                  node.children[i] = parsed.children[0] as Element;
                }
              } catch {
                // If highlighting fails, keep the original
              }
            }
          } else if (child.type === 'element') {
            await visit(child);
          }
        }
      }
    };

    await visit(tree);
  };
}

/**
 * Extract text content from a hast node.
 */
function getTextContent(node: Element | Root): string {
  let text = '';

  if ('children' in node) {
    for (const child of node.children) {
      if (child.type === 'text') {
        text += child.value;
      } else if (child.type === 'element') {
        text += getTextContent(child);
      }
    }
  }

  return text;
}

/**
 * Apply syntax highlighting to HTML using Shiki.
 */
export async function highlightCode(
  html: string,
  theme: string = 'github-dark'
): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeShikiHighlight, { theme })
    .use(rehypeStringify)
    .process(html);

  return String(result);
}
