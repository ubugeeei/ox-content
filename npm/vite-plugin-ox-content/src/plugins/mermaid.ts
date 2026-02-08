/**
 * Mermaid Plugin - Native Rust renderer via NAPI + mmdc CLI
 *
 * Renders mermaid code blocks to SVG using the mmdc CLI, orchestrated
 * from Rust via NAPI. HTML extraction and replacement are performed
 * in Rust; mermaid→SVG conversion uses mmdc (mermaid-cli) in parallel.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

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
    napiBindings = mod;
    return mod;
  } catch {
    napiBindings = null;
    return null;
  }
}

/** Cached mmdc path */
let cachedMmdcPath: string | null | undefined;

function resolveMmdcPath(): string | null {
  if (cachedMmdcPath !== undefined) return cachedMmdcPath;

  // 1. Resolve from the plugin's own node_modules/.bin/mmdc
  try {
    const thisDir = path.dirname(fileURLToPath(import.meta.url));
    const pluginRoot = path.resolve(thisDir, "..");
    const binPath = path.join(pluginRoot, "node_modules", ".bin", "mmdc");
    fs.accessSync(binPath);
    cachedMmdcPath = binPath;
    return cachedMmdcPath;
  } catch {
    // continue
  }

  // 2. Resolve from process.cwd() (project root)
  try {
    const binPath = path.join(process.cwd(), "node_modules", ".bin", "mmdc");
    fs.accessSync(binPath);
    cachedMmdcPath = binPath;
    return cachedMmdcPath;
  } catch {
    // continue
  }

  // 3. Fallback: try createRequire to locate the CLI script
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve(
      "@mermaid-js/mermaid-cli/package.json",
    );
    const cliPath = path.join(path.dirname(pkgPath), "src", "cli.js");
    fs.accessSync(cliPath);
    cachedMmdcPath = cliPath;
    return cachedMmdcPath;
  } catch {
    // continue
  }

  cachedMmdcPath = null;
  return null;
}

/**
 * Transforms mermaid code blocks in HTML to rendered SVG diagrams.
 * Uses the native Rust NAPI binding which calls mmdc CLI in parallel.
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
    console.warn(
      "[ox-content] @mermaid-js/mermaid-cli not found. Skipping mermaid rendering.",
    );
    return html;
  }

  const result = napi.transformMermaid(html, mmdcPath);

  for (const error of result.errors) {
    console.warn("[ox-content] Mermaid render error:", error);
  }

  return result.html;
}

/**
 * @deprecated No longer used. Mermaid rendering is now done at build time via NAPI.
 */
export const mermaidClientScript = "";
