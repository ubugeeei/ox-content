# theme.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts)**

> 22 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`ThemeColors`](#themecolors) `interface` - Theme color configuration.
- [`ThemeLayout`](#themelayout) `interface` - Theme layout configuration.
- [`ThemeFonts`](#themefonts) `interface` - Theme font configuration.
- [`ThemeHeader`](#themeheader) `interface` - Theme header configuration.
- [`ThemeFooter`](#themefooter) `interface` - Theme footer configuration.
- [`SocialLinks`](#sociallinks) `interface` - Social links configuration.
- [`ThemeEmbed`](#themeembed) `interface` - Embedded HTML content for specific positions in the page layout.
- [`ThemeConfig`](#themeconfig) `interface` - Complete theme configuration.
- [`ResolvedThemeConfig`](#resolvedthemeconfig) `interface` - Resolved theme configuration (after merging with defaults).
- [`deepMerge`](#deepmerge) `function` - Deep merge two objects.
- [`defineTheme`](#definetheme) `function` `defineTheme(config: ThemeConfig): ThemeConfig` - Defines a theme configuration with type checking.
- [`mergeThemes`](#mergethemes) `function` `mergeThemes(...themes: ThemeConfig[]): ThemeConfig` - Merges multiple theme configurations. Later themes override earlier ones.
- [`resolveTheme`](#resolvetheme) `function` `resolveTheme(config?: ThemeConfig): ResolvedThemeConfig` - Resolves a theme configuration by merging with its extends chain and defaults.
- [`themeToNapi`](#themetonapi) `function` `themeToNapi(theme: ResolvedThemeConfig): NapiThemeConfig` - Converts resolved theme to the format expected by Rust NAPI.
- [`NapiThemeColors`](#napithemecolors) `interface` - NAPI-compatible theme colors type.
- [`NapiThemeFonts`](#napithemefonts) `interface` - NAPI-compatible theme fonts type.
- [`NapiThemeLayout`](#napithemelayout) `interface` - NAPI-compatible theme layout type.
- [`NapiThemeHeader`](#napithemeheader) `interface` - NAPI-compatible theme header type.
- [`NapiThemeFooter`](#napithemefooter) `interface` - NAPI-compatible theme footer type.
- [`NapiSocialLinks`](#napisociallinks) `interface` - NAPI-compatible social links type.
- [`NapiThemeEmbed`](#napithemeembed) `interface` - NAPI-compatible theme embed type.
- [`NapiThemeConfig`](#napithemeconfig) `interface` - NAPI-compatible theme configuration type.

## Reference

<a id="themecolors"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeColors</code><span class="ox-api-entry__description">Theme color configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme color configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L7">View source</a></p>
  </div>
</details>

<a id="themelayout"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeLayout</code><span class="ox-api-entry__description">Theme layout configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme layout configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L31">View source</a></p>
  </div>
</details>

<a id="themefonts"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeFonts</code><span class="ox-api-entry__description">Theme font configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme font configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L43">View source</a></p>
  </div>
</details>

<a id="themeheader"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeHeader</code><span class="ox-api-entry__description">Theme header configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme header configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L53">View source</a></p>
  </div>
</details>

<a id="themefooter"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeFooter</code><span class="ox-api-entry__description">Theme footer configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Theme footer configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L65">View source</a></p>
  </div>
</details>

<a id="sociallinks"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SocialLinks</code><span class="ox-api-entry__description">Social links configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Social links configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L75">View source</a></p>
  </div>
</details>

<a id="themeembed"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeEmbed</code><span class="ox-api-entry__description">Embedded HTML content for specific positions in the page layout.</span></summary>
  <div class="ox-api-entry__body">
<p>Embedded HTML content for specific positions in the page layout.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L87">View source</a></p>
  </div>
</details>

<a id="themeconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ThemeConfig</code><span class="ox-api-entry__description">Complete theme configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Complete theme configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L111">View source</a></p>
  </div>
</details>

<a id="resolvedthemeconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">ResolvedThemeConfig</code><span class="ox-api-entry__description">Resolved theme configuration (after merging with defaults).</span></summary>
  <div class="ox-api-entry__body">
<p>Resolved theme configuration (after merging with defaults).</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L141">View source</a></p>
  </div>
</details>

<a id="deepmerge"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">deepMerge</code><span class="ox-api-entry__description">Deep merge two objects.</span></summary>
  <div class="ox-api-entry__body">
<p>Deep merge two objects.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L210">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>T</code></p>
</div>
  </div>
</details>

<a id="definetheme"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">defineTheme</code><code class="ox-api-entry__signature">defineTheme(config: ThemeConfig): ThemeConfig</code><span class="ox-api-entry__description">Defines a theme configuration with type checking.</span></summary>
  <div class="ox-api-entry__body">
<p>Defines a theme configuration with type checking.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L241">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function defineTheme(config: ThemeConfig): ThemeConfig</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ThemeConfig</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">const myTheme = defineTheme({
  extends: defaultTheme,
  colors: {
    primary: &#39;#3498db&#39;,
  },
  footer: {
    copyright: &#39;2025 My Company&#39;,
  },
});</code></pre>
</div>
  </div>
</details>

<a id="mergethemes"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">mergeThemes</code><code class="ox-api-entry__signature">mergeThemes(...themes: ThemeConfig[]): ThemeConfig</code><span class="ox-api-entry__description">Merges multiple theme configurations. Later themes override earlier ones.</span></summary>
  <div class="ox-api-entry__body">
<p>Merges multiple theme configurations.<br>Later themes override earlier ones.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L261">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function mergeThemes(...themes: ThemeConfig[]): ThemeConfig</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ThemeConfig</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">const merged = mergeThemes(defaultTheme, customTheme, overrides);</code></pre>
</div>
  </div>
</details>

<a id="resolvetheme"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">resolveTheme</code><code class="ox-api-entry__signature">resolveTheme(config?: ThemeConfig): ResolvedThemeConfig</code><span class="ox-api-entry__description">Resolves a theme configuration by merging with its extends chain and defaults.</span></summary>
  <div class="ox-api-entry__body">
<p>Resolves a theme configuration by merging with its extends chain and defaults.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L287">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function resolveTheme(config?: ThemeConfig): ResolvedThemeConfig</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ResolvedThemeConfig</code></p>
</div>
  </div>
</details>

<a id="themetonapi"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">themeToNapi</code><code class="ox-api-entry__signature">themeToNapi(theme: ResolvedThemeConfig): NapiThemeConfig</code><span class="ox-api-entry__description">Converts resolved theme to the format expected by Rust NAPI.</span></summary>
  <div class="ox-api-entry__body">
<p>Converts resolved theme to the format expected by Rust NAPI.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L328">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function themeToNapi(theme: ResolvedThemeConfig): NapiThemeConfig</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>NapiThemeConfig</code></p>
</div>
  </div>
</details>

<a id="napithemecolors"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeColors</code><span class="ox-api-entry__description">NAPI-compatible theme colors type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme colors type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L400">View source</a></p>
  </div>
</details>

<a id="napithemefonts"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeFonts</code><span class="ox-api-entry__description">NAPI-compatible theme fonts type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme fonts type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L415">View source</a></p>
  </div>
</details>

<a id="napithemelayout"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeLayout</code><span class="ox-api-entry__description">NAPI-compatible theme layout type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme layout type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L423">View source</a></p>
  </div>
</details>

<a id="napithemeheader"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeHeader</code><span class="ox-api-entry__description">NAPI-compatible theme header type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme header type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L432">View source</a></p>
  </div>
</details>

<a id="napithemefooter"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeFooter</code><span class="ox-api-entry__description">NAPI-compatible theme footer type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme footer type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L441">View source</a></p>
  </div>
</details>

<a id="napisociallinks"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiSocialLinks</code><span class="ox-api-entry__description">NAPI-compatible social links type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible social links type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L449">View source</a></p>
  </div>
</details>

<a id="napithemeembed"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeEmbed</code><span class="ox-api-entry__description">NAPI-compatible theme embed type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme embed type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L458">View source</a></p>
  </div>
</details>

<a id="napithemeconfig"></a>
<details class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NapiThemeConfig</code><span class="ox-api-entry__description">NAPI-compatible theme configuration type.</span></summary>
  <div class="ox-api-entry__body">
<p>NAPI-compatible theme configuration type.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/theme.ts#L473">View source</a></p>
  </div>
</details>

