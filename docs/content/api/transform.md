# transform.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts)**

> 11 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`NapiBindings`](#napibindings) `interface` - NAPI bindings for Rust-based Markdown processing. Provides access to compiled Rust func…
- [`OgImageData`](#ogimagedata) `interface` - OG image data for generating social media preview images.
- [`OgImageConfig`](#ogimageconfig) `interface` - OG image configuration.
- [`JsTransformOptions`](#jstransformoptions) `interface` - Options for Rust-based Markdown transformation. Controls which Markdown extensions and…
- [`loadNapiBindings`](#loadnapibindings) `function` `loadNapiBindings(): Promise<NapiBindings | null>` - Lazily loads and caches NAPI bindings. This function uses lazy loading to defer the imp…
- [`SsgTransformOptions`](#ssgtransformoptions) `interface` - SSG-specific transform options.
- [`parseFrontmatter`](#parsefrontmatter) `function` `parseFrontmatter(source: string):` - Parses YAML frontmatter from Markdown content. Uses proper YAML parser for full nested…
- [`buildTocTree`](#buildtoctree) `function` `buildTocTree(entries: TocEntry[]): TocEntry[]` - Builds nested TOC tree from flat list.
- [`generateModuleCode`](#generatemodulecode) `function` - Generates the JavaScript module code.
- [`extractImports`](#extractimports) `function` `extractImports(content: string): string[]` - Extracts imports from Markdown content. Supports importing components for interactive i…
- [`generateOgImageSvg`](#generateogimagesvg) `function` `generateOgImageSvg( data: OgImageData, config?: OgImageConfig, ): Promise<string | null>` - Generates an OG image SVG using the Rust-based generator. This function uses the Rust N…

## Reference

<a id="napibindings"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiBindings</code><span class="ox-api-entry__description">NAPI bindings for Rust-based Markdown processing. Provides access to compiled Rust functions for high-performance Markd…</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI bindings for Rust-based Markdown processing.<br>Provides access to compiled Rust functions for high-performance<br>Markdown parsing and rendering operations.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L40">View source</a></p>
  </div>
</details>

<a id="ogimagedata"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">OgImageData</code><span class="ox-api-entry__description">OG image data for generating social media preview images.</span></summary>
  <div class="ox-api-entry__body">
<p>OG image data for generating social media preview images.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L88">View source</a></p>
  </div>
</details>

<a id="ogimageconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">OgImageConfig</code><span class="ox-api-entry__description">OG image configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>OG image configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L102">View source</a></p>
  </div>
</details>

<a id="jstransformoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">JsTransformOptions</code><span class="ox-api-entry__description">Options for Rust-based Markdown transformation. Controls which Markdown extensions and features are enabled during pars…</span></summary>
  <div class="ox-api-entry__body">
<p>Options for Rust-based Markdown transformation.<br>Controls which Markdown extensions and features are enabled<br>during parsing and rendering.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L120">View source</a></p>
  </div>
</details>

<a id="loadnapibindings"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">loadNapiBindings</code><code class="ox-api-entry__signature">loadNapiBindings(): Promise&lt;NapiBindings | null&gt;</code><span class="ox-api-entry__description">Lazily loads and caches NAPI bindings. This function uses lazy loading to defer…</span></summary>
  <div class="ox-api-entry__body">
<p>Lazily loads and caches NAPI bindings.<br>This function uses lazy loading to defer the import of NAPI bindings<br>until they&#39;re actually needed. The bindings are loaded only once and<br>cached for subsequent uses. If loading fails (e.g., bindings not built),<br>the failure is cached to avoid repeated load attempts.<br>## Performance Considerations<br>The first call to this function may have a slight performance penalty<br>due to module loading. Subsequent calls use the cached result and are<br>essentially zero-cost.<br>## Error Handling<br>If NAPI bindings are not available (not built, wrong architecture, etc.),<br>this function returns <code>null</code>. The caller should handle this gracefully<br>or provide fallback behavior.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L208">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">async function loadNapiBindings(): Promise&lt;NapiBindings | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;NapiBindings | null&gt;</code> — Promise resolving to NAPI bindings or null if unavailable</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">// Simple check with fallback
const napi = await loadNapiBindings();
if (!napi) {
  console.warn(&#39;NAPI bindings not available, using fallback&#39;);
  return fallbackRender(content);
}
// Use Rust implementation
const result = napi.transform(content, { gfm: true });</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<a id="ssgtransformoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SsgTransformOptions</code><span class="ox-api-entry__description">SSG-specific transform options.</span></summary>
  <div class="ox-api-entry__body">
<p>SSG-specific transform options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L351">View source</a></p>
  </div>
</details>

<a id="parsefrontmatter"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">parseFrontmatter</code><code class="ox-api-entry__signature">parseFrontmatter(source: string):</code><span class="ox-api-entry__description">Parses YAML frontmatter from Markdown content. Uses proper YAML parser for full…</span></summary>
  <div class="ox-api-entry__body">
<p>Parses YAML frontmatter from Markdown content.<br>Uses proper YAML parser for full nested object support.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L434">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function parseFrontmatter(source: string):</code></pre>
</div>
  </div>
</details>

<a id="buildtoctree"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">buildTocTree</code><code class="ox-api-entry__signature">buildTocTree(entries: TocEntry[]): TocEntry[]</code><span class="ox-api-entry__description">Builds nested TOC tree from flat list.</span></summary>
  <div class="ox-api-entry__body">
<p>Builds nested TOC tree from flat list.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L467">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function buildTocTree(entries: TocEntry[]): TocEntry[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>TocEntry[]</code></p>
</div>
  </div>
</details>

<a id="generatemodulecode"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateModuleCode</code><span class="ox-api-entry__description">Generates the JavaScript module code.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates the JavaScript module code.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L492">View source</a></p>
  </div>
</details>

<a id="extractimports"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractImports</code><code class="ox-api-entry__signature">extractImports(content: string): string[]</code><span class="ox-api-entry__description">Extracts imports from Markdown content. Supports importing components for inter…</span></summary>
  <div class="ox-api-entry__body">
<p>Extracts imports from Markdown content.<br>Supports importing components for interactive islands.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L546">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function extractImports(content: string): string[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string[]</code></p>
</div>
  </div>
</details>

<a id="generateogimagesvg"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateOgImageSvg</code><code class="ox-api-entry__signature">generateOgImageSvg( data: OgImageData, config?: OgImageConfig, ): Promise&lt;string | null&gt;</code><span class="ox-api-entry__description">Generates an OG image SVG using the Rust-based generator. This function uses th…</span></summary>
  <div class="ox-api-entry__body">
<p>Generates an OG image SVG using the Rust-based generator.<br>This function uses the Rust NAPI bindings to generate SVG-based<br>OG images for social media previews. The SVG can be served directly<br>or converted to PNG/JPEG for broader compatibility.<br>In the future, custom JS templates can be provided to override<br>the default Rust-based template.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/transform.ts#L563">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function generateOgImageSvg(
  data: OgImageData,
  config?: OgImageConfig,
  ): Promise&lt;string | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>data</code></td>
  <td><code>OgImageData</code></td>
  <td>OG image data (title, description, etc.)</td>
</tr>
<tr>
  <td><code>config</code></td>
  <td><code>OgImageConfig</code></td>
  <td>Optional OG image configuration</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string | null&gt;</code> — SVG string or null if NAPI bindings are unavailable</p>
</div>
  </div>
</details>

