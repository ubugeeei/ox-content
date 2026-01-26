# ssg.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts)**

## SsgNavItem

`interface`

Navigation item for SSG.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L21)**

---

## SsgEntryPageConfig

`interface`

Entry page configuration for SSG (passed to Rust).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L31)**

---

## SsgPageData

`interface`

Page data for SSG.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L39)**

---

## resolveSsgOptions

`function`

Resolves SSG options with defaults.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L797)**

```typescript
export function resolveSsgOptions(ssg: SsgOptions | boolean | undefined): ResolvedSsgOptions
```

### Returns

`ResolvedSsgOptions` - 

---

## renderTemplate

`function`

Simple mustache-like template rendering.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L835)**

```typescript
function renderTemplate(template: string, data: Record<string, unknown>): string
```

### Returns

`string` - 

---

## extractTitle

`function`

Extracts title from content or frontmatter.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L861)**

```typescript
function extractTitle(content: string, frontmatter: Record<string, unknown>): string
```

### Returns

`string` - 

---

## _generateNavHtml

`function`

Generates navigation HTML from nav groups.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L877)**

```typescript
function _generateNavHtml(navGroups: NavGroup[], currentPath: string): string
```

### Returns

`string` - 

---

## _generateTocHtml

`function`

Generates TOC HTML from toc entries.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L901)**

```typescript
function _generateTocHtml(toc: TocEntry[]): string
```

### Returns

`string` - 

---

## generateBareHtmlPage

`function`

Generates bare HTML page (no navigation, no styles).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L920)**

```typescript
export function generateBareHtmlPage(content: string, title: string): string
```

### Returns

`string` - 

---

## generateHtmlPage

`function`

Generates HTML page with navigation using Rust NAPI bindings.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L930)**

---

## getOutputPath

`function`

Converts a markdown file path to its corresponding HTML output path.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1015)**

---

## getUrlPath

`function`

Converts a markdown file path to a relative URL path.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1035)**

```typescript
function getUrlPath(inputPath: string, srcDir: string): string
```

### Returns

`string` - 

---

## getHref

`function`

Converts a markdown file path to an href.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1049)**

```typescript
function getHref(inputPath: string, srcDir: string, base: string, extension: string): string
```

### Returns

`string` - 

---

## getOgImagePath

`function`

Gets the OG image output path for a given markdown file.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1060)**

```typescript
function getOgImagePath(inputPath: string, srcDir: string, outDir: string): string
```

### Returns

`string` - 

---

## getOgImageUrl

`function`

Gets the OG image URL for use in meta tags.
If siteUrl is provided, returns an absolute URL (required for SNS sharing).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1075)**

```typescript
function getOgImageUrl(inputPath: string, srcDir: string, base: string, siteUrl?: string): string
```

### Returns

`string` - 

---

## getDisplayTitle

`function`

Gets display title from file path.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1097)**

```typescript
function getDisplayTitle(filePath: string): string
```

### Returns

`string` - 

---

## formatTitle

`function`

Formats a file/dir name as a title.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1114)**

```typescript
function formatTitle(name: string): string
```

### Returns

`string` - 

---

## collectMarkdownFiles

`function`

Collects all markdown files from the source directory.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1123)**

```typescript
export async function collectMarkdownFiles(srcDir: string): Promise<string[]>
```

### Returns

`Promise<string[]>` - 

---

## NavGroup

`interface`

Navigation group for hierarchical navigation.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1135)**

---

## buildNavItems

`function`

Builds navigation items from markdown files, grouped by directory.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1143)**

---

## buildSsg

`function`

Builds all markdown files to static HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1228)**

```typescript
export async function buildSsg(
  options: ResolvedOptions,
  root: string,
  ): Promise<
```

### Returns

`Promise<` - 

---

