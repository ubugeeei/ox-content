import { describe, expect, it } from "vite-plus/test";
import { highlightCode } from "./highlight";

describe("highlightCode", () => {
  it("caches highlighters per theme instead of reusing the first one", async () => {
    const html = '<pre><code class="language-ts">const value = 1;</code></pre>';

    const githubDark = await highlightCode(html, "github-dark");
    const vitesseDark = await highlightCode(html, "vitesse-dark");

    expect(githubDark).toContain("github-dark");
    expect(vitesseDark).toContain("vitesse-dark");
    expect(vitesseDark).not.toContain("github-dark");
  });
});
