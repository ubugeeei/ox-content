# mermaid-protect.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts)**

> 3 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`MermaidSvgProtection`](#mermaidsvgprotection) `interface` - Protects mermaid SVG content from rehype HTML5 parser corruption. rehypeParse + rehypeS…
- [`protectMermaidSvgs`](#protectmermaidsvgs) `function` `protectMermaidSvgs(html: string): MermaidSvgProtection` - Extract `<div class="ox-mermaid">...</div>` blocks and replace with HTML comment placeh…
- [`restoreMermaidSvgs`](#restoremermaidsvgs) `function` `restoreMermaidSvgs(html: string, svgs: Map<string, string>): string` - Restore protected mermaid SVG blocks from placeholders.

## Reference

<details id="mermaidsvgprotection" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">MermaidSvgProtection</code><span class="ox-api-entry__description">Protects mermaid SVG content from rehype HTML5 parser corruption. rehypeParse + rehypeStringify converts <code>&lt;br /&gt;</code> in SV…</span></summary>
  <div class="ox-api-entry__body">
<p>Protects mermaid SVG content from rehype HTML5 parser corruption.<br>rehypeParse + rehypeStringify converts <code>&lt;br /&gt;</code> in SVG foreignObject<br>to <code>&lt;br&gt;&lt;/br&gt;</code>, which HTML5 interprets as 2 &lt;br&gt; elements.<br>Each rehype pass doubles them: 1 → 2 → 4 → 8 → 16.<br>This module extracts ox-mermaid SVG blocks into placeholders before<br>rehype processing and restores them after.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts#L1">View source</a></p>
  </div>
</details>

<details id="protectmermaidsvgs" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">protectMermaidSvgs</code><code class="ox-api-entry__signature">protectMermaidSvgs(html: string): MermaidSvgProtection</code><span class="ox-api-entry__description">Extract <code>&lt;div class=&quot;ox-mermaid&quot;&gt;...&lt;/div&gt;</code> blocks and replace with HTML commen…</span></summary>
  <div class="ox-api-entry__body">
<p>Extract <code>&lt;div class=&quot;ox-mermaid&quot;&gt;...&lt;/div&gt;</code> blocks and replace<br>with HTML comment placeholders that rehype will preserve.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts#L17">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function protectMermaidSvgs(html: string): MermaidSvgProtection</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>MermaidSvgProtection</code></p>
</div>
  </div>
</details>

<details id="restoremermaidsvgs" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">restoreMermaidSvgs</code><code class="ox-api-entry__signature">restoreMermaidSvgs(html: string, svgs: Map&lt;string, string&gt;): string</code><span class="ox-api-entry__description">Restore protected mermaid SVG blocks from placeholders.</span></summary>
  <div class="ox-api-entry__body">
<p>Restore protected mermaid SVG blocks from placeholders.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid-protect.ts#L66">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function restoreMermaidSvgs(html: string, svgs: Map&lt;string, string&gt;): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

