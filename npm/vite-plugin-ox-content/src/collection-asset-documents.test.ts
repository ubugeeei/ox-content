import * as fs from "node:fs/promises";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, createServer, type InlineConfig, type ViteDevServer } from "vite";
import { oxContentCustomHost } from ".";
import type { CollectionAssetManifest } from "./collection-assets";
import {
  planCollectionAssetsFromDocuments,
  type CollectionAssetDocumentInput,
} from "./collection-asset-documents";
import { rewriteCollectionAssetUrls } from "./collection-asset-html";

const tempDirs: string[] = [];
const activeServers: ViteDevServer[] = [];
const activeListeners: http.Server[] = [];

afterEach(async () => {
  await Promise.all(activeListeners.splice(0).map(closeHttpServer));
  await Promise.all(activeServers.splice(0).map((server) => server.close().catch(() => {})));
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("planCollectionAssetsFromDocuments", () => {
  it("plans selected Markdown and MDX local references without extension allowlists", async () => {
    const root = await createProject("ox-collection-asset-documents-");
    await writeContentFiles(root);

    const result = await planCollectionAssetsFromDocuments({
      root,
      contentRoot: "content",
      documents: [{ documentPath: "content/posts/post.mdx", pagePath: "/posts/post" }],
      extraAssets: [{ sourcePath: "content/metadata/opengraph.png", publicPath: "/og/post.png" }],
      publicPath: (reference) =>
        reference.pathname === "./cover.avif"
          ? [reference.publicPath, "/legacy/post-cover.avif"]
          : undefined,
    });

    const sourceNames = result.manifest.assets.map((asset) => path.basename(asset.sourcePath));
    expect(sourceNames).toEqual(["opengraph.png", "cover.avif", "guide.pdf", "poster.png"]);
    expect(
      result.manifest.assets.some((asset) => asset.sourcePath.endsWith("draft-secret.png")),
    ).toBe(false);
    expect(result.manifest.assets.some((asset) => asset.sourcePath.endsWith("unused.png"))).toBe(
      false,
    );

    const cover = result.manifest.assets.find((asset) => asset.sourcePath.endsWith("cover.avif"));
    expect(cover?.publicPaths).toEqual(["/posts/post/cover.avif", "/legacy/post-cover.avif"]);
    expect(
      result.references.find((reference) => reference.original.startsWith("./cover.avif")),
    ).toMatchObject({ search: "?size=large", hash: "#hero" });
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: "missing-file", reference: "./missing.png" }),
      expect.objectContaining({ code: "outside-content-root", reference: "../../private.txt" }),
    ]);

    const rewritten = rewriteCollectionAssetUrls({
      html: '<img src="./cover.avif?size=large#hero">',
      pagePath: "/posts/post/",
      manifest: result.manifest,
    });
    expect(rewritten.rewrites[0]?.replacement).toMatch(
      /^\/assets\/content\/[a-f0-9]{64}\.avif\?size=large#hero$/u,
    );
  });

  it("accepts structured mdast input and deduplicates repeated references", async () => {
    const root = await createProject("ox-collection-asset-documents-ast-");
    await fs.mkdir(path.join(root, "content", "docs"), { recursive: true });
    await fs.writeFile(path.join(root, "content", "docs", "chart.svg"), "<svg/>");
    await fs.writeFile(path.join(root, "content", "docs", "entry.md"), "");

    const document: CollectionAssetDocumentInput = {
      documentPath: "content/docs/entry.md",
      pagePath: "/docs/entry",
      ast: {
        type: "root",
        children: [
          { type: "image", url: "./chart.svg" },
          { type: "link", url: "./chart.svg" },
          {
            type: "mdxJsxFlowElement",
            attributes: [{ type: "mdxJsxAttribute", name: "src", value: "./chart.svg" }],
          },
        ],
      },
    };

    const result = await planCollectionAssetsFromDocuments({
      root,
      contentRoot: "content",
      documents: [document],
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.manifest.assets).toHaveLength(1);
    expect(result.manifest.assets[0]?.publicPaths).toEqual(["/docs/entry/chart.svg"]);
  });

  it("integrates with custom-host build writer and development middleware", async () => {
    const root = await createProject("ox-collection-asset-documents-custom-host-");
    await fs.writeFile(path.join(root, "content", "posts", "cover.png"), "cover");
    await fs.writeFile(path.join(root, "content", "posts", "post.md"), "![cover](./cover.png)");
    await fs.writeFile(path.join(root, "src", "host.ts"), hostSource());
    await fs.writeFile(path.join(root, "src", "main.ts"), "export {};\n");

    await viteBuild(config(root, () => documentManifest(root)));
    await expect(
      fs.readFile(path.join(root, "dist", "posts", "post", "cover.png"), "utf8"),
    ).resolves.toBe("cover");

    const server = await trackDevServer(createServer(config(root, () => documentManifest(root))));
    const listener = await listen(server);
    await expect(text(listener.port, "/posts/post/cover.png")).resolves.toMatchObject({
      status: 200,
      text: "cover",
    });
  });
});

async function writeContentFiles(root: string): Promise<void> {
  await fs.writeFile(path.join(root, "content", "posts", "cover.avif"), "cover");
  await fs.writeFile(path.join(root, "content", "downloads", "guide.pdf"), "guide");
  await fs.writeFile(path.join(root, "content", "posts", "poster.png"), "poster");
  await fs.writeFile(path.join(root, "content", "metadata", "opengraph.png"), "og");
  await fs.writeFile(path.join(root, "content", "posts", "unused.png"), "unused");
  await fs.writeFile(path.join(root, "content", "drafts", "draft-secret.png"), "secret");
  await fs.writeFile(path.join(root, "private.txt"), "private");
  await fs.writeFile(
    path.join(root, "content", "drafts", "draft.mdx"),
    "![secret](./draft-secret.png)",
  );
  await fs.writeFile(
    path.join(root, "content", "posts", "post.mdx"),
    [
      "![cover](./cover.avif?size=large#hero)",
      "[download](../downloads/guide.pdf#page=2)",
      '<video poster="./poster.png?fit=cover"></video>',
      '<img src="/absolute.png">',
      '<img src="data:image/png;base64,aaa">',
      '<a href="https://example.com/file.pdf">external</a>',
      '<img src="./missing.png">',
      '<img src="../../private.txt">',
      "<Image src={dynamic} />",
      '<Image src="./cover.avif" />',
    ].join("\n"),
  );
}

async function createProject(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "src"), { recursive: true });
  await fs.mkdir(path.join(root, "content", "posts"), { recursive: true });
  await fs.mkdir(path.join(root, "content", "downloads"), { recursive: true });
  await fs.mkdir(path.join(root, "content", "drafts"), { recursive: true });
  await fs.mkdir(path.join(root, "content", "metadata"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  return root;
}

async function documentManifest(root: string): Promise<CollectionAssetManifest> {
  const result = await planCollectionAssetsFromDocuments({
    root,
    contentRoot: "content",
    documents: [{ documentPath: "content/posts/post.md", pagePath: "/posts/post" }],
  });
  expect(result.diagnostics).toEqual([]);
  return result.manifest;
}

function config(root: string, manifest: () => Promise<CollectionAssetManifest>): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      ...oxContentCustomHost({
        host: "./src/host.ts",
        oxContent: { srcDir: "content", outDir: "dist", docs: false, search: false },
        collectionAssets: {
          manifest,
          watch: [{ path: "content", kind: "directory" }],
          ownedPrefixes: ["/assets/content"],
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

function hostSource(): string {
  return `
export default {
  routes: [{ path: "/posts/post", render: () => ({ html: '<img src="/posts/post/cover.png">' }) }],
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

function closeHttpServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
