# youtube.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts)**

> 6 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`getAttribute`](#getattribute) `function` `getAttribute(el: Element, name: string): string | undefined` - Get element attribute value.
- [`extractVideoId`](#extractvideoid) `function` `extractVideoId(input: string): string | null` - Extract YouTube video ID from various URL formats.
- [`buildEmbedUrl`](#buildembedurl) `function` `buildEmbedUrl( videoId: string, options: Required<YouTubeOptions>, params?: Record<string, string>, ): string` - Build YouTube embed URL with parameters.
- [`createYouTubeElement`](#createyoutubeelement) `function` - Create YouTube embed element.
- [`rehypeYouTube`](#rehypeyoutube) `function` `rehypeYouTube(options: Required<YouTubeOptions>)` - Rehype plugin to transform YouTube components.
- [`transformYouTube`](#transformyoutube) `function` `transformYouTube(html: string, options?: YouTubeOptions): Promise<string>` - Transform YouTube components in HTML.

## Reference

<details id="getattribute" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getAttribute</code><code class="ox-api-entry__signature">getAttribute(el: Element, name: string): string | undefined</code><span class="ox-api-entry__description">Get element attribute value.</span></summary>
  <div class="ox-api-entry__body">
<p>Get element attribute value.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L31">View source</a></p>
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

<details id="extractvideoid" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractVideoId</code><code class="ox-api-entry__signature">extractVideoId(input: string): string | null</code><span class="ox-api-entry__description">Extract YouTube video ID from various URL formats.</span></summary>
  <div class="ox-api-entry__body">
<p>Extract YouTube video ID from various URL formats.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L41">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function extractVideoId(input: string): string | null</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string | null</code></p>
</div>
  </div>
</details>

<details id="buildembedurl" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">buildEmbedUrl</code><code class="ox-api-entry__signature">buildEmbedUrl( videoId: string, options: Required&lt;YouTubeOptions&gt;, params?: Record&lt;string, string&gt;, ): string</code><span class="ox-api-entry__description">Build YouTube embed URL with parameters.</span></summary>
  <div class="ox-api-entry__body">
<p>Build YouTube embed URL with parameters.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L64">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function buildEmbedUrl(
  videoId: string,
  options: Required&lt;YouTubeOptions&gt;,
  params?: Record&lt;string, string&gt;,
  ): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="createyoutubeelement" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createYouTubeElement</code><span class="ox-api-entry__description">Create YouTube embed element.</span></summary>
  <div class="ox-api-entry__body">
<p>Create YouTube embed element.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L85">View source</a></p>
  </div>
</details>

<details id="rehypeyoutube" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">rehypeYouTube</code><code class="ox-api-entry__signature">rehypeYouTube(options: Required&lt;YouTubeOptions&gt;)</code><span class="ox-api-entry__description">Rehype plugin to transform YouTube components.</span></summary>
  <div class="ox-api-entry__body">
<p>Rehype plugin to transform YouTube components.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L129">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function rehypeYouTube(options: Required&lt;YouTubeOptions&gt;)</code></pre>
</div>
  </div>
</details>

<details id="transformyoutube" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">transformYouTube</code><code class="ox-api-entry__signature">transformYouTube(html: string, options?: YouTubeOptions): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Transform YouTube components in HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Transform YouTube components in HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/youtube.ts#L166">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function transformYouTube(html: string, options?: YouTubeOptions): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>
