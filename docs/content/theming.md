---
title: Theming
description: Customize the appearance of your documentation site with ox-content's Theme API.
---

# Theming

ox-content provides a flexible Theme API that allows you to customize the appearance of your documentation site. You can use CSS variables for simple customization or write full JSX themes for complete control.

## Quick Start

### CSS Variable Customization

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { oxContent, defineTheme, defaultTheme } from 'vite-plugin-ox-content';

export default defineConfig({
  plugins: [
    oxContent({
      ssg: {
        siteName: 'My Docs',
        theme: defineTheme({
          extends: defaultTheme,
          colors: {
            primary: '#3498db',
          },
          socialLinks: {
            github: 'https://github.com/your/repo',
          },
          footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024 My Company',
          },
        }),
      },
    }),
  ],
});
```

### JSX Theme (Full Control)

ox-content supports JSX/TSX themes that render to static HTML with **zero client-side JavaScript** by default.

```tsx
// theme/Layout.tsx
import {
  usePageProps,
  useSiteConfig,
  useNav,
  raw,
  each,
} from 'vite-plugin-ox-content';

export function Layout({ children }) {
  const page = usePageProps();
  const site = useSiteConfig();
  const nav = useNav();

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>{page.title} - {site.name}</title>
      </head>
      <body>
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
        <main>{children}</main>
      </body>
    </html>
  );
}
```

Configure your `tsconfig.json` for JSX:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "vite-plugin-ox-content"
  }
}
```

## CSS Variables Reference

All CSS variables use the `--octc-` prefix for namespacing.

### Colors

| Option | CSS Variable | Description |
|--------|-------------|-------------|
| `colors.primary` | `--octc-color-primary` | Primary accent color for links, active states |
| `colors.primaryHover` | `--octc-color-primary-hover` | Primary color on hover |
| `colors.background` | `--octc-color-bg` | Main background color |
| `colors.backgroundAlt` | `--octc-color-bg-alt` | Alternative background (sidebar, code blocks) |
| `colors.text` | `--octc-color-text` | Main text color |
| `colors.textMuted` | `--octc-color-text-muted` | Muted/secondary text color |
| `colors.border` | `--octc-color-border` | Border color |
| `colors.codeBackground` | `--octc-color-code-bg` | Code block background |
| `colors.codeText` | `--octc-color-code-text` | Code block text color |

### Layout

| Option | CSS Variable | Description |
|--------|-------------|-------------|
| `layout.sidebarWidth` | `--octc-sidebar-width` | Sidebar width (default: `260px`) |
| `layout.headerHeight` | `--octc-header-height` | Header height (default: `60px`) |
| `layout.maxContentWidth` | `--octc-max-content-width` | Maximum content width (default: `960px`) |

### Fonts

| Option | CSS Variable | Description |
|--------|-------------|-------------|
| `fonts.sans` | `--octc-font-sans` | Sans-serif font stack |
| `fonts.mono` | `--octc-font-mono` | Monospace font stack |

## Page Props & Hooks

Access page data in your theme components using hooks:

### `usePageProps()`

Returns the current page's data:

```tsx
function PageHeader() {
  const page = usePageProps();

  return (
    <header>
      <h1>{page.title}</h1>
      {page.description && <p>{page.description}</p>}
    </header>
  );
}
```

**Available properties:**
- `title` - Page title
- `description` - Page description
- `html` - Rendered HTML content
- `toc` - Table of contents
- `path` - Source file path
- `url` - Output URL
- `frontmatter` - Raw frontmatter object
- `layout` - Layout name

### `useSiteConfig()`

Returns site-wide configuration:

```tsx
function SiteHeader() {
  const site = useSiteConfig();

  return <header>{site.name}</header>;
}
```

### `useNav()`

Returns navigation groups:

```tsx
function Sidebar() {
  const nav = useNav();

  return (
    <nav>
      {each(nav, (group) => (
        <section>
          <h3>{group.title}</h3>
          {each(group.items, (item) => (
            <a href={item.href}>{item.title}</a>
          ))}
        </section>
      ))}
    </nav>
  );
}
```

### `useIsActive(path)`

Checks if a path is the current page:

```tsx
function NavLink({ href, children }) {
  const isActive = useIsActive(href);

  return (
    <a href={href} class={isActive ? 'active' : ''}>
      {children}
    </a>
  );
}
```

## JSX Utilities

### `raw(html)`

Renders raw HTML without escaping:

```tsx
<div>{raw(page.html)}</div>
```

### `each(items, render)`

Maps over arrays:

```tsx
{each(items, (item, index) => (
  <li key={index}>{item.name}</li>
))}
```

### `when(condition, content)`

Conditional rendering:

```tsx
{when(page.toc.length > 0, (
  <aside class="toc">...</aside>
))}
```

## Type Generation

ox-content auto-generates TypeScript types based on your pages' frontmatter. The generated types are saved to your output directory.

```ts
// Generated: page-props.d.ts
export interface PageFrontmatter {
  title: string;
  description?: string;
  layout?: string;
  // ... other fields from your frontmatter
}

export type PageProps = import('vite-plugin-ox-content').PageProps<PageFrontmatter>;
```

Use the generated types:

```tsx
import type { PageProps } from './page-props';

function Layout() {
  const page = usePageProps<PageProps['frontmatter']>();
  // page.frontmatter is now fully typed
}
```

## Layout Switching

Support multiple layouts based on frontmatter:

```tsx
// theme/index.tsx
import { createTheme } from 'vite-plugin-ox-content';
import { DefaultLayout } from './layouts/Default';
import { EntryLayout } from './layouts/Entry';
import { BlogLayout } from './layouts/Blog';

export default createTheme({
  layouts: {
    default: DefaultLayout,
    entry: EntryLayout,
    blog: BlogLayout,
  },
});
```

In your markdown:

```md
---
layout: entry
title: Welcome
---

# Welcome to My Docs
```

## Social Links

Add social links to the header:

```ts
defineTheme({
  extends: defaultTheme,
  socialLinks: {
    github: 'https://github.com/your/repo',
    twitter: 'https://twitter.com/yourhandle',
    discord: 'https://discord.gg/yourserver',
  },
});
```

## Slots

Inject custom HTML at specific locations:

```ts
defineTheme({
  extends: defaultTheme,
  slots: {
    head: '<link rel="preconnect" href="https://fonts.googleapis.com">',
    headerBefore: '<div class="announcement">New version!</div>',
    headerAfter: '',
    sidebarBefore: '',
    sidebarAfter: '',
    contentBefore: '',
    contentAfter: '<div class="feedback">Was this helpful?</div>',
    footerBefore: '',
    footer: '<footer class="custom">...</footer>',
  },
});
```

## Custom CSS and JavaScript

```ts
defineTheme({
  extends: defaultTheme,
  css: `
    .content h1 {
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `,
  js: `
    console.log('Page loaded');
  `,
});
```

## Default Theme Values

```ts
const defaultTheme = {
  name: 'default',
  colors: {
    primary: '#e04d0a',
    primaryHover: '#f5602a',
    background: '#ffffff',
    backgroundAlt: '#f8f9fa',
    text: '#1a1a1a',
    textMuted: '#666666',
    border: '#e5e7eb',
    codeBackground: '#1e293b',
    codeText: '#e2e8f0',
  },
  darkColors: {
    primary: '#f5714a',
    primaryHover: '#ff8a66',
    background: '#141414',
    backgroundAlt: '#141414',
    text: '#e5e5e5',
    textMuted: '#a3a3a3',
    border: '#2a2a2a',
    codeBackground: '#1a1a1a',
    codeText: '#e5e5e5',
  },
  fonts: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  layout: {
    sidebarWidth: '260px',
    headerHeight: '60px',
    maxContentWidth: '960px',
  },
  socialLinks: {},
};
```

## TypeScript Support

All types are exported:

```ts
import type {
  ThemeConfig,
  ThemeColors,
  ThemeLayout,
  ThemeFonts,
  ThemeHeader,
  ThemeFooter,
  SocialLinks,
  ThemeSlots,
  ResolvedThemeConfig,
  PageProps,
  BasePageProps,
  SiteConfig,
  NavGroup,
  NavItem,
  ThemeComponent,
  ThemeProps,
} from 'vite-plugin-ox-content';
```
