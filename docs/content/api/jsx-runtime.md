# jsx-runtime.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts)**

> 15 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`escapeHtml`](#escapehtml) `function` `escapeHtml(str: string): string` - Escapes HTML special characters to prevent XSS.
- [`toHtmlAttr`](#tohtmlattr) `function` `toHtmlAttr(name: string): string` - Converts a camelCase attribute name to kebab-case for HTML. Special handling for data-\*…
- [`renderAttr`](#renderattr) `function` `renderAttr(name: string, value: unknown): string` - Renders an attribute value to a string.
- [`JSXElementType`](#jsxelementtype) `type` - JSX element type - either a string (intrinsic) or a function component.
- [`JSXChild`](#jsxchild) `type` - Valid JSX child types.
- [`JSXNode`](#jsxnode) `interface` - JSX node - the result of JSX expressions.
- [`JSXProps`](#jsxprops) `interface` - Props with children.
- [`renderChildren`](#renderchildren) `function` `renderChildren(children: JSXChild): string` - Renders children to HTML string.
- [`jsx`](#jsx) `function` `jsx(type: JSXElementType, props: JSXProps, _key?: string): JSXNode` - Creates a JSX element. This is the core function called by the JSX transform.
- [`jsxs`](#jsxs) `function` `jsxs(type: JSXElementType, props: JSXProps, key?: string): JSXNode` - Creates a JSX element with static children. Called by the JSX transform for elements wi…
- [`Fragment`](#fragment) `function` - Fragment component - renders children without a wrapper element.
- [`renderToString`](#rendertostring) `function` `renderToString(node: JSXNode): string` - Renders a JSX node to an HTML string.
- [`raw`](#raw) `function` `raw(html: string): JSXNode` - Creates raw HTML without escaping. Use with caution - only for trusted content.
- [`when`](#when) `function` `when(condition: boolean, content: JSXNode): JSXNode` - Conditionally renders content.
- [`each`](#each) `function` - Maps over an array and renders each item.

## Reference

<details id="escapehtml" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">escapeHtml</code><code class="ox-api-entry__signature">escapeHtml(str: string): string</code><span class="ox-api-entry__description">Escapes HTML special characters to prevent XSS.</span></summary>
  <div class="ox-api-entry__body">
<p>Escapes HTML special characters to prevent XSS.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L75">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function escapeHtml(str: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="tohtmlattr" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">toHtmlAttr</code><code class="ox-api-entry__signature">toHtmlAttr(name: string): string</code><span class="ox-api-entry__description">Converts a camelCase attribute name to kebab-case for HTML. Special handling fo…</span></summary>
  <div class="ox-api-entry__body">
<p>Converts a camelCase attribute name to kebab-case for HTML.<br>Special handling for data-* and aria-* attributes.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L87">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function toHtmlAttr(name: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="renderattr" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderAttr</code><code class="ox-api-entry__signature">renderAttr(name: string, value: unknown): string</code><span class="ox-api-entry__description">Renders an attribute value to a string.</span></summary>
  <div class="ox-api-entry__body">
<p>Renders an attribute value to a string.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L103">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function renderAttr(name: string, value: unknown): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="jsxelementtype" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><code class="ox-api-entry__name">JSXElementType</code><span class="ox-api-entry__description">JSX element type - either a string (intrinsic) or a function component.</span></summary>
  <div class="ox-api-entry__body">
<p>JSX element type - either a string (intrinsic) or a function component.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L134">View source</a></p>
  </div>
</details>

<details id="jsxchild" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><code class="ox-api-entry__name">JSXChild</code><span class="ox-api-entry__description">Valid JSX child types.</span></summary>
  <div class="ox-api-entry__body">
<p>Valid JSX child types.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L139">View source</a></p>
  </div>
</details>

<details id="jsxnode" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">JSXNode</code><span class="ox-api-entry__description">JSX node - the result of JSX expressions.</span></summary>
  <div class="ox-api-entry__body">
<p>JSX node - the result of JSX expressions.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L144">View source</a></p>
  </div>
</details>

<details id="jsxprops" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">JSXProps</code><span class="ox-api-entry__description">Props with children.</span></summary>
  <div class="ox-api-entry__body">
<p>Props with children.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L151">View source</a></p>
  </div>
</details>

<details id="renderchildren" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderChildren</code><code class="ox-api-entry__signature">renderChildren(children: JSXChild): string</code><span class="ox-api-entry__description">Renders children to HTML string.</span></summary>
  <div class="ox-api-entry__body">
<p>Renders children to HTML string.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L159">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function renderChildren(children: JSXChild): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="jsx" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">jsx</code><code class="ox-api-entry__signature">jsx(type: JSXElementType, props: JSXProps, _key?: string): JSXNode</code><span class="ox-api-entry__description">Creates a JSX element. This is the core function called by the JSX transform.</span></summary>
  <div class="ox-api-entry__body">
<p>Creates a JSX element.<br>This is the core function called by the JSX transform.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L190">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function jsx(type: JSXElementType, props: JSXProps, _key?: string): JSXNode</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
  </div>
</details>

<details id="jsxs" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">jsxs</code><code class="ox-api-entry__signature">jsxs(type: JSXElementType, props: JSXProps, key?: string): JSXNode</code><span class="ox-api-entry__description">Creates a JSX element with static children. Called by the JSX transform for ele…</span></summary>
  <div class="ox-api-entry__body">
<p>Creates a JSX element with static children.<br>Called by the JSX transform for elements with multiple children.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L231">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function jsxs(type: JSXElementType, props: JSXProps, key?: string): JSXNode</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
  </div>
</details>

<details id="fragment" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">Fragment</code><span class="ox-api-entry__description">Fragment component - renders children without a wrapper element.</span></summary>
  <div class="ox-api-entry__body">
<p>Fragment component - renders children without a wrapper element.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L239">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
  </div>
</details>

<details id="rendertostring" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">renderToString</code><code class="ox-api-entry__signature">renderToString(node: JSXNode): string</code><span class="ox-api-entry__description">Renders a JSX node to an HTML string.</span></summary>
  <div class="ox-api-entry__body">
<p>Renders a JSX node to an HTML string.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L246">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function renderToString(node: JSXNode): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="raw" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">raw</code><code class="ox-api-entry__signature">raw(html: string): JSXNode</code><span class="ox-api-entry__description">Creates raw HTML without escaping. Use with caution - only for trusted content.</span></summary>
  <div class="ox-api-entry__body">
<p>Creates raw HTML without escaping.<br>Use with caution - only for trusted content.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L253">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function raw(html: string): JSXNode</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">&lt;div&gt;{raw(&#39;&lt;strong&gt;Bold&lt;/strong&gt;&#39;)}&lt;/div&gt;</code></pre>
</div>
  </div>
</details>

<details id="when" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">when</code><code class="ox-api-entry__signature">when(condition: boolean, content: JSXNode): JSXNode</code><span class="ox-api-entry__description">Conditionally renders content.</span></summary>
  <div class="ox-api-entry__body">
<p>Conditionally renders content.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L266">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function when(condition: boolean, content: JSXNode): JSXNode</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">{when(isLoggedIn, &lt;UserMenu /&gt;)}</code></pre>
</div>
  </div>
</details>

<details id="each" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">each</code><span class="ox-api-entry__description">Maps over an array and renders each item.</span></summary>
  <div class="ox-api-entry__body">
<p>Maps over an array and renders each item.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/jsx-runtime.ts#L278">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>JSXNode</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">{each(items, (item) =&gt; &lt;li&gt;{item.name}&lt;/li&gt;)}</code></pre>
</div>
  </div>
</details>
