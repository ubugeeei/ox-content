import { afterEach, describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { writeDocs } from "./docs";

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
});
