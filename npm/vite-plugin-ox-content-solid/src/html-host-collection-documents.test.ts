import fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import solid from "@solidjs/vite-plugin";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, type Plugin, type ViteDevServer } from "vite";
import {
  SOLID_HTML_HOST_MODULES_VIRTUAL_ID,
  createSolidHtmlHostIslandRegistry,
  resolveSolidHtmlHostCollectionDocuments,
  resolveSolidHtmlHostIslandRegistry,
} from ".";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("Solid HTML host collection documents", () => {
  it("resolves configured flat and directory-index collection sources through host policy", async () => {
    const root = await createProject("ox-solid-collection-docs-");
    const oxContent = collectionOptions();
    const select = (
      document: { frontmatter: Record<string, unknown> },
      context: { command: string },
    ) => context.command === "serve" || document.frontmatter.published === true;

    const serveDocuments = await resolveSolidHtmlHostCollectionDocuments(
      { oxContent, select },
      { root, mode: "development", command: "serve" },
    );
    const buildDocuments = await resolveSolidHtmlHostCollectionDocuments(
      { oxContent, select },
      { root, mode: "production", command: "build" },
    );

    expect(relativeDocumentPaths(root, serveDocuments)).toEqual([
      "content/blog/draft.mdx",
      "content/blog/hidden.mdx",
      "content/blog/published.mdx",
      "content/docs/guide/index.mdx",
    ]);
    expect(relativeDocumentPaths(root, buildDocuments)).toEqual([
      "content/blog/published.mdx",
      "content/docs/guide/index.mdx",
    ]);
    expect(buildDocuments[0]?.source).toContain("import PublishedProbe");
    expect(buildDocuments[1]?.source).toContain("import { DirectoryProbe }");
  });

  it("builds the browser registry from selected configured collection documents only", async () => {
    const root = await createProject("ox-solid-collection-build-");
    const registry = createSolidHtmlHostIslandRegistry({
      root,
      oxContent: collectionOptions(),
      collectionDocuments: { select: selectedForBuild },
    });
    await fs.writeFile(
      path.join(root, "src", "client.ts"),
      [
        `import modules, { clientModules } from "${SOLID_HTML_HOST_MODULES_VIRTUAL_ID}";`,
        "globalThis.__oxModules = modules;",
        "globalThis.__oxClientModules = clientModules;",
      ].join("\n"),
    );

    await viteBuild({
      root,
      configFile: false,
      logLevel: "silent",
      plugins: [registry.plugin, solid({ compiler: "native" })],
      build: {
        outDir: "dist",
        emptyOutDir: true,
        minify: false,
        rollupOptions: { input: path.join(root, "src", "client.ts") },
      },
    });

    const resolved = await registry.resolve();
    const output = await readDist(root);
    expect(resolved.modules).toEqual([
      {
        name: "PublishedProbe",
        moduleId: "/content/blog/PublishedProbe.tsx",
        exportName: "default",
      },
      {
        name: "DirectoryProbe",
        moduleId: "/content/docs/guide/DirectoryProbe.tsx",
        exportName: "DirectoryProbe",
      },
    ]);
    expect(output).toContain("PUBLISHED_ISLAND_SENTINEL");
    expect(output).toContain("DIRECTORY_INDEX_SENTINEL");
    expect(output).not.toContain("DRAFT_ONLY_SENTINEL");
    expect(output).not.toContain("HIDDEN_ONLY_SENTINEL");
  });

  it("invalidates collection-derived island modules for source change, add and delete in dev", async () => {
    const root = await createProject("ox-solid-collection-dev-");
    const registry = createSolidHtmlHostIslandRegistry({
      root,
      oxContent: collectionOptions(),
      collectionDocuments: { select: selectedForBuild },
    });
    const plugin = registry.plugin as Plugin;
    await runConfig(plugin, "serve");
    await (plugin.configResolved as (config: unknown) => void | Promise<void>)({
      root,
      mode: "development",
    });

    const id = `\0${SOLID_HTML_HOST_MODULES_VIRTUAL_ID}`;
    const first = await loadVirtual(plugin, id);
    await writePublishedVariant(root, "ChangedProbe", "CHANGED_ISLAND_SENTINEL");
    await invalidate(plugin, root, "content/blog/published.mdx");
    const changed = await loadVirtual(plugin, id);
    await writeIsland(root, "content/blog/NewProbe.tsx", "NewProbe", "NEW_ISLAND_SENTINEL");
    await writeMdx(root, "content/blog/new.mdx", "NewProbe", "./NewProbe.tsx", true);
    await invalidate(plugin, root, "content/blog/new.mdx");
    const added = await loadVirtual(plugin, id);
    await fs.rm(path.join(root, "content", "blog", "new.mdx"));
    await invalidate(plugin, root, "content/blog/new.mdx");
    const deleted = await loadVirtual(plugin, id);

    expect(first).toContain("/content/blog/PublishedProbe.tsx");
    expect(changed).toContain("/content/blog/ChangedProbe.tsx");
    expect(changed).not.toContain("/content/blog/PublishedProbe.tsx");
    expect(added).toContain("/content/blog/NewProbe.tsx");
    expect(deleted).not.toContain("/content/blog/NewProbe.tsx");
  });

  it("keeps explicit documents supported beside collection documents", async () => {
    const root = await createProject("ox-solid-collection-explicit-");
    const result = await resolveSolidHtmlHostIslandRegistry(
      {
        oxContent: collectionOptions(),
        collectionDocuments: { select: selectedForBuild },
        documents: [
          {
            documentPath: path.join(root, "content", "extra.mdx"),
            source: "import ExtraProbe from './blog/ExtraProbe.tsx'\n<ExtraProbe />\n",
          },
        ],
      },
      { root, mode: "production", command: "build" },
    );

    expect(result.modules.map((module) => module.name).sort()).toEqual([
      "DirectoryProbe",
      "ExtraProbe",
      "PublishedProbe",
    ]);
  });
});

function collectionOptions() {
  return {
    srcDir: "content",
    embeds: { github: false, openGraph: false },
    collections: {
      blog: "blog/*.mdx",
      docs: "docs/**/index.mdx",
    },
  };
}

function selectedForBuild(
  document: { frontmatter: Record<string, unknown> },
  context: { command: string },
) {
  return context.command === "serve" || document.frontmatter.published === true;
}

async function createProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "content", "blog"), { recursive: true });
  await fs.mkdir(path.join(root, "content", "docs", "guide"), { recursive: true });
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await writeIsland(
    root,
    "content/blog/PublishedProbe.tsx",
    "PublishedProbe",
    "PUBLISHED_ISLAND_SENTINEL",
  );
  await writeIsland(root, "content/blog/DraftProbe.tsx", "DraftProbe", "DRAFT_ONLY_SENTINEL");
  await writeIsland(root, "content/blog/HiddenProbe.tsx", "HiddenProbe", "HIDDEN_ONLY_SENTINEL");
  await writeIsland(root, "content/blog/ExtraProbe.tsx", "ExtraProbe", "EXTRA_ISLAND_SENTINEL");
  await writeIsland(
    root,
    "content/docs/guide/DirectoryProbe.tsx",
    "DirectoryProbe",
    "DIRECTORY_INDEX_SENTINEL",
    true,
  );
  await writeMdx(
    root,
    "content/blog/published.mdx",
    "PublishedProbe",
    "./PublishedProbe.tsx",
    true,
  );
  await writeMdx(root, "content/blog/draft.mdx", "DraftProbe", "./DraftProbe.tsx", false);
  await writeMdx(root, "content/blog/hidden.mdx", "HiddenProbe", "./HiddenProbe.tsx", false);
  await fs.writeFile(
    path.join(root, "content", "docs", "guide", "index.mdx"),
    "---\ntitle: Guide\npublished: true\n---\nimport { DirectoryProbe } from './DirectoryProbe.tsx'\n<DirectoryProbe />\n",
  );
  return root;
}

async function writePublishedVariant(root: string, name: string, marker: string) {
  await writeIsland(root, `content/blog/${name}.tsx`, name, marker);
  await writeMdx(root, "content/blog/published.mdx", name, `./${name}.tsx`, true);
}

async function writeMdx(
  root: string,
  file: string,
  component: string,
  specifier: string,
  published: boolean,
) {
  await fs.writeFile(
    path.join(root, file),
    `---\ntitle: ${component}\npublished: ${published}\n---\nimport ${component} from '${specifier}'\n<${component} />\n`,
  );
}

async function writeIsland(
  root: string,
  file: string,
  name: string,
  marker: string,
  named = false,
) {
  const declaration = `${named ? "export " : "export default "}function ${name}() { console.log("${marker}"); return "${marker}"; }\n`;
  await fs.writeFile(path.join(root, file), declaration);
}

function relativeDocumentPaths(
  root: string,
  documents: readonly { documentPath: string }[],
): string[] {
  return documents.map((document) => path.relative(root, document.documentPath)).sort();
}

async function runConfig(plugin: Plugin, command: "build" | "serve") {
  await (plugin.config as (config: unknown, env: { command: typeof command }) => unknown)?.(
    {},
    { command },
  );
}

async function invalidate(plugin: Plugin, root: string, relative: string) {
  await (plugin.handleHotUpdate as (ctx: unknown) => Promise<unknown[]>)({
    file: path.join(root, relative),
    modules: [],
    server: {
      moduleGraph: {
        getModuleById: () => ({}),
        invalidateModule: () => {},
      },
      ws: { send: () => {} },
    } as unknown as ViteDevServer,
  } as never);
}

async function loadVirtual(plugin: Plugin, id: string): Promise<string> {
  const loaded = await (plugin.load as (id: string) => Promise<string>)(id);
  return String(loaded);
}

async function readDist(root: string): Promise<string> {
  const chunks: string[] = [];
  await collectFiles(path.join(root, "dist"), chunks);
  return chunks.join("\n");
}

async function collectFiles(dir: string, chunks: string[]): Promise<void> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(file, chunks);
    } else if (entry.isFile()) {
      chunks.push(await fs.readFile(file, "utf8"));
    }
  }
}
