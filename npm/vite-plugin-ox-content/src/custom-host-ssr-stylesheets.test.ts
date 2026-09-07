import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost } from ".";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host SSR stylesheets", () => {
  it("emits route-specific SSR styles without browser-bundling server modules", async () => {
    const root = await createProject("ox-custom-host-ssr-style-build-");

    await viteBuild(viteConfig(root));

    const home = await fs.readFile(path.join(root, "dist", "home", "index.html"), "utf8");
    const work = await fs.readFile(path.join(root, "dist", "work", "index.html"), "utf8");
    expect(markers(home)).toEqual(
      expect.arrayContaining(["src-layout", "src-pages-home-page", "island"]),
    );
    expect(markers(home)).not.toContain("src-pages-work-page");
    expect(markers(work)).toEqual(
      expect.arrayContaining(["src-layout", "src-pages-work-page", "island"]),
    );
    expect(markers(work)).not.toContain("src-pages-home-page");
    expect(home).toMatch(/href="\/docs\/assets\/src-layout-[^"]+\.css"/u);
    expect(home).toMatch(/href="\/docs\/assets\/src-pages-home-page-[^"]+\.css"/u);
    expect(home.indexOf('rel="stylesheet"')).toBeLessThan(home.indexOf('<script type="module"'));
    expect(home).not.toContain("server-only");

    const homeCss = await readLinkedCss(root, home);
    expect(homeCss).toContain(".layout");
    expect(homeCss).toContain(".nested");
    expect(homeCss).toContain(".home");
    expect(homeCss).not.toContain(".work");
    const workCss = await readLinkedCss(root, work);
    expect(workCss).toContain(".work");
    expect(workCss).not.toContain(".home");

    const scripts = await readDistJs(root);
    expect(scripts).not.toContain("server-only");
  });

  it("serves blocking dev styles and invalidates nested import changes", async () => {
    const root = await createProject("ox-custom-host-ssr-style-dev-");
    const server = await trackDevServer(createServer(viteConfig(root, { reloadDebounceMs: 1 })));
    const listener = await listen(server);

    const home = await read(listener.port, "/docs/home");
    expect(home.text).toContain('data-render="1"');
    expect(home.text).toContain('href="/docs/src/layout.css"');
    expect(home.text).toContain('href="/docs/src/components/nested.css"');
    expect(home.text).toContain('href="/docs/src/pages/home/home.css"');
    expect(home.text).not.toContain('href="/docs/src/pages/work/work.css"');
    expect(home.text.indexOf('href="/docs/src/layout.css"')).toBeLessThan(
      home.text.indexOf('src="/docs/src/main.ts"'),
    );

    const nested = path.join(root, "src", "components", "Nested.ts");
    await fs.writeFile(
      nested,
      'import "./nested.css";\nimport "./nested-extra.css";\nexport const nested = "nested";\n',
    );
    await fs.writeFile(path.join(root, "src", "components", "nested-extra.css"), ".extra{}\n");
    server.watcher.emit("change", nested);
    await wait(30);

    const updated = await read(listener.port, "/docs/home");
    expect(updated.text).toContain('data-render="2"');
    expect(updated.text).toContain('href="/docs/src/components/nested-extra.css"');
  });

  it("reports unsupported local dynamic SSR imports", async () => {
    const root = await createProject("ox-custom-host-ssr-style-diagnostic-");
    await fs.writeFile(
      path.join(root, "src", "pages", "home", "page.ts"),
      'import("./late.css");\nimport "./home.css";\nexport const marker = "home server-only";\n',
    );
    await fs.writeFile(path.join(root, "src", "pages", "home", "late.css"), ".late{}\n");

    await viteBuild(viteConfig(root));

    const home = await fs.readFile(path.join(root, "dist", "home", "index.html"), "utf8");
    expect(home).toContain('data-diagnostics="unsupported-import"');
    expect(await readLinkedCss(root, home)).not.toContain(".late");
  });
});

function viteConfig(root: string, dev: { reloadDebounceMs?: number } = {}): InlineConfig {
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

async function createProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "src", "components"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "pages", "home"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "pages", "work"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "islands"), { recursive: true });
  await fs.mkdir(path.join(root, "content"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await writeSourceFiles(root);
  await fs.writeFile(path.join(root, "src", "host.ts"), hostModuleSource());
  return root;
}

async function writeSourceFiles(root: string): Promise<void> {
  await fs.writeFile(path.join(root, "src", "main.ts"), "document.body.dataset.client='ready';\n");
  await fs.writeFile(
    path.join(root, "src", "layout.ts"),
    'import "./layout.css";\nimport { nested } from "./components/Nested.ts";\nexport function layout(body) { return `<div class="layout ${nested}">${body}</div>`; }\n',
  );
  await fs.writeFile(
    path.join(root, "src", "components", "Nested.ts"),
    'import "./nested.css";\nexport const nested = "nested";\n',
  );
  await fs.writeFile(
    path.join(root, "src", "pages", "home", "page.ts"),
    'import "./home.css";\nexport const marker = "home server-only";\n',
  );
  await fs.writeFile(
    path.join(root, "src", "pages", "work", "page.ts"),
    'import "./work.css";\nexport const marker = "work server-only";\n',
  );
  await fs.writeFile(
    path.join(root, "src", "islands", "client.ts"),
    'import "./island.css";\nexport const hydrate = true;\n',
  );
  await fs.writeFile(path.join(root, "src", "layout.css"), ".layout{}\n");
  await fs.writeFile(path.join(root, "src", "components", "nested.css"), ".nested{}\n");
  await fs.writeFile(path.join(root, "src", "pages", "home", "home.css"), ".home{}\n");
  await fs.writeFile(path.join(root, "src", "pages", "work", "work.css"), ".work{}\n");
  await fs.writeFile(path.join(root, "src", "islands", "island.css"), ".island{}\n");
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
      const assets = ctx.assets.document({
        islandStyles: [...ssr.stylesheets, ...island.stylesheets],
        clientEntries: ["src/main.ts"],
      });
      return {
        html: "<!doctype html><html><head>" + assets.headHtml + "</head><body data-render=\\"" + renders + "\\" data-diagnostics=\\"" + diagnostics + "\\"><div class=\\"layout nested\\"><main>" + route.marker + "</main></div></body></html>",
        dependencies: [...ssr.dependencies, ...island.dependencies],
      };
    },
  })),
};
`;
}

function markers(html: string): string[] {
  return [...html.matchAll(/assets\/([a-z-]+)-[^"]+\.css/gu)].map((match) => match[1]);
}

async function readLinkedCss(root: string, html: string): Promise<string> {
  const files = [...html.matchAll(/href="\/docs\/([^"]+\.css)"/gu)].map((match) =>
    path.join(root, "dist", match[1]),
  );
  return (await Promise.all(files.map((file) => fs.readFile(file, "utf8")))).join("\n");
}

async function readDistJs(root: string): Promise<string> {
  return readDist(root, ".js");
}

async function readDist(root: string, extension: string): Promise<string> {
  const assetDir = path.join(root, "dist", "assets");
  const files = (await fs.readdir(assetDir)).filter((file) => file.endsWith(extension));
  return (
    await Promise.all(files.map((file) => fs.readFile(path.join(assetDir, file), "utf8")))
  ).join("\n");
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
