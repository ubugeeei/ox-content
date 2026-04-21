# nav-generator.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts)**

> 4 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`generateNavMetadata`](#generatenavmetadata) `function` `generateNavMetadata(docs: ExtractedDocs[], basePath: string = "/api"): NavItem[]` - Generates sidebar navigation metadata from extracted documentation. Takes an array of e…
- [`getDocDisplayName`](#getdocdisplayname) `function` `getDocDisplayName(filePath: string): string` - Gets the human-readable display name for a documentation file. Transforms file paths an…
- [`getDocFileName`](#getdocfilename) `function` `getDocFileName(filePath: string): string` - Gets the file name (without extension) for use in navigation paths. This handles filena…
- [`generateNavCode`](#generatenavcode) `function` `generateNavCode(navItems: NavItem[], exportName: string = "apiNav"): string` - Generates TypeScript code for navigation metadata export. Creates a complete, self-cont…

## Reference

<details id="generatenavmetadata" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateNavMetadata</code><code class="ox-api-entry__signature">generateNavMetadata(docs: ExtractedDocs[], basePath: string = &quot;/api&quot;): NavItem[]</code><span class="ox-api-entry__description">Generates sidebar navigation metadata from extracted documentation. Takes an ar…</span></summary>
  <div class="ox-api-entry__body">
<p>Generates sidebar navigation metadata from extracted documentation.<br>Takes an array of extracted documentation and produces a flat navigation<br>structure suitable for sidebar menus. Items are:<br>- Sorted alphabetically by display name<br>- Formatted with readable titles<br>- Prefixed with the specified base path<br>## Naming Conventions<br>- <code>transform.ts</code> → <code>{ title: &#39;Transform&#39;, path: &#39;/api/transform&#39; }</code><br>- <code>nav-generator.ts</code> → <code>{ title: &#39;Nav Generator&#39;, path: &#39;/api/nav-generator&#39; }</code><br>- <code>index.ts</code> or <code>index-module.ts</code> → <code>{ title: &#39;Overview&#39;, path: &#39;/api/index&#39; }</code><br>- <code>types.ts</code> → <code>{ title: &#39;Types&#39;, path: &#39;/api/types&#39; }</code><br>## Sorting<br>Items are sorted alphabetically by display title for consistent ordering.<br>Special item &#39;Overview&#39; sorts naturally with others (O comes after most letters).<br>## Path Generation<br>The generated paths are used to import corresponding Markdown files:<br>- Path <code>/api/transform</code> → Import from <code>../api/transform.md</code><br>- Path <code>/api/index</code> → Import from <code>../api/index.md</code><br>Use &#39;/api&#39; for main API docs, &#39;/helpers&#39; for utilities, etc.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L62">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateNavMetadata(docs: ExtractedDocs[], basePath: string = &quot;/api&quot;): NavItem[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>docs</code></td>
  <td><code>ExtractedDocs[]</code></td>
  <td>Array of extracted documentation (file + entries)</td>
</tr>
<tr>
  <td><code>basePath</code></td>
  <td><code>string</code></td>
  <td>Base path prefix for navigation URLs (default: &#39;/api&#39;)</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>NavItem[]</code> — Array of navigation items ready to use or export to TypeScript</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">const navItems = generateNavMetadata(
  [
    { file: &#39;transform.ts&#39;, entries: [...] },
    { file: &#39;docs.ts&#39;, entries: [...] },
    { file: &#39;types.ts&#39;, entries: [...] },
  ],
  &#39;/api&#39;
);
// Returns:
// [
//   { title: &#39;Docs&#39;, path: &#39;/api/docs&#39; },
//   { title: &#39;Transform&#39;, path: &#39;/api/transform&#39; },
//   { title: &#39;Types&#39;, path: &#39;/api/types&#39; },
// ]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@see</span><span>generateNavCode For converting these items to TypeScript code</span></li></ul>
</div>
  </div>
</details>

<details id="getdocdisplayname" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getDocDisplayName</code><code class="ox-api-entry__signature">getDocDisplayName(filePath: string): string</code><span class="ox-api-entry__description">Gets the human-readable display name for a documentation file. Transforms file…</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the human-readable display name for a documentation file.<br>Transforms file paths and names into proper title case:<br>- Extracts base name (e.g., &#39;transform.ts&#39; → &#39;transform&#39;)<br>- Converts kebab-case to Title Case (e.g., &#39;nav-generator&#39; → &#39;Nav Generator&#39;)<br>- Converts camelCase to Title Case (e.g., &#39;transformMarkdown&#39; → &#39;Transform Markdown&#39;)<br>- Handles special cases (index → &#39;Overview&#39;)<br>## Examples<br>- <code>&#39;/path/to/transform.ts&#39;</code> → <code>&#39;Transform&#39;</code><br>- <code>&#39;nav-generator.ts&#39;</code> → <code>&#39;Nav Generator&#39;</code><br>- <code>&#39;index.ts&#39;</code> → <code>&#39;Overview&#39;</code><br>- <code>&#39;index-module.ts&#39;</code> → <code>&#39;Overview&#39;</code><br>- <code>&#39;myFunction.ts&#39;</code> → <code>&#39;My Function&#39;</code> (with camelCase handling)</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L130">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getDocDisplayName(filePath: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>filePath</code></td>
  <td><code>string</code></td>
  <td>Full or relative file path</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code> — Formatted display name suitable for UI labels</p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="getdocfilename" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getDocFileName</code><code class="ox-api-entry__signature">getDocFileName(filePath: string): string</code><span class="ox-api-entry__description">Gets the file name (without extension) for use in navigation paths. This handle…</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the file name (without extension) for use in navigation paths.<br>This handles filename conflicts that may occur during generation:<br>- Preserves most names as-is<br>- Special handling for index files to maintain consistency</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L167">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function getDocFileName(filePath: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>filePath</code></td>
  <td><code>string</code></td>
  <td>Source file path</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code> — File name without extension, ready for URL paths</p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="generatenavcode" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateNavCode</code><code class="ox-api-entry__signature">generateNavCode(navItems: NavItem[], exportName: string = &quot;apiNav&quot;): string</code><span class="ox-api-entry__description">Generates TypeScript code for navigation metadata export. Creates a complete, s…</span></summary>
  <div class="ox-api-entry__body">
<p>Generates TypeScript code for navigation metadata export.<br>Creates a complete, self-contained TypeScript file that:<br>- Defines the NavItem interface<br>- Exports navigation items as a const<br>- Uses <code>as const</code> for type-safe literal types<br>- Includes auto-generation notice<br>The generated code is production-ready and suitable for direct import<br>in Vue, React, or vanilla TypeScript applications.<br>## Generated Code Example<br>``<code>typescript<br>export interface NavItem {<br>title: string;<br>path: string;<br>children?: NavItem[];<br>}<br>export const apiNav: NavItem[] = [<br>{ &quot;title&quot;: &quot;Docs&quot;, &quot;path&quot;: &quot;/api/docs&quot; },<br>{ &quot;title&quot;: &quot;Transform&quot;, &quot;path&quot;: &quot;/api/transform&quot; },<br>// ...<br>] as const;<br></code>`<code><br>## Features<br>- **Type Safety**: Includes NavItem interface definition<br>- **Readonly**: Uses </code>as const` to ensure immutability<br>- **IDE Support**: Full IntelliSense and autocomplete<br>- **Self-Documenting**: Includes notice that file is auto-generated<br>Use custom names for different navigation sections<br>ready to write to a .ts file</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/nav-generator.ts#L191">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateNavCode(navItems: NavItem[], exportName: string = &quot;apiNav&quot;): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>navItems</code></td>
  <td><code>NavItem[]</code></td>
  <td>Array of navigation items to export</td>
</tr>
<tr>
  <td><code>exportName</code></td>
  <td><code>string</code></td>
  <td>Name of the exported const (default: &#39;apiNav&#39;)</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code> — Complete TypeScript source code as string,</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">const navItems = [
  { title: &#39;Home&#39;, path: &#39;/api/index&#39; },
  { title: &#39;Transform&#39;, path: &#39;/api/transform&#39; },
];
const code = generateNavCode(navItems, &#39;apiNav&#39;);
await fs.promises.writeFile(&#39;docs/api/nav.ts&#39;, code, &#39;utf-8&#39;);</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@see</span><span>generateNavMetadata For generating NavItem arrays from extracted docs</span></li></ul>
</div>
  </div>
</details>

