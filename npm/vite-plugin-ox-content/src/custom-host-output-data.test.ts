import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import {
  build as viteBuild,
  createServer,
  type InlineConfig,
  type Plugin,
  type ViteDevServer,
} from "vite";
import { oxContentCustomHost, type FeedsOptions, type OxContentCustomHostModule } from ".";

const tempDirs: string[] = [];
const listeners: http.Server[] = [];
const servers: ViteDevServer[] = [];

afterEach(async () => {
  await Promise.all(listeners.splice(0).map(closeHttpServer));
  await Promise.all(servers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host output data", () => {
  it("passes build-only feed data through coordinated feed writers", async () => {
    const root = await createProject("ox-custom-host-output-data-");
    await fs.writeFile(path.join(root, "src", "feed-data.ts"), feedDataModule());
    await fs.writeFile(path.join(root, "src", "host.ts"), feedHostModule());

    await viteBuild(config(root, { minifyHtml: true }));

    const html = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
    const blogFeed = await fs.readFile(path.join(root, "dist", "blog", "feed.xml"), "utf8");
    const mediaFeed = await fs.readFile(
      path.join(root, "dist", "works", "media", "feed.xml"),
      "utf8",
    );

    expect(html).toContain("<p>Home <strong>route</strong></p>");
    expect(html).not.toContain("remove me");
    expect(blogFeed).toContain("<title>Blog Post</title>");
    expect(mediaFeed).toContain("<title>Guest appearance</title>");
    expect(mediaFeed).toContain("<link>https://media.example.com/episode</link>");
  });

  it("skips build output data when feeds are disabled", async () => {
    const root = await createProject("ox-custom-host-output-data-off-");
    await fs.writeFile(path.join(root, "src", "host.ts"), outputGuardHostModule());

    await viteBuild(config(root, { feeds: false }));

    expect(await fs.readFile(path.join(root, "dist", "index.html"), "utf8")).toContain(
      "<h1>guard</h1>",
    );
  });

  it("does not run build-only output data in development", async () => {
    const root = await createProject("ox-custom-host-output-data-dev-");
    await fs.writeFile(path.join(root, "src", "host.ts"), outputGuardHostModule());
    const server = await createServer(config(root));
    servers.push(server);
    const listener = http.createServer(server.middlewares);
    listeners.push(listener);
    await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
    const port = (listener.address() as AddressInfo).port;

    const response = await fetch(`http://127.0.0.1:${port}/`);

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("<h1>guard</h1>");
  });

  it("typechecks external host output data and memo usage", () => {
    const host = {
      async routes(ctx) {
        const content = await ctx.memo(
          "content",
          () => ctx.loadModule("/src/content.ts") as Promise<{ title: string }>,
        );
        return [{ path: "/", title: content.title, render: () => ({ html: "<h1>Home</h1>" }) }];
      },
      async outputs(ctx) {
        const content = await ctx.memo("content", () => ({ title: "Home" }));
        return {
          siteDescription: `${content.title} feed`,
          collectionNames: ["blog"],
          collections: {
            blog: [{ title: content.title, loc: "https://example.com/" }],
          },
        };
      },
    } satisfies OxContentCustomHostModule;

    expect(host).toBeDefined();
  });
});

function config(
  root: string,
  options: { feeds?: boolean | FeedsOptions; minifyHtml?: boolean } = {},
): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      htmlTransformMarker(),
      ...oxContentCustomHost({
        host: "./src/host.ts",
        build: { minifyHtml: options.minifyHtml },
        oxContent: {
          srcDir: "content",
          outDir: "dist",
          resources: false,
          docs: false,
          search: false,
          ogViewer: false,
          feeds:
            options.feeds ??
            ({
              blog: { formats: ["rss"], collection: "blog", path: "/blog" },
              media: { formats: ["rss"], collection: "media", path: "/works/media" },
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
  await fs.writeFile(path.join(root, "content", "index.md"), "# First\n");
  await fs.writeFile(path.join(root, "src", "main.ts"), 'console.log("ready");\n');
  return root;
}

function htmlTransformMarker(): Plugin {
  return {
    name: "fixture-html-transform",
    transformIndexHtml(html) {
      return html.replace("</head>", '<meta name="fixture-transform" content="1"></head>');
    },
  };
}

function feedDataModule(): string {
  return `
export const siteDescription = "Programmatic output data";
export const blog = [{ title: "Blog Post", path: "/blog/post", date: "2026-09-01" }];
export const media = [{
  title: "Guest appearance",
  loc: "https://media.example.com/episode",
  date: "2026-09-02",
}];
`;
}

function feedHostModule(): string {
  return `
let loads = 0;
async function loadContent(ctx) {
  return ctx.memo("content", async () => {
    loads += 1;
    const data = await ctx.loadModule("/src/feed-data.ts");
    return { ...data, loads };
  });
}
export default {
  async routes(ctx) {
    const content = await loadContent(ctx);
    return [
      {
        path: "/",
        title: "Home",
        render() {
          return {
            html: "<!DOCTYPE html><html><head><!-- remove me --></head><body><p>Home <strong>route</strong></p><span data-loads='" + content.loads + "'></span></body></html>",
          };
        },
      },
      { path: "/about", title: "About", render: () => ({ html: "<h1>About</h1>" }) },
    ];
  },
  async outputs(ctx) {
    const content = await loadContent(ctx);
    if (ctx.mode !== "build" || !ctx.root || !ctx.outDir || ctx.routes.length !== 2) {
      throw new Error("missing output context");
    }
    if (content.loads !== 1) throw new Error("output data did not share route memo");
    return {
      siteDescription: content.siteDescription,
      collectionNames: ["blog", "media"],
      collections: { blog: content.blog, media: content.media },
    };
  },
};
`;
}

function outputGuardHostModule(): string {
  return `
export default {
  routes: [
    { path: "/", render: () => ({ html: "<!doctype html><html><body><h1>guard</h1></body></html>" }) },
  ],
  outputs() {
    throw new Error("outputs should not run");
  },
};
`;
}

function closeHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}
