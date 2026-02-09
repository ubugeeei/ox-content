/**
 * Mermaid Plugin - Native Rust renderer via NAPI
 *
 * Renders mermaid code blocks to SVG using the native Rust renderer
 * via NAPI. Extracts mermaid code blocks from HTML, renders each to SVG,
 * and replaces them with rendered output.
 */

export interface MermaidOptions {
  /** Mermaid theme. Default: "neutral" */
  theme?: "default" | "dark" | "forest" | "neutral" | "base";
}

/** Cached NAPI bindings */
let napiBindings: {
  renderMermaid: (
    code: string,
    options: Record<string, unknown>,
  ) => { svg: string; error?: string };
  transformMermaid?: (
    html: string,
    mmdcPath: string,
  ) => { html: string; errors: string[] };
} | null = null;

let napiLoadAttempted = false;

async function loadNapi() {
  if (napiLoadAttempted) return napiBindings;
  napiLoadAttempted = true;
  try {
    const mod = await import("@ox-content/napi");
    // CJS-to-ESM interop: native functions are on mod.default
    const binding = (mod.default ?? mod) as typeof napiBindings;
    napiBindings = binding;
    return binding;
  } catch {
    napiBindings = null;
    return null;
  }
}

/** Decode HTML entities in mermaid source extracted from code blocks */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x3C;/gi, "<")
    .replace(/&#x3E;/gi, ">")
    .replace(/&#x22;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#60;/g, "<")
    .replace(/&#62;/g, ">")
    .replace(/&#34;/g, '"');
}

/** Post-process mermaid SVG: transparent bg and unique IDs */
function postprocessSvg(svg: string, id: number): string {
  const uniqueId = `ox-mermaid-${id}`;
  return svg
    .replace(/background-color:\s*white;/g, "background-color: transparent;")
    .replace(/my-svg/g, uniqueId);
}

interface MermaidBlock {
  start: number;
  end: number;
  source: string;
}

/** Extract mermaid code blocks from HTML */
function extractMermaidBlocks(html: string): MermaidBlock[] {
  const open = '<pre><code class="language-mermaid">';
  const close = "</code></pre>";
  const blocks: MermaidBlock[] = [];
  let cursor = 0;

  while (true) {
    const relStart = html.indexOf(open, cursor);
    if (relStart === -1) break;

    const contentStart = relStart + open.length;
    const relEnd = html.indexOf(close, contentStart);
    if (relEnd === -1) break;

    const raw = html.slice(contentStart, relEnd);
    blocks.push({
      start: relStart,
      end: relEnd + close.length,
      source: decodeHtmlEntities(raw),
    });
    cursor = relEnd + close.length;
  }

  return blocks;
}

let diagramCounter = 0;

/**
 * Transforms mermaid code blocks in HTML to rendered SVG diagrams.
 * Uses the native Rust NAPI renderMermaid function.
 */
export async function transformMermaidStatic(
  html: string,
  _options?: MermaidOptions,
): Promise<string> {
  const napi = await loadNapi();
  if (!napi) {
    return html;
  }

  // Extract mermaid blocks from HTML
  const blocks = extractMermaidBlocks(html);
  if (blocks.length === 0) {
    return html;
  }

  // Render each block and replace in reverse order to preserve positions
  let result = html;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    try {
      const rendered = napi.renderMermaid(block.source, {});
      if (rendered.error) {
        console.warn("[ox-content] Mermaid render error:", rendered.error);
        continue;
      }
      const svg = postprocessSvg(rendered.svg, diagramCounter++);
      const replacement = `<div class="ox-mermaid">${svg}</div>`;
      result = result.slice(0, block.start) + replacement + result.slice(block.end);
    } catch (err) {
      console.warn("[ox-content] Mermaid render error:", err);
    }
  }

  return result;
}

/**
 * @deprecated No longer used. Mermaid rendering is now done at build time via NAPI.
 */
export const mermaidClientScript = "";
