# parse.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts)**

> 10 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`getAttribute`](#getattribute) `function` `getAttribute(el: Element, name: string): string | undefined` - Get element attribute value.
- [`parseProps`](#parseprops) `function` `parseProps(el: Element): Record<string, unknown>` - Parse JSX-style props from attributes.
- [`findComponentElement`](#findcomponentelement) `function` `findComponentElement(children: Element["children"]): Element | null` - Find the component element inside <Island>.
- [`getComponentName`](#getcomponentname) `function` `getComponentName(el: Element): string` - Get component name from child element.
- [`resetIslandCounter`](#resetislandcounter) `function` `resetIslandCounter(): void` - Reset island counter (for testing).
- [`rehypeIslands`](#rehypeislands) `function` `rehypeIslands(collectedIslands: IslandInfo[])` - Rehype plugin to transform Island components.
- [`transformIslands`](#transformislands) `function` `transformIslands(html: string): Promise<ParseIslandsResult>` - Transform Island components in HTML. Converts: ```html <Island load="visible"> <Counter…
- [`hasIslands`](#hasislands) `function` `hasIslands(html: string): boolean` - Check if HTML contains any Island components.
- [`extractIslandInfo`](#extractislandinfo) `function` `extractIslandInfo(html: string): Promise<IslandInfo[]>` - Extract island info without transforming HTML. Useful for analysis/bundling purposes.
- [`generateHydrationScript`](#generatehydrationscript) `function` `generateHydrationScript(components: string[]): string` - Generate client-side hydration script. This is a minimal script that imports and initia…

## Reference

<a id="getattribute"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getAttribute</code><code class="ox-api-entry__signature">getAttribute(el: Element, name: string): string | undefined</code><span class="ox-api-entry__description">Get element attribute value.</span></summary>
  <div class="ox-api-entry__body">
<p>Get element attribute value.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L27">View source</a></p>
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

<a id="parseprops"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">parseProps</code><code class="ox-api-entry__signature">parseProps(el: Element): Record&lt;string, unknown&gt;</code><span class="ox-api-entry__description">Parse JSX-style props from attributes.</span></summary>
  <div class="ox-api-entry__body">
<p>Parse JSX-style props from attributes.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L37">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function parseProps(el: Element): Record&lt;string, unknown&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Record&lt;string, unknown&gt;</code></p>
</div>
  </div>
</details>

<a id="findcomponentelement"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">findComponentElement</code><code class="ox-api-entry__signature">findComponentElement(children: Element[&quot;children&quot;]): Element | null</code><span class="ox-api-entry__description">Find the component element inside &lt;Island&gt;.</span></summary>
  <div class="ox-api-entry__body">
<p>Find the component element inside &lt;Island&gt;.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L79">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function findComponentElement(children: Element[&quot;children&quot;]): Element | null</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element | null</code></p>
</div>
  </div>
</details>

<a id="getcomponentname"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getComponentName</code><code class="ox-api-entry__signature">getComponentName(el: Element): string</code><span class="ox-api-entry__description">Get component name from child element.</span></summary>
  <div class="ox-api-entry__body">
<p>Get component name from child element.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L94">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getComponentName(el: Element): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<a id="resetislandcounter"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resetIslandCounter</code><code class="ox-api-entry__signature">resetIslandCounter(): void</code><span class="ox-api-entry__description">Reset island counter (for testing).</span></summary>
  <div class="ox-api-entry__body">
<p>Reset island counter (for testing).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L109">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function resetIslandCounter(): void</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>void</code></p>
</div>
  </div>
</details>

<a id="rehypeislands"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">rehypeIslands</code><code class="ox-api-entry__signature">rehypeIslands(collectedIslands: IslandInfo[])</code><span class="ox-api-entry__description">Rehype plugin to transform Island components.</span></summary>
  <div class="ox-api-entry__body">
<p>Rehype plugin to transform Island components.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L116">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function rehypeIslands(collectedIslands: IslandInfo[])</code></pre>
</div>
  </div>
</details>

<a id="transformislands"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">transformIslands</code><code class="ox-api-entry__signature">transformIslands(html: string): Promise&lt;ParseIslandsResult&gt;</code><span class="ox-api-entry__description">Transform Island components in HTML. Converts: ```html &lt;Island load=&quot;visible&quot;&gt;…</span></summary>
  <div class="ox-api-entry__body">
<p>Transform Island components in HTML.<br>Converts:<br>``<code>html<br>&lt;Island load=&quot;visible&quot;&gt;<br>&lt;Counter initial={0} /&gt;<br>&lt;/Island&gt;<br></code>`<code><br>To:<br></code>`<code>html<br>&lt;div id=&quot;ox-island-0&quot;<br>data-ox-island=&quot;Counter&quot;<br>data-ox-load=&quot;visible&quot;<br>data-ox-props=&#39;{&quot;initial&quot;:0}&#39;<br>class=&quot;ox-island&quot;&gt;<br>&lt;!-- fallback content --&gt;<br>&lt;/div&gt;<br></code>``</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L182">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function transformIslands(html: string): Promise&lt;ParseIslandsResult&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;ParseIslandsResult&gt;</code></p>
</div>
  </div>
</details>

<a id="hasislands"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">hasIslands</code><code class="ox-api-entry__signature">hasIslands(html: string): boolean</code><span class="ox-api-entry__description">Check if HTML contains any Island components.</span></summary>
  <div class="ox-api-entry__body">
<p>Check if HTML contains any Island components.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L218">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function hasIslands(html: string): boolean</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>boolean</code></p>
</div>
  </div>
</details>

<a id="extractislandinfo"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractIslandInfo</code><code class="ox-api-entry__signature">extractIslandInfo(html: string): Promise&lt;IslandInfo[]&gt;</code><span class="ox-api-entry__description">Extract island info without transforming HTML. Useful for analysis/bundling pur…</span></summary>
  <div class="ox-api-entry__body">
<p>Extract island info without transforming HTML.<br>Useful for analysis/bundling purposes.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L225">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function extractIslandInfo(html: string): Promise&lt;IslandInfo[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;IslandInfo[]&gt;</code></p>
</div>
  </div>
</details>

<a id="generatehydrationscript"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateHydrationScript</code><code class="ox-api-entry__signature">generateHydrationScript(components: string[]): string</code><span class="ox-api-entry__description">Generate client-side hydration script. This is a minimal script that imports an…</span></summary>
  <div class="ox-api-entry__body">
<p>Generate client-side hydration script.<br>This is a minimal script that imports and initializes islands.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/island/parse.ts#L234">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateHydrationScript(components: string[]): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

