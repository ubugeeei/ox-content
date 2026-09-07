import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const publicValues = [
  "resolveGitLastmods",
  "resolveSelfHostedAssetManifest",
  "writeSelfHostedAssets",
];
const publicTypes = [
  "OxContentAssetManifest",
  "OxContentAssetPreload",
  "SelfHostedAssetOptions",
  "SsgOutputPageInput",
  "WriteSelfHostedAssetsInput",
  "WriteSelfHostedAssetsResult",
];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tscBin = join("node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");
const virtualReference = '/// <reference path="./virtual.d.ts" />';
const virtualModules = [
  "virtual:ox-content/collections",
  "virtual:ox-content/assets.css",
  "virtual:ox-content/asset-manifest",
];

export function checkVitePluginDeclarations({ pkg, tarball, packDir, failures, readPackedFile }) {
  for (const extension of ["mts", "cts"]) {
    const declaration = readPackedFile(tarball, `dist/index.d.${extension}`);

    for (const name of [...publicValues, ...publicTypes]) {
      if (!new RegExp(`\\b${name}\\b`).test(declaration)) {
        failures.push(`${pkg.name} index.d.${extension} is missing ${name}`);
      }
    }

    if (!declaration.startsWith(virtualReference)) {
      failures.push(`${pkg.name} index.d.${extension} is missing ${virtualReference}`);
    }
  }

  const virtualDeclaration = readPackedFile(tarball, "dist/virtual.d.ts");
  for (const moduleId of virtualModules) {
    if (!virtualDeclaration.includes(`declare module "${moduleId}"`)) {
      failures.push(`${pkg.name} virtual.d.ts is missing ${moduleId}`);
    }
  }
  if (!virtualDeclaration.includes('import("@ox-content/vite-plugin").CollectionEntry')) {
    failures.push(`${pkg.name} virtual.d.ts does not reference public collection types`);
  }

  for (const mode of ["bundler", "nodenext", "node16"]) {
    checkVirtualCollectionsConsumer({ pkg, tarball, packDir, failures, mode });
  }
}

function checkVirtualCollectionsConsumer({ pkg, tarball, packDir, failures, mode }) {
  const consumerRoot = mkdtempSync(join(packDir, `vite-plugin-virtual-${mode}-`));
  const packageRoot = join(consumerRoot, "node_modules", "@ox-content", "vite-plugin");
  mkdirSync(packageRoot, { recursive: true });

  const extract = spawnSync("tar", ["-xzf", tarball, "-C", packageRoot, "--strip-components=1"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (extract.error) throw extract.error;
  if (extract.status !== 0) {
    throw new Error(extract.stderr || `Failed to extract ${pkg.name} into ${consumerRoot}`);
  }

  for (const dependency of [
    "@types/node",
    "@ox-content/napi",
    "glob",
    "rehype-parse",
    "rehype-stringify",
    "unified",
    "vite",
  ]) {
    linkPackageDependency(consumerRoot, "npm/vite-plugin-ox-content", dependency);
  }

  writeFileSync(join(consumerRoot, "package.json"), JSON.stringify({ type: "module" }));
  writeFileSync(join(consumerRoot, "collections-fixture.ts"), collectionsFixture());
  writeFileSync(join(consumerRoot, "collections-fixture.cts"), cjsCollectionsFixture());
  writeFileSync(join(consumerRoot, "tsconfig.json"), tsconfig(mode));

  const result = spawnSync(tscBin, ["-p", join(consumerRoot, "tsconfig.json")], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    failures.push(
      `${pkg.name} virtual collections ${mode} consumer failed:\n${result.stdout}${result.stderr}`,
    );
  }
}

function linkPackageDependency(consumerRoot, packageDir, dependency) {
  const source = resolve(root, packageDir, "node_modules", ...dependency.split("/"));
  if (!existsSync(source)) return;
  const target = join(consumerRoot, "node_modules", ...dependency.split("/"));
  mkdirSync(dirname(target), { recursive: true });
  try {
    symlinkSync(source, target, "junction");
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
  }
}

function collectionsFixture() {
  return [
    'import api, { collectionNames, collections, getCollection, queryCollection } from "virtual:ox-content/collections";',
    'import type { CollectionEntry, CollectionQueryBuilder } from "@ox-content/vite-plugin";',
    "",
    "interface PostEntry extends CollectionEntry {",
    "  title: string;",
    "  frontmatter: { draft?: boolean; rank: number };",
    "}",
    "",
    'const rows: CollectionEntry[] = collections.content ?? getCollection("content");',
    "const names: string[] = collectionNames;",
    'const builder: CollectionQueryBuilder<PostEntry> = queryCollection<PostEntry>("blog")',
    '  .path("/posts/hello")',
    '  .where("frontmatter.rank", ">=", 1);',
    'const selected = builder.select("title", "frontmatter");',
    "async function useTypedQuery(): Promise<number> {",
    "  const first = await selected.first();",
    "  return first?.frontmatter.rank ?? 0;",
    "}",
    "",
    "void api;",
    "void names;",
    "void rows;",
    "void useTypedQuery;",
  ].join("\n");
}

function cjsCollectionsFixture() {
  return [
    'import collectionsApi = require("virtual:ox-content/collections");',
    'type CollectionEntry = import("@ox-content/vite-plugin").CollectionEntry;',
    'type CollectionQueryBuilder<T extends CollectionEntry = CollectionEntry> = import("@ox-content/vite-plugin").CollectionQueryBuilder<T>;',
    "",
    "interface PostEntry extends CollectionEntry {",
    "  title: string;",
    "  frontmatter: { draft?: boolean; rank: number };",
    "}",
    "",
    "const names: string[] = collectionsApi.collectionNames;",
    'const builder: CollectionQueryBuilder<PostEntry> = collectionsApi.queryCollection<PostEntry>("blog");',
    "async function useTypedQuery(): Promise<boolean> {",
    '  const entries = await builder.where("frontmatter.draft", false).all();',
    "  return entries.some((entry) => entry.frontmatter.draft === false);",
    "}",
    "",
    "void collectionsApi.default;",
    "void names;",
    "void useTypedQuery;",
  ].join("\n");
}

function tsconfig(mode) {
  const compilerOptions =
    mode === "bundler"
      ? {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          lib: ["ES2022", "DOM"],
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          types: ["@ox-content/vite-plugin"],
        }
      : {
          target: "ES2022",
          module: mode === "nodenext" ? "NodeNext" : "Node16",
          moduleResolution: mode === "nodenext" ? "NodeNext" : "Node16",
          lib: ["ES2022", "DOM"],
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          types: ["@ox-content/vite-plugin"],
        };

  return JSON.stringify(
    {
      compilerOptions,
      files:
        mode === "bundler"
          ? ["collections-fixture.ts"]
          : ["collections-fixture.ts", "collections-fixture.cts"],
    },
    null,
    2,
  );
}
