---
title: ox-content mdast js plugin example
---

# mdast JS Plugins

This example demonstrates **ox-content mdast JS plugins**.

## How It Works

mdast plugins receive the parsed tree before HTML rendering.

```typescript
const myPlugin = defineMdastPlugin("annotate-headings", (tree) => {
  for (const node of tree.children) {
    if (node.type === "heading") {
      node.children?.push({ type: "text", value: " (via mdast plugin)" });
    }
  }
});
```

## Benefits

- mdast-shaped authoring experience
- Existing unified/remark plugins keep working
- Native parser speed with JS extensibility
- TOC stays in sync with transformed headings
