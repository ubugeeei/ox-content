# cache.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts)**

## computeCacheKey

`function`

Computes a cache key from template + props + options.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts#L12)**

---

## getCached

`function`

Checks if a cached PNG exists for the given key.
Returns the cached file path if found, null otherwise.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts#L25)**

```typescript
export async function getCached(cacheDir: string, key: string): Promise<Buffer | null>;
```

### Returns

`Promise<Buffer | null>` -

---

## writeCache

`function`

Writes a PNG buffer to the cache.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts#L38)**

```typescript
export async function writeCache(cacheDir: string, key: string, png: Buffer): Promise<void>;
```

### Returns

`Promise<void>` -

---
