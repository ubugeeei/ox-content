# theme.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts)**

## ThemeColors

`interface`

Theme color configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L7)**

---

## ThemeLayout

`interface`

Theme layout configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L31)**

---

## ThemeFonts

`interface`

Theme font configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L43)**

---

## ThemeHeader

`interface`

Theme header configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L53)**

---

## ThemeFooter

`interface`

Theme footer configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L65)**

---

## SocialLinks

`interface`

Social links configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L75)**

---

## ThemeSlots

`interface`

Theme slots for injecting custom HTML.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L87)**

---

## ThemeConfig

`interface`

Complete theme configuration.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L111)**

---

## ResolvedThemeConfig

`interface`

Resolved theme configuration (after merging with defaults).

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L141)**

---

## deepMerge

`function`

Deep merge two objects.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L210)**

### Returns

`T` - 

---

## defineTheme

`function`

Defines a theme configuration with type checking.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L241)**

```typescript
export function defineTheme(config: ThemeConfig): ThemeConfig
```

### Returns

`ThemeConfig` - 

### Examples

```ts
const myTheme = defineTheme({
  extends: defaultTheme,
  colors: {
    primary: '#3498db',
  },
  footer: {
    copyright: '2025 My Company',
  },
});
```

---

## mergeThemes

`function`

Merges multiple theme configurations.
Later themes override earlier ones.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L261)**

```typescript
export function mergeThemes(...themes: ThemeConfig[]): ThemeConfig
```

### Returns

`ThemeConfig` - 

### Examples

```ts
const merged = mergeThemes(defaultTheme, customTheme, overrides);
```

---

## resolveTheme

`function`

Resolves a theme configuration by merging with its extends chain and defaults.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L284)**

```typescript
export function resolveTheme(config?: ThemeConfig): ResolvedThemeConfig
```

### Returns

`ResolvedThemeConfig` - 

---

## themeToNapi

`function`

Converts resolved theme to the format expected by Rust NAPI.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L325)**

```typescript
export function themeToNapi(theme: ResolvedThemeConfig): NapiThemeConfig
```

### Returns

`NapiThemeConfig` - 

---

## NapiThemeColors

`interface`

NAPI-compatible theme colors type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L397)**

---

## NapiThemeFonts

`interface`

NAPI-compatible theme fonts type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L412)**

---

## NapiThemeLayout

`interface`

NAPI-compatible theme layout type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L420)**

---

## NapiThemeHeader

`interface`

NAPI-compatible theme header type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L429)**

---

## NapiThemeFooter

`interface`

NAPI-compatible theme footer type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L438)**

---

## NapiSocialLinks

`interface`

NAPI-compatible social links type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L446)**

---

## NapiThemeSlots

`interface`

NAPI-compatible theme slots type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L455)**

---

## NapiThemeConfig

`interface`

NAPI-compatible theme configuration type.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L470)**

---

