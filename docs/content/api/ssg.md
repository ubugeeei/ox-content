# ssg.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts)**

> 21 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`SsgNavItem`](#ssgnavitem) `interface` - Navigation item for SSG.
- [`SsgEntryPageConfig`](#ssgentrypageconfig) `interface` - Entry page configuration for SSG (passed to Rust).
- [`SsgPageData`](#ssgpagedata) `interface` - Page data for SSG.
- [`resolveSsgOptions`](#resolvessgoptions) `function` `resolveSsgOptions(ssg: SsgOptions | boolean | undefined): ResolvedSsgOptions` - Resolves SSG options with defaults.
- [`renderTemplate`](#rendertemplate) `function` `renderTemplate(template: string, data: Record<string, unknown>): string` - Simple mustache-like template rendering.
- [`extractTitle`](#extracttitle) `function` `extractTitle(content: string, frontmatter: Record<string, unknown>): string` - Extracts title from content or frontmatter.
- [`_generateNavHtml`](#_generatenavhtml) `function` `_generateNavHtml(navGroups: NavGroup[], currentPath: string): string` - Generates navigation HTML from nav groups.
- [`_generateTocHtml`](#_generatetochtml) `function` `_generateTocHtml(toc: TocEntry[]): string` - Generates TOC HTML from toc entries.
- [`generateBareHtmlPage`](#generatebarehtmlpage) `function` `generateBareHtmlPage(content: string, title: string): string` - Generates bare HTML page (no navigation, no styles).
- [`generateHtmlPage`](#generatehtmlpage) `function` - Generates HTML page with navigation using Rust NAPI bindings.
- [`getOutputPath`](#getoutputpath) `function` - Converts a markdown file path to its corresponding HTML output path.
- [`getUrlPath`](#geturlpath) `function` `getUrlPath(inputPath: string, srcDir: string): string` - Converts a markdown file path to a relative URL path.
- [`getHref`](#gethref) `function` - Converts a markdown file path to an href.
- [`getOgImagePath`](#getogimagepath) `function` `getOgImagePath(inputPath: string, srcDir: string, outDir: string): string` - Gets the OG image output path for a given markdown file.
- [`getOgImageUrl`](#getogimageurl) `function` `getOgImageUrl(inputPath: string, srcDir: string, base: string, siteUrl?: string): string` - Gets the OG image URL for use in meta tags. If siteUrl is provided, returns an absolute…
- [`getDisplayTitle`](#getdisplaytitle) `function` `getDisplayTitle(filePath: string): string` - Gets display title from file path.
- [`formatTitle`](#formattitle) `function` `formatTitle(name: string): string` - Formats a file/dir name as a title.
- [`collectMarkdownFiles`](#collectmarkdownfiles) `function` `collectMarkdownFiles(srcDir: string): Promise<string[]>` - Collects all markdown files from the source directory.
- [`NavGroup`](#navgroup) `interface` - Navigation group for hierarchical navigation.
- [`buildNavItems`](#buildnavitems) `function` - Builds navigation items from markdown files, grouped by directory.
- [`buildSsg`](#buildssg) `function` `buildSsg( options: ResolvedOptions, root: string, ): Promise<` - Builds all markdown files to static HTML.

## Reference

<a id="ssgnavitem"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SsgNavItem</code><span class="ox-api-entry__description">Navigation item for SSG.</span></summary>
  <div class="ox-api-entry__body">
<p>Navigation item for SSG.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L28">View source</a></p>
  </div>
</details>

<a id="ssgentrypageconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SsgEntryPageConfig</code><span class="ox-api-entry__description">Entry page configuration for SSG (passed to Rust).</span></summary>
  <div class="ox-api-entry__body">
<p>Entry page configuration for SSG (passed to Rust).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L38">View source</a></p>
  </div>
</details>

<a id="ssgpagedata"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SsgPageData</code><span class="ox-api-entry__description">Page data for SSG.</span></summary>
  <div class="ox-api-entry__body">
<p>Page data for SSG.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L46">View source</a></p>
  </div>
</details>

<a id="resolvessgoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resolveSsgOptions</code><code class="ox-api-entry__signature">resolveSsgOptions(ssg: SsgOptions | boolean | undefined): ResolvedSsgOptions</code><span class="ox-api-entry__description">Resolves SSG options with defaults.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolves SSG options with defaults.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L882">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function resolveSsgOptions(ssg: SsgOptions | boolean | undefined): ResolvedSsgOptions</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ResolvedSsgOptions</code></p>
</div>
  </div>
</details>

<a id="rendertemplate"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderTemplate</code><code class="ox-api-entry__signature">renderTemplate(template: string, data: Record&lt;string, unknown&gt;): string</code><span class="ox-api-entry__description">Simple mustache-like template rendering.</span></summary>
  <div class="ox-api-entry__body">
<p>Simple mustache-like template rendering.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L920">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function renderTemplate(template: string, data: Record&lt;string, unknown&gt;): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="extracttitle"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractTitle</code><code class="ox-api-entry__signature">extractTitle(content: string, frontmatter: Record&lt;string, unknown&gt;): string</code><span class="ox-api-entry__description">Extracts title from content or frontmatter.</span></summary>
  <div class="ox-api-entry__body">
<p>Extracts title from content or frontmatter.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L951">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function extractTitle(content: string, frontmatter: Record&lt;string, unknown&gt;): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="_generatenavhtml"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">_generateNavHtml</code><code class="ox-api-entry__signature">_generateNavHtml(navGroups: NavGroup[], currentPath: string): string</code><span class="ox-api-entry__description">Generates navigation HTML from nav groups.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates navigation HTML from nav groups.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L967">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function _generateNavHtml(navGroups: NavGroup[], currentPath: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="_generatetochtml"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">_generateTocHtml</code><code class="ox-api-entry__signature">_generateTocHtml(toc: TocEntry[]): string</code><span class="ox-api-entry__description">Generates TOC HTML from toc entries.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates TOC HTML from toc entries.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L991">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function _generateTocHtml(toc: TocEntry[]): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="generatebarehtmlpage"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateBareHtmlPage</code><code class="ox-api-entry__signature">generateBareHtmlPage(content: string, title: string): string</code><span class="ox-api-entry__description">Generates bare HTML page (no navigation, no styles).</span></summary>
  <div class="ox-api-entry__body">
<p>Generates bare HTML page (no navigation, no styles).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1010">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateBareHtmlPage(content: string, title: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="generatehtmlpage"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateHtmlPage</code><span class="ox-api-entry__description">Generates HTML page with navigation using Rust NAPI bindings.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates HTML page with navigation using Rust NAPI bindings.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1020">View source</a></p>
  </div>
</details>

<a id="getoutputpath"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getOutputPath</code><span class="ox-api-entry__description">Converts a markdown file path to its corresponding HTML output path.</span></summary>
  <div class="ox-api-entry__body">
<p>Converts a markdown file path to its corresponding HTML output path.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1406">View source</a></p>
  </div>
</details>

<a id="geturlpath"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getUrlPath</code><code class="ox-api-entry__signature">getUrlPath(inputPath: string, srcDir: string): string</code><span class="ox-api-entry__description">Converts a markdown file path to a relative URL path.</span></summary>
  <div class="ox-api-entry__body">
<p>Converts a markdown file path to a relative URL path.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1426">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function getUrlPath(inputPath: string, srcDir: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="gethref"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getHref</code><span class="ox-api-entry__description">Converts a markdown file path to an href.</span></summary>
  <div class="ox-api-entry__body">
<p>Converts a markdown file path to an href.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1440">View source</a></p>
  </div>
</details>

<a id="getogimagepath"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getOgImagePath</code><code class="ox-api-entry__signature">getOgImagePath(inputPath: string, srcDir: string, outDir: string): string</code><span class="ox-api-entry__description">Gets the OG image output path for a given markdown file.</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the OG image output path for a given markdown file.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1456">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getOgImagePath(inputPath: string, srcDir: string, outDir: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="getogimageurl"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getOgImageUrl</code><code class="ox-api-entry__signature">getOgImageUrl(inputPath: string, srcDir: string, base: string, siteUrl?: string): string</code><span class="ox-api-entry__description">Gets the OG image URL for use in meta tags. If siteUrl is provided, returns an…</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the OG image URL for use in meta tags.<br>If siteUrl is provided, returns an absolute URL (required for SNS sharing).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1471">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getOgImageUrl(inputPath: string, srcDir: string, base: string, siteUrl?: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="getdisplaytitle"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getDisplayTitle</code><code class="ox-api-entry__signature">getDisplayTitle(filePath: string): string</code><span class="ox-api-entry__description">Gets display title from file path.</span></summary>
  <div class="ox-api-entry__body">
<p>Gets display title from file path.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1493">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getDisplayTitle(filePath: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="formattitle"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">formatTitle</code><code class="ox-api-entry__signature">formatTitle(name: string): string</code><span class="ox-api-entry__description">Formats a file/dir name as a title.</span></summary>
  <div class="ox-api-entry__body">
<p>Formats a file/dir name as a title.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1510">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function formatTitle(name: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="collectmarkdownfiles"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">collectMarkdownFiles</code><code class="ox-api-entry__signature">collectMarkdownFiles(srcDir: string): Promise&lt;string[]&gt;</code><span class="ox-api-entry__description">Collects all markdown files from the source directory.</span></summary>
  <div class="ox-api-entry__body">
<p>Collects all markdown files from the source directory.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1519">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function collectMarkdownFiles(srcDir: string): Promise&lt;string[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string[]&gt;</code></p>
</div>
  </div>
</details>

<a id="navgroup"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NavGroup</code><span class="ox-api-entry__description">Navigation group for hierarchical navigation.</span></summary>
  <div class="ox-api-entry__body">
<p>Navigation group for hierarchical navigation.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1531">View source</a></p>
  </div>
</details>

<a id="buildnavitems"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">buildNavItems</code><span class="ox-api-entry__description">Builds navigation items from markdown files, grouped by directory.</span></summary>
  <div class="ox-api-entry__body">
<p>Builds navigation items from markdown files, grouped by directory.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1539">View source</a></p>
  </div>
</details>

<a id="buildssg"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">buildSsg</code><code class="ox-api-entry__signature">buildSsg( options: ResolvedOptions, root: string, ): Promise&lt;</code><span class="ox-api-entry__description">Builds all markdown files to static HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Builds all markdown files to static HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/ssg.ts#L1624">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function buildSsg(
  options: ResolvedOptions,
  root: string,
  ): Promise&lt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;</code></p>
</div>
  </div>
</details>

