# page-context.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts)**

## BasePageProps

`interface`

Base page props available for all pages.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L31)**

---

## PageProps

`type`

Extended page props with custom frontmatter.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L53)**

---

## SiteConfig

`interface`

Site-wide configuration available in context.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L62)**

---

## NavGroup

`interface`

Navigation group.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L76)**

---

## NavItem

`interface`

Navigation item.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L84)**

---

## RenderContext

`interface`

Complete render context.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L93)**

---

## setRenderContext

`function`

Sets the current render context.
Called internally during page rendering.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L106)**

```typescript
export function setRenderContext(ctx: RenderContext): void
```

### Returns

`void` - 

---

## clearRenderContext

`function`

Clears the current render context.
Called internally after page rendering.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L115)**

```typescript
export function clearRenderContext(): void
```

### Returns

`void` - 

---

## usePageProps

`function`

Gets the current page props.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L124)**

### Returns

`PageProps<T>` - The current page props

### Examples

```ts
function PageTitle() {
  const page = usePageProps();
  return <h1>{page.title}</h1>;
}
```

---

## useSiteConfig

`function`

Gets the site configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L148)**

```typescript
export function useSiteConfig(): SiteConfig
```

### Returns

`SiteConfig` - The site configuration

### Examples

```ts
function SiteHeader() {
  const site = useSiteConfig();
  return <header>{site.name}</header>;
}
```

---

## useRenderContext

`function`

Gets the full render context.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L172)**

### Returns

`RenderContext<T>` - The complete render context

### Examples

```ts
function Layout({ children }) {
  const ctx = useRenderContext();
  return (
    <html>
      <head><title>{ctx.page.title} - {ctx.site.name}</title></head>
      <body>{children}</body>
    </html>
  );
}
```

---

## useNav

`function`

Gets the navigation groups.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L201)**

```typescript
export function useNav(): NavGroup[]
```

### Returns

`NavGroup[]` - 

### Examples

```ts
function Sidebar() {
  const nav = useNav();
  return (
    <nav>
      {each(nav, (group) => (
        <div>
          <h3>{group.title}</h3>
          <ul>
            {each(group.items, (item) => (
              <li><a href={item.href}>{item.title}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

---

## useIsActive

`function`

Checks if the given path is the current page.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L229)**

```typescript
export function useIsActive(path: string): boolean
```

### Returns

`boolean` - 

### Examples

```ts
function NavLink({ href, children }) {
  const isActive = useIsActive(href);
  return <a href={href} class={isActive ? 'active' : ''}>{children}</a>;
}
```

---

## FrontmatterSchema

`interface`

Schema for frontmatter type generation.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L247)**

---

## inferType

`function`

Infers TypeScript types from frontmatter values.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L261)**

```typescript
export function inferType(value: unknown): string
```

### Returns

`string` - 

---

## generateFrontmatterTypes

`function`

Generates TypeScript interface from frontmatter samples.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L287)**

```typescript
export function generateFrontmatterTypes(
  samples: Record<string, unknown>[],
  interfaceName = "PageFrontmatter"
  ): string
```

### Returns

`string` - 

---

