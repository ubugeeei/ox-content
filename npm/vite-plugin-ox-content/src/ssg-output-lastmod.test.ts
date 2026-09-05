import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { planSsgOutputs, resolveGitLastmods } from "./index";

const tempDirs: string[] = [];
const FIRST = 1_704_067_200_000;
const SECOND = 1_704_153_600_000;
const THIRD = 1_704_240_000_000;

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("SSG output git lastmod sources", () => {
  it("preserves an explicit lastUpdated override", async () => {
    const site = await createGitSite();
    const plan = planFor(site.root, {
      inputPath: site.page,
      lastUpdated: 123,
      lastUpdatedPaths: [site.meta, "content/articles"],
    });

    expect(plan.siteMaps.pages[0]?.lastUpdated).toBe(123);
  });

  it("uses the latest timestamp across inputPath and additional files", async () => {
    const site = await createGitSite();
    const plan = planFor(site.root, {
      inputPath: site.page,
      lastUpdatedPaths: [site.meta],
    });

    expect(plan.siteMaps.pages[0]?.lastUpdated).toBe(SECOND);
  });

  it("uses the latest tracked descendant for additional directories", async () => {
    const site = await createGitSite();
    const plan = planFor(site.root, {
      inputPath: site.page,
      lastUpdatedPaths: ["content/articles"],
    });

    expect(plan.siteMaps.pages[0]?.lastUpdated).toBe(THIRD);
  });

  it("keeps a known source timestamp when an additional source is missing", async () => {
    const site = await createGitSite();
    const plan = planFor(site.root, {
      inputPath: site.page,
      lastUpdatedPaths: ["missing.md"],
    });

    expect(plan.siteMaps.pages[0]?.lastUpdated).toBe(FIRST);
  });

  it("omits lastmod without a usable git repository", async () => {
    const root = await makeTempDir("ox-content-lastmod-nogit-");
    await fs.mkdir(path.join(root, "content"), { recursive: true });
    await fs.writeFile(path.join(root, "content", "page.md"), "# Page\n");

    const plan = planFor(root, { inputPath: path.join(root, "content", "page.md") });

    expect(plan.siteMaps.pages[0]?.lastUpdated).toBeUndefined();
  });

  it("normalizes duplicate relative and absolute lookup paths", async () => {
    const site = await createGitSite();
    const lastmods = resolveGitLastmods(
      [site.meta, "src/meta.ts", "./src/../src/meta.ts", "../outside.ts"],
      site.root,
    );

    expect(lastmods.size).toBe(1);
    expect(lastmods.get(site.meta)).toBe(SECOND);
  });

  it("accepts descendant names that begin with parent-directory markers", async () => {
    const site = await createGitSite();
    const lastmods = resolveGitLastmods([site.dotPrefixed], site.root);

    expect(lastmods.get(site.dotPrefixed)).toBe(FIRST);
  });
});

function planFor(
  root: string,
  page: { inputPath: string; lastUpdated?: number; lastUpdatedPaths?: readonly string[] },
) {
  return planSsgOutputs({
    outDir: path.join(root, "dist"),
    root,
    options: {
      ssg: { enabled: false, siteUrl: "https://example.com", siteName: "Example" },
      siteMaps: { robots: false, llms: false },
    },
    pages: [
      {
        ...page,
        urlPath: "guide",
        title: "Guide",
      },
    ],
  });
}

async function createGitSite() {
  const root = await makeTempDir("ox-content-lastmod-");
  const page = path.join(root, "content", "page.md");
  const article = path.join(root, "content", "articles", "guide", "body.md");
  const dotPrefixed = path.join(root, "content", "..well-known", "feed.md");
  const meta = path.join(root, "src", "meta.ts");
  await fs.mkdir(path.dirname(article), { recursive: true });
  await fs.mkdir(path.dirname(dotPrefixed), { recursive: true });
  await fs.mkdir(path.dirname(meta), { recursive: true });
  await fs.writeFile(page, "# Page\n");
  await fs.writeFile(article, "# Article\n");
  await fs.writeFile(dotPrefixed, "# Feed\n");
  await fs.writeFile(meta, "export const owner = 'first';\n");
  git(root, ["init"], FIRST);
  git(root, ["add", "."], FIRST);
  git(root, ["commit", "-m", "first"], FIRST);

  await fs.writeFile(meta, "export const owner = 'second';\n");
  git(root, ["add", "src/meta.ts"], SECOND);
  git(root, ["commit", "-m", "meta"], SECOND);

  await fs.writeFile(article, "# Article edited\n");
  git(root, ["add", "content/articles/guide/body.md"], THIRD);
  git(root, ["commit", "-m", "article"], THIRD);

  return { root, page, article, dotPrefixed, meta };
}

async function makeTempDir(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(root);
  return root;
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
