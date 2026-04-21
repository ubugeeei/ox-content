# tabs.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts)**

> 8 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`resetTabGroupCounter`](#resettabgroupcounter) `function` `resetTabGroupCounter(): void` - Reset tab group counter (for testing).
- [`getAttribute`](#getattribute) `function` `getAttribute(el: Element, name: string): string | undefined` - Get element attribute value.
- [`parseTabChildren`](#parsetabchildren) `function` `parseTabChildren(children: Element["children"]): TabData[]` - Parse Tab elements from Tabs children.
- [`createTabsElement`](#createtabselement) `function` `createTabsElement(tabs: TabData[], groupId: string): Element` - Create the HTML structure for tabs.
- [`createFallbackElement`](#createfallbackelement) `function` `createFallbackElement(tabs: TabData[]): Element` - Create fallback HTML using <details> elements.
- [`rehypeTabs`](#rehypetabs) `function` `rehypeTabs()` - Rehype plugin to transform Tabs components.
- [`transformTabs`](#transformtabs) `function` `transformTabs(html: string): Promise<string>` - Transform Tabs components in HTML.
- [`generateTabsCSS`](#generatetabscss) `function` `generateTabsCSS(groupCount: number): string` - Generate dynamic CSS for :has() based tab switching. This is needed because :has() sele…

## Reference

<a id="resettabgroupcounter"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resetTabGroupCounter</code><code class="ox-api-entry__signature">resetTabGroupCounter(): void</code><span class="ox-api-entry__description">Reset tab group counter (for testing).</span></summary>
  <div class="ox-api-entry__body">
<p>Reset tab group counter (for testing).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L15">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function resetTabGroupCounter(): void</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>void</code></p>
</div>
  </div>
</details>

<a id="getattribute"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getAttribute</code><code class="ox-api-entry__signature">getAttribute(el: Element, name: string): string | undefined</code><span class="ox-api-entry__description">Get element attribute value.</span></summary>
  <div class="ox-api-entry__body">
<p>Get element attribute value.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L22">View source</a></p>
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

<a id="parsetabchildren"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">parseTabChildren</code><code class="ox-api-entry__signature">parseTabChildren(children: Element[&quot;children&quot;]): TabData[]</code><span class="ox-api-entry__description">Parse Tab elements from Tabs children.</span></summary>
  <div class="ox-api-entry__body">
<p>Parse Tab elements from Tabs children.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L37">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function parseTabChildren(children: Element[&quot;children&quot;]): TabData[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>TabData[]</code></p>
</div>
  </div>
</details>

<a id="createtabselement"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createTabsElement</code><code class="ox-api-entry__signature">createTabsElement(tabs: TabData[], groupId: string): Element</code><span class="ox-api-entry__description">Create the HTML structure for tabs.</span></summary>
  <div class="ox-api-entry__body">
<p>Create the HTML structure for tabs.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L61">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function createTabsElement(tabs: TabData[], groupId: string): Element</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element</code></p>
</div>
  </div>
</details>

<a id="createfallbackelement"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createFallbackElement</code><code class="ox-api-entry__signature">createFallbackElement(tabs: TabData[]): Element</code><span class="ox-api-entry__description">Create fallback HTML using &lt;details&gt; elements.</span></summary>
  <div class="ox-api-entry__body">
<p>Create fallback HTML using &lt;details&gt; elements.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L129">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function createFallbackElement(tabs: TabData[]): Element</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Element</code></p>
</div>
  </div>
</details>

<a id="rehypetabs"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">rehypeTabs</code><code class="ox-api-entry__signature">rehypeTabs()</code><span class="ox-api-entry__description">Rehype plugin to transform Tabs components.</span></summary>
  <div class="ox-api-entry__body">
<p>Rehype plugin to transform Tabs components.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L174">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function rehypeTabs()</code></pre>
</div>
  </div>
</details>

<a id="transformtabs"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">transformTabs</code><code class="ox-api-entry__signature">transformTabs(html: string): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Transform Tabs components in HTML.</span></summary>
  <div class="ox-api-entry__body">
<p>Transform Tabs components in HTML.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L217">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function transformTabs(html: string): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>

<a id="generatetabscss"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateTabsCSS</code><code class="ox-api-entry__signature">generateTabsCSS(groupCount: number): string</code><span class="ox-api-entry__description">Generate dynamic CSS for :has() based tab switching. This is needed because :ha…</span></summary>
  <div class="ox-api-entry__body">
<p>Generate dynamic CSS for :has() based tab switching.<br>This is needed because :has() selectors need unique IDs.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/plugins/tabs.ts#L230">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateTabsCSS(groupCount: number): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

