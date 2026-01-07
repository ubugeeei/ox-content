import { execSync } from "node:child_process";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSizeSync } from "gzip-size";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get total size of a directory
 * @param {string} dir
 * @returns {{ total: number, gzipped: number, files: number }}
 */
function getDirSize(dir) {
  let total = 0;
  let gzipped = 0;
  let files = 0;

  function walk(currentDir) {
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const content = readFileSync(fullPath);
          total += content.length;
          // Only gzip JS/CSS/HTML files
          if (/\.(js|css|html|json)$/.test(entry.name)) {
            gzipped += gzipSizeSync(content);
          } else {
            gzipped += content.length;
          }
          files++;
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  walk(dir);
  return { total, gzipped, files };
}

/**
 * Format bytes to human readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * @typedef {Object} AppConfig
 * @property {string} name
 * @property {string} dir
 * @property {string} distDir
 * @property {string} buildCmd
 */

/** @type {AppConfig[]} */
const apps = [
  {
    name: "ox-content (bare)",
    dir: join(__dirname, "apps/ox-content-bare"),
    distDir: "dist",
    buildCmd: "pnpm build",
  },
  {
    name: "ox-content (default)",
    dir: join(__dirname, "apps/ox-content"),
    distDir: "dist",
    buildCmd: "pnpm build",
  },
  {
    name: "ox-content + Vue",
    dir: join(__dirname, "apps/ox-content-vue"),
    distDir: "dist",
    buildCmd: "pnpm build",
  },
  {
    name: "VitePress (bare)",
    dir: join(__dirname, "apps/vitepress-bare"),
    distDir: ".vitepress/dist",
    buildCmd: "pnpm build",
  },
  {
    name: "VitePress (default)",
    dir: join(__dirname, "apps/vitepress"),
    distDir: ".vitepress/dist",
    buildCmd: "pnpm build",
  },
  {
    name: "Astro",
    dir: join(__dirname, "apps/astro"),
    distDir: "dist",
    buildCmd: "pnpm build",
  },
  {
    name: "Astro + Vue",
    dir: join(__dirname, "apps/astro-vue"),
    distDir: "dist",
    buildCmd: "pnpm build",
  },
];

async function main() {
  const skipBuild = process.argv.includes("--skip-build");

  console.log("Bundle Size Benchmark");
  console.log("=====================\n");

  // Install dependencies
  if (!skipBuild) {
    console.log("Installing dependencies...\n");
    for (const app of apps) {
      try {
        console.log(`  ${app.name}: installing...`);
        execSync("pnpm install", { cwd: app.dir, stdio: "pipe" });
      } catch (e) {
        console.log(`  ${app.name}: install failed - ${e.message}`);
      }
    }
    console.log("");
  }

  // Build each app
  const results = [];

  for (const app of apps) {
    console.log(`Building ${app.name}...`);

    if (!skipBuild) {
      try {
        execSync(app.buildCmd, { cwd: app.dir, stdio: "pipe" });
      } catch (e) {
        console.log(`  Build failed: ${e.message}\n`);
        results.push({
          name: app.name,
          total: -1,
          gzipped: -1,
          files: 0,
          error: true,
        });
        continue;
      }
    }

    const distPath = join(app.dir, app.distDir);
    const size = getDirSize(distPath);

    results.push({
      name: app.name,
      ...size,
    });

    console.log(`  Total: ${formatBytes(size.total)}`);
    console.log(`  Gzipped: ${formatBytes(size.gzipped)}`);
    console.log(`  Files: ${size.files}\n`);
  }

  // Find baseline (ox-content bare)
  const oxContentBare = results.find((r) => r.name === "ox-content (bare)");
  const baseline = oxContentBare && !oxContentBare.error ? oxContentBare.gzipped : Math.min(...results.filter((r) => !r.error && r.gzipped > 0).map((r) => r.gzipped));

  // Sort by gzipped size
  results.sort((a, b) => {
    if (a.error) return 1;
    if (b.error) return -1;
    return a.gzipped - b.gzipped;
  });

  console.log("\nResults (sorted by gzipped size):");
  console.log("=================================\n");

  // Calculate dynamic column widths
  const nameWidth = Math.max(9, ...results.map((r) => r.name.length)); // min 9 for "Framework"
  const totalWidth = 10;
  const gzippedWidth = 10;
  const ratioWidth = 9;
  const filesWidth = 5;

  // Print markdown table
  const header = `| ${"Framework".padEnd(nameWidth)} | ${"Total".padEnd(totalWidth)} | ${"Gzipped".padEnd(gzippedWidth)} | ${"Ratio".padEnd(ratioWidth)} | ${"Files".padEnd(filesWidth)} |`;
  const separator = `|${"-".repeat(nameWidth + 2)}|${"-".repeat(totalWidth + 2)}|${"-".repeat(gzippedWidth + 2)}|${"-".repeat(ratioWidth + 2)}|${"-".repeat(filesWidth + 2)}|`;
  console.log(header);
  console.log(separator);

  for (const result of results) {
    if (result.error) {
      console.log(`| ${result.name.padEnd(nameWidth)} | ${"Error".padEnd(totalWidth)} | ${"-".padEnd(gzippedWidth)} | ${"-".padEnd(ratioWidth)} | ${"-".padEnd(filesWidth)} |`);
      continue;
    }

    const name = result.name.padEnd(nameWidth);
    const total = formatBytes(result.total).padEnd(totalWidth);
    const gzipped = formatBytes(result.gzipped).padEnd(gzippedWidth);
    const ratio = ((result.gzipped / baseline).toFixed(2) + "x").padEnd(ratioWidth);
    const files = String(result.files).padEnd(filesWidth);
    console.log(`| ${name} | ${total} | ${gzipped} | ${ratio} | ${files} |`);
  }

  console.log("\n\nNotes:");
  console.log("- All frameworks built with production settings");
  console.log("- Gzipped size calculated for JS/CSS/HTML files");
  console.log("- Same markdown content used across all frameworks");
  console.log("- Ratio is relative to the smallest bundle");
}

main().catch(console.error);
