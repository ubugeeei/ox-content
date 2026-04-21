# renderer.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/renderer.ts)**

## wrapHtml

`function`

Wraps template HTML in a minimal document with viewport locked to given dimensions.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/renderer.ts#L8)**

```typescript
function wrapHtml(bodyHtml: string, width: number, height: number, useBaseUrl: boolean): string;
```

### Returns

`string` -

---

## renderHtmlToPng

`function`

Renders an HTML string to a PNG buffer using Chromium.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/renderer.ts#L26)**

### Parameters

| Name        | Type      | Description                                                              |
| ----------- | --------- | ------------------------------------------------------------------------ |
| `page`      | `unknown` | Playwright page instance                                                 |
| `html`      | `unknown` | HTML string from template function                                       |
| `width`     | `unknown` | Image width                                                              |
| `height`    | `unknown` | Image height                                                             |
| `publicDir` | `unknown` | Optional public directory for serving local assets (images, fonts, etc.) |

### Returns

`unknown` - PNG buffer

---
