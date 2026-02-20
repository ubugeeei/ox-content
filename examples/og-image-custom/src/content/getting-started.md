---
title: Getting Started
description: Learn how to set up custom OG image generation in your project
author: Jane Doe
category: Guide
coverColor: "#059669"
tags:
  - setup
  - tutorial
---

# Getting Started

## 1. Enable OG Image Generation

In your `vite.config.ts`:

```ts
oxContent({
  ogImage: true,
  ogImageOptions: {
    template: "./og-template.ts",
  },
})
```

## 2. Create a Template

The template file must default-export a function that takes props and returns an HTML string:

```ts
export default function (props) {
  return `<div style="...">${props.title}</div>`;
}
```

## 3. Add Frontmatter

Any frontmatter field is available as `props.<fieldName>` in your template:

```markdown
---
title: My Page
category: Guide
coverColor: "#059669"
---
```
