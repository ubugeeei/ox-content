import { describe, expect, it } from "vite-plus/test";
import {
  categorizeCommits,
  collectCommitImpact,
  formatImpact,
  generateChangelog,
} from "./release-changelog";

const options = {
  root: process.cwd(),
  npmPackages: [
    "crates/ox_content_napi",
    "npm/vite-plugin-ox-content",
    "npm/theme/swiss",
    "npm/theme-color/oceanic",
  ],
};

describe("release changelog impacts", () => {
  it("names changed crates on each changelog entry", () => {
    const categories = categorizeCommits([
      {
        subject: "fix(parser): parse digit-prefixed inline math (#1326)",
        files: ["crates/ox_content_parser/src/inlines.rs"],
        impact: collectCommitImpact(["crates/ox_content_parser/src/inlines.rs"], options),
      },
    ]);

    expect(generateChangelog("3.0.1", categories)).toContain(
      "- parse digit-prefixed inline math (#1326) _(affects: crates: ox_content_parser)_",
    );
  });

  it("also reports npm packages and release areas", () => {
    const impact = collectCommitImpact(
      [
        "npm/vite-plugin-ox-content/src/custom-host.ts",
        "docs/content/built-in/custom-host.md",
        ".github/workflows/publish.yml",
      ],
      options,
    );

    expect(formatImpact(impact)).toBe("npm: @ox-content/vite-plugin; ci, docs");
  });

  it("summarizes large package sets instead of flooding the changelog", () => {
    const impact = collectCommitImpact(
      [
        "crates/ox_content_allocator/src/lib.rs",
        "crates/ox_content_ast/src/lib.rs",
        "crates/ox_content_docs/src/lib.rs",
        "crates/ox_content_incremental/src/lib.rs",
        "crates/ox_content_mdast/src/lib.rs",
        "crates/ox_content_og_image/src/lib.rs",
        "npm/theme/swiss/package.json",
        "npm/theme-color/oceanic/package.json",
        "crates/ox_content_parser/src/lib.rs",
        "crates/ox_content_renderer/src/lib.rs",
        "crates/ox_content_transform/src/lib.rs",
      ],
      options,
    );

    expect(formatImpact(impact)).toBe(
      "crates: ox_content_allocator, ox_content_ast, ox_content_docs, ox_content_incremental, ox_content_mdast, ox_content_og_image, ox_content_parser, ox_content_renderer (+1 more); npm: @ox-content/theme-color-oceanic, @ox-content/theme-swiss",
    );
  });
});
