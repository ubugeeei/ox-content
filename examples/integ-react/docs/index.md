---
title: React Integration Example
description: Embedding React components in Markdown
---

# React Integration Example

Embed React components directly in Markdown using `vite-plugin-ox-content-react`.

## Interactive Counter

<Counter start={5} />

Click the buttons to increment or decrement!

## Alert Components

<Alert type="info" title="Information">
This is powered by React 18.
</Alert>

<Alert type="success" title="Success">
Components work seamlessly in Markdown!
</Alert>

## Configuration

```tsx
// vite.config.ts
import { oxContentReact } from 'vite-plugin-ox-content-react';

export default defineConfig({
  plugins: [
    react(),
    oxContentReact({
      components: {
        Counter: './src/components/Counter.tsx',
        Alert: './src/components/Alert.tsx',
      },
    }),
  ],
});
```

## Features

- Full React 18 support
- TypeScript components
- Hot Module Replacement
- SSR with Vite Environment API
