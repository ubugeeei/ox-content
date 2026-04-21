# docs.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts)**

> 13 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`extractDocs`](#extractdocs) `function` `extractDocs( srcDirs: string[], options: ResolvedDocsOptions, ): Promise<ExtractedDocs[]>` - Extracts JSDoc documentation from source files in specified directories. This function…
- [`findFiles`](#findfiles) `function` `findFiles(dir: string, options: ResolvedDocsOptions): Promise<string[]>` - Recursively finds all source files matching include/exclude patterns.
- [`extractFromContent`](#extractfromcontent) `function` `extractFromContent( content: string, file: string, options: ResolvedDocsOptions, ): DocEntry[]` - Extracts documentation entries from file content.
- [`extractFunctionSignature`](#extractfunctionsignature) `function` `extractFunctionSignature(signature: string): string | undefined` - Extracts the complete function signature for display. Captures the full function declar…
- [`extractTypesFromSignature`](#extracttypesfromsignature) `function` `extractTypesFromSignature( signature: string, _params: ParamDoc[], ):` - Extracts parameter and return types from a TypeScript function signature. Parses functi…
- [`splitParameters`](#splitparameters) `function` `splitParameters(paramListStr: string): string[]` - Splits function parameters while respecting nested angle brackets (generics). Handles c…
- [`parseJsdocBlock`](#parsejsdocblock) `function` - Parses a JSDoc block and the following declaration. Only matches if the declaration is…
- [`generateMarkdown`](#generatemarkdown) `function` `generateMarkdown( docs: ExtractedDocs[], options: ResolvedDocsOptions, ): Record<string, string>` - Generates Markdown documentation from extracted docs.
- [`SymbolLocation`](#symbollocation) `interface` - Symbol location info for cross-file linking.
- [`convertSymbolLinks`](#convertsymbollinks) `function` `convertSymbolLinks( text: string, currentFileName: string, symbolMap: Map<string, SymbolLocation>, ): string` - Converts symbol links [SymbolName] to markdown links. Processes description text to con…
- [`buildSymbolMap`](#buildsymbolmap) `function` `buildSymbolMap(docs: ExtractedDocs[]): Map<string, SymbolLocation>` - Builds a map of all symbols to their file locations.
- [`writeDocs`](#writedocs) `function` - Writes generated documentation to the output directory.
- [`generateSourceHref`](#generatesourcehref) `function` `generateSourceHref(filePath: string, githubUrl: string, lineNumber?: number): string` - Generates a GitHub source link for a file and optional line number.

## Reference

<details id="extractdocs" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractDocs</code><code class="ox-api-entry__signature">extractDocs( srcDirs: string[], options: ResolvedDocsOptions, ): Promise&lt;ExtractedDocs[]&gt;</code><span class="ox-api-entry__description">Extracts JSDoc documentation from source files in specified directories. This f…</span></summary>
  <div class="ox-api-entry__body">
<p>Extracts JSDoc documentation from source files in specified directories.<br>This function recursively searches directories for source files matching<br>the include/exclude patterns, then extracts all documented items (functions,<br>classes, interfaces, types) from those files.<br>## Process<br>1. **File Discovery**: Recursively walks directories, applying filters<br>2. **File Reading**: Loads each matching file&#39;s content<br>3. **JSDoc Extraction**: Parses JSDoc comments using regex patterns<br>4. **Declaration Matching**: Pairs JSDoc comments with source declarations<br>5. **Result Collection**: Aggregates extracted documentation by file<br>## Include/Exclude Patterns<br>Patterns support:<br>- <code>**</code> - Match any directory structure<br>- <code>*</code> - Match any filename<br>- Standard glob patterns (e.g., <code>**\/*.test.ts</code>)<br>## Performance Considerations<br>- Uses filesystem I/O which can be slow for large codebases<br>- Consider using more specific include patterns to reduce file scanning<br>- Results are not cached; call once per build/dev session<br>Each ExtractedDocs object contains file path and array of DocEntry items.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L180">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function extractDocs(
  srcDirs: string[],
  options: ResolvedDocsOptions,
  ): Promise&lt;ExtractedDocs[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>srcDirs</code></td>
  <td><code>string[]</code></td>
  <td>Array of source directory paths to scan</td>
</tr>
<tr>
  <td><code>options</code></td>
  <td><code>ResolvedDocsOptions</code></td>
  <td>Documentation extraction options (filters, grouping, etc.)</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;ExtractedDocs[]&gt;</code> — Promise resolving to array of extracted documentation by file.</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">const docs = await extractDocs(
  [&#39;./packages/vite-plugin/src&#39;],
  {
    enabled: true,
    src: [],
    out: &#39;docs&#39;,
    include: [&#39;**\/*.ts&#39;],
    exclude: [&#39;**\/*.test.ts&#39;, &#39;**\/*.spec.ts&#39;],
    format: &#39;markdown&#39;,
    private: false,
    toc: true,
    groupBy: &#39;file&#39;,
    generateNav: true,
  }
);
// Returns:
// [
//   {
//     file: &#39;/path/to/transform.ts&#39;,
//     entries: [
//       { name: &#39;transformMarkdown&#39;, kind: &#39;function&#39;, ... },
//       { name: &#39;loadNapiBindings&#39;, kind: &#39;function&#39;, ... },
//     ]
//   },
//   ...
// ]</code></pre>
</div>
  </div>
</details>

<details id="findfiles" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">findFiles</code><code class="ox-api-entry__signature">findFiles(dir: string, options: ResolvedDocsOptions): Promise&lt;string[]&gt;</code><span class="ox-api-entry__description">Recursively finds all source files matching include/exclude patterns.</span></summary>
  <div class="ox-api-entry__body">
<p>Recursively finds all source files matching include/exclude patterns.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L267">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">async function findFiles(dir: string, options: ResolvedDocsOptions): Promise&lt;string[]&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;string[]&gt;</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="extractfromcontent" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractFromContent</code><code class="ox-api-entry__signature">extractFromContent( content: string, file: string, options: ResolvedDocsOptions, ): DocEntry[]</code><span class="ox-api-entry__description">Extracts documentation entries from file content.</span></summary>
  <div class="ox-api-entry__body">
<p>Extracts documentation entries from file content.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L324">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function extractFromContent(
  content: string,
  file: string,
  options: ResolvedDocsOptions,
  ): DocEntry[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>DocEntry[]</code></p>
</div>
  </div>
</details>

<details id="extractfunctionsignature" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractFunctionSignature</code><code class="ox-api-entry__signature">extractFunctionSignature(signature: string): string | undefined</code><span class="ox-api-entry__description">Extracts the complete function signature for display. Captures the full functio…</span></summary>
  <div class="ox-api-entry__body">
<p>Extracts the complete function signature for display.<br>Captures the full function declaration from <code>export/async/function name(...): ReturnType</code><br>or <code>export const name = (...): ReturnType =&gt; {}</code>, handling multi-line signatures.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L354">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function extractFunctionSignature(signature: string): string | undefined</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>signature</code></td>
  <td><code>string</code></td>
  <td>Multi-line function declaration text</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string | undefined</code> — Cleaned function signature or undefined if not found</p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="extracttypesfromsignature" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">extractTypesFromSignature</code><code class="ox-api-entry__signature">extractTypesFromSignature( signature: string, _params: ParamDoc[], ):</code><span class="ox-api-entry__description">Extracts parameter and return types from a TypeScript function signature. Parse…</span></summary>
  <div class="ox-api-entry__body">
<p>Extracts parameter and return types from a TypeScript function signature.<br>Parses function signatures to extract:<br>- Parameter names and their type annotations<br>- Return type annotation<br>Handles various function declaration styles:<br>- <code>function name(param: type): ReturnType</code><br>- <code>const name = (param: type): ReturnType =&gt; {}</code><br>- <code>export async function name(param: type): Promise&lt;ReturnType&gt;</code></p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L387">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function extractTypesFromSignature(
  signature: string,
  _params: ParamDoc[],
  ):</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>signature</code></td>
  <td><code>string</code></td>
  <td>Multi-line function signature text</td>
</tr>
<tr>
  <td><code>params</code></td>
  <td><code>ParamDoc[]</code></td>
  <td>Array of parameter docs with names already extracted</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>{ paramTypes: string[]; returnType?: string }</code> — Object with extracted parameter types and return type</p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="splitparameters" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">splitParameters</code><code class="ox-api-entry__signature">splitParameters(paramListStr: string): string[]</code><span class="ox-api-entry__description">Splits function parameters while respecting nested angle brackets (generics). H…</span></summary>
  <div class="ox-api-entry__body">
<p>Splits function parameters while respecting nested angle brackets (generics).<br>Handles cases like:<br>- <code>a: string, b: number</code> → <code>[&quot;a: string&quot;, &quot;b: number&quot;]</code><br>- <code>a: Promise&lt;string&gt;, b: Record&lt;string, any&gt;</code> → <code>[&quot;a: Promise&lt;string&gt;&quot;, &quot;b: Record&lt;string, any&gt;&quot;]</code></p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L456">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function splitParameters(paramListStr: string): string[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>paramListStr</code></td>
  <td><code>string</code></td>
  <td>String containing all parameters</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string[]</code> — Array of individual parameter strings</p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="parsejsdocblock" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">parseJsdocBlock</code><span class="ox-api-entry__description">Parses a JSDoc block and the following declaration. Only matches if the declaration is immediately after the JSDoc (wit…</span></summary>
  <div class="ox-api-entry__body">
<p>Parses a JSDoc block and the following declaration.<br>Only matches if the declaration is immediately after the JSDoc (with only whitespace/keywords between).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L495">View source</a></p>
  </div>
</details>

<details id="generatemarkdown" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateMarkdown</code><code class="ox-api-entry__signature">generateMarkdown( docs: ExtractedDocs[], options: ResolvedDocsOptions, ): Record&lt;string, string&gt;</code><span class="ox-api-entry__description">Generates Markdown documentation from extracted docs.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates Markdown documentation from extracted docs.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L661">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateMarkdown(
  docs: ExtractedDocs[],
  options: ResolvedDocsOptions,
  ): Record&lt;string, string&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Record&lt;string, string&gt;</code></p>
</div>
  </div>
</details>

<details id="symbollocation" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SymbolLocation</code><span class="ox-api-entry__description">Symbol location info for cross-file linking.</span></summary>
  <div class="ox-api-entry__body">
<p>Symbol location info for cross-file linking.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L1000">View source</a></p>
  </div>
</details>

<details id="convertsymbollinks" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">convertSymbolLinks</code><code class="ox-api-entry__signature">convertSymbolLinks( text: string, currentFileName: string, symbolMap: Map&lt;string, SymbolLocation&gt;, ): string</code><span class="ox-api-entry__description">Converts symbol links [SymbolName] to markdown links. Processes description tex…</span></summary>
  <div class="ox-api-entry__body">
<p>Converts symbol links [SymbolName] to markdown links.<br>Processes description text to convert cargo-docs-style symbol references<br><code>[SymbolName]</code> into clickable markdown links pointing to the appropriate<br>documentation page.<br>## Examples<br>Input: &quot;See [transformMarkdown] for usage&quot; (same file)<br>Output: &quot;See <a href="#transformmarkdown">transformMarkdown</a> for usage&quot;<br>Input: &quot;Uses <a href="./types.md#navitem">NavItem</a> interface&quot; (different file: types.ts)<br>Output: &quot;Uses <a href="./types.md#navitem">NavItem</a> interface&quot;</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L1009">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function convertSymbolLinks(
  text: string,
  currentFileName: string,
  symbolMap: Map&lt;string, SymbolLocation&gt;,
  ): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Parameters</h4>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
<tr>
  <td><code>text</code></td>
  <td><code>string</code></td>
  <td>Description text containing symbol references</td>
</tr>
<tr>
  <td><code>currentFileName</code></td>
  <td><code>string</code></td>
  <td>Current file name (without extension) for same-file detection</td>
</tr>
<tr>
  <td><code>symbolMap</code></td>
  <td><code>Map&lt;string, SymbolLocation&gt;</code></td>
  <td>Map of symbol names to their file locations</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code> — Text with symbol references converted to markdown links</p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="buildsymbolmap" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">buildSymbolMap</code><code class="ox-api-entry__signature">buildSymbolMap(docs: ExtractedDocs[]): Map&lt;string, SymbolLocation&gt;</code><span class="ox-api-entry__description">Builds a map of all symbols to their file locations.</span></summary>
  <div class="ox-api-entry__body">
<p>Builds a map of all symbols to their file locations.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L1055">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function buildSymbolMap(docs: ExtractedDocs[]): Map&lt;string, SymbolLocation&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Map&lt;string, SymbolLocation&gt;</code></p>
</div>
  </div>
</details>

<details id="writedocs" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">writeDocs</code><span class="ox-api-entry__description">Writes generated documentation to the output directory.</span></summary>
  <div class="ox-api-entry__body">
<p>Writes generated documentation to the output directory.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L1079">View source</a></p>
  </div>
</details>

<details id="generatesourcehref" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateSourceHref</code><code class="ox-api-entry__signature">generateSourceHref(filePath: string, githubUrl: string, lineNumber?: number): string</code><span class="ox-api-entry__description">Generates a GitHub source link for a file and optional line number.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates a GitHub source link for a file and optional line number.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/docs.ts#L1146">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">function generateSourceHref(filePath: string, githubUrl: string, lineNumber?: number): string</code></pre>
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
  <td>Full path to the source file</td>
</tr>
<tr>
  <td><code>githubUrl</code></td>
  <td><code>string</code></td>
  <td>Base GitHub repository URL</td>
</tr>
<tr>
  <td><code>lineNumber</code></td>
  <td><code>number</code></td>
  <td>Optional line number to link to</td>
</tr>
  </tbody>
</table>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code> — Absolute GitHub URL to source code</p>
</div>
  </div>
</details>

