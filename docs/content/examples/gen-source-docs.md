# Source Documentation Generator Example

Demonstrates auto-generating API documentation from JSDoc/TSDoc comments.

## Setup

```bash
cd examples/gen-source-docs
pnpm install
pnpm dev
```

## Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { oxContent } from 'vite-plugin-ox-content';
import { oxContentVue } from 'vite-plugin-ox-content-vue';

export default defineConfig({
  plugins: [
    vue(),

    // Base plugin with docs generation
    oxContent({
      srcDir: 'docs',
      docs: {
        enabled: true,
        src: ['./src'],
        out: 'docs/api',
        include: ['**/*.ts'],
        exclude: ['**/*.test.*'],
        format: 'markdown',
        toc: true,
        groupBy: 'file',
      },
    }),

    // Vue integration for interactive docs
    oxContentVue({
      srcDir: 'docs',
      components: './src/components/*.vue',
    }),
  ],
});
```

## Source Files

### utils.ts

```ts
/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The input string
 * @returns The capitalized string
 *
 * @example
 * ```ts
 * capitalize('hello') // => 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### math.ts

```ts
/**
 * Adds two numbers together.
 *
 * @param a - First number
 * @param b - Second number
 * @returns The sum
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

## Generated Output

The plugin generates Markdown files in `docs/api/`:

```
docs/api/
├── index.md       # API index
├── utils.md       # utils.ts documentation
└── math.md        # math.ts documentation
```

## Dogfooding

This example demonstrates dogfooding - using Ox Content's tools to document example source files with Vue components for interactive documentation viewing.
