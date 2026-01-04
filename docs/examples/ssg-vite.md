# Basic SSG with Vite

This example demonstrates how to use Ox Content with Vite for static site generation.

## Setup

Create a new Vite project and install dependencies:

```bash
npm create vite@latest my-docs -- --template vanilla-ts
cd my-docs
npm install vite-plugin-ox-content
```

## Configuration

Create or update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { oxContent } from 'vite-plugin-ox-content';

export default defineConfig({
  plugins: [
    oxContent({
      srcDir: 'docs',
      gfm: true,
      highlight: true,
      highlightTheme: 'github-dark',
    }),
  ],
});
```

## Usage

Create markdown files in your `docs` directory:

```markdown
---
title: My First Page
---

# Hello World

This is my first page with **Ox Content**.
```

Import and use in your application:

```typescript
import content from './docs/hello.md';

document.getElementById('app').innerHTML = content.html;
```

## Building for Production

```bash
npm run build
```

The output will be in the `dist` directory, ready for deployment.

## Features

- Fast Rust-based Markdown parsing
- Syntax highlighting with Shiki
- GitHub Flavored Markdown support
- Frontmatter parsing
- Table of contents generation
