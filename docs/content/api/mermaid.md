# mermaid.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid.ts)**

> 1 documented symbol. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`transformMermaidStatic`](#transformmermaidstatic) `function` `transformMermaidStatic( html: string, _options?: MermaidOptions, ): Promise<string>` - Transforms mermaid code blocks in HTML to rendered SVG diagrams. Uses the native Rust N…

## Reference

<details id="transformmermaidstatic" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">transformMermaidStatic</code><code class="ox-api-entry__signature">transformMermaidStatic( html: string, _options?: MermaidOptions, ): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Transforms mermaid code blocks in HTML to rendered SVG diagrams. Uses the nativ…</span></summary>
  <div class="ox-api-entry__body">
<p>Transforms mermaid code blocks in HTML to rendered SVG diagrams.<br>Uses the native Rust NAPI transformMermaid function.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/mermaid.ts#L72">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function transformMermaidStatic(
  html: string,
  _options?: MermaidOptions,
  ): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>
