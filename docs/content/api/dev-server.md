# dev-server.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts)**

> 10 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`shouldSkip`](#shouldskip) `function` `shouldSkip(url: string): boolean` - Check if a request URL should be skipped by the dev server middleware.
- [`resolveMarkdownFile`](#resolvemarkdownfile) `function` `resolveMarkdownFile(url: string, srcDir: string): Promise<string | null>` - Resolve a request URL to a markdown file path. Returns null if no matching file exists.
- [`injectViteHmrClient`](#injectvitehmrclient) `function` `injectViteHmrClient(html: string): string` - Inject Vite HMR client script into the HTML.
- [`DevServerCache`](#devservercache) `interface` - Dev server state for caching.
- [`createDevServerCache`](#createdevservercache) `function` `createDevServerCache(): DevServerCache` - Create a dev server cache instance.
- [`invalidateNavCache`](#invalidatenavcache) `function` `invalidateNavCache(cache: DevServerCache): void` - Invalidate navigation cache (called on file add/unlink).
- [`invalidatePageCache`](#invalidatepagecache) `function` `invalidatePageCache(cache: DevServerCache, filePath: string): void` - Invalidate page cache for a specific file (called on file change).
- [`resolveSiteName`](#resolvesitename) `function` `resolveSiteName(options: ResolvedOptions, root: string): Promise<string>` - Resolve site name from options or package.json.
- [`renderPage`](#renderpage) `function` - Render a single markdown page to full HTML.
- [`createDevServerMiddleware`](#createdevservermiddleware) `function` `createDevServerMiddleware( options: ResolvedOptions, root: string, cache: DevServerCache, ): Connect.NextHandleFunction` - Create the dev server middleware for SSG page serving.

## Reference

<a id="shouldskip"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">shouldSkip</code><code class="ox-api-entry__signature">shouldSkip(url: string): boolean</code><span class="ox-api-entry__description">Check if a request URL should be skipped by the dev server middleware.</span></summary>
  <div class="ox-api-entry__body">
<p>Check if a request URL should be skipped by the dev server middleware.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L57">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function shouldSkip(url: string): boolean</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>boolean</code></p>
</div>
  </div>
</details>

<a id="resolvemarkdownfile"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resolveMarkdownFile</code><code class="ox-api-entry__signature">resolveMarkdownFile(url: string, srcDir: string): Promise&lt;string | null&gt;</code><span class="ox-api-entry__description">Resolve a request URL to a markdown file path. Returns null if no matching file…</span></summary>
  <div class="ox-api-entry__body">
<p>Resolve a request URL to a markdown file path.<br>Returns null if no matching file exists.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L79">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">async function resolveMarkdownFile(url: string, srcDir: string): Promise&lt;string | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string | null&gt;</code></p>
</div>
  </div>
</details>

<a id="injectvitehmrclient"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">injectViteHmrClient</code><code class="ox-api-entry__signature">injectViteHmrClient(html: string): string</code><span class="ox-api-entry__description">Inject Vite HMR client script into the HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Inject Vite HMR client script into the HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L123">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function injectViteHmrClient(html: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="devservercache"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">DevServerCache</code><span class="ox-api-entry__description">Dev server state for caching.</span></summary>
  <div class="ox-api-entry__body">
<p>Dev server state for caching.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L195">View source</a></p>
  </div>
</details>

<a id="createdevservercache"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createDevServerCache</code><code class="ox-api-entry__signature">createDevServerCache(): DevServerCache</code><span class="ox-api-entry__description">Create a dev server cache instance.</span></summary>
  <div class="ox-api-entry__body">
<p>Create a dev server cache instance.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L207">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function createDevServerCache(): DevServerCache</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>DevServerCache</code></p>
</div>
  </div>
</details>

<a id="invalidatenavcache"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">invalidateNavCache</code><code class="ox-api-entry__signature">invalidateNavCache(cache: DevServerCache): void</code><span class="ox-api-entry__description">Invalidate navigation cache (called on file add/unlink).</span></summary>
  <div class="ox-api-entry__body">
<p>Invalidate navigation cache (called on file add/unlink).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L218">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function invalidateNavCache(cache: DevServerCache): void</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>void</code></p>
</div>
  </div>
</details>

<a id="invalidatepagecache"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">invalidatePageCache</code><code class="ox-api-entry__signature">invalidatePageCache(cache: DevServerCache, filePath: string): void</code><span class="ox-api-entry__description">Invalidate page cache for a specific file (called on file change).</span></summary>
  <div class="ox-api-entry__body">
<p>Invalidate page cache for a specific file (called on file change).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L227">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function invalidatePageCache(cache: DevServerCache, filePath: string): void</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>void</code></p>
</div>
  </div>
</details>

<a id="resolvesitename"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resolveSiteName</code><code class="ox-api-entry__signature">resolveSiteName(options: ResolvedOptions, root: string): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Resolve site name from options or package.json.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolve site name from options or package.json.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L234">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">async function resolveSiteName(options: ResolvedOptions, root: string): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>

<a id="renderpage"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderPage</code><span class="ox-api-entry__description">Render a single markdown page to full HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Render a single markdown page to full HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L255">View source</a></p>
  </div>
</details>

<a id="createdevservermiddleware"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createDevServerMiddleware</code><code class="ox-api-entry__signature">createDevServerMiddleware( options: ResolvedOptions, root: string, cache: DevServerCache, ): Connect.NextHandleFunction</code><span class="ox-api-entry__description">Create the dev server middleware for SSG page serving.</span></summary>
  <div class="ox-api-entry__body">
<p>Create the dev server middleware for SSG page serving.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/dev-server.ts#L348">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function createDevServerMiddleware(
  options: ResolvedOptions,
  root: string,
  cache: DevServerCache,
  ): Connect.NextHandleFunction</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Connect.NextHandleFunction</code></p>
</div>
  </div>
</details>

