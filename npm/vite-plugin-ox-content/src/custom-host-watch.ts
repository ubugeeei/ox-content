import * as path from "node:path";
import type { OxContentCustomHostDependency } from "./custom-host-types";
import { canonicalFilePath, dependencyPath } from "./custom-host-utils";

export type NormalizedCustomHostDependencyKind = "file" | "directory" | "glob";

export interface NormalizedCustomHostDependency {
  kind: NormalizedCustomHostDependencyKind;
  path: string;
  pattern?: RegExp;
}

export function normalizeCustomHostDependencies(
  root: string,
  dependencies: readonly OxContentCustomHostDependency[] | undefined,
): NormalizedCustomHostDependency[] {
  const seen = new Set<string>();
  const result: NormalizedCustomHostDependency[] = [];
  for (const dependency of dependencies ?? []) {
    const rawPath = dependencyPath(dependency);
    if (!rawPath) {
      continue;
    }
    const kind = dependencyKind(dependency);
    const resolved = path.isAbsolute(rawPath) ? rawPath : path.resolve(root, rawPath);
    const normalized = kind === "file" ? canonicalFilePath(resolved) : normalizeFilePath(resolved);
    const key = `${kind}\0${normalized}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({
      kind,
      path: normalized,
      pattern: kind === "glob" ? globToRegExp(normalized) : undefined,
    });
  }
  return result;
}

export function exactDependencyKeys(
  dependencies: readonly NormalizedCustomHostDependency[],
): string[] {
  return dependencies
    .filter((dependency) => dependency.kind === "file")
    .map((dependency) => dependency.path);
}

export function broadDependencies(
  dependencies: readonly NormalizedCustomHostDependency[],
): NormalizedCustomHostDependency[] {
  return dependencies.filter((dependency) => dependency.kind !== "file");
}

export function dependencyWatchPaths(
  dependencies: readonly NormalizedCustomHostDependency[],
): string[] {
  return [
    ...new Set(
      dependencies.map(watchPathForDependency).filter((value): value is string => !!value),
    ),
  ];
}

export function matchesCustomHostDependency(
  dependency: NormalizedCustomHostDependency,
  changedFile: string,
): boolean {
  const changed = normalizeFilePath(changedFile);
  if (dependency.kind === "file") {
    return changed === normalizeFilePath(dependency.path);
  }
  if (dependency.kind === "directory") {
    return changed === dependency.path || isWithinDirectory(dependency.path, changed);
  }
  return dependency.pattern?.test(changed) ?? false;
}

export function anyCustomHostDependencyMatches(
  dependencies: readonly NormalizedCustomHostDependency[],
  changedFile: string,
): boolean {
  return dependencies.some((dependency) => matchesCustomHostDependency(dependency, changedFile));
}

function dependencyKind(
  dependency: OxContentCustomHostDependency,
): NormalizedCustomHostDependencyKind {
  if (typeof dependency !== "string" && dependency.kind) {
    return dependency.kind;
  }
  return hasGlobSyntax(dependencyPath(dependency)) ? "glob" : "file";
}

function watchPathForDependency(dependency: NormalizedCustomHostDependency): string | undefined {
  if (dependency.kind !== "glob") {
    return dependency.path;
  }
  const prefix = dependency.path.slice(0, firstGlobIndex(dependency.path));
  const directory = prefix.endsWith("/") ? prefix.slice(0, -1) : path.dirname(prefix);
  return directory || path.parse(dependency.path).root;
}

function globToRegExp(glob: string): RegExp {
  let source = "^";
  const normalized = normalizeFilePath(glob);
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    const next = normalized[index + 1];
    const afterNext = normalized[index + 2];
    if (character === "*" && next === "*" && afterNext === "/") {
      source += "(?:.*/)?";
      index += 2;
    } else if (character === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (character === "*") {
      source += "[^/]*";
    } else if (character === "?") {
      source += "[^/]";
    } else {
      source += escapeRegExp(character);
    }
  }
  return new RegExp(`${source}$`, "u");
}

function hasGlobSyntax(value: string): boolean {
  return /[*?[\]{}]/u.test(value);
}

function firstGlobIndex(value: string): number {
  const indexes = ["*", "?", "[", "{", "]", "}"]
    .map((character) => value.indexOf(character))
    .filter((index) => index >= 0);
  return indexes.length === 0 ? value.length : Math.min(...indexes);
}

function normalizeFilePath(file: string): string {
  return file.replace(/\\/g, "/");
}

function isWithinDirectory(directory: string, file: string): boolean {
  const relative = path.posix.relative(directory, file);
  return relative !== "" && !relative.startsWith("../") && relative !== "..";
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+*?.]/gu, "\\$&");
}
