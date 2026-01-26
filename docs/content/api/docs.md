# docs.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts)**

## extractDocs

`function`

Extracts JSDoc documentation from source files in specified directories.
This function recursively searches directories for source files matching
the include/exclude patterns, then extracts all documented items (functions,
classes, interfaces, types) from those files.
## Process
1. **File Discovery**: Recursively walks directories, applying filters
2. **File Reading**: Loads each matching file's content
3. **JSDoc Extraction**: Parses JSDoc comments using regex patterns
4. **Declaration Matching**: Pairs JSDoc comments with source declarations
5. **Result Collection**: Aggregates extracted documentation by file
## Include/Exclude Patterns
Patterns support:
- `**` - Match any directory structure
- `*` - Match any filename
- Standard glob patterns (e.g., `**\/*.test.ts`)
## Performance Considerations
- Uses filesystem I/O which can be slow for large codebases
- Consider using more specific include patterns to reduce file scanning
- Results are not cached; call once per build/dev session
Each ExtractedDocs object contains file path and array of DocEntry items.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L102)**

```typescript
export async function extractDocs(
  srcDirs: string[],
  options: ResolvedDocsOptions,
  ): Promise<ExtractedDocs[]>
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `srcDirs` | `string[]` | Array of source directory paths to scan |
| `options` | `ResolvedDocsOptions` | Documentation extraction options (filters, grouping, etc.) |

### Returns

`Promise<ExtractedDocs[]>` - Promise resolving to array of extracted documentation by file.

### Examples

```ts
const docs = await extractDocs(
  ['./packages/vite-plugin/src'],
  {
    enabled: true,
    src: [],
    out: 'docs',
    include: ['**\/*.ts'],
    exclude: ['**\/*.test.ts', '**\/*.spec.ts'],
    format: 'markdown',
    private: false,
    toc: true,
    groupBy: 'file',
    generateNav: true,
  }
);
// Returns:
// [
//   {
//     file: '/path/to/transform.ts',
//     entries: [
//       { name: 'transformMarkdown', kind: 'function', ... },
//       { name: 'loadNapiBindings', kind: 'function', ... },
//     ]
//   },
//   ...
// ]
```

---

## findFiles

`function`

Recursively finds all source files matching include/exclude patterns.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L189)**

```typescript
async function findFiles(dir: string, options: ResolvedDocsOptions): Promise<string[]>
```

### Returns

`Promise<string[]>` - 

---

## extractFromContent

`function`

Extracts documentation entries from file content.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L246)**

```typescript
function extractFromContent(
  content: string,
  file: string,
  options: ResolvedDocsOptions,
  ): DocEntry[]
```

### Returns

`DocEntry[]` - 

---

## extractFunctionSignature

`function`

Extracts the complete function signature for display.
Captures the full function declaration from `export/async/function name(...): ReturnType`
or `export const name = (...): ReturnType => {}`, handling multi-line signatures.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L276)**

```typescript
function extractFunctionSignature(signature: string): string | undefined
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `signature` | `string` | Multi-line function declaration text |

### Returns

`string | undefined` - Cleaned function signature or undefined if not found

---

## extractTypesFromSignature

`function`

Extracts parameter and return types from a TypeScript function signature.
Parses function signatures to extract:
- Parameter names and their type annotations
- Return type annotation
Handles various function declaration styles:
- `function name(param: type): ReturnType`
- `const name = (param: type): ReturnType => {}`
- `export async function name(param: type): Promise<ReturnType>`

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L309)**

```typescript
function extractTypesFromSignature(
  signature: string,
  _params: ParamDoc[],
  ):
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `signature` | `string` | Multi-line function signature text |
| `params` | `ParamDoc[]` | Array of parameter docs with names already extracted |

### Returns

`{ paramTypes: string[]; returnType?: string }` - Object with extracted parameter types and return type

---

## splitParameters

`function`

Splits function parameters while respecting nested angle brackets (generics).
Handles cases like:
- `a: string, b: number` → `["a: string", "b: number"]`
- `a: Promise<string>, b: Record<string, any>` → `["a: Promise<string>", "b: Record<string, any>"]`

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L378)**

```typescript
function splitParameters(paramListStr: string): string[]
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `paramListStr` | `string` | String containing all parameters |

### Returns

`string[]` - Array of individual parameter strings

---

## parseJsdocBlock

`function`

Parses a JSDoc block and the following declaration.
Only matches if the declaration is immediately after the JSDoc (with only whitespace/keywords between).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L417)**

---

## generateMarkdown

`function`

Generates Markdown documentation from extracted docs.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L583)**

```typescript
export function generateMarkdown(
  docs: ExtractedDocs[],
  options: ResolvedDocsOptions,
  ): Record<string, string>
```

### Returns

`Record<string, string>` - 

---

## SymbolLocation

`interface`

Symbol location info for cross-file linking.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L781)**

---

## convertSymbolLinks

`function`

Converts symbol links [SymbolName] to markdown links.
Processes description text to convert cargo-docs-style symbol references
`[SymbolName]` into clickable markdown links pointing to the appropriate
documentation page.
## Examples
Input: "See [transformMarkdown] for usage" (same file)
Output: "See [transformMarkdown](#transformmarkdown) for usage"
Input: "Uses [NavItem](./types.md#navitem) interface" (different file: types.ts)
Output: "Uses [NavItem](./types.md#navitem) interface"

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L790)**

```typescript
function convertSymbolLinks(
  text: string,
  currentFileName: string,
  symbolMap: Map<string, SymbolLocation>,
  ): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `text` | `string` | Description text containing symbol references |
| `currentFileName` | `string` | Current file name (without extension) for same-file detection |
| `symbolMap` | `Map<string, SymbolLocation>` | Map of symbol names to their file locations |

### Returns

`string` - Text with symbol references converted to markdown links

---

## buildSymbolMap

`function`

Builds a map of all symbols to their file locations.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L836)**

```typescript
function buildSymbolMap(docs: ExtractedDocs[]): Map<string, SymbolLocation>
```

### Returns

`Map<string, SymbolLocation>` - 

---

## writeDocs

`function`

Writes generated documentation to the output directory.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L860)**

---

## generateSourceLink

`function`

Generates a GitHub source link for a file and optional line number.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L888)**

```typescript
function generateSourceLink(filePath: string, githubUrl: string, lineNumber?: number): string
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `filePath` | `string` | Full path to the source file |
| `githubUrl` | `string` | Base GitHub repository URL |
| `lineNumber` | `number` | Optional line number to link to |

### Returns

`string` - Markdown link to source code

---

