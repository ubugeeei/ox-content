/**
 * Content-hash based caching for OG images.
 *
 * Uses SHA256 of (template source + props + options) to determine
 * if a re-render is needed. Cache dir: .cache/og-images
 */

import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Computes a cache key from template + props + options.
 */
export function computeCacheKey(
  templateSource: string,
  props: Record<string, unknown>,
  width: number,
  height: number,
): string {
  const data = JSON.stringify({ templateSource, props, width, height });
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Checks if a cached PNG exists for the given key.
 * Returns the cached file path if found, null otherwise.
 */
export async function getCached(cacheDir: string, key: string): Promise<Buffer | null> {
  const filePath = path.join(cacheDir, `${key}.png`);
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

/**
 * Writes a PNG buffer to the cache.
 */
export async function writeCache(cacheDir: string, key: string, png: Buffer): Promise<void> {
  await fs.mkdir(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, `${key}.png`);
  await fs.writeFile(filePath, png);
}
