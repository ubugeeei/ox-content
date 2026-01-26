# highlight.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts)**

## getHighlighter

`function`

Get or create the Shiki highlighter.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L14)**

```typescript
async function getHighlighter(theme: string): Promise<Highlighter>
```

### Returns

`Promise<Highlighter>` - 

---

## rehypeShikiHighlight

`function`

Rehype plugin for syntax highlighting with Shiki.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L52)**

---

## getTextContent

`function`

Extract text content from a hast node.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L118)**

```typescript
function getTextContent(node: Element | Root): string
```

### Returns

`string` - 

---

## highlightCode

`function`

Apply syntax highlighting to HTML using Shiki.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L137)**

```typescript
export async function highlightCode(html: string, theme: string = "github-dark"): Promise<string>
```

### Returns

`Promise<string>` - 

---

