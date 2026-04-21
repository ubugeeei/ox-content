# renderer.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/renderer.ts)**

> 2 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`wrapHtml`](#wraphtml) `function` `wrapHtml(bodyHtml: string, width: number, height: number, useBaseUrl: boolean): string` - Wraps template HTML in a minimal document with viewport locked to given dimensions.
- [`renderHtmlToPng`](#renderhtmltopng) `function` - Renders an HTML string to a PNG buffer using Chromium.

## Reference

<details id="wraphtml" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">wrapHtml</code><code class="ox-api-entry__signature">wrapHtml(bodyHtml: string, width: number, height: number, useBaseUrl: boolean): string</code><span class="ox-api-entry__description">Wraps template HTML in a minimal document with viewport locked to given dimensi…</span></summary>
  <div class="ox-api-entry__body">
<p>Wraps template HTML in a minimal document with viewport locked to given dimensions.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/renderer.ts#L8">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function wrapHtml(bodyHtml: string, width: number, height: number, useBaseUrl: boolean): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="renderhtmltopng" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderHtmlToPng</code><span class="ox-api-entry__description">Renders an HTML string to a PNG buffer using Chromium.</span></summary>
  <div class="ox-api-entry__body">
<p>Renders an HTML string to a PNG buffer using Chromium.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/renderer.ts#L26">View source</a></p>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>page</code></td>
  <td><code>unknown</code></td>
  <td>Playwright page instance</td>
</tr>
<tr>
  <td><code>html</code></td>
  <td><code>unknown</code></td>
  <td>HTML string from template function</td>
</tr>
<tr>
  <td><code>width</code></td>
  <td><code>unknown</code></td>
  <td>Image width</td>
</tr>
<tr>
  <td><code>height</code></td>
  <td><code>unknown</code></td>
  <td>Image height</td>
</tr>
<tr>
  <td><code>publicDir</code></td>
  <td><code>unknown</code></td>
  <td>Optional public directory for serving local assets (images, fonts, etc.)</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>unknown</code> — PNG buffer</p>
</div>
  </div>
</details>

