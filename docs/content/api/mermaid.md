# mermaid.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid.ts)**

## transformMermaidStatic

`function`

Transforms mermaid code blocks in HTML to rendered SVG diagrams.
Uses the native Rust NAPI transformMermaid function.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid.ts#L73)**

```typescript
export async function transformMermaidStatic(
  html: string,
  _options?: MermaidOptions,
): Promise<string>;
```

### Returns

`Promise<string>` -

---
