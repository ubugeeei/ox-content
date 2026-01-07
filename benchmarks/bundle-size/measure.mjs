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
    name: "ox-content",
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
    name: "VitePress",
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

  // Find baseline (smallest gzipped size)
  const validResults = results.filter((r) => !r.error && r.gzipped > 0);
  const baseline = Math.min(...validResults.map((r) => r.gzipped));

  // Sort by gzipped size
  results.sort((a, b) => {
    if (a.error) return 1;
    if (b.error) return -1;
    return a.gzipped - b.gzipped;
  });

  console.log("\nResults (sorted by gzipped size):");
  console.log("=================================\n");

  // Print markdown table
  console.log("| Framework          | Total      | Gzipped    | Ratio     | Files |");
  console.log("|--------------------|------------|------------|-----------|-------|");

  for (const result of results) {
    if (result.error) {
      console.log(`| ${result.name.padEnd(18)} | Error      | -          | -         | -     |`);
      continue;
    }

    const name = result.name.padEnd(18);
    const total = formatBytes(result.total).padEnd(10);
    const gzipped = formatBytes(result.gzipped).padEnd(10);
    const ratio = ((result.gzipped / baseline).toFixed(2) + "x").padEnd(9);
    const files = String(result.files).padEnd(5);
    console.log(`| ${name} | ${total} | ${gzipped} | ${ratio} | ${files} |`);
  }

  console.log("\n\nNotes:");
  console.log("- All frameworks built with production settings");
  console.log("- Gzipped size calculated for JS/CSS/HTML files");
  console.log("- Same markdown content used across all frameworks");
  console.log("- Ratio is relative to the smallest bundle");
}

main().catch(console.error);
