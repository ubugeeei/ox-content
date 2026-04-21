# types.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts)**

> 36 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`HeroAction`](#heroaction) `interface` - Hero section action button.
- [`HeroImage`](#heroimage) `interface` - Hero section image configuration.
- [`HeroConfig`](#heroconfig) `interface` - Hero section configuration for entry page.
- [`FeatureConfig`](#featureconfig) `interface` - Feature card for entry page.
- [`EntryPageConfig`](#entrypageconfig) `interface` - Entry page frontmatter configuration.
- [`SsgOptions`](#ssgoptions) `interface` - SSG (Static Site Generation) options.
- [`ResolvedSsgOptions`](#resolvedssgoptions) `interface` - Resolved SSG options.
- [`OxContentOptions`](#oxcontentoptions) `interface` - Plugin options.
- [`ResolvedOptions`](#resolvedoptions) `interface` - Resolved options with all defaults applied.
- [`CodeAnnotationKind`](#codeannotationkind) `type` - Supported line annotation kinds for code blocks.
- [`CodeAnnotationSyntax`](#codeannotationsyntax) `type` - Supported code annotation syntaxes.
- [`CodeAnnotationsOptions`](#codeannotationsoptions) `interface` - Opt-in code annotation configuration.
- [`ResolvedCodeAnnotationsOptions`](#resolvedcodeannotationsoptions) `interface` - Resolved code annotation configuration.
- [`OgImageOptions`](#ogimageoptions) `interface` - OG image generation options. Uses Chromium-based rendering with customizable templates.
- [`ResolvedOgImageOptions`](#resolvedogimageoptions) `interface` - Resolved OG image options with all defaults applied.
- [`MarkdownTransformer`](#markdowntransformer) `interface` - Custom AST transformer.
- [`TransformContext`](#transformcontext) `interface` - Transform context passed to transformers.
- [`MarkdownNode`](#markdownnode) `interface` - Markdown AST node (simplified for TypeScript).
- [`TransformResult`](#transformresult) `interface` - Transform result.
- [`TocEntry`](#tocentry) `interface` - Table of contents entry.
- [`DocsOptions`](#docsoptions) `interface` - Options for source documentation generation.
- [`ResolvedDocsOptions`](#resolveddocsoptions) `interface` - Resolved docs options with all defaults applied.
- [`DocEntry`](#docentry) `interface` - A single documentation entry extracted from source.
- [`ParamDoc`](#paramdoc) `interface` - Parameter documentation.
- [`ReturnDoc`](#returndoc) `interface` - Return type documentation.
- [`ExtractedDocs`](#extracteddocs) `interface` - Extracted documentation for a single file.
- [`GeneratedDocsData`](#generateddocsdata) `interface` - Machine-readable payload emitted alongside generated docs.
- [`NavItem`](#navitem) `interface` - Navigation item for sidebar navigation.
- [`SearchOptions`](#searchoptions) `interface` - Options for full-text search.
- [`ResolvedSearchOptions`](#resolvedsearchoptions) `interface` - Resolved search options.
- [`SearchDocument`](#searchdocument) `interface` - Search document structure.
- [`SearchResult`](#searchresult) `interface` - Search result structure.
- [`ScopedSearchQuery`](#scopedsearchquery) `interface` - Parsed search query with optional scope prefixes.
- [`LocaleConfig`](#localeconfig) `interface` - Locale configuration.
- [`I18nOptions`](#i18noptions) `interface` - i18n (internationalization) options.
- [`ResolvedI18nOptions`](#resolvedi18noptions) `interface` - Resolved i18n options with all defaults applied.

## Reference

<a id="heroaction"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">HeroAction</code><span class="ox-api-entry__description">Hero section action button.</span></summary>
  <div class="ox-api-entry__body">
<p>Hero section action button.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L12">View source</a></p>
  </div>
</details>

<a id="heroimage"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">HeroImage</code><span class="ox-api-entry__description">Hero section image configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Hero section image configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L24">View source</a></p>
  </div>
</details>

<a id="heroconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">HeroConfig</code><span class="ox-api-entry__description">Hero section configuration for entry page.</span></summary>
  <div class="ox-api-entry__body">
<p>Hero section configuration for entry page.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L38">View source</a></p>
  </div>
</details>

<a id="featureconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">FeatureConfig</code><span class="ox-api-entry__description">Feature card for entry page.</span></summary>
  <div class="ox-api-entry__body">
<p>Feature card for entry page.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L54">View source</a></p>
  </div>
</details>

<a id="entrypageconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">EntryPageConfig</code><span class="ox-api-entry__description">Entry page frontmatter configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Entry page frontmatter configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L70">View source</a></p>
  </div>
</details>

<a id="ssgoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SsgOptions</code><span class="ox-api-entry__description">SSG (Static Site Generation) options.</span></summary>
  <div class="ox-api-entry__body">
<p>SSG (Static Site Generation) options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L82">View source</a></p>
  </div>
</details>

<a id="resolvedssgoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedSsgOptions</code><span class="ox-api-entry__description">Resolved SSG options.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved SSG options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L143">View source</a></p>
  </div>
</details>

<a id="oxcontentoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">OxContentOptions</code><span class="ox-api-entry__description">Plugin options.</span></summary>
  <div class="ox-api-entry__body">
<p>Plugin options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L158">View source</a></p>
  </div>
</details>

<a id="resolvedoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedOptions</code><span class="ox-api-entry__description">Resolved options with all defaults applied.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved options with all defaults applied.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L318">View source</a></p>
  </div>
</details>

<a id="codeannotationkind"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><code class="ox-api-entry__name">CodeAnnotationKind</code><span class="ox-api-entry__description">Supported line annotation kinds for code blocks.</span></summary>
  <div class="ox-api-entry__body">
<p>Supported line annotation kinds for code blocks.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L348">View source</a></p>
  </div>
</details>

<a id="codeannotationsyntax"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><code class="ox-api-entry__name">CodeAnnotationSyntax</code><span class="ox-api-entry__description">Supported code annotation syntaxes.</span></summary>
  <div class="ox-api-entry__body">
<p>Supported code annotation syntaxes.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L353">View source</a></p>
  </div>
</details>

<a id="codeannotationsoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">CodeAnnotationsOptions</code><span class="ox-api-entry__description">Opt-in code annotation configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Opt-in code annotation configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L358">View source</a></p>
  </div>
</details>

<a id="resolvedcodeannotationsoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedCodeAnnotationsOptions</code><span class="ox-api-entry__description">Resolved code annotation configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved code annotation configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L393">View source</a></p>
  </div>
</details>

<a id="ogimageoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">OgImageOptions</code><span class="ox-api-entry__description">OG image generation options. Uses Chromium-based rendering with customizable templates.</span></summary>
  <div class="ox-api-entry__body">
<p>OG image generation options.<br>Uses Chromium-based rendering with customizable templates.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L403">View source</a></p>
  </div>
</details>

<a id="resolvedogimageoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedOgImageOptions</code><span class="ox-api-entry__description">Resolved OG image options with all defaults applied.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved OG image options with all defaults applied.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L452">View source</a></p>
  </div>
</details>

<a id="markdowntransformer"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">MarkdownTransformer</code><span class="ox-api-entry__description">Custom AST transformer.</span></summary>
  <div class="ox-api-entry__body">
<p>Custom AST transformer.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L464">View source</a></p>
  </div>
</details>

<a id="transformcontext"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">TransformContext</code><span class="ox-api-entry__description">Transform context passed to transformers.</span></summary>
  <div class="ox-api-entry__body">
<p>Transform context passed to transformers.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L479">View source</a></p>
  </div>
</details>

<a id="markdownnode"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">MarkdownNode</code><span class="ox-api-entry__description">Markdown AST node (simplified for TypeScript).</span></summary>
  <div class="ox-api-entry__body">
<p>Markdown AST node (simplified for TypeScript).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L499">View source</a></p>
  </div>
</details>

<a id="transformresult"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">TransformResult</code><span class="ox-api-entry__description">Transform result.</span></summary>
  <div class="ox-api-entry__body">
<p>Transform result.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L509">View source</a></p>
  </div>
</details>

<a id="tocentry"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">TocEntry</code><span class="ox-api-entry__description">Table of contents entry.</span></summary>
  <div class="ox-api-entry__body">
<p>Table of contents entry.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L539">View source</a></p>
  </div>
</details>

<a id="docsoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">DocsOptions</code><span class="ox-api-entry__description">Options for source documentation generation.</span></summary>
  <div class="ox-api-entry__body">
<p>Options for source documentation generation.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L568">View source</a></p>
  </div>
</details>

<a id="resolveddocsoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedDocsOptions</code><span class="ox-api-entry__description">Resolved docs options with all defaults applied.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved docs options with all defaults applied.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L640">View source</a></p>
  </div>
</details>

<a id="docentry"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">DocEntry</code><span class="ox-api-entry__description">A single documentation entry extracted from source.</span></summary>
  <div class="ox-api-entry__body">
<p>A single documentation entry extracted from source.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L657">View source</a></p>
  </div>
</details>

<a id="paramdoc"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ParamDoc</code><span class="ox-api-entry__description">Parameter documentation.</span></summary>
  <div class="ox-api-entry__body">
<p>Parameter documentation.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L674">View source</a></p>
  </div>
</details>

<a id="returndoc"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ReturnDoc</code><span class="ox-api-entry__description">Return type documentation.</span></summary>
  <div class="ox-api-entry__body">
<p>Return type documentation.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L685">View source</a></p>
  </div>
</details>

<a id="extracteddocs"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ExtractedDocs</code><span class="ox-api-entry__description">Extracted documentation for a single file.</span></summary>
  <div class="ox-api-entry__body">
<p>Extracted documentation for a single file.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L693">View source</a></p>
  </div>
</details>

<a id="generateddocsdata"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">GeneratedDocsData</code><span class="ox-api-entry__description">Machine-readable payload emitted alongside generated docs.</span></summary>
  <div class="ox-api-entry__body">
<p>Machine-readable payload emitted alongside generated docs.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L701">View source</a></p>
  </div>
</details>

<a id="navitem"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NavItem</code><span class="ox-api-entry__description">Navigation item for sidebar navigation.</span></summary>
  <div class="ox-api-entry__body">
<p>Navigation item for sidebar navigation.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L710">View source</a></p>
  </div>
</details>

<a id="searchoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SearchOptions</code><span class="ox-api-entry__description">Options for full-text search.</span></summary>
  <div class="ox-api-entry__body">
<p>Options for full-text search.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L734">View source</a></p>
  </div>
</details>

<a id="resolvedsearchoptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedSearchOptions</code><span class="ox-api-entry__description">Resolved search options.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved search options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L769">View source</a></p>
  </div>
</details>

<a id="searchdocument"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SearchDocument</code><span class="ox-api-entry__description">Search document structure.</span></summary>
  <div class="ox-api-entry__body">
<p>Search document structure.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L780">View source</a></p>
  </div>
</details>

<a id="searchresult"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SearchResult</code><span class="ox-api-entry__description">Search result structure.</span></summary>
  <div class="ox-api-entry__body">
<p>Search result structure.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L792">View source</a></p>
  </div>
</details>

<a id="scopedsearchquery"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ScopedSearchQuery</code><span class="ox-api-entry__description">Parsed search query with optional scope prefixes.</span></summary>
  <div class="ox-api-entry__body">
<p>Parsed search query with optional scope prefixes.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L805">View source</a></p>
  </div>
</details>

<a id="localeconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">LocaleConfig</code><span class="ox-api-entry__description">Locale configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Locale configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L817">View source</a></p>
  </div>
</details>

<a id="i18noptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">I18nOptions</code><span class="ox-api-entry__description">i18n (internationalization) options.</span></summary>
  <div class="ox-api-entry__body">
<p>i18n (internationalization) options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L829">View source</a></p>
  </div>
</details>

<a id="resolvedi18noptions"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedI18nOptions</code><span class="ox-api-entry__description">Resolved i18n options with all defaults applied.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved i18n options with all defaults applied.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/types.ts#L877">View source</a></p>
  </div>
</details>

