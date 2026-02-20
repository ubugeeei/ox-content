---
title: Advanced Usage
description: Caching, concurrency, and template tips for OG image generation
author: John Smith
category: Deep Dive
coverColor: "#dc2626"
tags:
  - advanced
  - performance
  - caching
---

# Advanced Usage

## Caching

OG images are cached by default based on a content hash. The cache key includes:

- Template source (SHA256 hash — changes when you edit the template file)
- All props values
- Image dimensions (width, height)

Cached images are stored in `.cache/og-images/`. To force regeneration, delete the cache directory or set `cache: false`.

## Concurrency

Control how many pages are rendered in parallel:

```ts
ogImageOptions: {
  concurrency: 4, // render 4 pages at once
}
```

Higher values speed up builds but use more memory.

## Custom Props

Any YAML-serializable data in frontmatter is available as props. This means you can pass:

- Strings, numbers, booleans
- Arrays (like `tags`)
- Nested objects

The `layout` field is excluded from props since it controls page rendering, not OG images.
