import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createDocsResolvedOptions } from "../test/fixtures/docs-fixture";
import { resolveFeedsOptions } from "./feeds";
import { buildSsg } from "./ssg";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("buildSsg HTML minification", () => {
  it("minifies only generated HTML at the final write boundary", async () => {
    const root = await makeSite(`---
title: Home
---
<!-- remove me -->
<p>Alpha <strong>Beta</strong> Gamma</p>
<pre> keep   spaces
  and newlines </pre>
<textarea> keep   textarea spaces </textarea>
<script type="application/ld+json">{ "@context": "https://schema.org", "name": "Ada" }</script>
<script> const answer = 1 + 2; window.__answer = answer; </script>
<style>.badge { color: red; margin: 0px; }</style>
`);

    const result = await buildSsg(
      createDocsResolvedOptions({
        feeds: resolveFeedsOptions({ formats: ["rss"], path: "/" }),
        ssg: {
          ...createDocsResolvedOptions().ssg,
          siteUrl: "https://example.com",
          markdownSource: { enabled: true, alternate: true, copy: true },
          minifyHtml: true,
        },
      }),
      root,
    );

    const html = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
    const companion = await fs.readFile(path.join(root, "dist", "index.md"), "utf8");
    const feed = await fs.readFile(path.join(root, "dist", "feed.xml"), "utf8");

    expect(result.errors).toEqual([]);
    expect(html).not.toContain("remove me");
    expect(html).toContain("<p>Alpha <strong>Beta</strong> Gamma</p>");
    expect(html).toContain(`<pre> keep   spaces
  and newlines </pre>`);
    expect(html).toContain("<textarea> keep   textarea spaces </textarea>");
    expect(html).toContain("window.__answer=3");
    expect(html).toContain("<style>.badge{color:red;margin:0}</style>");
    expect(companion).toContain("<!-- remove me -->");
    expect(companion).toContain(".badge { color: red; margin: 0px; }");
    expect(feed).toContain("<rss");
    expect(feed).toContain("<title>Ox Content</title>");
    expect(feed).toContain("\n  <channel>\n");
  });

  it("keeps generated HTML unchanged when explicitly disabled", async () => {
    const root = await makeSite("---\ntitle: Home\n---\n<p>Alpha   Beta</p>\n");

    await buildSsg(
      createDocsResolvedOptions({
        ssg: { ...createDocsResolvedOptions().ssg, minifyHtml: false },
      }),
      root,
    );

    const html = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");

    expect(html).toContain("Alpha   Beta");
  });
});

async function makeSite(index: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ox-content-ssg-minify-"));
  tempDirs.push(root);
  const file = path.join(root, "content", "index.md");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, index, "utf8");
  return root;
}
