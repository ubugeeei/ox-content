import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import type { InlineConfig, ViteDevServer } from "vite";
import { oxContentCustomHost } from ".";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

export async function cleanupCustomHostSsrFixtures(): Promise<void> {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
}

export function viteConfig(root: string, dev: { reloadDebounceMs?: number } = {}): InlineConfig {
  return {
    root,
    base: "/docs/",
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
        },
        ssrStylesheets: {
          modules: ["src/layout.ts", "src/pages/**/page.ts"],
        },
        build: { transformHtml: false },
        dev: { transformHtml: false, ...dev },
      }),
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      cssMinify: true,
      cssCodeSplit: true,
      manifest: true,
      rollupOptions: {
        input: {
          main: path.join(root, "src", "main.ts"),
          island: path.join(root, "src", "islands", "client.ts"),
        },
      },
    },
  };
}

export async function createProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "src", "components"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "styles"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "pages", "home"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "pages", "work"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "islands"), { recursive: true });
  await fs.mkdir(path.join(root, "content"), { recursive: true });
  await fs.mkdir(path.join(root, "node_modules", "@fixture", "styles"), { recursive: true });
  await writeProjectFile(root, "package.json", '{"type":"module"}\n');
  await writeProjectFile(
    root,
    "node_modules/@fixture/styles/package.json",
    '{"name":"@fixture/styles","exports":{"./package.css":"./package.css"}}\n',
  );
  await writeProjectFile(
    root,
    "node_modules/@fixture/styles/package.css",
    '.fixture-package{font-family:"fixture";src:url("./package.woff2")}\n',
  );
  await writeProjectFile(root, "node_modules/@fixture/styles/package.woff2", "fixture-font");
  await writeSourceFiles(root);
  await writeProjectFile(root, "src/host.ts", hostModuleSource());
  return root;
}

export function writeProjectFile(root: string, file: string, content: string): Promise<void> {
  return fs.writeFile(path.join(root, ...file.split("/")), content);
}

export async function readOutput(root: string, file: string): Promise<string> {
  return fs.readFile(path.join(root, "dist", ...file.split("/")), "utf8");
}

export function hasMarker(html: string, marker: string): boolean {
  return linkedCssPaths(html).some((href) =>
    href.replace(/^\/docs\/assets\//u, "").startsWith(marker),
  );
}

export async function readLinkedCss(root: string, html: string): Promise<string> {
  const files = linkedCssPaths(html).map((href) =>
    path.join(root, "dist", href.replace(/^\/docs\//u, "")),
  );
  return (await Promise.all(files.map((file) => fs.readFile(file, "utf8")))).join("\n");
}

export function resourcePaths(html: string, css: string): string[] {
  const resources = new Set<string>();
  for (const match of html.matchAll(/(?:href|src)="(\/docs\/[^"]+)"/gu)) {
    resources.add(match[1]);
  }
  for (const match of css.matchAll(/url\((?:'|")?(\/docs\/[^)'"]+)(?:'|")?\)/gu)) {
    resources.add(match[1]);
  }
  return [...resources];
}

export async function serveDist(root: string): Promise<{ port: number }> {
  const dist = path.join(root, "dist");
  const listener = http.createServer(async (req, res) => {
    const requestPath = new URL(req.url ?? "/", "http://localhost").pathname;
    const relative = requestPath.startsWith("/docs/")
      ? requestPath.slice("/docs/".length)
      : requestPath.replace(/^\/+/u, "");
    const file = path.resolve(dist, decodeURIComponent(relative));
    if (!file.startsWith(`${dist}${path.sep}`)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }
    try {
      res.statusCode = 200;
      res.end(await fs.readFile(file));
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  });
  activeListeners.push(listener);
  await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
  return { port: (listener.address() as AddressInfo).port };
}

export async function readDistJs(root: string): Promise<string> {
  return readDist(root, ".js");
}

export async function trackDevServer(
  serverPromise: Promise<ViteDevServer>,
): Promise<ViteDevServer> {
  const server = await serverPromise;
  activeServers.push(server);
  return server;
}

export async function listen(server: ViteDevServer): Promise<{ port: number }> {
  const listener = http.createServer(server.middlewares);
  activeListeners.push(listener);
  await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
  return { port: (listener.address() as AddressInfo).port };
}

export async function read(port: number, requestPath: string) {
  const response = await fetch(`http://127.0.0.1:${port}${requestPath}`);
  return { status: response.status, headers: response.headers, text: await response.text() };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeSourceFiles(root: string): Promise<void> {
  await writeProjectFile(root, "src/main.ts", "document.body.dataset.client='ready';\n");
  await writeProjectFile(
    root,
    "src/layout.ts",
    'import "./layout.css";\nimport { nested } from "./components/Nested.ts";\nexport function layout(body) { return `<div class="layout ${nested}">${body}</div>`; }\n',
  );
  await writeProjectFile(
    root,
    "src/components/Nested.ts",
    'import "./nested.css";\nexport const nested = "nested";\n',
  );
  await writeProjectFile(
    root,
    "src/pages/home/page.ts",
    'import "./home.css";\nexport const marker = "home server-only";\n',
  );
  await writeProjectFile(
    root,
    "src/pages/work/page.ts",
    'import "./work.css";\nexport const marker = "work server-only";\n',
  );
  await writeProjectFile(
    root,
    "src/islands/client.ts",
    'import "./island.css";\nexport const hydrate = true;\n',
  );
  await writeProjectFile(
    root,
    "src/layout.css",
    '@import "./styles/prose.css";\n@import "@fixture/styles/package.css";\n.layout{display:block}\n',
  );
  await writeProjectFile(
    root,
    "src/styles/prose.css",
    '@font-face{font-family:"prose";src:url("./prose.woff2") format("woff2")}.prose{line-height:1.6}\n',
  );
  await writeProjectFile(root, "src/styles/prose.woff2", "prose-font");
  await writeProjectFile(root, "src/components/nested.css", ".nested{padding:1px}\n");
  await writeProjectFile(
    root,
    "src/pages/home/home.css",
    '.home{color:green;background:url("./home.png")}\n',
  );
  await writeProjectFile(root, "src/pages/home/home.png", "home-image");
  await writeProjectFile(root, "src/pages/work/work.css", ".work{color:blue}\n");
  await writeProjectFile(root, "src/islands/island.css", ".island{color:purple}\n");
}

function hostModuleSource(): string {
  return `
let renders = 0;

const routes = [
  { path: "/home", moduleId: "/src/pages/home/page.ts", marker: "home" },
  { path: "/work", moduleId: "/src/pages/work/page.ts", marker: "work" },
];

export default {
  routes: routes.map((route) => ({
    path: route.path,
    async render(ctx) {
      renders += 1;
      const ssr = ctx.assets.ssrStylesheets({
        modules: ["/src/layout.ts", route.moduleId],
      });
      const island = ctx.assets.stylesheets({ modules: ["/src/islands/client.ts"] });
      const diagnostics = [...ssr.diagnostics, ...island.diagnostics]
        .map((diagnostic) => diagnostic.code)
        .join(",");
      const content = await ctx.assets.stylesheetContent({ stylesheets: ssr.stylesheets });
      const assets = ctx.assets.document({
        islandStyles: [...ssr.stylesheets, ...island.stylesheets],
        inlineStyles: content.stylesheets.map((stylesheet) => ({
          key: "critical:" + stylesheet.href,
          content: stylesheet.content,
          attrs: { "data-critical": stylesheet.href },
        })),
        clientEntries: ["src/main.ts"],
      });
      return {
        html: "<!doctype html><html><head>" + assets.headHtml + "</head><body data-render=\\"" + renders + "\\" data-diagnostics=\\"" + diagnostics + "\\" data-style-content-diagnostics=\\"" + content.diagnostics.map((diagnostic) => diagnostic.code).join(",") + "\\"><div class=\\"layout nested\\"><main>" + route.marker + "</main></div></body></html>",
        dependencies: [...ssr.dependencies, ...island.dependencies],
      };
    },
  })),
};
`;
}

function linkedCssPaths(html: string): string[] {
  return [...html.matchAll(/href="(\/docs\/[^"]+\.css)"/gu)].map((match) => match[1]);
}

async function readDist(root: string, extension: string): Promise<string> {
  const assetDir = path.join(root, "dist", "assets");
  const files = (await fs.readdir(assetDir)).filter((file) => file.endsWith(extension));
  return (
    await Promise.all(files.map((file) => fs.readFile(path.join(assetDir, file), "utf8")))
  ).join("\n");
}

function closeHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
