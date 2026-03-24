# parse.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts)**

## getAttribute

`function`

Get element attribute value.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L27)**

```typescript
function getAttribute(el: Element, name: string): string | undefined
```

### Returns

`string | undefined` - 

---

## parseProps

`function`

Parse JSX-style props from attributes.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L37)**

```typescript
function parseProps(el: Element): Record<string, unknown>
```

### Returns

`Record<string, unknown>` - 

---

## findComponentElement

`function`

Find the component element inside <Island>.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L79)**

```typescript
function findComponentElement(children: Element["children"]): Element | null
```

### Returns

`Element | null` - 

---

## getComponentName

`function`

Get component name from child element.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L94)**

```typescript
function getComponentName(el: Element): string
```

### Returns

`string` - 

---

## resetIslandCounter

`function`

Reset island counter (for testing).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L109)**

```typescript
export function resetIslandCounter(): void
```

### Returns

`void` - 

---

## rehypeIslands

`function`

Rehype plugin to transform Island components.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L116)**

```typescript
function rehypeIslands(collectedIslands: IslandInfo[])
```

---

## transformIslands

`function`

Transform Island components in HTML.
Converts:
```html
<Island load="visible">
<Counter initial={0} />
</Island>
```
To:
```html
<div id="ox-island-0"
data-ox-island="Counter"
data-ox-load="visible"
data-ox-props='{"initial":0}'
class="ox-island">
<!-- fallback content -->
</div>
```

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L182)**

```typescript
export async function transformIslands(html: string): Promise<ParseIslandsResult>
```

### Returns

`Promise<ParseIslandsResult>` - 

---

## hasIslands

`function`

Check if HTML contains any Island components.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L218)**

```typescript
export function hasIslands(html: string): boolean
```

### Returns

`boolean` - 

---

## extractIslandInfo

`function`

Extract island info without transforming HTML.
Useful for analysis/bundling purposes.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L225)**

```typescript
export async function extractIslandInfo(html: string): Promise<IslandInfo[]>
```

### Returns

`Promise<IslandInfo[]>` - 

---

## generateHydrationScript

`function`

Generate client-side hydration script.
This is a minimal script that imports and initializes islands.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L234)**

```typescript
export function generateHydrationScript(components: string[]): string
```

### Returns

`string` - 

---

