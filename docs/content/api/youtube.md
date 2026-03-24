# youtube.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts)**

## getAttribute

`function`

Get element attribute value.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L31)**

```typescript
function getAttribute(el: Element, name: string): string | undefined
```

### Returns

`string | undefined` - 

---

## extractVideoId

`function`

Extract YouTube video ID from various URL formats.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L41)**

```typescript
export function extractVideoId(input: string): string | null
```

### Returns

`string | null` - 

---

## buildEmbedUrl

`function`

Build YouTube embed URL with parameters.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L64)**

```typescript
function buildEmbedUrl(
  videoId: string,
  options: Required<YouTubeOptions>,
  params?: Record<string, string>,
  ): string
```

### Returns

`string` - 

---

## createYouTubeElement

`function`

Create YouTube embed element.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L85)**

---

## rehypeYouTube

`function`

Rehype plugin to transform YouTube components.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L129)**

```typescript
function rehypeYouTube(options: Required<YouTubeOptions>)
```

---

## transformYouTube

`function`

Transform YouTube components in HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L166)**

```typescript
export async function transformYouTube(html: string, options?: YouTubeOptions): Promise<string>
```

### Returns

`Promise<string>` - 

---

