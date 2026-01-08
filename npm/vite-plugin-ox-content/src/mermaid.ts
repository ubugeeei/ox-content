/**
 * Mermaid diagram support.
 *
 * Transforms mermaid code blocks into SVG diagrams.
 * Uses client-side rendering with a wrapper element.
 */

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import type { Root, Element } from 'hast';

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
 * Rehype plugin to transform mermaid code blocks.
 *
 * Replaces ```mermaid blocks with a wrapper element
 * that can be rendered client-side.
 */
function rehypeMermaid() {
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      if ('children' in node) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (child.type === 'element' && child.tagName === 'pre') {
            const codeElement = child.children.find(
              (c): c is Element => c.type === 'element' && c.tagName === 'code'
            );

            if (codeElement) {
              // Check if this is a mermaid code block
              const className = codeElement.properties?.className;
              let isMermaid = false;

              if (Array.isArray(className)) {
                isMermaid = className.some(
                  (c: string | number) => typeof c === 'string' && c.includes('mermaid')
                );
              }

              if (isMermaid) {
                const mermaidCode = getTextContent(codeElement);

                // Replace with mermaid wrapper
                const wrapper: Element = {
                  type: 'element',
                  tagName: 'div',
                  properties: {
                    className: ['ox-mermaid'],
                    'data-mermaid': mermaidCode,
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'pre',
                      properties: {
                        className: ['ox-mermaid-source'],
                      },
                      children: [
                        {
                          type: 'text',
                          value: mermaidCode,
                        },
                      ],
                    },
                  ],
                };

                node.children[i] = wrapper;
              }
            }
          } else if (child.type === 'element') {
            visit(child);
          }
        }
      }
    };

    visit(tree);
  };
}

/**
 * Transform mermaid code blocks in HTML.
 *
 * Creates wrapper elements that can be rendered client-side
 * by the mermaid runtime.
 */
export async function transformMermaid(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeMermaid)
    .use(rehypeStringify)
    .process(html);

  return String(result);
}

/**
 * Client-side mermaid initialization script.
 *
 * This script should be included in the page to render
 * mermaid diagrams.
 */
export const mermaidClientScript = `
<script type="module">
  import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#bd34fe',
      primaryTextColor: '#fff',
      primaryBorderColor: '#7c3aed',
      lineColor: '#41d1ff',
      secondaryColor: '#1a1a2e',
      tertiaryColor: '#161618',
    },
  });

  async function renderMermaidDiagrams() {
    const elements = document.querySelectorAll('.ox-mermaid');

    for (const el of elements) {
      const code = el.dataset.mermaid;
      if (!code) continue;

      try {
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 9);
        const { svg } = await mermaid.render(id, code);

        // Replace content with rendered SVG
        el.innerHTML = svg;
        el.classList.add('ox-mermaid-rendered');
      } catch (err) {
        console.error('Mermaid render error:', err);
        el.classList.add('ox-mermaid-error');
      }
    }
  }

  // Render on load and on HMR updates
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaidDiagrams);
  } else {
    renderMermaidDiagrams();
  }

  // Re-render on content updates (for SPA navigation)
  if (import.meta.hot) {
    import.meta.hot.on('ox-content:update', renderMermaidDiagrams);
  }
</script>
`;

/**
 * CSS styles for mermaid diagrams.
 */
export const mermaidStyles = `
<style>
  .ox-mermaid {
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--code-bg, #161618);
    border-radius: 8px;
    border: 1px solid var(--border-color, #2e2e32);
    overflow-x: auto;
  }

  .ox-mermaid-source {
    display: none;
  }

  .ox-mermaid-rendered .ox-mermaid-source {
    display: none;
  }

  .ox-mermaid svg {
    max-width: 100%;
    height: auto;
  }

  .ox-mermaid-error {
    color: #f87171;
    padding: 1rem;
  }

  .ox-mermaid-error .ox-mermaid-source {
    display: block;
  }
</style>
`;
