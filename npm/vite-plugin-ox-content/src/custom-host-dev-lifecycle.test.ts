import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost, planCollectionAssets, type OxContentCustomHostOptions } from ".";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host dev lifecycle", () => {
  it("serves, owns, replans, and writes collection assets", async () => {
    const root = await createCollectionAssetProject();
    const sourcePath = path.join(root, "content", "logo.txt");
    const firstManifest = await collectionManifest(root);
    const firstContentPath = firstManifest.assets[0]!.contentPath;
    const server = await trackDevServer(
      createServer(collectionAssetViteConfig(root, { reloadDebounceMs: 1 })),
    );
    const listener = await listen(server);

    expect(await text(listener.port, "/media/logo.txt")).toMatchObject({
      status: 200,
      text: "first",
    });
    expect(await text(listener.port, firstContentPath)).toMatchObject({
      status: 200,
      text: "first",
    });
    expect(await text(listener.port, "/assets/content/missing.txt")).toMatchObject({
      status: 404,
      text: "Not found",
    });

    await fs.writeFile(sourcePath, "second");
    server.watcher.emit("change", sourcePath);
    await wait(40);

    const secondManifest = await collectionManifest(root);
    const secondContentPath = secondManifest.assets[0]!.contentPath;
    expect(secondContentPath).not.toBe(firstContentPath);
    expect(await text(listener.port, "/media/logo.txt")).toMatchObject({
      status: 200,
      text: "second",
    });
    expect(await text(listener.port, secondContentPath)).toMatchObject({
      status: 200,
      text: "second",
    });
    expect(await text(listener.port, firstContentPath)).toMatchObject({ status: 404 });

    await viteBuild(collectionAssetViteConfig(root));

    await expect(fs.readFile(path.join(root, "dist", "media", "logo.txt"), "utf8")).resolves.toBe(
      "second",
    );
    await expect(
      fs.readFile(path.join(root, "dist", secondContentPath.slice(1)), "utf8"),
    ).resolves.toBe("second");
  });

  it("retries failed route catalogues and invalidates directory-planned routes", async () => {
    const root = await createRouteCatalogueProject();
    const gatePath = path.join(root, "content", "routes.txt");
    const pagesDir = path.join(root, "content", "pages");
    const server = await trackDevServer(
      createServer(routeCatalogueViteConfig(root, { reloadDebounceMs: 1 })),
    );
    const listener = await listen(server);

    expect((await text(listener.port, "/one")).status).toBe(500);

    await fs.writeFile(gatePath, "ok\n");
    server.watcher.emit("change", gatePath);
    await wait(20);
    expect(await text(listener.port, "/one")).toMatchObject({ status: 200, text: "one.txt" });

    const twoPath = path.join(pagesDir, "two.txt");
    await fs.writeFile(twoPath, "two\n");
    server.watcher.emit("add", twoPath);
    await wait(20);
    expect(await text(listener.port, "/two")).toMatchObject({ status: 200, text: "two.txt" });

    const onePath = path.join(pagesDir, "one.txt");
    await fs.rm(onePath);
    server.watcher.emit("unlink", onePath);
    await wait(20);
    expect((await text(listener.port, "/one")).status).toBe(404);
  });

  it("tracks loadModule dependencies without invalidating unrelated cached routes", async () => {
    const root = await createTrackedModuleProject();
    const sharedPath = path.join(root, "src", "shared.ts");
    const server = await trackDevServer(
      createServer(trackedModuleViteConfig(root, { reloadDebounceMs: 1 })),
    );
    const listener = await listen(server);

    expect(await text(listener.port, "/tracked")).toMatchObject({
      status: 200,
      text: "tracked:1:first",
    });
    expect(await text(listener.port, "/tracked")).toMatchObject({
      status: 200,
      text: "tracked:1:first",
    });
    expect(await text(listener.port, "/other")).toMatchObject({
      status: 200,
      text: "other:1",
    });

    await fs.writeFile(sharedPath, 'export const value = "second";\n');
    server.watcher.emit("change", sharedPath);
    await wait(20);

    expect(await text(listener.port, "/tracked")).toMatchObject({
      status: 200,
      text: "tracked:2:second",
    });
    expect(await text(listener.port, "/other")).toMatchObject({
      status: 200,
      text: "other:1",
    });
  });
});

async function createCollectionAssetProject(): Promise<string> {
  const root = await createBaseProject("ox-custom-host-assets-");
  await fs.writeFile(path.join(root, "content", "logo.txt"), "first");
  await fs.writeFile(
    path.join(root, "src", "host.ts"),
    'export default { routes: [{ path: "/", render: () => ({ html: "<h1>assets</h1>" }) }] };\n',
  );
  return root;
}

async function createRouteCatalogueProject(): Promise<string> {
  const root = await createBaseProject("ox-custom-host-routes-");
  await fs.mkdir(path.join(root, "content", "pages"), { recursive: true });
  await fs.writeFile(path.join(root, "content", "routes.txt"), "fail\n");
  await fs.writeFile(path.join(root, "content", "pages", "one.txt"), "one\n");
  await fs.writeFile(path.join(root, "src", "host.ts"), routeCatalogueHostSource());
  return root;
}

async function createTrackedModuleProject(): Promise<string> {
  const root = await createBaseProject("ox-custom-host-modules-");
  await fs.writeFile(path.join(root, "src", "shared.ts"), 'export const value = "first";\n');
  await fs.writeFile(path.join(root, "src", "host.ts"), trackedModuleHostSource());
  return root;
}

async function createBaseProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.mkdir(path.join(root, "content"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await fs.writeFile(path.join(root, "src", "main.ts"), "export {};\n");
  return root;
}

function collectionAssetViteConfig(
  root: string,
  dev: { reloadDebounceMs?: number } = {},
): InlineConfig {
  return customHostConfig(root, {
    dev,
    collectionAssets: {
      manifest: () => collectionManifest(root),
      watch: [{ path: "content", kind: "directory" }],
      ownedPrefixes: ["/assets/content"],
    },
  });
}

function routeCatalogueViteConfig(
  root: string,
  dev: { reloadDebounceMs?: number } = {},
): InlineConfig {
  return customHostConfig(root, {
    dev: {
      ...dev,
      routeDependencies: ["content/routes.txt", { path: "content/pages", kind: "directory" }],
    },
  });
}

function trackedModuleViteConfig(
  root: string,
  dev: { reloadDebounceMs?: number } = {},
): InlineConfig {
  return customHostConfig(root, { dev });
}

function customHostConfig(root: string, input: Partial<OxContentCustomHostOptions>): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      ...oxContentCustomHost({
        host: "./src/host.ts",
        oxContent: { srcDir: "content", outDir: "dist", docs: false, search: false },
        ...input,
      }),
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      manifest: true,
      rollupOptions: { input: path.join(root, "src", "main.ts") },
    },
  };
}

function collectionManifest(root: string) {
  return planCollectionAssets({
    root,
    assets: [{ sourcePath: "content/logo.txt", publicPath: "/media/logo.txt" }],
  });
}

function routeCatalogueHostSource(): string {
  return `
import { readdir, readFile } from "node:fs/promises";

export default {
  async routes() {
    const gate = await readFile(new URL("../content/routes.txt", import.meta.url), "utf8");
    if (gate.includes("fail")) throw new Error("route catalogue failed");
    const entries = await readdir(new URL("../content/pages", import.meta.url), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
      .map((entry) => ({
        path: "/" + entry.name.replace(/\\.txt$/u, ""),
        render: () => ({ text: entry.name, contentType: "text/plain" }),
      }));
  },
};
`;
}

function trackedModuleHostSource(): string {
  return `
let trackedRenders = 0;
let otherRenders = 0;

export default {
  routes: [
    {
      path: "/tracked",
      async render(ctx) {
        trackedRenders += 1;
        const shared = await ctx.loadModule("/src/shared.ts");
        return { text: "tracked:" + trackedRenders + ":" + shared.value, contentType: "text/plain" };
      },
    },
    {
      path: "/other",
      render() {
        otherRenders += 1;
        return { text: "other:" + otherRenders, contentType: "text/plain" };
      },
    },
  ],
};
`;
}

async function trackDevServer(serverPromise: Promise<ViteDevServer>): Promise<ViteDevServer> {
  const server = await serverPromise;
  activeServers.push(server);
  return server;
}

async function listen(server: ViteDevServer): Promise<{ server: http.Server; port: number }> {
  const listener = http.createServer(server.middlewares);
  activeListeners.push(listener);
  await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const address = listener.address() as AddressInfo;
  return { server: listener, port: address.port };
}

async function text(port: number, requestPath: string) {
  const response = await fetch(`http://127.0.0.1:${port}${requestPath}`);
  return { status: response.status, text: await response.text() };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function closeHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
