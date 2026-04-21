# browser.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/browser.ts)**

> 2 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`OgBrowserSession`](#ogbrowsersession) `interface` - A browser session that can render HTML pages to PNG. Implements AsyncDisposable for aut…
- [`openBrowser`](#openbrowser) `function` `openBrowser(): Promise<OgBrowserSession | null>` - Opens a Chromium browser and returns a session for rendering OG images. Returns null if…

## Reference

<details id="ogbrowsersession" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">OgBrowserSession</code><span class="ox-api-entry__description">A browser session that can render HTML pages to PNG. Implements AsyncDisposable for automatic cleanup via <code>await using</code>.</span></summary>
  <div class="ox-api-entry__body">
<p>A browser session that can render HTML pages to PNG.<br>Implements AsyncDisposable for automatic cleanup via <code>await using</code>.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/browser.ts#L13">View source</a></p>
  </div>
</details>

<details id="openbrowser" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">openBrowser</code><code class="ox-api-entry__signature">openBrowser(): Promise&lt;OgBrowserSession | null&gt;</code><span class="ox-api-entry__description">Opens a Chromium browser and returns a session for rendering OG images. Returns…</span></summary>
  <div class="ox-api-entry__body">
<p>Opens a Chromium browser and returns a session for rendering OG images.<br>Returns null if Playwright/Chromium is not available.<br>The session implements AsyncDisposable — use <code>await using</code> for automatic cleanup:<br>``<code>ts<br>await using session = await openBrowser();<br>if (!session) return;<br>const png = await session.renderPage(html, 1200, 630);<br></code>``</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/browser.ts#L21">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function openBrowser(): Promise&lt;OgBrowserSession | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;OgBrowserSession | null&gt;</code></p>
</div>
  </div>
</details>

