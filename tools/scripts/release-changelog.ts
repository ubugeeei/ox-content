import * as fs from "fs";
import * as path from "path";

export type Exec = (cmd: string) => string;

export type ChangelogImpact = {
  crates: string[];
  npmPackages: string[];
  areas: string[];
};

export type CommitEntry = {
  hash?: string;
  subject: string;
  files: string[];
  impact: ChangelogImpact;
};

type ImpactOptions = {
  root: string;
  npmPackages: string[];
};

const CHANGELOG_CATEGORIES = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance",
  refactor: "Refactoring",
  docs: "Documentation",
} as const;

const CATEGORY_KEYS = [...Object.keys(CHANGELOG_CATEGORIES), "chore", "other"] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

export function getCommitsSinceTag(
  exec: Exec,
  tag: string | undefined,
  options: ImpactOptions,
): CommitEntry[] {
  try {
    const range = tag ? `${tag}..HEAD` : "HEAD";
    const log = exec(`git log ${range} --pretty=format:%H%x00%s --no-merges`);
    return log
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, subject] = line.split("\0", 2);
        const files = getCommitFiles(exec, hash);
        return {
          hash,
          subject,
          files,
          impact: collectCommitImpact(files, options),
        };
      });
  } catch {
    return [];
  }
}

export function categorizeCommits(commits: CommitEntry[]): Record<CategoryKey, CommitEntry[]> {
  const categories = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, []])) as Record<
    CategoryKey,
    CommitEntry[]
  >;

  for (const commit of commits) {
    if (commit.subject.includes("Generated with [Claude Code]")) continue;

    const match = commit.subject.match(/^(\w+)(?:\([^)]+\))?(?:!)?:\s*(.+)/);
    if (match) {
      const [, type, message] = match;
      const category = isCategoryKey(type) && categories[type] ? type : "other";
      categories[category].push({ ...commit, subject: message });
    } else {
      categories.other.push(commit);
    }
  }

  return categories;
}

export function generateChangelog(
  version: string,
  commits: Record<CategoryKey, CommitEntry[]>,
): string {
  const date = new Date().toISOString().split("T")[0];
  let changelog = `## [${version}] - ${date}\n\n`;

  for (const [key, title] of Object.entries(CHANGELOG_CATEGORIES) as [CategoryKey, string][]) {
    if (commits[key]?.length) {
      changelog += `### ${title}\n\n`;
      for (const entry of commits[key]) {
        changelog += `- ${entry.subject}${formatImpactAnnotation(entry.impact)}\n`;
      }
      changelog += "\n";
    }
  }

  return changelog;
}

export function collectCommitImpact(files: string[], options: ImpactOptions): ChangelogImpact {
  const npmPackages = buildNpmPackageLookup(options);
  const impact = {
    crates: new Set<string>(),
    npmPackages: new Set<string>(),
    areas: new Set<string>(),
  };

  for (const file of files) {
    const normalized = file.replace(/\\/g, "/");
    const crate = normalized.match(/^crates\/(ox_content_[^/]+)/)?.[1];
    if (crate) impact.crates.add(crate);

    const npmPackage = npmPackages.find((pkg) => pathBelongsTo(normalized, pkg.path));
    if (npmPackage) impact.npmPackages.add(npmPackage.name);

    for (const area of collectAreas(normalized)) {
      impact.areas.add(area);
    }
  }

  return {
    crates: [...impact.crates].sort(),
    npmPackages: [...impact.npmPackages].sort(),
    areas: [...impact.areas].sort(),
  };
}

export function formatImpact(impact: ChangelogImpact): string {
  const parts = [];
  if (impact.crates.length) parts.push(`crates: ${summarize(impact.crates)}`);
  if (impact.npmPackages.length) parts.push(`npm: ${summarize(impact.npmPackages)}`);
  if (impact.areas.length) parts.push(summarize(impact.areas));
  return parts.join("; ");
}

function getCommitFiles(exec: Exec, hash: string): string[] {
  if (!hash) return [];
  return exec(`git show --format= --name-only ${hash}`).trim().split("\n").filter(Boolean);
}

function formatImpactAnnotation(impact: ChangelogImpact): string {
  const formatted = formatImpact(impact);
  return formatted ? ` _(affects: ${formatted})_` : "";
}

function buildNpmPackageLookup(options: ImpactOptions): { path: string; name: string }[] {
  return options.npmPackages
    .map((pkgPath) => {
      const packageJsonPath = path.join(options.root, pkgPath, "package.json");
      if (!fs.existsSync(packageJsonPath)) return undefined;
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as { name?: string };
      return pkg.name ? { path: pkgPath.replace(/\\/g, "/"), name: pkg.name } : undefined;
    })
    .filter((pkg): pkg is { path: string; name: string } => Boolean(pkg))
    .sort((a, b) => b.path.length - a.path.length);
}

function collectAreas(file: string): string[] {
  const areas = [];
  if (file === "README.md" || file.startsWith("docs/")) areas.push("docs");
  if (file.startsWith(".github/")) areas.push("ci");
  if (file.startsWith("tools/")) areas.push("tooling");
  if (file.startsWith("editors/")) areas.push("editor extensions");
  if (file.startsWith("nix/") || file === "flake.nix" || file === "flake.lock") areas.push("nix");
  if (
    file === "Cargo.toml" ||
    file === "Cargo.lock" ||
    file === "package.json" ||
    file === "pnpm-lock.yaml" ||
    file === "pnpm-workspace.yaml" ||
    file === "rust-toolchain.toml"
  ) {
    areas.push("workspace metadata");
  }
  return areas;
}

function summarize(items: string[], max = 8): string {
  if (items.length <= max) return items.join(", ");
  return `${items.slice(0, max).join(", ")} (+${items.length - max} more)`;
}

function pathBelongsTo(file: string, dir: string): boolean {
  return file === dir || file.startsWith(`${dir}/`);
}

function isCategoryKey(key: string): key is CategoryKey {
  return CATEGORY_KEYS.includes(key as CategoryKey);
}
