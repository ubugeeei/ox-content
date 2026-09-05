import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { build as viteBuild, type InlineConfig } from "vite";
import { oxContentCustomHost } from ".";

const tempDirs: string[] = [];
const FIRST = 1_704_067_200_000;
const SECOND = 1_704_153_600_000;
const THIRD = 1_704_240_000_000;

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("custom host git lastmod sources", () => {
  it("plans sitemap lastmod from route and render result lastUpdatedPaths", async () => {
    const root = await createProject();

    await viteBuild(viteConfig(root));

    const sitemap = await fs.readFile(path.join(root, "dist", "sitemap.xml"), "utf8");
    expect(sitemap).toContain(
      "<loc>https://example.com/result/</loc>\n    <lastmod>2024-01-03</lastmod>",
    );
    expect(sitemap).toContain(
      "<loc>https://example.com/route/</loc>\n    <lastmod>2024-01-02</lastmod>",
    );
  });
});

function viteConfig(root: string): InlineConfig {
  return {
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      ...oxContentCustomHost({
        host: "./src/host.ts",
        oxContent: {
          srcDir: "content",
          outDir: "dist",
          resources: false,
          docs: false,
          search: false,
          ogViewer: false,
          feeds: false,
          siteMaps: { robots: false, llms: false },
          ssg: {
            siteUrl: "https://example.com",
            siteName: "Example",
          },
        },
      }),
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: path.join(root, "src", "main.ts"),
      },
    },
  };
}

async function createProject(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ox-custom-host-lastmod-"));
  tempDirs.push(root);
  await fs.mkdir(path.join(root, "content", "articles"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "shared"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), '{"type":"module"}\n');
  await fs.writeFile(path.join(root, "content", "page.md"), "# Page\n");
  await fs.writeFile(path.join(root, "content", "articles", "body.md"), "# Article\n");
  await fs.writeFile(path.join(root, "src", "shared", "config.ts"), "export const value = 1;\n");
  await fs.writeFile(path.join(root, "src", "main.ts"), "export {};\n");
  await fs.writeFile(path.join(root, "src", "host.ts"), hostModuleSource());
  git(root, ["init"], FIRST);
  git(root, ["add", "."], FIRST);
  git(root, ["commit", "-m", "first"], FIRST);

  await fs.writeFile(path.join(root, "src", "shared", "config.ts"), "export const value = 2;\n");
  git(root, ["add", "src/shared/config.ts"], SECOND);
  git(root, ["commit", "-m", "shared"], SECOND);

  await fs.writeFile(path.join(root, "content", "articles", "body.md"), "# Article edited\n");
  git(root, ["add", "content/articles/body.md"], THIRD);
  git(root, ["commit", "-m", "article"], THIRD);

  return root;
}

function hostModuleSource(): string {
  return `
export default {
  routes: [
    {
      path: "/route",
      inputPath: "content/page.md",
      title: "Route",
      lastUpdatedPaths: ["src/shared"],
      render() {
        return { html: "<!doctype html><title>Route</title><h1>Route</h1>", title: "Route" };
      },
    },
    {
      path: "/result",
      inputPath: "content/page.md",
      title: "Result",
      render() {
        return {
          html: "<!doctype html><title>Result</title><h1>Result</h1>",
          title: "Result",
          lastUpdatedPaths: ["content/articles"],
        };
      },
    },
  ],
};
`;
}

function git(root: string, args: readonly string[], timestampMs: number): void {
  const timestamp = `@${Math.trunc(timestampMs / 1_000)}`;
  const result = spawnSync(
    "git",
    [
      "-C",
      root,
      "-c",
      "commit.gpgsign=false",
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      ...args,
    ],
    {
      env: { ...process.env, GIT_AUTHOR_DATE: timestamp, GIT_COMMITTER_DATE: timestamp },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`);
  }
}
