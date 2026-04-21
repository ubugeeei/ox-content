import { afterEach, describe, expect, it } from "vite-plus/test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { generateMarkdown, resolveDocsOptions, writeDocs } from "./docs";
import type { ExtractedDocs } from "./types";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("writeDocs", () => {
  it("removes stale generated files from the previous manifest", async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "ox-content-docs-"));
    tempDirs.push(outDir);

    await writeDocs(
      {
        "alpha.md": "# Alpha",
        "beta.md": "# Beta",
      },
      outDir,
    );

    await writeDocs(
      {
        "beta.md": "# Beta updated",
      },
      outDir,
    );

    await expect(fs.access(path.join(outDir, "alpha.md"))).rejects.toThrow();
    await expect(fs.readFile(path.join(outDir, "beta.md"), "utf-8")).resolves.toContain("updated");
  });

  it("does not delete files that were never tracked by the manifest", async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "ox-content-docs-"));
    tempDirs.push(outDir);

    await fs.writeFile(path.join(outDir, "manual.md"), "# Manual", "utf-8");

    await writeDocs(
      {
        "generated.md": "# Generated",
      },
      outDir,
    );

    await writeDocs(
      {
        "generated.md": "# Generated again",
      },
      outDir,
    );

    await expect(fs.readFile(path.join(outDir, "manual.md"), "utf-8")).resolves.toContain("Manual");
  });

  it("writes machine-readable docs data when extracted docs are provided", async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "ox-content-docs-"));
    tempDirs.push(outDir);

    const extractedDocs: ExtractedDocs[] = [
      {
        file: "/repo/src/math.ts",
        entries: [
          {
            name: "clamp",
            kind: "function",
            description: "Clamps a number.",
            file: "/repo/src/math.ts",
            line: 10,
            signature: "export function clamp(value: number, min: number, max: number): number",
          },
        ],
      },
    ];

    await writeDocs(
      { "math.md": "# math" },
      outDir,
      extractedDocs,
      resolveDocsOptions({ generateNav: true }),
    );

    const docsJson = JSON.parse(await fs.readFile(path.join(outDir, "docs.json"), "utf-8")) as {
      version: number;
      modules: ExtractedDocs[];
    };

    expect(docsJson.version).toBe(1);
    expect(docsJson.modules[0]?.entries[0]?.name).toBe("clamp");
  });
});

describe("generateMarkdown", () => {
  it("emits overview lines and accordion-style details for file docs", () => {
    const docs: ExtractedDocs[] = [
      {
        file: "/repo/src/utils.ts",
        entries: [
          {
            name: "capitalize",
            kind: "function",
            description: "Capitalizes the first letter of a string.",
            file: "/repo/src/utils.ts",
            line: 4,
            signature: "export function capitalize(str: string): string",
            params: [{ name: "str", type: "string", description: "Input string" }],
            returns: { type: "string", description: "Capitalized string" },
          },
        ],
      },
    ];

    const markdown = generateMarkdown(docs, resolveDocsOptions({})!);

    expect(markdown["utils.md"]).toContain("## Overview");
    expect(markdown["utils.md"]).toContain('<details id="capitalize" class="ox-api-entry">');
    expect(markdown["utils.md"]).toContain("Skim the one-line surface first");
    expect(markdown["index.md"]).toContain("`@api transform`");
  });
});
