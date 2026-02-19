# Source Documentation Generator Example

This example demonstrates **dogfooding** - using Ox Content's own tools to generate documentation for source files, with Vue components embedded for interactive documentation.

## Features

- **Auto-generated API docs**: Extracts JSDoc/TSDoc comments from source files
- **Vue components**: Embed interactive components in the generated documentation
- **Glob pattern support**: Auto-discover components without listing each one

## Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { oxContent } from '@ox-content/vite-plugin';
import { oxContentVue } from '@ox-content/vite-plugin-vue';

export default defineConfig({
  plugins: [
    vue(),

    // Base plugin with docs generation (builtin, opt-out)
    oxContent({
      srcDir: 'docs',
      docs: {
        enabled: true,
        src: ['./src'],
        out: 'docs/api',
        include: ['**/*.ts'],
      },
    }),

    // Vue integration with glob pattern
    oxContentVue({
      srcDir: 'docs',
      components: './src/components/*.vue',
    }),
  ],
});
```

## Usage

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## How It Works

1. **Docs Generation**: The base `oxContent` plugin scans source files for JSDoc comments and generates Markdown documentation automatically.

2. **Vue Components**: The `oxContentVue` plugin enables embedding Vue components in Markdown using glob patterns for easy component discovery.

3. **Dogfooding**: This example uses Ox Content to document its own example source files, demonstrating the tool's capabilities.

## Supported Comment Formats

### JSDoc

```javascript
/**
 * Adds two numbers together.
 *
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 * @example
 * ```javascript
 * add(2, 3) // => 5
 * ```
 */
export function add(a, b) {
  return a + b;
}
```

### TypeScript

```typescript
/**
 * User interface.
 */
export interface User {
  /** User's unique identifier */
  id: string;
  /** User's display name */
  name: string;
}
```
