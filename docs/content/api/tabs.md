# tabs.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts)**

## resetTabGroupCounter

`function`

Reset tab group counter (for testing).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L15)**

```typescript
export function resetTabGroupCounter(): void;
```

### Returns

`void` -

---

## getAttribute

`function`

Get element attribute value.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L22)**

```typescript
function getAttribute(el: Element, name: string): string | undefined;
```

### Returns

`string | undefined` -

---

## parseTabChildren

`function`

Parse Tab elements from Tabs children.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L37)**

```typescript
function parseTabChildren(children: Element["children"]): TabData[];
```

### Returns

`TabData[]` -

---

## createTabsElement

`function`

Create the HTML structure for tabs.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L61)**

```typescript
function createTabsElement(tabs: TabData[], groupId: string): Element;
```

### Returns

`Element` -

---

## createFallbackElement

`function`

Create fallback HTML using <details> elements.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L129)**

```typescript
function createFallbackElement(tabs: TabData[]): Element;
```

### Returns

`Element` -

---

## rehypeTabs

`function`

Rehype plugin to transform Tabs components.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L174)**

```typescript
function rehypeTabs();
```

---

## transformTabs

`function`

Transform Tabs components in HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L217)**

```typescript
export async function transformTabs(html: string): Promise<string>;
```

### Returns

`Promise<string>` -

---

## generateTabsCSS

`function`

Generate dynamic CSS for :has() based tab switching.
This is needed because :has() selectors need unique IDs.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L230)**

```typescript
export function generateTabsCSS(groupCount: number): string;
```

### Returns

`string` -

---
