# Examples

Ox Content provides several examples demonstrating different use cases.

## Integration Examples

### [Vue Integration](./integ-vue.md)

Embed Vue 3 components in Markdown using `vite-plugin-ox-content-vue`.

```ts
import { oxContentVue } from 'vite-plugin-ox-content-vue';

export default defineConfig({
  plugins: [
    vue(),
    oxContentVue({
      components: './src/components/*.vue',
    }),
  ],
});
```

### [React Integration](./integ-react.md)

Embed React components in Markdown using `vite-plugin-ox-content-react`.

```ts
import { oxContentReact } from 'vite-plugin-ox-content-react';

export default defineConfig({
  plugins: [
    react(),
    oxContentReact({
      components: './src/components/*.tsx',
    }),
  ],
});
```

### [Svelte Integration](./integ-svelte.md)

Embed Svelte 5 components in Markdown using `vite-plugin-ox-content-svelte`.

```ts
import { oxContentSvelte } from 'vite-plugin-ox-content-svelte';

export default defineConfig({
  plugins: [
    svelte(),
    oxContentSvelte({
      components: './src/components/*.svelte',
    }),
  ],
});
```

## Plugin Examples

### [markdown-it Plugin](./plugin-markdown-it.md)

Use Ox Content as a markdown-it plugin for existing markdown-it projects.

### [rehype Plugin](./plugin-rehype.md)

Use Ox Content as a rehype plugin in the unified ecosystem.

## Generator Examples

### [Source Docs Generation](./gen-source-docs.md)

Generate API documentation from JSDoc/TSDoc comments automatically.

```ts
oxContent({
  docs: {
    src: ['./src'],
    out: 'docs/api',
    include: ['**/*.ts'],
  },
})
```

## Other Examples

### [Playground](./playground.md)

Interactive web playground for testing Markdown parsing.

### [Vite SSG](./ssg-vite.md)

Static Site Generation example using Vite.

## Running Examples

```bash
# Clone the repository
git clone https://github.com/ubugeeei/ox-content.git
cd ox-content

# Install dependencies
pnpm install

# Run an example
cd examples/integ-vue
pnpm dev
```
