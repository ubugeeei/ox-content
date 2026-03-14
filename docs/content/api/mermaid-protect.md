# mermaid-protect.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts)**

## MermaidSvgProtection

`interface`

Protects mermaid SVG content from rehype HTML5 parser corruption.
rehypeParse + rehypeStringify converts `<br />` in SVG foreignObject
to `<br></br>`, which HTML5 interprets as 2 <br> elements.
Each rehype pass doubles them: 1 → 2 → 4 → 8 → 16.
This module extracts ox-mermaid SVG blocks into placeholders before
rehype processing and restores them after.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts#L1)**

---

## protectMermaidSvgs

`function`

Extract `<div class="ox-mermaid">...</div>` blocks and replace
with HTML comment placeholders that rehype will preserve.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts#L17)**

```typescript
export function protectMermaidSvgs(html: string): MermaidSvgProtection;
```

### Returns

`MermaidSvgProtection` -

---

## restoreMermaidSvgs

`function`

Restore protected mermaid SVG blocks from placeholders.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts#L66)**

```typescript
export function restoreMermaidSvgs(html: string, svgs: Map<string, string>): string;
```

### Returns

`string` -

---
