# theme-renderer.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts)**

> 9 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`ThemeComponent`](#themecomponent) `type` - Theme component type.
- [`ThemeProps`](#themeprops) `interface` - Props passed to the theme component.
- [`PageData`](#pagedata) `interface` - Page data for rendering.
- [`ThemeRenderOptions`](#themerenderoptions) `interface` - Theme render options.
- [`renderPage`](#renderpage) `function` `renderPage(page: PageData, options: ThemeRenderOptions): string` - Renders a page using the theme component.
- [`renderAllPages`](#renderallpages) `function` `renderAllPages( pages: PageData[], options: ThemeRenderOptions, ): Promise<Map<string, string>>` - Renders all pages and generates type definitions.
- [`generateTypes`](#generatetypes) `function` `generateTypes(pages: PageData[], outDir: string): Promise<void>` - Generates TypeScript type definitions from page frontmatter.
- [`DefaultTheme`](#defaulttheme) `function` - Default theme component. A minimal theme that renders page content with basic styling.
- [`createTheme`](#createtheme) `function` - Creates a theme with layout switching support.

## Reference

<a id="themecomponent"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><code class="ox-api-entry__name">ThemeComponent</code><span class="ox-api-entry__description">Theme component type.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme component type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L22">View source</a></p>
  </div>
</details>

<a id="themeprops"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeProps</code><span class="ox-api-entry__description">Props passed to the theme component.</span></summary>
  <div class="ox-api-entry__body">
<p>Props passed to the theme component.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L27">View source</a></p>
  </div>
</details>

<a id="pagedata"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">PageData</code><span class="ox-api-entry__description">Page data for rendering.</span></summary>
  <div class="ox-api-entry__body">
<p>Page data for rendering.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L35">View source</a></p>
  </div>
</details>

<a id="themerenderoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeRenderOptions</code><span class="ox-api-entry__description">Theme render options.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme render options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L57">View source</a></p>
  </div>
</details>

<a id="renderpage"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderPage</code><code class="ox-api-entry__signature">renderPage(page: PageData, options: ThemeRenderOptions): string</code><span class="ox-api-entry__description">Renders a page using the theme component.</span></summary>
  <div class="ox-api-entry__body">
<p>Renders a page using the theme component.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L75">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function renderPage(page: PageData, options: ThemeRenderOptions): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>page</code></td>
  <td><code>PageData</code></td>
  <td>Page data to render</td>
</tr>
<tr>
  <td><code>options</code></td>
  <td><code>ThemeRenderOptions</code></td>
  <td>Theme render options</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code> — Rendered HTML string</p>
</div>
  </div>
</details>

<a id="renderallpages"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderAllPages</code><code class="ox-api-entry__signature">renderAllPages( pages: PageData[], options: ThemeRenderOptions, ): Promise&lt;Map&lt;string, string&gt;&gt;</code><span class="ox-api-entry__description">Renders all pages and generates type definitions.</span></summary>
  <div class="ox-api-entry__body">
<p>Renders all pages and generates type definitions.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L141">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function renderAllPages(
  pages: PageData[],
  options: ThemeRenderOptions,
  ): Promise&lt;Map&lt;string, string&gt;&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>pages</code></td>
  <td><code>PageData[]</code></td>
  <td>All pages to render</td>
</tr>
<tr>
  <td><code>options</code></td>
  <td><code>ThemeRenderOptions</code></td>
  <td>Theme render options</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;Map&lt;string, string&gt;&gt;</code> — Map of output paths to rendered HTML</p>
</div>
  </div>
</details>

<a id="generatetypes"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateTypes</code><code class="ox-api-entry__signature">generateTypes(pages: PageData[], outDir: string): Promise&lt;void&gt;</code><span class="ox-api-entry__description">Generates TypeScript type definitions from page frontmatter.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates TypeScript type definitions from page frontmatter.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L168">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function generateTypes(pages: PageData[], outDir: string): Promise&lt;void&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>pages</code></td>
  <td><code>PageData[]</code></td>
  <td>All pages</td>
</tr>
<tr>
  <td><code>outDir</code></td>
  <td><code>string</code></td>
  <td>Output directory for types</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;void&gt;</code></p>
</div>
  </div>
</details>

<a id="defaulttheme"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">DefaultTheme</code><span class="ox-api-entry__description">Default theme component. A minimal theme that renders page content with basic styling.</span></summary>
  <div class="ox-api-entry__body">
<p>Default theme component.<br>A minimal theme that renders page content with basic styling.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L187">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
  </div>
</details>

<a id="createtheme"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createTheme</code><span class="ox-api-entry__description">Creates a theme with layout switching support.</span></summary>
  <div class="ox-api-entry__body">
<p>Creates a theme with layout switching support.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme-renderer.ts#L243">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ThemeComponent</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">import { createTheme } from &#39;@ox-content/vite-plugin&#39;;
import { DefaultLayout } from &#39;./layouts/Default&#39;;
import { EntryLayout } from &#39;./layouts/Entry&#39;;
export default createTheme({
  layouts: {
    default: DefaultLayout,
    entry: EntryLayout,
  },
});</code></pre>
</div>
  </div>
</details>

