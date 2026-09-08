import * as path from "node:path";
import { normalizeFilePath, publicModuleId } from "./custom-host-ssr-imports";
import type {
  OxContentCustomHostStylesheet,
  OxContentCustomHostStylesheetsResult,
} from "./custom-host-types";
import { withBase } from "./custom-host-utils";

const VIRTUAL_SSR_STYLESHEET_PREFIX = "\0ox-content:custom-host-ssr-stylesheet:";

export type SsrStylesheetBuildRecord = {
  moduleId: string;
  stylesheet?: OxContentCustomHostStylesheet;
};

export type WritableSsrStylesheetBuildRecord = SsrStylesheetBuildRecord & {
  entryName: string;
  css: readonly { file: string }[];
  referenceId?: string;
};

export type SsrStylesheetOutputBundle = Record<string, SsrStylesheetBundleEntry>;

type SsrStylesheetBundleEntry =
  | {
      type: "asset";
      fileName?: string;
    }
  | {
      type: "chunk";
      fileName?: string;
      viteMetadata?: { importedCss?: Set<string> | string[] };
    };

export function resolveBuildSsrStylesheetRecords(input: {
  records: readonly SsrStylesheetBuildRecord[];
  base?: string;
}): OxContentCustomHostStylesheetsResult {
  const stylesheets: OxContentCustomHostStylesheet[] = [];
  const seen = new Set<string>();

  for (const record of input.records) {
    if (!record.stylesheet) {
      continue;
    }
    const stylesheet = {
      ...record.stylesheet,
      href: withBase(input.base ?? "/", record.stylesheet.href),
    };
    if (!seen.has(stylesheet.href)) {
      seen.add(stylesheet.href);
      stylesheets.push(stylesheet);
    }
  }

  return { stylesheets, diagnostics: [], dependencies: [] };
}

export function ssrStylesheetEntryName(file: string, root: string): string {
  return path.posix
    .relative(normalizeFilePath(root), normalizeFilePath(file))
    .replace(/\.[^.]+$/u, "")
    .replace(/[^a-z0-9_/-]+/giu, "-")
    .replace(/\//gu, "-");
}

export function ssrStylesheetVirtualId(entryName: string): string {
  return `${VIRTUAL_SSR_STYLESHEET_PREFIX}${entryName}.js`;
}

export function isSsrStylesheetVirtualId(id: string): boolean {
  return id.startsWith(VIRTUAL_SSR_STYLESHEET_PREFIX);
}

export function ssrStylesheetVirtualCss(
  record: { css: readonly { file: string }[] },
  root: string,
): string {
  return `${record.css
    .map((stylesheet, index) => stylesheetImport(stylesheet.file, root, index))
    .join("\n")}\n`;
}

function stylesheetImport(file: string, root: string, index: number): string {
  const moduleId = JSON.stringify(publicModuleId(file, root));
  if (isCssModuleFile(file)) {
    const binding = `__oxContentSsrCssModule${index}`;
    return `import ${binding} from ${moduleId};\nexport const ${binding}ClassNames = Object.values(${binding});`;
  }
  return `import ${moduleId};`;
}

function isCssModuleFile(file: string): boolean {
  return /\.module\.css(?:[?#].*)?$/u.test(file);
}

export function resolveSsrStylesheetBundleOutput(
  record: WritableSsrStylesheetBuildRecord,
  bundle: SsrStylesheetOutputBundle,
  getFileName: (referenceId: string) => string,
): OxContentCustomHostStylesheet | undefined {
  if (record.css.length === 0) {
    return undefined;
  }
  if (!record.referenceId) {
    return undefined;
  }
  const outputPath = cssOutputPath(bundle, getFileName(record.referenceId), record.entryName);
  if (!outputPath) {
    return undefined;
  }
  return {
    kind: "style",
    href: `/${outputPath}`,
    moduleId: record.moduleId,
    outputPath,
  };
}

function cssOutputPath(
  bundle: SsrStylesheetOutputBundle,
  fileName: string,
  entryName: string,
): string | undefined {
  const entry = bundle[fileName];
  if (entry?.type === "asset" && fileName.endsWith(".css")) {
    return fileName;
  }
  if (entry?.type === "chunk") {
    const importedCss = viteImportedCss(entry);
    if (importedCss[0]) {
      return importedCss[0];
    }
  }
  return findNamedCssAsset(bundle, entryName);
}

function findNamedCssAsset(
  bundle: SsrStylesheetOutputBundle,
  entryName: string,
): string | undefined {
  const prefix = `assets/${entryName}-`;
  for (const [fileName, entry] of Object.entries(bundle)) {
    if (entry.type === "asset" && fileName.startsWith(prefix) && fileName.endsWith(".css")) {
      return fileName;
    }
  }
  return undefined;
}

function viteImportedCss(chunk: Extract<SsrStylesheetBundleEntry, { type: "chunk" }>): string[] {
  const importedCss = chunk.viteMetadata?.importedCss;
  return importedCss ? Array.from(importedCss) : [];
}
