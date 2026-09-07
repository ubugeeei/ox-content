import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { normalizeFilePath } from "./custom-host-ssr-imports";
import type {
  OxContentCustomHostStylesheet,
  OxContentCustomHostStylesheetsResult,
} from "./custom-host-types";
import { withBase } from "./custom-host-utils";

export type SsrStylesheetBuildRecord = {
  moduleId: string;
  stylesheet?: OxContentCustomHostStylesheet;
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

export async function writeSsrStylesheetArtifact(
  record: {
    moduleId: string;
    entryName: string;
    css: readonly { file: string }[];
  },
  outDir: string,
): Promise<OxContentCustomHostStylesheet | undefined> {
  if (record.css.length === 0) {
    return undefined;
  }
  const content = (
    await Promise.all(record.css.map((stylesheet) => fs.readFile(stylesheet.file, "utf8")))
  ).join("\n");
  const hash = createHash("sha256").update(content).digest("base64url").slice(0, 8);
  const outputPath = `assets/${record.entryName}-${hash}.css`;
  await fs.mkdir(path.join(outDir, "assets"), { recursive: true });
  await fs.writeFile(path.join(outDir, outputPath), content, "utf8");
  return {
    kind: "style",
    href: `/${outputPath}`,
    moduleId: record.moduleId,
    outputPath,
  };
}
