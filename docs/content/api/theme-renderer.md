# theme-renderer.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts)**

## ThemeComponent

`type`

Theme component type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L22)**

---

## ThemeProps

`interface`

Props passed to the theme component.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L27)**

---

## PageData

`interface`

Page data for rendering.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L35)**

---

## ThemeRenderOptions

`interface`

Theme render options.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L57)**

---

## renderPage

`function`

Renders a page using the theme component.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L75)**

```typescript
export function renderPage(
  page: PageData,
  options: ThemeRenderOptions
  ): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `page` | `PageData` | Page data to render |
| `options` | `ThemeRenderOptions` | Theme render options |

### Returns

`string` - Rendered HTML string

---

## renderAllPages

`function`

Renders all pages and generates type definitions.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L144)**

```typescript
export async function renderAllPages(
  pages: PageData[],
  options: ThemeRenderOptions
  ): Promise<Map<string, string>>
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `pages` | `PageData[]` | All pages to render |
| `options` | `ThemeRenderOptions` | Theme render options |

### Returns

`Promise<Map<string, string>>` - Map of output paths to rendered HTML

---

## generateTypes

`function`

Generates TypeScript type definitions from page frontmatter.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L171)**

```typescript
export async function generateTypes(
  pages: PageData[],
  outDir: string
  ): Promise<void>
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `pages` | `PageData[]` | All pages |
| `outDir` | `string` | Output directory for types |

### Returns

`Promise<void>` - 

---

## DefaultTheme

`function`

Default theme component.
A minimal theme that renders page content with basic styling.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L193)**

### Returns

`JSXNode` - 

---

## createTheme

`function`

Creates a theme with layout switching support.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L249)**

### Returns

`ThemeComponent` - 

### Examples

```ts
import { createTheme } from '@ox-content/vite-plugin';
import { DefaultLayout } from './layouts/Default';
import { EntryLayout } from './layouts/Entry';
export default createTheme({
  layouts: {
    default: DefaultLayout,
    entry: EntryLayout,
  },
});
```

---

