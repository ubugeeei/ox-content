import * as path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
  anyCustomHostDependencyMatches,
  matchesCustomHostDependency,
  normalizeCustomHostDependencies,
} from "./custom-host-watch";

describe("custom host dependency globs", () => {
  it("matches brace expansions and character classes", () => {
    const root = path.resolve("fixtures/custom-host");
    const [brace, characterClass] = normalizeCustomHostDependencies(root, [
      { path: "content/*.{md,mdx}", kind: "glob" },
      { path: "src/*.[jt]s", kind: "glob" },
    ]);

    expect(matchesCustomHostDependency(brace!, path.join(root, "content", "guide.md"))).toBe(true);
    expect(matchesCustomHostDependency(brace!, path.join(root, "content", "guide.mdx"))).toBe(true);
    expect(matchesCustomHostDependency(brace!, path.join(root, "content", "guide.txt"))).toBe(
      false,
    );
    expect(matchesCustomHostDependency(characterClass!, path.join(root, "src", "entry.ts"))).toBe(
      true,
    );
    expect(matchesCustomHostDependency(characterClass!, path.join(root, "src", "entry.js"))).toBe(
      true,
    );
    expect(matchesCustomHostDependency(characterClass!, path.join(root, "src", "entry.css"))).toBe(
      false,
    );
  });

  it("keeps glob matching scoped to normalized changed files", () => {
    const root = path.resolve("fixtures/custom-host");
    const dependencies = normalizeCustomHostDependencies(root, [
      { path: "content/**/index.{md,mdx}", kind: "glob" },
    ]);

    expect(
      anyCustomHostDependencyMatches(
        dependencies,
        path.join(root, "content", "guide", "index.mdx"),
      ),
    ).toBe(true);
    expect(
      anyCustomHostDependencyMatches(dependencies, path.join(root, "content", "guide.mdx")),
    ).toBe(false);
  });
});
