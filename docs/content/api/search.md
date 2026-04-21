# search.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts)**

> 8 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`parseScopedSearchQuery`](#parsescopedsearchquery) `function` `parseScopedSearchQuery(query: string): ScopedSearchQuery` - Splits a raw query into free-text terms and `@scope` prefixes.
- [`getSearchDocumentScopes`](#getsearchdocumentscopes) `function` `getSearchDocumentScopes(doc: Pick<SearchDocument, "id" | "url">): string[]` - Derives hierarchical search scopes from a document id or URL. For example, `api/math/in…
- [`matchesSearchScopes`](#matchessearchscopes) `function` `matchesSearchScopes( doc: Pick<SearchDocument, "id" | "url">, scopes: string[], ): boolean` - Returns true when a search document belongs to at least one requested scope.
- [`resolveSearchOptions`](#resolvesearchoptions) `function` `resolveSearchOptions( options: SearchOptions | boolean | undefined, ): ResolvedSearchOptions` - Resolves search options with defaults.
- [`collectMarkdownFiles`](#collectmarkdownfiles) `function` `collectMarkdownFiles(dir: string): Promise<string[]>` - Collects all Markdown files from a directory.
- [`buildSearchIndex`](#buildsearchindex) `function` `buildSearchIndex(srcDir: string, base: string): Promise<string>` - Builds the search index from Markdown files.
- [`writeSearchIndex`](#writesearchindex) `function` `writeSearchIndex(indexJson: string, outDir: string): Promise<void>` - Writes the search index to a file.
- [`generateSearchModule`](#generatesearchmodule) `function` `generateSearchModule(options: ResolvedSearchOptions, indexPath: string): string` - Client-side search module code. This is injected into the bundle as a virtual module.

## Reference

<a id="parsescopedsearchquery"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">parseScopedSearchQuery</code><code class="ox-api-entry__signature">parseScopedSearchQuery(query: string): ScopedSearchQuery</code><span class="ox-api-entry__description">Splits a raw query into free-text terms and <code>@scope</code> prefixes.</span></summary>
  <div class="ox-api-entry__body">
<p>Splits a raw query into free-text terms and <code>@scope</code> prefixes.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L32">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function parseScopedSearchQuery(query: string): ScopedSearchQuery</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ScopedSearchQuery</code></p>
</div>
  </div>
</details>

<a id="getsearchdocumentscopes"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">getSearchDocumentScopes</code><code class="ox-api-entry__signature">getSearchDocumentScopes(doc: Pick&lt;SearchDocument, &quot;id&quot; | &quot;url&quot;&gt;): string[]</code><span class="ox-api-entry__description">Derives hierarchical search scopes from a document id or URL. For example, `api…</span></summary>
  <div class="ox-api-entry__body">
<p>Derives hierarchical search scopes from a document id or URL.<br>For example, <code>api/math/index</code> yields <code>[&quot;api&quot;, &quot;api/math&quot;]</code>.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L53">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function getSearchDocumentScopes(doc: Pick&lt;SearchDocument, &quot;id&quot; | &quot;url&quot;&gt;): string[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string[]</code></p>
</div>
  </div>
</details>

<a id="matchessearchscopes"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">matchesSearchScopes</code><code class="ox-api-entry__signature">matchesSearchScopes( doc: Pick&lt;SearchDocument, &quot;id&quot; | &quot;url&quot;&gt;, scopes: string[], ): boolean</code><span class="ox-api-entry__description">Returns true when a search document belongs to at least one requested scope.</span></summary>
  <div class="ox-api-entry__body">
<p>Returns true when a search document belongs to at least one requested scope.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L77">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function matchesSearchScopes(
  doc: Pick&lt;SearchDocument, &quot;id&quot; | &quot;url&quot;&gt;,
  scopes: string[],
  ): boolean</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>boolean</code></p>
</div>
  </div>
</details>

<a id="resolvesearchoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resolveSearchOptions</code><code class="ox-api-entry__signature">resolveSearchOptions( options: SearchOptions | boolean | undefined, ): ResolvedSearchOptions</code><span class="ox-api-entry__description">Resolves search options with defaults.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolves search options with defaults.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L92">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function resolveSearchOptions(
  options: SearchOptions | boolean | undefined,
  ): ResolvedSearchOptions</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ResolvedSearchOptions</code></p>
</div>
  </div>
</details>

<a id="collectmarkdownfiles"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">collectMarkdownFiles</code><code class="ox-api-entry__signature">collectMarkdownFiles(dir: string): Promise&lt;string[]&gt;</code><span class="ox-api-entry__description">Collects all Markdown files from a directory.</span></summary>
  <div class="ox-api-entry__body">
<p>Collects all Markdown files from a directory.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L119">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">async function collectMarkdownFiles(dir: string): Promise&lt;string[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string[]&gt;</code></p>
</div>
  </div>
</details>

<a id="buildsearchindex"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">buildSearchIndex</code><code class="ox-api-entry__signature">buildSearchIndex(srcDir: string, base: string): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Builds the search index from Markdown files.</span></summary>
  <div class="ox-api-entry__body">
<p>Builds the search index from Markdown files.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L147">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function buildSearchIndex(srcDir: string, base: string): Promise&lt;string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string&gt;</code></p>
</div>
  </div>
</details>

<a id="writesearchindex"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">writeSearchIndex</code><code class="ox-api-entry__signature">writeSearchIndex(indexJson: string, outDir: string): Promise&lt;void&gt;</code><span class="ox-api-entry__description">Writes the search index to a file.</span></summary>
  <div class="ox-api-entry__body">
<p>Writes the search index to a file.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L203">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function writeSearchIndex(indexJson: string, outDir: string): Promise&lt;void&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;void&gt;</code></p>
</div>
  </div>
</details>

<a id="generatesearchmodule"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateSearchModule</code><code class="ox-api-entry__signature">generateSearchModule(options: ResolvedSearchOptions, indexPath: string): string</code><span class="ox-api-entry__description">Client-side search module code. This is injected into the bundle as a virtual m…</span></summary>
  <div class="ox-api-entry__body">
<p>Client-side search module code.<br>This is injected into the bundle as a virtual module.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/search.ts#L216">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateSearchModule(options: ResolvedSearchOptions, indexPath: string): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

