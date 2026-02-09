/**
 * Mermaid Plugin - Native Rust renderer via NAPI
 *
 * Renders mermaid code blocks to SVG using the native Rust renderer
 * via NAPI. Delegates to the NAPI `transformMermaid` function which
 * extracts mermaid code blocks from HTML and renders them using mmdc.
 */

import { createRequire } from "node:module";

export interface MermaidOptions {
  /** Mermaid theme. Default: "neutral" */
  theme?: "default" | "dark" | "forest" | "neutral" | "base";
}

/** Cached NAPI bindings */
let napiBindings: {
  transformMermaid: (
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
    const binding = (mod.default ?? mod) as unknown as NonNullable<
      typeof napiBindings
    >;
    if (typeof binding.transformMermaid !== "function") {
      napiBindings = null;
      return null;
    }
    napiBindings = binding;
    return binding;
  } catch {
    napiBindings = null;
    return null;
  }
}

let cachedMmdcPath: string | null | undefined;

function resolveMmdcPath(): string | null {
  if (cachedMmdcPath !== undefined) return cachedMmdcPath;
  try {
    const require = createRequire(import.meta.url);
    cachedMmdcPath = require.resolve("@mermaid-js/mermaid-cli/src/cli.js");
    return cachedMmdcPath;
  } catch {
    cachedMmdcPath = null;
    return null;
  }
}

/**
 * Transforms mermaid code blocks in HTML to rendered SVG diagrams.
 * Uses the native Rust NAPI transformMermaid function.
 */
export async function transformMermaidStatic(
  html: string,
  _options?: MermaidOptions,
): Promise<string> {
  const napi = await loadNapi();
  if (!napi) {
    return html;
  }

  const mmdcPath = resolveMmdcPath();
  if (!mmdcPath) {
    console.warn("[ox-content] mmdc not found, skipping mermaid rendering");
    return html;
  }

  try {
    const result = napi.transformMermaid(html, mmdcPath);
    for (const error of result.errors) {
      console.warn("[ox-content] Mermaid render error:", error);
    }
    return result.html;
  } catch (err) {
    console.warn("[ox-content] Mermaid transform error:", err);
    return html;
  }
}

/**
 * @deprecated No longer used. Mermaid rendering is now done at build time via NAPI.
 */
export const mermaidClientScript = "";
