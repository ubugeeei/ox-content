import * as fs from "node:fs/promises";
import * as path from "node:path";
import { glob } from "glob";
import type { DocumentAssetManifest } from "./document-assets";
import {
  resolveBuildSsrStylesheetRecords,
  ssrStylesheetEntryName,
  writeSsrStylesheetArtifact,
} from "./custom-host-ssr-build-stylesheets";
import { resolveStaticDevSsrStylesheets } from "./custom-host-ssr-dev-stylesheets";
import {
  cleanModulePath,
  dynamicDiagnostic,
  fileFromModuleId,
  hasGlobSyntax,
  isLocalSpecifier,
  isSourceFile,
  isStyleFile,
  isWithinRoot,
  moduleIdCandidates,
  normalizeFilePath,
  outsideRootDiagnostic,
  parseImports,
  publicModuleId,
  unresolvedDiagnostic,
  unique,
} from "./custom-host-ssr-imports";
import {
  resolveCustomHostStylesheets,
  type CustomHostDevModuleGraph,
} from "./custom-host-stylesheets";
import type {
  OxContentCustomHostDependency,
  OxContentCustomHostSsrStylesheetDescriptor,
  OxContentCustomHostSsrStylesheetsInput,
  OxContentCustomHostSsrStylesheetsOptions,
  OxContentCustomHostSsrStylesheetsResult,
  OxContentCustomHostStylesheet,
  OxContentCustomHostStylesheetDiagnostic,
  OxContentCustomHostStylesheetsResult,
} from "./custom-host-types";

export interface CustomHostSsrStylesheetController {
  buildStart(context: CustomHostSsrRollupContext, root: string): Promise<void>;
  write(outDir: string): Promise<void>;
  resolve(input: ResolveCustomHostSsrStylesheetsInput): OxContentCustomHostSsrStylesheetsResult;
  dependencies(): OxContentCustomHostDependency[];
}

export interface CustomHostSsrRollupContext {
  resolve(
    id: string,
    importer?: string,
    options?: { skipSelf?: boolean },
  ): Promise<{ id: string; external?: boolean | "absolute" | "relative" } | null>;
  addWatchFile(id: string): void;
}

export interface ResolveCustomHostSsrStylesheetsInput extends OxContentCustomHostSsrStylesheetsInput {
  root?: string;
  manifest?: DocumentAssetManifest;
  moduleGraph?: CustomHostDevModuleGraph;
}

type CssRecord = {
  moduleId: string;
  file: string;
};

type RootRecord = {
  moduleId: string;
  file: string;
  entryName: string;
  css: CssRecord[];
  dependencies: string[];
  diagnostics: OxContentCustomHostStylesheetDiagnostic[];
  stylesheet?: OxContentCustomHostStylesheet;
};

export function createCustomHostSsrStylesheetController(
  options: false | OxContentCustomHostSsrStylesheetsOptions | undefined,
): CustomHostSsrStylesheetController {
  let buildRoot: string | undefined;
  let buildRecords: RootRecord[] = [];
  let records = new Map<string, RootRecord>();
  let configured = false;

  return {
    async buildStart(context, root) {
      buildRoot = root;
      buildRecords = [];
      records = new Map();
      configured = !!options && options.modules.length > 0;
      if (!configured) {
        return;
      }
      for (const moduleId of await expandConfiguredModules(options.modules, root)) {
        const record = await discoverRoot(context, moduleId, root);
        buildRecords.push(record);
        records.set(record.file, record);
        records.set(record.moduleId, record);
      }
    },
    async write(outDir) {
      for (const record of buildRecords) {
        record.stylesheet = await writeSsrStylesheetArtifact(record, outDir);
      }
    },
    resolve(input) {
      if (input.manifest || buildRoot) {
        return resolveBuild(input, records, configured, buildRoot);
      }
      if (input.moduleGraph) {
        return resolveDev(input);
      }
      return missingResolverResult(input.modules);
    },
    dependencies() {
      return (options?.modules ?? []).map((moduleId) => ({
        path: moduleId,
        kind: hasGlobSyntax(moduleId) ? "glob" : "file",
      }));
    },
  };
}

function resolveBuild(
  input: ResolveCustomHostSsrStylesheetsInput,
  records: Map<string, RootRecord>,
  configured: boolean,
  root: string | undefined,
): OxContentCustomHostSsrStylesheetsResult {
  if (!configured) {
    return missingResolverResult(input.modules);
  }
  const descriptors: OxContentCustomHostSsrStylesheetDescriptor[] = [];
  const styleRecords: { moduleId: string; stylesheet?: OxContentCustomHostStylesheet }[] = [];
  const diagnostics: OxContentCustomHostStylesheetDiagnostic[] = [];

  for (const moduleId of input.modules) {
    const record = findRecord(records, moduleId, root ?? input.root);
    if (!record) {
      diagnostics.push({
        code: "missing-module",
        moduleId,
        message: `SSR stylesheet module "${moduleId}" was not discovered during buildStart.`,
      });
      continue;
    }
    const buildRecord = { moduleId, stylesheet: record.stylesheet };
    styleRecords.push(buildRecord);
    diagnostics.push(...record.diagnostics);
    descriptors.push({
      moduleId,
      stylesheets: resolveBuildSsrStylesheetRecords({
        records: [buildRecord],
        base: input.base,
      }).stylesheets,
      dependencies: record.dependencies,
    });
  }

  const styles = resolveBuildSsrStylesheetRecords({
    records: styleRecords,
    base: input.base,
  });
  return mergeResult(styles, diagnostics, descriptors);
}

function resolveDev(
  input: ResolveCustomHostSsrStylesheetsInput,
): OxContentCustomHostSsrStylesheetsResult {
  const styles = resolveCustomHostStylesheets(input);
  if (styles.stylesheets.length === 0 && input.root) {
    const staticResult = resolveStaticDevSsrStylesheets({
      modules: input.modules,
      base: input.base,
      root: input.root,
    });
    if (staticResult) {
      return staticResult;
    }
  }
  const descriptors = input.modules.map((moduleId): OxContentCustomHostSsrStylesheetDescriptor => {
    const result = resolveCustomHostStylesheets({ ...input, modules: [moduleId] });
    return {
      moduleId,
      stylesheets: result.stylesheets,
      dependencies: result.dependencies,
    };
  });
  return { ...styles, descriptors };
}

function mergeResult(
  styles: OxContentCustomHostStylesheetsResult,
  diagnostics: OxContentCustomHostStylesheetDiagnostic[],
  descriptors: OxContentCustomHostSsrStylesheetDescriptor[],
): OxContentCustomHostSsrStylesheetsResult {
  return { ...styles, diagnostics: [...diagnostics, ...styles.diagnostics], descriptors };
}

function missingResolverResult(
  modules: readonly string[],
): OxContentCustomHostSsrStylesheetsResult {
  return {
    stylesheets: [],
    dependencies: [],
    descriptors: [],
    diagnostics: modules.map((moduleId) => ({
      code: "missing-resolver",
      moduleId,
      message:
        `SSR stylesheet discovery is not configured for "${moduleId}". ` +
        "Add custom-host ssrStylesheets.modules entries for production builds.",
    })),
  };
}

async function expandConfiguredModules(
  modules: readonly string[],
  root: string,
): Promise<string[]> {
  const expanded: string[] = [];
  for (const moduleId of modules) {
    if (!hasGlobSyntax(moduleId)) {
      expanded.push(moduleId);
      continue;
    }
    expanded.push(...(await glob(moduleId, { absolute: true, cwd: root, nodir: true })));
  }
  return unique(expanded);
}

async function discoverRoot(
  context: CustomHostSsrRollupContext,
  moduleId: string,
  root: string,
): Promise<RootRecord> {
  const resolved = await resolveModule(context, moduleId, undefined, root);
  const fallback = fileFromModuleId(moduleId, root) ?? path.resolve(root, moduleId);
  const file = resolved?.file ?? normalizeFilePath(fallback);
  const record: RootRecord = {
    moduleId: publicModuleId(file, root),
    file,
    entryName: ssrStylesheetEntryName(file, root),
    css: [],
    dependencies: [],
    diagnostics: resolved
      ? []
      : [
          {
            code: "missing-module",
            moduleId,
            message: `SSR stylesheet root "${moduleId}" could not be resolved.`,
          },
        ],
  };
  if (resolved) {
    await visitSource(context, resolved.file, root, record, new Set());
  }
  return record;
}

async function visitSource(
  context: CustomHostSsrRollupContext,
  file: string,
  root: string,
  record: RootRecord,
  seen: Set<string>,
): Promise<void> {
  const clean = normalizeFilePath(file);
  if (seen.has(clean)) {
    return;
  }
  seen.add(clean);
  record.dependencies.push(clean);
  context.addWatchFile(clean);

  const source = await fs.readFile(clean, "utf8");
  for (const item of parseImports(source)) {
    if (!isLocalSpecifier(item.specifier)) {
      continue;
    }
    if (item.dynamic) {
      record.diagnostics.push(dynamicDiagnostic(record.moduleId, item.specifier, clean));
      continue;
    }
    const resolved = await resolveModule(context, item.specifier, clean, root);
    if (resolved?.kind === "outside-root") {
      record.diagnostics.push(outsideRootDiagnostic(record.moduleId, item.specifier, clean));
      continue;
    }
    if (!resolved) {
      record.diagnostics.push(unresolvedDiagnostic(record.moduleId, item.specifier, clean));
      continue;
    }
    if (resolved.kind === "style") {
      record.dependencies.push(resolved.file);
      context.addWatchFile(resolved.file);
      record.css.push({ moduleId: resolved.file, file: resolved.file });
    } else {
      await visitSource(context, resolved.file, root, record, seen);
    }
  }
}

async function resolveModule(
  context: CustomHostSsrRollupContext,
  specifier: string,
  importer: string | undefined,
  root: string,
): Promise<{ file: string; kind: "outside-root" | "source" | "style" } | undefined> {
  const resolved = await context.resolve(specifier, importer, { skipSelf: true });
  const resolvedId = resolved?.id ?? specifier;
  const file = fileFromModuleId(resolvedId, root);
  const clean = cleanModulePath(resolvedId);
  if (!file && path.isAbsolute(clean) && isStyleFile(clean)) {
    return { file: normalizeFilePath(clean), kind: "outside-root" };
  }
  if (!file || !isWithinRoot(file, root) || !(await fileExists(file))) {
    return undefined;
  }
  if (isStyleFile(file)) {
    return { file, kind: "style" };
  }
  return isSourceFile(file) ? { file, kind: "source" } : undefined;
}

async function fileExists(file: string): Promise<boolean> {
  try {
    return (await fs.stat(file)).isFile();
  } catch {
    return false;
  }
}

function findRecord(
  records: Map<string, RootRecord>,
  moduleId: string,
  root: string | undefined,
): RootRecord | undefined {
  for (const candidate of moduleIdCandidates(moduleId, root)) {
    const record = records.get(candidate);
    if (record) {
      return record;
    }
  }
  return undefined;
}
