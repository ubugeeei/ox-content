# dev-server.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts)**

## shouldSkip

`function`

Check if a request URL should be skipped by the dev server middleware.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L57)**

```typescript
function shouldSkip(url: string): boolean
```

### Returns

`boolean` - 

---

## resolveMarkdownFile

`function`

Resolve a request URL to a markdown file path.
Returns null if no matching file exists.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L79)**

```typescript
async function resolveMarkdownFile(url: string, srcDir: string): Promise<string | null>
```

### Returns

`Promise<string | null>` - 

---

## injectViteHmrClient

`function`

Inject Vite HMR client script into the HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L123)**

```typescript
function injectViteHmrClient(html: string): string
```

### Returns

`string` - 

---

## DevServerCache

`interface`

Dev server state for caching.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L195)**

---

## createDevServerCache

`function`

Create a dev server cache instance.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L207)**

```typescript
export function createDevServerCache(): DevServerCache
```

### Returns

`DevServerCache` - 

---

## invalidateNavCache

`function`

Invalidate navigation cache (called on file add/unlink).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L218)**

```typescript
export function invalidateNavCache(cache: DevServerCache): void
```

### Returns

`void` - 

---

## invalidatePageCache

`function`

Invalidate page cache for a specific file (called on file change).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L227)**

```typescript
export function invalidatePageCache(cache: DevServerCache, filePath: string): void
```

### Returns

`void` - 

---

## resolveSiteName

`function`

Resolve site name from options or package.json.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L234)**

```typescript
async function resolveSiteName(options: ResolvedOptions, root: string): Promise<string>
```

### Returns

`Promise<string>` - 

---

## renderPage

`function`

Render a single markdown page to full HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L255)**

---

## createDevServerMiddleware

`function`

Create the dev server middleware for SSG page serving.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L348)**

```typescript
export function createDevServerMiddleware(
  options: ResolvedOptions,
  root: string,
  cache: DevServerCache,
  ): Connect.NextHandleFunction
```

### Returns

`Connect.NextHandleFunction` - 

---

