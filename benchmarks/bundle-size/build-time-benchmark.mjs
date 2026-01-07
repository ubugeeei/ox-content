#!/usr/bin/env node

/**
 * Build Time Benchmark
 *
 * Measures production build time for various documentation frameworks.
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const APPS_DIR = './apps';
const ITERATIONS = 3; // Number of iterations to average

const apps = [
  { name: 'ox-content (bare)', dir: 'ox-content-bare', buildCmd: 'pnpm build' },
  { name: 'ox-content (default)', dir: 'ox-content', buildCmd: 'pnpm build' },
  { name: 'ox-content + Vue', dir: 'ox-content-vue', buildCmd: 'pnpm build' },
  { name: 'VitePress (bare)', dir: 'vitepress-bare', buildCmd: 'pnpm build' },
  { name: 'VitePress (default)', dir: 'vitepress', buildCmd: 'pnpm build' },
  { name: 'Astro', dir: 'astro', buildCmd: 'pnpm build' },
  { name: 'Astro + Vue', dir: 'astro-vue', buildCmd: 'pnpm build' },
];

function cleanDist(appDir) {
  const distPaths = [
    join(appDir, 'dist'),
    join(appDir, '.vitepress/dist'),
    join(appDir, '.astro'),
  ];
  for (const distPath of distPaths) {
    if (existsSync(distPath)) {
      rmSync(distPath, { recursive: true, force: true });
    }
  }
}

function measureBuildTime(appDir, buildCmd) {
  const start = performance.now();
  try {
    execSync(buildCmd, {
      cwd: appDir,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' },
    });
    const end = performance.now();
    return end - start;
  } catch (error) {
    console.error(`Build failed in ${appDir}:`, error.message);
    return null;
  }
}

async function runBenchmark() {
  console.log('Build Time Benchmark');
  console.log('====================\n');
  console.log(`Running ${ITERATIONS} iterations per framework...\n`);

  const results = [];

  for (const app of apps) {
    const appDir = join(APPS_DIR, app.dir);

    if (!existsSync(appDir)) {
      console.log(`  ${app.name}: skipped (not found)`);
      continue;
    }

    process.stdout.write(`  ${app.name}: `);

    const times = [];
    for (let i = 0; i < ITERATIONS; i++) {
      // Clean dist before each build
      cleanDist(appDir);

      const time = measureBuildTime(appDir, app.buildCmd);
      if (time !== null) {
        times.push(time);
        process.stdout.write('.');
      } else {
        process.stdout.write('x');
      }
    }

    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      results.push({
        name: app.name,
        avg,
        min,
        max,
        times,
      });
      console.log(` ${avg.toFixed(0)}ms (avg)`);
    } else {
      console.log(' failed');
    }
  }

  // Sort by average time
  results.sort((a, b) => a.avg - b.avg);

  // Calculate ratio relative to fastest (ox-content bare)
  const baseline = results.find((r) => r.name === 'ox-content (bare)')?.avg || results[0]?.avg;

  console.log('\n\nResults (sorted by build time):');
  console.log('================================\n');

  // Calculate column widths
  const nameWidth = Math.max(9, ...results.map((r) => r.name.length));
  const avgWidth = 8;
  const minWidth = 8;
  const maxWidth = 8;
  const ratioWidth = 8;

  const header = `| ${'Framework'.padEnd(nameWidth)} | ${'Avg'.padStart(avgWidth)} | ${'Min'.padStart(minWidth)} | ${'Max'.padStart(maxWidth)} | ${'Ratio'.padStart(ratioWidth)} |`;
  const separator = `|${'-'.repeat(nameWidth + 2)}|${'-'.repeat(avgWidth + 2)}|${'-'.repeat(minWidth + 2)}|${'-'.repeat(maxWidth + 2)}|${'-'.repeat(ratioWidth + 2)}|`;

  console.log(header);
  console.log(separator);

  for (const result of results) {
    const ratio = result.avg / baseline;
    const avgStr = `${result.avg.toFixed(0)}ms`.padStart(avgWidth);
    const minStr = `${result.min.toFixed(0)}ms`.padStart(minWidth);
    const maxStr = `${result.max.toFixed(0)}ms`.padStart(maxWidth);
    const ratioStr = `${ratio.toFixed(2)}x`.padStart(ratioWidth);

    console.log(
      `| ${result.name.padEnd(nameWidth)} | ${avgStr} | ${minStr} | ${maxStr} | ${ratioStr} |`
    );
  }

  console.log('\n');
  console.log('Notes:');
  console.log('- All frameworks built with production settings');
  console.log(`- Average of ${ITERATIONS} builds per framework`);
  console.log('- Disk cache cleared between builds');
  console.log('- Same markdown content used across all frameworks');
}

runBenchmark().catch(console.error);
