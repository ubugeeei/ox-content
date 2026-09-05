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
  const normalized = normalizeFilePath(glob);
  return new RegExp(`^${globToRegExpSource(normalized)}$`, "u");
}

function globToRegExpSource(input: string): string {
  let source = "";
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];
    const afterNext = input[index + 2];
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
    } else if (character === "[") {
      const end = findCharacterClassEnd(input, index + 1);
      const characterClass =
        end > index ? characterClassToRegExpSource(input.slice(index + 1, end)) : undefined;
      if (characterClass) {
        source += characterClass;
        index = end;
      } else {
        source += escapeRegExp(character);
      }
    } else if (character === "{") {
      const end = findBraceEnd(input, index + 1);
      const alternatives = end > index ? splitBraceAlternatives(input.slice(index + 1, end)) : [];
      if (alternatives.length > 1) {
        source += `(?:${alternatives.map(globToRegExpSource).join("|")})`;
        index = end;
      } else {
        source += escapeRegExp(character);
      }
    } else {
      source += escapeRegExp(character);
    }
  }
  return source;
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

function findCharacterClassEnd(input: string, start: number): number {
  for (let index = start; index < input.length; index += 1) {
    if (input[index] === "]" && index > start) {
      return index;
    }
  }
  return -1;
}

function characterClassToRegExpSource(input: string): string | undefined {
  if (input.length === 0 || input.includes("/")) {
    return undefined;
  }
  const negated = input[0] === "!" || input[0] === "^";
  const body = negated ? input.slice(1) : input;
  if (body.length === 0) {
    return undefined;
  }
  const escaped = body.replace(/\\/gu, "\\\\").replace(/\]/gu, "\\]").replace(/\[/gu, "\\[");
  return `[${negated ? "^" : ""}${escaped}]`;
}

function findBraceEnd(input: string, start: number): number {
  let depth = 0;
  for (let index = start; index < input.length; index += 1) {
    const character = input[index];
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      if (depth === 0) {
        return index;
      }
      depth -= 1;
    }
  }
  return -1;
}

function splitBraceAlternatives(input: string): string[] {
  const alternatives: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
    } else if (character === "," && depth === 0) {
      alternatives.push(input.slice(start, index));
      start = index + 1;
    }
  }
  alternatives.push(input.slice(start));
  return alternatives;
}

function isWithinDirectory(directory: string, file: string): boolean {
  const relative = path.posix.relative(directory, file);
  return relative !== "" && !relative.startsWith("../") && relative !== "..";
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+*?.]/gu, "\\$&");
}
