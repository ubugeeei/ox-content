# ogp.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts)**

> 11 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`getAttribute`](#getattribute) `function` `getAttribute(el: Element, name: string): string | undefined` - Get element attribute value.
- [`extractDomain`](#extractdomain) `function` `extractDomain(url: string): string` - Extract domain from URL.
- [`getFaviconUrl`](#getfaviconurl) `function` `getFaviconUrl(url: string): string` - Get favicon URL for a domain.
- [`parseOgpFromHtml`](#parseogpfromhtml) `function` `parseOgpFromHtml(html: string, url: string): OgpData` - Parse OGP metadata from HTML.
- [`fetchOgpData`](#fetchogpdata) `function` `fetchOgpData( url: string, options: Required<OgpOptions>, ): Promise<OgpData | null>` - Fetch OGP data for a URL.
- [`createOgpCard`](#createogpcard) `function` `createOgpCard(data: OgpData): Element` - Create OGP card element.
- [`createFallbackCard`](#createfallbackcard) `function` `createFallbackCard(url: string): Element` - Create fallback element when OGP data is unavailable.
- [`collectOgpUrls`](#collectogpurls) `function` `collectOgpUrls(html: string): Promise<string[]>` - Collect all OGP URLs from HTML for pre-fetching.
- [`prefetchOgpData`](#prefetchogpdata) `function` `prefetchOgpData( urls: string[], options?: OgpOptions, ): Promise<Map<string, OgpData | null>>` - Pre-fetch all OGP data.
- [`rehypeOgp`](#rehypeogp) `function` `rehypeOgp(ogpDataMap: Map<string, OgpData | null>)` - Rehype plugin to transform OgCard components.
- [`transformOgp`](#transformogp) `function` `transformOgp( html: string, ogpDataMap?: Map<string, OgpData | null>, options?: OgpOptions, ): Promise<string>` - Transform OgCard components in HTML.

## Reference

<a id="getattribute"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getAttribute</code><code class="ox-api-entry__signature">getAttribute(el: Element, name: string): string | undefined</code><span class="ox-api-entry__description">Get element attribute value.</span></summary>
  <div class="ox-api-entry__body">
<p>Get element attribute value.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L43">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getAttribute(el: Element, name: string): string | undefined</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string | undefined</code></p>
</div>
  </div>
</details>

<a id="extractdomain"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractDomain</code><code class="ox-api-entry__signature">extractDomain(url: string): string</code><span class="ox-api-entry__description">Extract domain from URL.</span></summary>
  <div class="ox-api-entry__body">
<p>Extract domain from URL.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L53">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function extractDomain(url: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="getfaviconurl"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getFaviconUrl</code><code class="ox-api-entry__signature">getFaviconUrl(url: string): string</code><span class="ox-api-entry__description">Get favicon URL for a domain.</span></summary>
  <div class="ox-api-entry__body">
<p>Get favicon URL for a domain.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L65">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getFaviconUrl(url: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="parseogpfromhtml"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">parseOgpFromHtml</code><code class="ox-api-entry__signature">parseOgpFromHtml(html: string, url: string): OgpData</code><span class="ox-api-entry__description">Parse OGP metadata from HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Parse OGP metadata from HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L78">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function parseOgpFromHtml(html: string, url: string): OgpData</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>OgpData</code></p>
</div>
  </div>
</details>

<a id="fetchogpdata"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">fetchOgpData</code><code class="ox-api-entry__signature">fetchOgpData( url: string, options: Required&lt;OgpOptions&gt;, ): Promise&lt;OgpData | null&gt;</code><span class="ox-api-entry__description">Fetch OGP data for a URL.</span></summary>
  <div class="ox-api-entry__body">
<p>Fetch OGP data for a URL.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L140">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function fetchOgpData(
  url: string,
  options: Required&lt;OgpOptions&gt;,
  ): Promise&lt;OgpData | null&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;OgpData | null&gt;</code></p>
</div>
  </div>
</details>

<a id="createogpcard"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createOgpCard</code><code class="ox-api-entry__signature">createOgpCard(data: OgpData): Element</code><span class="ox-api-entry__description">Create OGP card element.</span></summary>
  <div class="ox-api-entry__body">
<p>Create OGP card element.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L193">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function createOgpCard(data: OgpData): Element</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element</code></p>
</div>
  </div>
</details>

<a id="createfallbackcard"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createFallbackCard</code><code class="ox-api-entry__signature">createFallbackCard(url: string): Element</code><span class="ox-api-entry__description">Create fallback element when OGP data is unavailable.</span></summary>
  <div class="ox-api-entry__body">
<p>Create fallback element when OGP data is unavailable.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L286">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function createFallbackCard(url: string): Element</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element</code></p>
</div>
  </div>
</details>

<a id="collectogpurls"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">collectOgpUrls</code><code class="ox-api-entry__signature">collectOgpUrls(html: string): Promise&lt;string[]&gt;</code><span class="ox-api-entry__description">Collect all OGP URLs from HTML for pre-fetching.</span></summary>
  <div class="ox-api-entry__body">
<p>Collect all OGP URLs from HTML for pre-fetching.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L325">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function collectOgpUrls(html: string): Promise&lt;string[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string[]&gt;</code></p>
</div>
  </div>
</details>

<a id="prefetchogpdata"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">prefetchOgpData</code><code class="ox-api-entry__signature">prefetchOgpData( urls: string[], options?: OgpOptions, ): Promise&lt;Map&lt;string, OgpData | null&gt;&gt;</code><span class="ox-api-entry__description">Pre-fetch all OGP data.</span></summary>
  <div class="ox-api-entry__body">
<p>Pre-fetch all OGP data.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L340">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function prefetchOgpData(
  urls: string[],
  options?: OgpOptions,
  ): Promise&lt;Map&lt;string, OgpData | null&gt;&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;Map&lt;string, OgpData | null&gt;&gt;</code></p>
</div>
  </div>
</details>

<a id="rehypeogp"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">rehypeOgp</code><code class="ox-api-entry__signature">rehypeOgp(ogpDataMap: Map&lt;string, OgpData | null&gt;)</code><span class="ox-api-entry__description">Rehype plugin to transform OgCard components.</span></summary>
  <div class="ox-api-entry__body">
<p>Rehype plugin to transform OgCard components.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L360">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function rehypeOgp(ogpDataMap: Map&lt;string, OgpData | null&gt;)</code></pre>
</div>
  </div>
</details>

<a id="transformogp"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">transformOgp</code><code class="ox-api-entry__signature">transformOgp( html: string, ogpDataMap?: Map&lt;string, OgpData | null&gt;, options?: OgpOptions, ): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Transform OgCard components in HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Transform OgCard components in HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/ogp.ts#L392">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function transformOgp(
  html: string,
  ogpDataMap?: Map&lt;string, OgpData | null&gt;,
  options?: OgpOptions,
  ): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>

