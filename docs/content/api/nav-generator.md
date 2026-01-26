# nav-generator.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts)**

## generateNavMetadata

`function`

Generates sidebar navigation metadata from extracted documentation.
Takes an array of extracted documentation and produces a flat navigation
structure suitable for sidebar menus. Items are:
- Sorted alphabetically by display name
- Formatted with readable titles
- Prefixed with the specified base path
## Naming Conventions
- `transform.ts` → `{ title: 'Transform', path: '/api/transform' }`
- `nav-generator.ts` → `{ title: 'Nav Generator', path: '/api/nav-generator' }`
- `index.ts` or `index-module.ts` → `{ title: 'Overview', path: '/api/index' }`
- `types.ts` → `{ title: 'Types', path: '/api/types' }`
## Sorting
Items are sorted alphabetically by display title for consistent ordering.
Special item 'Overview' sorts naturally with others (O comes after most letters).
## Path Generation
The generated paths are used to import corresponding Markdown files:
- Path `/api/transform` → Import from `../api/transform.md`
- Path `/api/index` → Import from `../api/index.md`
Use '/api' for main API docs, '/helpers' for utilities, etc.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L62)**

```typescript
export function generateNavMetadata(docs: ExtractedDocs[], basePath: string = "/api"): NavItem[]
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `docs` | `ExtractedDocs[]` | Array of extracted documentation (file + entries) |
| `basePath` | `string` | Base path prefix for navigation URLs (default: '/api') |

### Returns

`NavItem[]` - Array of navigation items ready to use or export to TypeScript

### Examples

```ts
const navItems = generateNavMetadata(
  [
    { file: 'transform.ts', entries: [...] },
    { file: 'docs.ts', entries: [...] },
    { file: 'types.ts', entries: [...] },
  ],
  '/api'
);
// Returns:
// [
//   { title: 'Docs', path: '/api/docs' },
//   { title: 'Transform', path: '/api/transform' },
//   { title: 'Types', path: '/api/types' },
// ]
```

---

## getDocDisplayName

`function`

Gets the human-readable display name for a documentation file.
Transforms file paths and names into proper title case:
- Extracts base name (e.g., 'transform.ts' → 'transform')
- Converts kebab-case to Title Case (e.g., 'nav-generator' → 'Nav Generator')
- Converts camelCase to Title Case (e.g., 'transformMarkdown' → 'Transform Markdown')
- Handles special cases (index → 'Overview')
## Examples
- `'/path/to/transform.ts'` → `'Transform'`
- `'nav-generator.ts'` → `'Nav Generator'`
- `'index.ts'` → `'Overview'`
- `'index-module.ts'` → `'Overview'`
- `'myFunction.ts'` → `'My Function'` (with camelCase handling)

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L130)**

```typescript
function getDocDisplayName(filePath: string): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `filePath` | `string` | Full or relative file path |

### Returns

`string` - Formatted display name suitable for UI labels

---

## getDocFileName

`function`

Gets the file name (without extension) for use in navigation paths.
This handles filename conflicts that may occur during generation:
- Preserves most names as-is
- Special handling for index files to maintain consistency

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L167)**

```typescript
function getDocFileName(filePath: string): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `filePath` | `string` | Source file path |

### Returns

`string` - File name without extension, ready for URL paths

---

## generateNavCode

`function`

Generates TypeScript code for navigation metadata export.
Creates a complete, self-contained TypeScript file that:
- Defines the NavItem interface
- Exports navigation items as a const
- Uses `as const` for type-safe literal types
- Includes auto-generation notice
The generated code is production-ready and suitable for direct import
in Vue, React, or vanilla TypeScript applications.
## Generated Code Example
```typescript
export interface NavItem {
title: string;
path: string;
children?: NavItem[];
}
export const apiNav: NavItem[] = [
{ "title": "Docs", "path": "/api/docs" },
{ "title": "Transform", "path": "/api/transform" },
// ...
] as const;
```
## Features
- **Type Safety**: Includes NavItem interface definition
- **Readonly**: Uses `as const` to ensure immutability
- **IDE Support**: Full IntelliSense and autocomplete
- **Self-Documenting**: Includes notice that file is auto-generated
Use custom names for different navigation sections
ready to write to a .ts file

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L191)**

```typescript
export function generateNavCode(navItems: NavItem[], exportName: string = "apiNav"): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `navItems` | `NavItem[]` | Array of navigation items to export |
| `exportName` | `string` | Name of the exported const (default: 'apiNav') |

### Returns

`string` - Complete TypeScript source code as string,

### Examples

```ts
const navItems = [
  { title: 'Home', path: '/api/index' },
  { title: 'Transform', path: '/api/transform' },
];
const code = generateNavCode(navItems, 'apiNav');
await fs.promises.writeFile('docs/api/nav.ts', code, 'utf-8');
```

---

