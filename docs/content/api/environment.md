# environment.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts)**

## createMarkdownEnvironment

`function`

Creates the Markdown processing environment configuration.
This environment is used for:
- Server-side rendering of Markdown files
- Static site generation
- Pre-rendering at build time

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L11)**

```typescript
export function createMarkdownEnvironment(options: ResolvedOptions): EnvironmentOptions
```

### Returns

`EnvironmentOptions` - 

### Examples

```ts
// In your vite.config.ts
export default defineConfig({
  environments: {
    markdown: createMarkdownEnvironment({
      srcDir: 'content',
      gfm: true,
    }),
  },
});
```

---

## EnvironmentTransformContext

`interface`

Environment-specific module transformer.
This is called during the transform phase to process
Markdown files within the environment context.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L81)**

---

## createTransformOptions

`function`

Creates environment-aware transform options.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L109)**

```typescript
export function createTransformOptions(
  ctx: EnvironmentTransformContext,
  options: ResolvedOptions,
  ): ResolvedOptions
```

### Returns

`ResolvedOptions` - 

---

## prerender

`function`

Runs pre-render for SSG.
This function is called during build to pre-render all Markdown files.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L124)**

```typescript
export async function prerender(
  files: string[],
  _options: ResolvedOptions,
  ): Promise<Map<string, string>>
```

### Returns

`Promise<Map<string, string>>` - 

---

## createEnvironmentPlugins

`function`

Environment plugin factory.
Creates plugins specific to the Markdown environment.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L144)**

```typescript
export function createEnvironmentPlugins(_options: ResolvedOptions)
```

---

