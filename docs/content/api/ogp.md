# ogp.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts)**

## getAttribute

`function`

Get element attribute value.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L43)**

```typescript
function getAttribute(el: Element, name: string): string | undefined;
```

### Returns

`string | undefined` -

---

## extractDomain

`function`

Extract domain from URL.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L53)**

```typescript
function extractDomain(url: string): string;
```

### Returns

`string` -

---

## getFaviconUrl

`function`

Get favicon URL for a domain.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L65)**

```typescript
function getFaviconUrl(url: string): string;
```

### Returns

`string` -

---

## parseOgpFromHtml

`function`

Parse OGP metadata from HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L78)**

```typescript
function parseOgpFromHtml(html: string, url: string): OgpData;
```

### Returns

`OgpData` -

---

## fetchOgpData

`function`

Fetch OGP data for a URL.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L140)**

```typescript
export async function fetchOgpData(
  url: string,
  options: Required<OgpOptions>,
): Promise<OgpData | null>;
```

### Returns

`Promise<OgpData | null>` -

---

## createOgpCard

`function`

Create OGP card element.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L193)**

```typescript
function createOgpCard(data: OgpData): Element;
```

### Returns

`Element` -

---

## createFallbackCard

`function`

Create fallback element when OGP data is unavailable.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L286)**

```typescript
function createFallbackCard(url: string): Element;
```

### Returns

`Element` -

---

## collectOgpUrls

`function`

Collect all OGP URLs from HTML for pre-fetching.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L325)**

```typescript
export async function collectOgpUrls(html: string): Promise<string[]>;
```

### Returns

`Promise<string[]>` -

---

## prefetchOgpData

`function`

Pre-fetch all OGP data.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L340)**

```typescript
export async function prefetchOgpData(
  urls: string[],
  options?: OgpOptions,
): Promise<Map<string, OgpData | null>>;
```

### Returns

`Promise<Map<string, OgpData | null>>` -

---

## rehypeOgp

`function`

Rehype plugin to transform OgCard components.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L360)**

```typescript
function rehypeOgp(ogpDataMap: Map<string, OgpData | null>);
```

---

## transformOgp

`function`

Transform OgCard components in HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L392)**

```typescript
export async function transformOgp(
  html: string,
  ogpDataMap?: Map<string, OgpData | null>,
  options?: OgpOptions,
): Promise<string>;
```

### Returns

`Promise<string>` -

---
