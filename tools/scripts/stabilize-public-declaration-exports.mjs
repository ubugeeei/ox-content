#!/usr/bin/env node

import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publicDeclarationEntries } from "./public-declaration-contracts.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const requested = new Set(process.argv.slice(2));
const entries = requested.size
  ? publicDeclarationEntries.filter((entry) =>
      [entry.packageName, entry.specifier, entry.distBase].some((key) => requested.has(key)),
    )
  : publicDeclarationEntries;

if (entries.length === 0) {
  throw new Error(`No public declaration entry matched: ${[...requested].join(", ")}`);
}

for (const entry of entries) {
  for (const extension of ["mts", "cts"]) {
    const declarationFile = join(
      root,
      entry.packageDir,
      "dist",
      `${entry.distBase}.d.${extension}`,
    );
    const declaration = await readFile(declarationFile, "utf8");
    const stableDeclaration = stabilizeDeclaration(declaration, entry, extension);
    const outputBase = entry.publicDistBase ?? entry.distBase;
    const outputFile = join(root, entry.packageDir, "dist", `${outputBase}.d.${extension}`);
    await writeFile(outputFile, stableDeclaration);
    await rm(`${outputFile}.map`, { force: true });
  }
}

function stabilizeDeclaration(declaration, entry, extension) {
  const expectedNames = [...entry.values, ...entry.types];
  for (const name of expectedNames) {
    if (!new RegExp(`\\b${escapeRegExp(name)}\\b`).test(declaration)) {
      throw new Error(`${entry.specifier} declaration is missing ${name}`);
    }
  }

  const exportStart = declaration.lastIndexOf("export {");
  if (exportStart === -1) {
    throw new Error(`${entry.specifier} declaration is missing a final export block`);
  }

  if (entry.publicDistBase && entry.publicDistBase !== entry.distBase) {
    return stableFacadeDeclaration(declaration.slice(exportStart), entry, extension);
  }

  return [
    declaration.slice(0, exportStart).trimEnd(),
    `export { ${entry.values.join(", ")} };`,
    `export type { ${entry.types.join(", ")} };`,
    "",
  ].join("\n");
}

function stableFacadeDeclaration(exportBlock, entry, extension) {
  const exportedNames = parseExportedNames(exportBlock);
  const source = `./${entry.distBase}.${extension === "cts" ? "cjs" : "mjs"}`;
  const values = entry.values.map((name) => exportSpecifier(exportedNames, name));
  const types = entry.types.map((name) => exportSpecifier(exportedNames, name));

  return [
    `export { ${values.join(", ")} } from "${source}";`,
    `export type { ${types.join(", ")} } from "${source}";`,
    "",
  ].join("\n");
}

function parseExportedNames(exportBlock) {
  const exports = new Map();
  const bodyStart = exportBlock.indexOf("{");
  const bodyEnd = exportBlock.indexOf("}", bodyStart);
  if (bodyStart === -1 || bodyEnd === -1) {
    throw new Error("Declaration export block is malformed");
  }

  for (const specifier of exportBlock.slice(bodyStart + 1, bodyEnd).split(",")) {
    const trimmed = specifier.trim();
    if (!trimmed) continue;
    const alias = /^(?<local>[$A-Z_a-z][$\w]*)\s+as\s+(?<exported>[$A-Z_a-z][$\w]*)$/.exec(trimmed);
    if (alias?.groups) {
      exports.set(alias.groups.local, alias.groups.exported);
      continue;
    }
    exports.set(trimmed, trimmed);
  }

  return exports;
}

function exportSpecifier(exportedNames, publicName) {
  const exported = exportedNames.get(publicName);
  if (!exported) {
    throw new Error(`Declaration export block is missing ${publicName}`);
  }
  return exported === publicName ? publicName : `${exported} as ${publicName}`;
}

function escapeRegExp(value) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}
