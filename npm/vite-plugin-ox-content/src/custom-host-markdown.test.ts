import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost } from ".";
import type { CustomHostDevModuleNode } from "./custom-host-stylesheets";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host Markdown renderer", () => {
  it("renders configured Markdown and MDX through dev and build host contexts", async () => {
    const root = await createProject("ox-custom-host-markdown-");

    const server = await trackDevServer(createServer(viteConfig(root, { reloadDebounceMs: 1 })));
    installClientModuleGraph(server, root);
    const listener = await listen(server);

    const firstMdx = await read(listener.port, "/mdx");
    expect(firstMdx.status, firstMdx.text).toBe(200);
    expect(firstMdx.text).toContain('data-renderer-state="initial"');
    expect(firstMdx.text).toContain('data-render-count="1"');
    expect(firstMdx.text).toContain('data-imports="./LocalWidget.tsx"');
    expect(firstMdx.text).toContain('data-components="LocalWidget"');
    expect(firstMdx.text).toContain('href="../plain/index.html"');
    expect(firstMdx.text).toContain('href="/docs/src/client.css"');
    expect(firstMdx.text).toContain('aria-label="Copy code"');
    expect(firstMdx.text).not.toContain("missing-module");

    const cachedMdx = await read(listener.port, "/mdx");
    expect(cachedMdx.text).toContain('data-render-count="1"');

    const statePath = path.join(root, "src", "renderer-state.ts");
    await fs.writeFile(statePath, 'export const state = "updated";\n');
    server.watcher.emit("change", statePath);
    await wait(30);

    const updatedMdx = await read(listener.port, "/mdx");
    expect(updatedMdx.text).toContain('data-renderer-state="updated"');
    expect(updatedMdx.text).toContain('data-render-count="2"');

    const plain = await read(listener.port, "/plain");
    expect(plain.status).toBe(200);
    expect(plain.text).toContain('<h1 id="plain">Plain</h1>');
    expect(plain.text).toContain('data-imports=""');
    expect(plain.text).toContain("youtube");

    await viteBuild(viteConfig(root));

    const builtMdx = await fs.readFile(path.join(root, "dist", "mdx", "index.html"), "utf8");
    const builtPlain = await fs.readFile(path.join(root, "dist", "plain", "index.html"), "utf8");
    expect(builtMdx).toContain('data-renderer-state="updated"');
    expect(builtMdx).toMatch(/href="\/docs\/assets\/client-[^"]+\.css"/u);
    expect(builtMdx).toContain('data-imports="./LocalWidget.tsx"');
    expect(builtPlain).toContain('<h1 id="plain">Plain</h1>');
  });
});

function viteConfig(root: string, dev: { reloadDebounceMs?: number } = {}): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      ...oxContentCustomHost({
        host: "./src/host.ts",
        oxContent: {
          base: "/docs/",
          srcDir: "content",
          outDir: "dist",
          resources: false,
          docs: false,
          search: false,
          ogViewer: false,
          feeds: false,
          siteMaps: false,
          ssg: {
            routePrefix: "articles",
            siteUrl: "https://example.com",
            siteName: "Example",
            readerChrome: { copy: true, externalLinks: true, backToTop: false },
          },
        },
        dev,
      }),
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: {
          client: path.join(root, "src", "client.ts"),
        },
      },
    },
  };
}

async function createProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "content"), { recursive: true });
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await fs.writeFile(
    path.join(root, "content", "LocalWidget.tsx"),
    "export default function LocalWidget() {}\n",
  );
  await fs.writeFile(path.join(root, "content", "post.mdx"), mdxDocument());
  await fs.writeFile(path.join(root, "content", "plain.md"), plainDocument());
  await fs.writeFile(
    path.join(root, "src", "client.ts"),
    'import "./client.css";\nexport const clientModule = true;\n',
  );
  await fs.writeFile(path.join(root, "src", "client.css"), ".client{color:teal}\n");
  await fs.writeFile(
    path.join(root, "src", "renderer-state.ts"),
    'export const state = "initial";\n',
  );
  await fs.writeFile(path.join(root, "src", "framework-renderer.ts"), frameworkRendererModule());
  await fs.writeFile(path.join(root, "src", "host.ts"), hostModule());
  return root;
}

function mdxDocument(): string {
  return [
    "---",
    "title: MDX page",
    "---",
    "import LocalWidget from './LocalWidget.tsx'",
    "",
    "# MDX Page",
    "",
    "[Plain](./plain.md)",
    "",
    '<LocalWidget label="alpha" />',
    "",
    "```ts",
    "const value = 1;",
    "```",
  ].join("\n");
}

function plainDocument(): string {
  return ["# Plain", "", '<youtube id="dQw4w9WgXcQ"></youtube>'].join("\n");
}

function frameworkRendererModule(): string {
  return `
export async function render(markdown) {
  const state = await markdown.loadModule("/src/renderer-state.ts");
  return {
    html: markdown.html + '<span data-renderer-state="' + state.state + '"></span>',
    metadata: { clientModules: ["/src/client.ts"] },
  };
}
`;
}

function installClientModuleGraph(server: ViteDevServer, root: string): void {
  const graph = server.moduleGraph as unknown as {
    getModuleById(id: string): CustomHostDevModuleNode | undefined;
    getModulesByFile?(file: string): Set<CustomHostDevModuleNode> | undefined;
  };
  const clientCss = node("/src/client.css", [], path.join(root, "src", "client.css"));
  const client = node("/src/client.ts", [clientCss], path.join(root, "src", "client.ts"));
  const originalGetModuleById = graph.getModuleById.bind(graph);
  const originalGetModulesByFile = graph.getModulesByFile?.bind(graph);

  graph.getModuleById = (id: string) =>
    id === "/src/client.ts" ? client : originalGetModuleById(id);
  graph.getModulesByFile = (file: string) =>
    file === path.join(root, "src", "client.ts")
      ? new Set([client])
      : file === path.join(root, "src", "client.css")
        ? new Set([clientCss])
        : originalGetModulesByFile?.(file);
}

function node(
  url: string,
  imports: CustomHostDevModuleNode[] = [],
  file?: string,
): CustomHostDevModuleNode {
  return {
    id: url,
    url,
    file,
    importedModules: imports,
  };
}

function hostModule(): string {
  return `
import * as fs from "node:fs/promises";
import * as path from "node:path";

let renders = 0;
const pages = [
  { path: "/mdx", file: "post.mdx" },
  { path: "/plain", file: "plain.md" },
];

export default {
  routes: pages.map((page) => ({
    path: page.path,
    inputPath: "content/" + page.file,
    render: (ctx) => renderDocument(ctx, page.file),
  })),
};

async function renderDocument(ctx, file) {
  renders += 1;
  const documentPath = path.join(ctx.root, "content", file);
  const source = await fs.readFile(documentPath, "utf8");
  const rendered = await ctx.markdown.render({
    source,
    documentPath,
    async renderHtml(markdown) {
      const renderer = await markdown.loadModule("/src/framework-renderer.ts");
      return renderer.render(markdown);
    },
  });
  const clientModules = rendered.metadata?.clientModules ?? [];
  const styles = ctx.assets.stylesheets({ modules: clientModules });
  const assets = ctx.assets.document({
    islandStyles: styles.stylesheets,
    clientEntries: ["src/client.ts"],
  });
  return {
    html: [
      "<!doctype html><html><head>",
      assets.headHtml,
      "</head><body>",
      '<article class="client" data-file="' + file + '" data-render-count="' + renders + '" data-imports="' + rendered.imports.map((item) => item.source).join("|") + '" data-components="' + rendered.components.join("|") + '">',
      rendered.html,
      "</article>",
      '<p data-diagnostics="' + styles.diagnostics.map((diagnostic) => diagnostic.code).join(",") + '"></p>',
      "</body></html>",
    ].join(""),
    source,
    frontmatter: rendered.frontmatter,
    dependencies: [...rendered.dependencies, ...styles.dependencies],
  };
}
`;
}

async function trackDevServer(serverPromise: Promise<ViteDevServer>): Promise<ViteDevServer> {
  const server = await serverPromise;
  activeServers.push(server);
  return server;
}

async function listen(server: ViteDevServer): Promise<{ port: number }> {
  const listener = http.createServer(server.middlewares);
  activeListeners.push(listener);
  await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
  return { port: (listener.address() as AddressInfo).port };
}

async function read(port: number, requestPath: string) {
  const response = await fetch(`http://127.0.0.1:${port}${requestPath}`);
  return { status: response.status, headers: response.headers, text: await response.text() };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function closeHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
