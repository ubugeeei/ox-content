/**
 * Mermaid Plugin - Native Rust renderer via NAPI
 *
 * Renders mermaid code blocks to SVG using the native Rust renderer
 * via NAPI. Delegates to the NAPI `transformMermaid` function which
 * extracts mermaid code blocks from HTML and renders them using mmdc.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

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

  // 1. Check node_modules/.bin/mmdc relative to cwd (works in pnpm monorepos)
  const binPath = join(process.cwd(), "node_modules", ".bin", "mmdc");
  if (existsSync(binPath)) {
    cachedMmdcPath = binPath;
    return cachedMmdcPath;
  }

  // 2. Check if mmdc is on PATH (pnpm adds node_modules/.bin to PATH)
  try {
    const resolved = execSync("which mmdc", { encoding: "utf-8" }).trim();
    if (resolved) {
      cachedMmdcPath = resolved;
      return cachedMmdcPath;
    }
  } catch {
    // not on PATH
  }

  cachedMmdcPath = null;
  return null;
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
