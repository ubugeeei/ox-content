import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost, type FeedsOptions, type OxContentCustomHostOptions } from ".";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map((server) => closeHttpServer(server)));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host dev feeds", () => {
  it("serves coordinated feed outputs before custom notFound without rendering pages", async () => {
    const root = await createProject("ox-custom-host-dev-feeds-");
    await fs.writeFile(path.join(root, "src", "feed-data.ts"), feedDataModule("First Post"));
    await fs.writeFile(path.join(root, "src", "host.ts"), coordinatedFeedHostModule());
    const server = await trackDevServer(
      createServer(config(root, { dev: { feedOutputs: true, reloadDebounceMs: 1 } })),
    );
    const listener = await listen(server);

    const blogFeed = await text(listener.port, "/blog/feed.xml");
    expect(blogFeed.status).toBe(200);
    expect(blogFeed.contentType).toContain("application/rss+xml");
    expect(blogFeed.text).toContain("<title>First Post</title>");
    expect(blogFeed.text).not.toContain("Guest appearance");

    const mediaFeed = await text(listener.port, "/works/media/feed.json");
    expect(mediaFeed.status).toBe(200);
    expect(mediaFeed.contentType).toContain("application/feed+json");
    expect(mediaFeed.text).toContain('"title": "Guest appearance"');
    expect(mediaFeed.text).not.toContain("First Post");

    expect(await text(listener.port, "/missing/feed.xml")).toMatchObject({
      status: 404,
      text: "custom 404",
    });
    expect(await text(listener.port, "/")).toMatchObject({ status: 200 });
    expect((await text(listener.port, "/")).text).toContain("renders:1");

    await viteBuild(config(root, { dev: { feedOutputs: true } }));
    await expect(fs.readFile(path.join(root, "dist", "blog", "feed.xml"), "utf8")).resolves.toBe(
      blogFeed.text,
    );
  });

  it("retries failed output renders and invalidates tracked feed data", async () => {
    const root = await createProject("ox-custom-host-dev-feeds-retry-");
    const dataPath = path.join(root, "src", "feed-data.ts");
    await fs.writeFile(dataPath, retryFeedDataModule("Initial title"));
    await fs.writeFile(path.join(root, "src", "host.ts"), retryingFeedHostModule());
    const server = await trackDevServer(
      createServer(
        config(root, {
          dev: { feedOutputs: true, reloadDebounceMs: 1 },
          feeds: { formats: ["rss"], path: "/" },
        }),
      ),
    );
    const listener = await listen(server);

    expect((await text(listener.port, "/feed.xml")).status).toBe(500);
    expect(await text(listener.port, "/feed.xml")).toMatchObject({
      status: 200,
      contentType: expect.stringContaining("application/rss+xml"),
    });

    await fs.writeFile(dataPath, retryFeedDataModule("Updated title"));
    server.watcher.emit("change", dataPath);
    await wait(30);

    const updated = await text(listener.port, "/feed.xml");
    expect(updated.text).toContain("<title>Updated title</title>");
    expect(updated.text).not.toContain("Initial title");
  });
});

function config(
  root: string,
  input: {
    dev?: NonNullable<OxContentCustomHostOptions["dev"]>;
    feeds?: boolean | FeedsOptions;
  } = {},
): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      ...oxContentCustomHost({
        host: "./src/host.ts",
        dev: input.dev,
        oxContent: {
          srcDir: "content",
          outDir: "dist",
          resources: false,
          docs: false,
          search: false,
          ogViewer: false,
          feeds:
            input.feeds ??
            ({
              blog: { formats: ["rss"], collection: "blog", path: "/blog" },
              media: { formats: ["json"], collection: "media", path: "/works/media" },
            } satisfies FeedsOptions),
          siteMaps: false,
          ssg: { siteUrl: "https://example.com", siteName: "Example" },
        },
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

async function createProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.mkdir(path.join(root, "content"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await fs.writeFile(path.join(root, "src", "main.ts"), "export {};\n");
  return root;
}

function feedDataModule(title: string): string {
  return `
export const siteDescription = "Programmatic output data";
export const blog = [{ title: ${JSON.stringify(title)}, path: "/blog/first", date: "2026-09-01" }];
export const media = [{
  title: "Guest appearance",
  loc: "https://media.example.com/episode",
  date: "2026-09-02",
}];
`;
}

function retryFeedDataModule(title: string): string {
  return `export const title = ${JSON.stringify(title)};\n`;
}

function coordinatedFeedHostModule(): string {
  return `
let pageRenders = 0;
let loadCalls = 0;
let latestRouteLoad = 0;

async function content(ctx) {
  return ctx.memo("content", async () => {
    loadCalls += 1;
    const data = await ctx.loadModule("/src/feed-data.ts");
    return { ...data, loadCalls };
  });
}

export default {
  async routes(ctx) {
    const data = await content(ctx);
    latestRouteLoad = data.loadCalls;
    return [
      {
        path: "/",
        render() {
          pageRenders += 1;
          return { html: "<!doctype html><html><body><h1>renders:" + pageRenders + "</h1></body></html>" };
        },
      },
    ];
  },
  async outputs(ctx) {
    const data = await content(ctx);
    if (data.loadCalls !== latestRouteLoad) {
      throw new Error("dev feed outputs did not share route memo");
    }
    return {
      siteDescription: data.siteDescription,
      collectionNames: ["blog", "media"],
      collections: { blog: data.blog, media: data.media },
    };
  },
  notFound() {
    return { text: "custom 404", status: 404, contentType: "text/plain" };
  },
};
`;
}

function retryingFeedHostModule(): string {
  return `
let attempts = 0;

export default {
  routes: [{ path: "/", render: () => ({ html: "<h1>Home</h1>" }) }],
  async outputs(ctx) {
    attempts += 1;
    if (attempts === 1) {
      throw new Error("transient feed output failure");
    }
    const data = await ctx.memo("feed-data", () => ctx.loadModule("/src/feed-data.ts"));
    return {
      items: [{ title: data.title, path: "/updates", date: "2026-09-03" }],
    };
  },
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
  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    text: await response.text(),
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function closeHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
