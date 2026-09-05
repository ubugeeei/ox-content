import * as path from "node:path";
import { importNapiModuleSync } from "./napi";

interface NativeGitLastmodResult {
  path: string;
  lastUpdated: number;
}

interface NativeGitLastmodModule {
  getGitLastUpdated(filePath: string, root?: string | null): number | null;
  getGitLastUpdatedMany?(
    filePaths: readonly string[],
    root?: string | null,
  ): NativeGitLastmodResult[];
}

export interface GitLastmodPageInput {
  inputPath: string;
  lastUpdated?: number;
  lastUpdatedPaths?: readonly string[];
}

/**
 * Batched git last-commit times, keyed by normalized absolute source path.
 *
 * Directory paths resolve to the newest tracked descendant by Git pathspec
 * semantics. Missing paths, unavailable Git/NAPI, and root escapes are omitted.
 */
export function resolveGitLastmods(
  filePaths: readonly string[],
  root?: string,
): Map<string, number> {
  const normalized = normalizeGitLastmodPaths(filePaths, root);
  if (!root || normalized.length === 0) {
    return new Map();
  }

  try {
    const napi = importNapiModuleSync() as unknown as NativeGitLastmodModule;
    if (typeof napi.getGitLastUpdatedMany === "function") {
      return mapNativeResults(napi.getGitLastUpdatedMany(normalized, path.resolve(root)));
    }
    return normalized.length === 1
      ? resolveSingleWithLegacyNapi(napi, normalized[0]!, root)
      : new Map();
  } catch {
    return new Map();
  }
}

/**
 * Git last-commit time for `filePath` in milliseconds.
 *
 * Returns `undefined` when `root` is missing, the path escapes `root`, Git has
 * no matching history, or the NAPI/Git backend is unavailable.
 */
export function resolveGitLastmod(filePath: string, root?: string): number | undefined {
  const normalized = normalizeGitLastmodPath(filePath, root);
  return normalized ? resolveGitLastmods([normalized], root).get(normalized) : undefined;
}

export function resolvePageGitLastmods(
  pages: readonly GitLastmodPageInput[],
  root: string | undefined,
  enabled: boolean,
): Map<GitLastmodPageInput, number | undefined> {
  const planned = new Map<GitLastmodPageInput, number | undefined>();
  if (!enabled) {
    return planned;
  }

  const pageSources = new Map<GitLastmodPageInput, string[]>();
  const uniqueSources = new Set<string>();
  for (const page of pages) {
    if (page.lastUpdated != null) {
      planned.set(page, page.lastUpdated);
      continue;
    }
    const sources = normalizeGitLastmodPaths(
      [page.inputPath, ...(page.lastUpdatedPaths ?? [])],
      root,
    );
    pageSources.set(page, sources);
    for (const source of sources) {
      uniqueSources.add(source);
    }
  }

  const sourceLastmods = resolveGitLastmods([...uniqueSources], root);
  for (const [page, sources] of pageSources) {
    planned.set(page, newestSourceLastmod(sources, sourceLastmods));
  }
  return planned;
}

function normalizeGitLastmodPaths(
  filePaths: readonly string[],
  root: string | undefined,
): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const filePath of filePaths) {
    const source = normalizeGitLastmodPath(filePath, root);
    if (source && !seen.has(source)) {
      seen.add(source);
      normalized.push(source);
    }
  }
  return normalized;
}

function normalizeGitLastmodPath(filePath: string, root: string | undefined): string | undefined {
  if (!root || filePath.length === 0 || filePath.includes("\0")) {
    return undefined;
  }
  const rootPath = path.resolve(root);
  const sourcePath = path.resolve(rootPath, filePath);
  const relative = path.relative(rootPath, sourcePath);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return sourcePath;
  }
  return undefined;
}

function mapNativeResults(results: readonly NativeGitLastmodResult[]): Map<string, number> {
  const lastmods = new Map<string, number>();
  for (const result of results) {
    if (typeof result.path !== "string") {
      continue;
    }
    const value = result.lastUpdated;
    if (typeof value === "number" && Number.isFinite(value)) {
      lastmods.set(path.resolve(result.path), value);
    }
  }
  return lastmods;
}

function resolveSingleWithLegacyNapi(
  napi: NativeGitLastmodModule,
  filePath: string,
  root: string,
): Map<string, number> {
  const value = napi.getGitLastUpdated(filePath, path.resolve(root));
  return typeof value === "number" && Number.isFinite(value)
    ? new Map([[filePath, value]])
    : new Map();
}

function newestSourceLastmod(
  sources: readonly string[],
  lastmods: ReadonlyMap<string, number>,
): number | undefined {
  let newest: number | undefined;
  for (const source of sources) {
    const value = lastmods.get(source);
    if (value != null && (newest == null || value > newest)) {
      newest = value;
    }
  }
  return newest;
}
