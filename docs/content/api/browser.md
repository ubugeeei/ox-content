# browser.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/browser.ts)**

## OgBrowserSession

`interface`

A browser session that can render HTML pages to PNG.
Implements AsyncDisposable for automatic cleanup via `await using`.

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/browser.ts#L13)**

---

## openBrowser

`function`

Opens a Chromium browser and returns a session for rendering OG images.
Returns null if Playwright/Chromium is not available.
The session implements AsyncDisposable — use `await using` for automatic cleanup:
```ts
await using session = await openBrowser();
if (!session) return;
const png = await session.renderPage(html, 1200, 630);
```

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/browser.ts#L21)**

```typescript
export async function openBrowser(): Promise<OgBrowserSession | null>
```

### Returns

`Promise<OgBrowserSession | null>` - 

---

