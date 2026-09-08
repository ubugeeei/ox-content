import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost, type OxContentCustomHostOptions } from ".";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host dev eager-glob route catalogues", () => {
  it("refreshes eager-glob routes after watched module add and remove", async () => {
    const root = await createEagerGlobRouteProject();
    const server = await trackDevServer(
      createServer(eagerGlobRouteViteConfig(root, { reloadDebounceMs: 1 })),
    );
    const listener = await listen(server);

    expect(await text(listener.port, "/one/")).toMatchObject({ status: 200, text: "one" });
    expect((await text(listener.port, "/adoption-watch-probe/")).status).toBe(404);

    const probe = path.join(root, "src", "pages", "adoption-watch-probe", "index.ts");
    await fs.mkdir(path.dirname(probe), { recursive: true });
    await fs.writeFile(probe, pageRouteSource("/adoption-watch-probe/", "route-watch-3.1"));
    server.watcher.emit("add", probe);
    await wait(120);

    expect(await text(listener.port, "/adoption-watch-probe/")).toMatchObject({
      status: 200,
      text: "route-watch-3.1",
    });

    await fs.rm(probe);
    server.watcher.emit("unlink", probe);
    await wait(120);

    expect((await text(listener.port, "/adoption-watch-probe/")).status).toBe(404);
  });
});

async function createEagerGlobRouteProject(): Promise<string> {
  const root = await createBaseProject("ox-custom-host-eager-glob-routes-");
  await fs.mkdir(path.join(root, "src", "pages", "one"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "utils"), { recursive: true });
  await fs.writeFile(
    path.join(root, "src", "pages", "one", "index.ts"),
    pageRouteSource("/one/", "one"),
  );
  await fs.writeFile(path.join(root, "src", "utils", "routes.ts"), eagerGlobRoutesSource());
  await fs.writeFile(path.join(root, "src", "host.ts"), eagerGlobHostSource());
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

function eagerGlobRouteViteConfig(
  root: string,
  dev: { reloadDebounceMs?: number } = {},
): InlineConfig {
  return customHostConfig(root, {
    dev: {
      ...dev,
      routeDependencies: [
        { path: "src/pages", kind: "directory" },
        { path: "src/utils", kind: "directory" },
      ],
    },
  });
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

function eagerGlobHostSource(): string {
  return `
import { createPageRoutes } from "./utils/routes.ts";

export default {
  routes() {
    return createPageRoutes();
  },
};
`;
}

function eagerGlobRoutesSource(): string {
  return `
const modules = import.meta.glob("/src/pages/**/index.ts", { eager: true });

export function createPageRoutes() {
  return Object.values(modules).flatMap((module) => module.routes());
}
`;
}

function pageRouteSource(routePath: string, body: string): string {
  return `
export function routes() {
  return [
    {
      path: ${JSON.stringify(routePath)},
      render: () => ({ text: ${JSON.stringify(body)}, contentType: "text/plain" }),
    },
  ];
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
  const address = listener.address() as AddressInfo;
  return { port: address.port };
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
