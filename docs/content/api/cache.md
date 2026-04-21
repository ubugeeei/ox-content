# cache.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts)**

> 3 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`computeCacheKey`](#computecachekey) `function` - Computes a cache key from template + props + options.
- [`getCached`](#getcached) `function` `getCached(cacheDir: string, key: string): Promise<Buffer | null>` - Checks if a cached PNG exists for the given key. Returns the cached file path if found,…
- [`writeCache`](#writecache) `function` `writeCache(cacheDir: string, key: string, png: Buffer): Promise<void>` - Writes a PNG buffer to the cache.

## Reference

<a id="computecachekey"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">computeCacheKey</code><span class="ox-api-entry__description">Computes a cache key from template + props + options.</span></summary>
  <div class="ox-api-entry__body">
<p>Computes a cache key from template + props + options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts#L12">View source</a></p>
  </div>
</details>

<a id="getcached"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getCached</code><code class="ox-api-entry__signature">getCached(cacheDir: string, key: string): Promise&lt;Buffer | null&gt;</code><span class="ox-api-entry__description">Checks if a cached PNG exists for the given key. Returns the cached file path i…</span></summary>
  <div class="ox-api-entry__body">
<p>Checks if a cached PNG exists for the given key.<br>Returns the cached file path if found, null otherwise.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts#L25">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function getCached(cacheDir: string, key: string): Promise&lt;Buffer | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;Buffer | null&gt;</code></p>
</div>
  </div>
</details>

<a id="writecache"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">writeCache</code><code class="ox-api-entry__signature">writeCache(cacheDir: string, key: string, png: Buffer): Promise&lt;void&gt;</code><span class="ox-api-entry__description">Writes a PNG buffer to the cache.</span></summary>
  <div class="ox-api-entry__body">
<p>Writes a PNG buffer to the cache.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/og-image/cache.ts#L38">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function writeCache(cacheDir: string, key: string, png: Buffer): Promise&lt;void&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;void&gt;</code></p>
</div>
  </div>
</details>

