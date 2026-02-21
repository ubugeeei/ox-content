---
layout: entry
title: Ox Content
description: High-performance documentation toolkit built in Rust. Framework-agnostic, zero-copy parsing, NAPI bindings for Node.js.
hero:
  name: Ox Content
  text: High-performance documentation framework
  tagline: Built with Rust. Framework-agnostic. Blazing fast.
  image:
    src: logo.svg
    alt: Ox Content Logo
  actions:
    - theme: brand
      text: Get Started
      link: getting-started.md
    - theme: alt
      text: View on GitHub
      link: https://github.com/ubugeeei/ox-content
    - theme: alt
      text: Sponsor
      link: https://github.com/sponsors/ubugeeei
features:
  - icon: "mdi:lightning-bolt"
    title: Blazing Fast
    details: Arena-based allocation with Rust core for maximum performance
    link: architecture.md
  - icon: "mdi:package-variant"
    title: Framework Agnostic
    details: Works with Vue, React, Svelte, and more via NAPI bindings
  - icon: "mdi:magnify"
    title: Built-in Search
    details: Full-text search with BM25 scoring and CJK support
  - icon: "mdi:palette"
    title: Customizable Themes
    details: VitePress-like theming with CSS variables
    link: theming.md
---

## Core Philosophy

1. **Performance First** - Arena-based allocation for zero-copy parsing
2. **Standards Compliant** - Full CommonMark + GFM support with mdast-compatible AST
3. **Framework Agnostic** - Works with any JavaScript framework via NAPI
4. **Developer Experience** - Excellent TypeScript types and error messages

## Quick Links

- [Getting Started](./getting-started.md) - Installation and first steps
- [Architecture](./architecture.md) - Deep dive into the design
- [Theming](./theming.md) - Customize your documentation site
- [GitHub](https://github.com/ubugeeei/ox-content) - Source code and issues
