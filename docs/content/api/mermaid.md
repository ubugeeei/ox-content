# mermaid.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/mermaid.ts)**

## getTextContent

`function`

Extract text content from a hast node.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/mermaid.ts#L13)**

```typescript
function getTextContent(node: Element | Root): string
```

### Returns

`string` - 

---

## rehypeMermaid

`function`

Rehype plugin to transform mermaid code blocks.
Replaces ```mermaid blocks with a wrapper element
that can be rendered client-side.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/mermaid.ts#L32)**

```typescript
function rehypeMermaid()
```

---

## transformMermaid

`function`

Transform mermaid code blocks in HTML.
Creates wrapper elements that can be rendered client-side
by the mermaid runtime.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/mermaid.ts#L103)**

```typescript
export async function transformMermaid(html: string): Promise<string>
```

### Returns

`Promise<string>` - 

---

