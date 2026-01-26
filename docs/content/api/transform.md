# transform.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts)**

## NapiBindings

`interface`

NAPI bindings for Rust-based Markdown processing.
Provides access to compiled Rust functions for high-performance
Markdown parsing and rendering operations.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L39)**

---

## OgImageData

`interface`

OG image data for generating social media preview images.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L87)**

---

## OgImageConfig

`interface`

OG image configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L101)**

---

## JsTransformOptions

`interface`

Options for Rust-based Markdown transformation.
Controls which Markdown extensions and features are enabled
during parsing and rendering.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L119)**

---

## loadNapiBindings

`function`

Lazily loads and caches NAPI bindings.
This function uses lazy loading to defer the import of NAPI bindings
until they're actually needed. The bindings are loaded only once and
cached for subsequent uses. If loading fails (e.g., bindings not built),
the failure is cached to avoid repeated load attempts.
## Performance Considerations
The first call to this function may have a slight performance penalty
due to module loading. Subsequent calls use the cached result and are
essentially zero-cost.
## Error Handling
If NAPI bindings are not available (not built, wrong architecture, etc.),
this function returns `null`. The caller should handle this gracefully
or provide fallback behavior.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L207)**

```typescript
async function loadNapiBindings(): Promise<NapiBindings | null>
```

### Returns

`Promise<NapiBindings | null>` - Promise resolving to NAPI bindings or null if unavailable

### Examples

```ts
// Simple check with fallback
const napi = await loadNapiBindings();
if (!napi) {
  console.warn('NAPI bindings not available, using fallback');
  return fallbackRender(content);
}
// Use Rust implementation
const result = napi.transform(content, { gfm: true });
```

---

## SsgTransformOptions

`interface`

SSG-specific transform options.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L350)**

---

## parseFrontmatter

`function`

Parses YAML frontmatter from Markdown content.
Uses proper YAML parser for full nested object support.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L426)**

```typescript
function parseFrontmatter(source: string):
```

---

## buildTocTree

`function`

Builds nested TOC tree from flat list.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L459)**

```typescript
function buildTocTree(entries: TocEntry[]): TocEntry[]
```

### Returns

`TocEntry[]` - 

---

## generateModuleCode

`function`

Generates the JavaScript module code.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L484)**

---

## extractImports

`function`

Extracts imports from Markdown content.
Supports importing components for interactive islands.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L538)**

```typescript
export function extractImports(content: string): string[]
```

### Returns

`string[]` - 

---

## generateOgImageSvg

`function`

Generates an OG image SVG using the Rust-based generator.
This function uses the Rust NAPI bindings to generate SVG-based
OG images for social media previews. The SVG can be served directly
or converted to PNG/JPEG for broader compatibility.
In the future, custom JS templates can be provided to override
the default Rust-based template.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L555)**

```typescript
export async function generateOgImageSvg(
  data: OgImageData,
  config?: OgImageConfig,
  ): Promise<string | null>
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `data` | `OgImageData` | OG image data (title, description, etc.) |
| `config` | `OgImageConfig` | Optional OG image configuration |

### Returns

`Promise<string | null>` - SVG string or null if NAPI bindings are unavailable

---

