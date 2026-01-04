---
title: Svelte Integration Example
description: Embedding Svelte components in Markdown
---

# Svelte Integration Example

Embed Svelte 5 components directly in Markdown using `vite-plugin-ox-content-svelte`.

## Interactive Counter

<Counter start={3} />

Uses Svelte 5 Runes (`$state`, `$props`)!

## Alert Components

<Alert type="info" title="Information">
Powered by Svelte 5 with Runes.
</Alert>

<Alert type="success" title="Success">
Components work seamlessly!
</Alert>

## Configuration

```ts
// vite.config.ts
import { oxContentSvelte } from 'vite-plugin-ox-content-svelte';

export default defineConfig({
  plugins: [
    svelte(),
    oxContentSvelte({
      components: {
        Counter: './src/components/Counter.svelte',
        Alert: './src/components/Alert.svelte',
      },
    }),
  ],
});
```

## Features

- Svelte 5 with Runes support
- Hot Module Replacement
- SSR with Vite Environment API
