# jsx-runtime.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts)**

## escapeHtml

`function`

Escapes HTML special characters to prevent XSS.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L75)**

```typescript
function escapeHtml(str: string): string
```

### Returns

`string` - 

---

## toHtmlAttr

`function`

Converts a camelCase attribute name to kebab-case for HTML.
Special handling for data-* and aria-* attributes.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L87)**

```typescript
function toHtmlAttr(name: string): string
```

### Returns

`string` - 

---

## renderAttr

`function`

Renders an attribute value to a string.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L103)**

```typescript
function renderAttr(name: string, value: unknown): string
```

### Returns

`string` - 

---

## JSXElementType

`type`

JSX element type - either a string (intrinsic) or a function component.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L134)**

---

## JSXChild

`type`

Valid JSX child types.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L139)**

---

## JSXNode

`interface`

JSX node - the result of JSX expressions.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L144)**

---

## JSXProps

`interface`

Props with children.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L151)**

---

## renderChildren

`function`

Renders children to HTML string.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L159)**

```typescript
function renderChildren(children: JSXChild): string
```

### Returns

`string` - 

---

## jsx

`function`

Creates a JSX element.
This is the core function called by the JSX transform.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L190)**

```typescript
export function jsx(type: JSXElementType, props: JSXProps, _key?: string): JSXNode
```

### Returns

`JSXNode` - 

---

## jsxs

`function`

Creates a JSX element with static children.
Called by the JSX transform for elements with multiple children.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L231)**

```typescript
export function jsxs(type: JSXElementType, props: JSXProps, key?: string): JSXNode
```

### Returns

`JSXNode` - 

---

## Fragment

`function`

Fragment component - renders children without a wrapper element.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L239)**

### Returns

`JSXNode` - 

---

## renderToString

`function`

Renders a JSX node to an HTML string.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L246)**

```typescript
export function renderToString(node: JSXNode): string
```

### Returns

`string` - 

---

## raw

`function`

Creates raw HTML without escaping.
Use with caution - only for trusted content.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L253)**

```typescript
export function raw(html: string): JSXNode
```

### Returns

`JSXNode` - 

### Examples

```ts
<div>{raw('<strong>Bold</strong>')}</div>
```

---

## when

`function`

Conditionally renders content.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L266)**

```typescript
export function when(condition: boolean, content: JSXNode): JSXNode
```

### Returns

`JSXNode` - 

### Examples

```ts
{when(isLoggedIn, <UserMenu />)}
```

---

## each

`function`

Maps over an array and renders each item.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L278)**

### Returns

`JSXNode` - 

### Examples

```ts
{each(items, (item) => <li>{item.name}</li>)}
```

---

