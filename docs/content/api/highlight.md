# highlight.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts)**

> 4 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`getHighlighter`](#gethighlighter) `function` `getHighlighter( theme: string, customLangs: LanguageRegistration[] = [], ): Promise<Highlighter>` - Get or create the Shiki highlighter.
- [`rehypeShikiHighlight`](#rehypeshikihighlight) `function` - Rehype plugin for syntax highlighting with Shiki.
- [`getTextContent`](#gettextcontent) `function` `getTextContent(node: Element | Root): string` - Extract text content from a hast node.
- [`highlightCode`](#highlightcode) `function` `highlightCode( html: string, theme: string = "github-dark", langs: LanguageRegistration[] = [], ): Promise<string>` - Apply syntax highlighting to HTML using Shiki.

## Reference

<details id="gethighlighter" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getHighlighter</code><code class="ox-api-entry__signature">getHighlighter( theme: string, customLangs: LanguageRegistration[] = [], ): Promise&lt;Highlighter&gt;</code><span class="ox-api-entry__description">Get or create the Shiki highlighter.</span></summary>
  <div class="ox-api-entry__body">
<p>Get or create the Shiki highlighter.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L46">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">async function getHighlighter(
  theme: string,
  customLangs: LanguageRegistration[] = [],
  ): Promise&lt;Highlighter&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;Highlighter&gt;</code></p>
</div>
  </div>
</details>

<details id="rehypeshikihighlight" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">rehypeShikiHighlight</code><span class="ox-api-entry__description">Rehype plugin for syntax highlighting with Shiki.</span></summary>
  <div class="ox-api-entry__body">
<p>Rehype plugin for syntax highlighting with Shiki.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L69">View source</a></p>
  </div>
</details>

<details id="gettextcontent" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getTextContent</code><code class="ox-api-entry__signature">getTextContent(node: Element | Root): string</code><span class="ox-api-entry__description">Extract text content from a hast node.</span></summary>
  <div class="ox-api-entry__body">
<p>Extract text content from a hast node.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L135">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getTextContent(node: Element | Root): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="highlightcode" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">highlightCode</code><code class="ox-api-entry__signature">highlightCode( html: string, theme: string = &quot;github-dark&quot;, langs: LanguageRegistration[] = [], ): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Apply syntax highlighting to HTML using Shiki.</span></summary>
  <div class="ox-api-entry__body">
<p>Apply syntax highlighting to HTML using Shiki.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/highlight.ts#L166">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function highlightCode(
  html: string,
  theme: string = &quot;github-dark&quot;,
  langs: LanguageRegistration[] = [],
  ): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>

