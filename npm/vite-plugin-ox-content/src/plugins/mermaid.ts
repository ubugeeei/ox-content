/**
 * Mermaid Plugin - SSG-time SVG generation
 *
 * Transforms <Mermaid> components and ```mermaid code blocks
 * into static SVG diagrams at build time (no client-side JS required).
 */

import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import type { Root, Element, Text } from "hast";

export interface MermaidOptions {
  /** Mermaid theme. Default: "default" */
  theme?: "default" | "dark" | "forest" | "neutral" | "base";
  /** Background color. Default: "transparent" */
  backgroundColor?: string;
  /** Custom theme variables */
  themeVariables?: Record<string, string>;
}

const defaultOptions: Required<MermaidOptions> = {
  theme: "default",
  backgroundColor: "transparent",
  themeVariables: {},
};

// Counter for unique diagram IDs
let diagramCounter = 0;

/**
 * Reset diagram counter (for testing).
 */
export function resetDiagramCounter(): void {
  diagramCounter = 0;
}

/**
 * Create a simple hash for diagram code.
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract text content from a hast node.
 */
function getTextContent(node: Element | Root): string {
  let text = "";
  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "text") {
        text += (child as Text).value;
      } else if (child.type === "element") {
        text += getTextContent(child as Element);
      }
    }
  }
  return text;
}

/**
 * Render mermaid diagram to SVG.
 * Uses mermaid's Node.js compatible rendering.
 */
export async function renderMermaidToSvg(code: string, options: Required<MermaidOptions>): Promise<string> {
  try {
    // Dynamic import to avoid issues in non-Node environments
    const mermaid = await import("mermaid");

    const id = `mermaid-${hashCode(code)}-${diagramCounter++}`;

    // Initialize mermaid with options
    mermaid.default.initialize({
      startOnLoad: false,
      theme: options.theme,
      themeVariables: options.themeVariables,
      securityLevel: "strict",
    });

    // Render the diagram
    const { svg } = await mermaid.default.render(id, code.trim());

    return svg;
  } catch (error) {
    console.warn("Mermaid render error:", error);
    // Return fallback with source code
    return `<pre class="ox-mermaid-source">${escapeHtml(code)}</pre>`;
  }
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Collect all mermaid diagrams from HTML for pre-rendering.
 */
export async function collectMermaidDiagrams(html: string): Promise<string[]> {
  const diagrams: string[] = [];

  // Match <Mermaid> components
  const componentPattern = /<mermaid[^>]*>([\s\S]*?)<\/mermaid>/gi;
  let match;
  while ((match = componentPattern.exec(html)) !== null) {
    diagrams.push(match[1].trim());
  }

  // Match ```mermaid code blocks (already transformed to pre/code elements)
  const codeBlockPattern = /<pre[^>]*>[\s\S]*?<code[^>]*class="[^"]*mermaid[^"]*"[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi;
  while ((match = codeBlockPattern.exec(html)) !== null) {
    // Decode HTML entities
    const code = match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');
    diagrams.push(code.trim());
  }

  return diagrams;
}

/**
 * Pre-render all mermaid diagrams.
 */
export async function prerenderMermaidDiagrams(
  diagrams: string[],
  options?: MermaidOptions,
): Promise<Map<string, string>> {
  const mergedOptions = { ...defaultOptions, ...options };
  const results = new Map<string, string>();

  for (const diagram of diagrams) {
    const svg = await renderMermaidToSvg(diagram, mergedOptions);
    results.set(diagram.trim(), svg);
  }

  return results;
}

/**
 * Create mermaid wrapper element with SVG.
 */
function createMermaidElement(svg: string, originalCode: string): Element {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: ["ox-mermaid"],
      "data-mermaid": originalCode,
    },
    children: [
      // SVG content (parsed as raw HTML)
      {
        type: "raw" as unknown as "text",
        value: svg,
      } as unknown as Text,
      // Fallback source (hidden by CSS)
      {
        type: "element",
        tagName: "pre",
        properties: { className: ["ox-mermaid-source"] },
        children: [{ type: "text", value: originalCode }],
      },
    ],
  };
}

/**
 * Rehype plugin to transform mermaid components and code blocks.
 */
function rehypeMermaid(svgMap: Map<string, string>) {
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      if ("children" in node) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (child.type === "element") {
            // Check for <Mermaid> component
            if (child.tagName.toLowerCase() === "mermaid") {
              const code = getTextContent(child).trim();
              const svg = svgMap.get(code);

              if (svg) {
                node.children[i] = createMermaidElement(svg, code);
              }
            }
            // Check for mermaid code block (pre > code.language-mermaid)
            else if (child.tagName === "pre") {
              const codeElement = child.children.find(
                (c): c is Element => c.type === "element" && c.tagName === "code",
              );

              if (codeElement) {
                const className = codeElement.properties?.className;
                let isMermaid = false;

                if (Array.isArray(className)) {
                  isMermaid = className.some(
                    (c: string | number) => typeof c === "string" && c.includes("mermaid"),
                  );
                }

                if (isMermaid) {
                  const code = getTextContent(codeElement).trim();
                  const svg = svgMap.get(code);

                  if (svg) {
                    node.children[i] = createMermaidElement(svg, code);
                  }
                }
              }
            } else {
              visit(child);
            }
          }
        }
      }
    };

    visit(tree);
  };
}

/**
 * Transform mermaid components in HTML to static SVG.
 */
export async function transformMermaidStatic(
  html: string,
  svgMap?: Map<string, string>,
  options?: MermaidOptions,
): Promise<string> {
  // If no pre-rendered SVGs, collect and render
  let map = svgMap;
  if (!map) {
    const diagrams = await collectMermaidDiagrams(html);
    map = await prerenderMermaidDiagrams(diagrams, options);
  }

  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeMermaid, map)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(html);

  return String(result);
}

/**
 * Client-side mermaid initialization script (fallback for dynamic content).
 * Only needed if you want to support client-side rendering for dynamic diagrams.
 */
export const mermaidClientScript = `
<script type="module">
  // Only initialize if there are un-rendered mermaid diagrams
  const unrendered = document.querySelectorAll('.ox-mermaid:not(:has(svg))');
  if (unrendered.length === 0) return;

  import('https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
    });

    unrendered.forEach(async (el) => {
      const code = el.dataset.mermaid;
      if (!code) return;

      try {
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 9);
        const { svg } = await mermaid.render(id, code);
        const source = el.querySelector('.ox-mermaid-source');
        if (source) source.insertAdjacentHTML('beforebegin', svg);
        el.classList.add('ox-mermaid-rendered');
      } catch (err) {
        console.error('Mermaid render error:', err);
        el.classList.add('ox-mermaid-error');
      }
    });
  });
</script>
`;
