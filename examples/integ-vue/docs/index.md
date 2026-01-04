---
title: Vue Integration Example
description: Embedding Vue components in Markdown
---

# Vue Integration Example

This example demonstrates how to embed Vue components directly in Markdown using `vite-plugin-ox-content-vue`.

## Interactive Counter

Here's a counter component embedded in Markdown:

<Counter :start="10" />

You can interact with it just like any Vue component!

## Alert Components

<Alert type="info" title="Information">
This is an informational message.
</Alert>

<Alert type="warning" title="Warning">
Be careful with this operation.
</Alert>

<Alert type="success" title="Success">
Operation completed successfully!
</Alert>

## Code Demo

<CodeDemo language="typescript" code="import { oxContentVue } from 'vite-plugin-ox-content-vue';

export default defineConfig({
  plugins: [
    vue(),
    oxContentVue({
      components: {
        Counter: './src/components/Counter.vue',
      },
    }),
  ],
});" />

## How It Works

The `vite-plugin-ox-content-vue` plugin:

1. Parses Markdown files for Vue component syntax
2. Extracts component usages and generates Vue SFC
3. Uses Vite's Environment API for SSR/client rendering
4. Supports HMR for both Markdown and components

## Architecture

```
docs/
  index.md          # Markdown with <Counter /> syntax
src/
  components/
    Counter.vue     # Vue component
vite.config.ts      # Register components here
```

The plugin transforms `.md` files into Vue components at build time.
