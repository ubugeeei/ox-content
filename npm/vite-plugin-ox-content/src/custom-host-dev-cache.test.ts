import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost } from ".";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host dev response cache", () => {
  it("does not share cached responses across request identity headers", async () => {
    const root = await createCacheProject(identityHostSource());
    const server = await trackDevServer(createServer(customHostConfig(root)));
    const listener = await listen(server);

    expect(await text(listener.port, "/session")).toMatchObject({ text: "none:1" });
    expect(await text(listener.port, "/session")).toMatchObject({ text: "none:1" });
    expect(await text(listener.port, "/session", { cookie: "id=one" })).toMatchObject({
      text: "id=one:2",
    });
    expect(await text(listener.port, "/session", { cookie: "id=two" })).toMatchObject({
      text: "id=two:3",
    });
  });

  it("invalidates route catalogues and cached responses from glob descriptors", async () => {
    const root = await createCacheProject(globHostSource());
    await fs.mkdir(path.join(root, "content", "routes"), { recursive: true });
    await fs.writeFile(path.join(root, "content", "routes", "one.txt"), "one\n");
    await fs.writeFile(path.join(root, "content", "flag.tsx"), "first\n");
    const server = await trackDevServer(
      createServer(
        customHostConfig(root, {
          routeDependencies: [{ path: "content/routes/*.{txt,mdx}", kind: "glob" }],
        }),
      ),
    );
    const listener = await listen(server);

    expect(await text(listener.port, "/one")).toMatchObject({ text: "one.txt" });
    expect(await text(listener.port, "/response")).toMatchObject({ text: "1:first" });
    expect(await text(listener.port, "/response")).toMatchObject({ text: "1:first" });

    const nextRoute = path.join(root, "content", "routes", "two.mdx");
    await fs.writeFile(nextRoute, "two\n");
    server.watcher.emit("add", nextRoute);
    await wait(20);
    expect(await text(listener.port, "/two")).toMatchObject({ text: "two.mdx" });

    const flag = path.join(root, "content", "flag.tsx");
    await fs.writeFile(flag, "second\n");
    server.watcher.emit("change", flag);
    await wait(20);
    expect(await text(listener.port, "/response")).toMatchObject({ text: "2:second" });
  });
});

async function createCacheProject(hostSource: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ox-custom-host-cache-"));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "content"), { recursive: true });
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await fs.writeFile(path.join(root, "src", "host.ts"), hostSource);
  return root;
}

function customHostConfig(
  root: string,
  dev: { routeDependencies?: readonly { path: string; kind: "glob" }[] } = {},
): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      ...oxContentCustomHost({
        host: "./src/host.ts",
        dev: { ...dev, reloadDebounceMs: 1 },
        oxContent: { srcDir: "content", outDir: "dist", docs: false, search: false },
      }),
    ],
  };
}

function identityHostSource(): string {
  return `
let renders = 0;

export default {
  routes: [
    {
      path: "/session",
      render(ctx) {
        renders += 1;
        return {
          text: (ctx.request.headers.get("cookie") ?? "none") + ":" + renders,
          contentType: "text/plain",
        };
      },
    },
  ],
};
`;
}

function globHostSource(): string {
  return `
import { readdir, readFile } from "node:fs/promises";

let responseRenders = 0;

export default {
  async routes() {
    const entries = await readdir(new URL("../content/routes/", import.meta.url), { withFileTypes: true });
    return [
      ...entries
        .filter((entry) => entry.isFile() && /\\.(?:txt|mdx)$/u.test(entry.name))
        .map((entry) => ({
          path: "/" + entry.name.replace(/\\.(?:txt|mdx)$/u, ""),
          render: () => ({ text: entry.name, contentType: "text/plain" }),
        })),
      {
        path: "/response",
        async render() {
          responseRenders += 1;
          const value = await readFile(new URL("../content/flag.tsx", import.meta.url), "utf8");
          return {
            text: responseRenders + ":" + value.trim(),
            contentType: "text/plain",
            dependencies: [{ path: "content/flag.[jt]sx", kind: "glob" }],
          };
        },
      },
    ];
  },
};
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

async function text(port: number, requestPath: string, headers: HeadersInit = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${requestPath}`, { headers });
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
