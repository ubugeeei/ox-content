# search.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts)**

## resolveSearchOptions

`function`

Resolves search options with defaults.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L26)**

```typescript
export function resolveSearchOptions(
  options: SearchOptions | boolean | undefined,
  ): ResolvedSearchOptions
```

### Returns

`ResolvedSearchOptions` - 

---

## collectMarkdownFiles

`function`

Collects all Markdown files from a directory.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L53)**

```typescript
async function collectMarkdownFiles(dir: string): Promise<string[]>
```

### Returns

`Promise<string[]>` - 

---

## buildSearchIndex

`function`

Builds the search index from Markdown files.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L81)**

```typescript
export async function buildSearchIndex(srcDir: string, base: string): Promise<string>
```

### Returns

`Promise<string>` - 

---

## writeSearchIndex

`function`

Writes the search index to a file.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L137)**

```typescript
export async function writeSearchIndex(indexJson: string, outDir: string): Promise<void>
```

### Returns

`Promise<void>` - 

---

## generateSearchModule

`function`

Client-side search module code.
This is injected into the bundle as a virtual module.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L150)**

```typescript
export function generateSearchModule(options: ResolvedSearchOptions, indexPath: string): string
```

### Returns

`string` - 

---

