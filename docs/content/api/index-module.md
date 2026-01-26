# index.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/index.ts)**

## oxContent

`function`

Creates the Ox Content Vite plugin.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/index.ts#L44)**

### Returns

`Plugin[]` - 

### Examples

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { oxContent } from 'vite-plugin-ox-content';
export default defineConfig({
  plugins: [
    oxContent({
      srcDir: 'content',
      gfm: true,
    }),
  ],
});
```

---

## resolveOptions

`function`

Resolves plugin options with defaults.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/index.ts#L321)**

```typescript
function resolveOptions(options: OxContentOptions): ResolvedOptions
```

### Returns

`ResolvedOptions` - 

---

## generateVirtualModule

`function`

Generates virtual module content.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/index.ts#L349)**

```typescript
function generateVirtualModule(path: string, options: ResolvedOptions): string
```

### Returns

`string` - 

---

