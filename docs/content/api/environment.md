# environment.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts)**

> 5 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`createMarkdownEnvironment`](#createmarkdownenvironment) `function` `createMarkdownEnvironment(options: ResolvedOptions): EnvironmentOptions` - Creates the Markdown processing environment configuration. This environment is used for…
- [`EnvironmentTransformContext`](#environmenttransformcontext) `interface` - Environment-specific module transformer. This is called during the transform phase to p…
- [`createTransformOptions`](#createtransformoptions) `function` `createTransformOptions( ctx: EnvironmentTransformContext, options: ResolvedOptions, ): ResolvedOptions` - Creates environment-aware transform options.
- [`prerender`](#prerender) `function` `prerender( files: string[], _options: ResolvedOptions, ): Promise<Map<string, string>>` - Runs pre-render for SSG. This function is called during build to pre-render all Markdow…
- [`createEnvironmentPlugins`](#createenvironmentplugins) `function` `createEnvironmentPlugins(_options: ResolvedOptions)` - Environment plugin factory. Creates plugins specific to the Markdown environment.

## Reference

<details id="createmarkdownenvironment" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createMarkdownEnvironment</code><code class="ox-api-entry__signature">createMarkdownEnvironment(options: ResolvedOptions): EnvironmentOptions</code><span class="ox-api-entry__description">Creates the Markdown processing environment configuration. This environment is…</span></summary>
  <div class="ox-api-entry__body">
<p>Creates the Markdown processing environment configuration.<br>This environment is used for:<br>- Server-side rendering of Markdown files<br>- Static site generation<br>- Pre-rendering at build time</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L11">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function createMarkdownEnvironment(options: ResolvedOptions): EnvironmentOptions</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>EnvironmentOptions</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">// In your vite.config.ts
export default defineConfig({
  environments: {
    markdown: createMarkdownEnvironment({
      srcDir: &#39;content&#39;,
      gfm: true,
    }),
  },
});</code></pre>
</div>
  </div>
</details>

<details id="environmenttransformcontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">EnvironmentTransformContext</code><span class="ox-api-entry__description">Environment-specific module transformer. This is called during the transform phase to process Markdown files within the…</span></summary>
  <div class="ox-api-entry__body">
<p>Environment-specific module transformer.<br>This is called during the transform phase to process<br>Markdown files within the environment context.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L81">View source</a></p>
  </div>
</details>

<details id="createtransformoptions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createTransformOptions</code><code class="ox-api-entry__signature">createTransformOptions( ctx: EnvironmentTransformContext, options: ResolvedOptions, ): ResolvedOptions</code><span class="ox-api-entry__description">Creates environment-aware transform options.</span></summary>
  <div class="ox-api-entry__body">
<p>Creates environment-aware transform options.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L109">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function createTransformOptions(
  ctx: EnvironmentTransformContext,
  options: ResolvedOptions,
  ): ResolvedOptions</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>ResolvedOptions</code></p>
</div>
  </div>
</details>

<details id="prerender" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">prerender</code><code class="ox-api-entry__signature">prerender( files: string[], _options: ResolvedOptions, ): Promise&lt;Map&lt;string, string&gt;&gt;</code><span class="ox-api-entry__description">Runs pre-render for SSG. This function is called during build to pre-render all…</span></summary>
  <div class="ox-api-entry__body">
<p>Runs pre-render for SSG.<br>This function is called during build to pre-render all Markdown files.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L124">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export async function prerender(
  files: string[],
  _options: ResolvedOptions,
  ): Promise&lt;Map&lt;string, string&gt;&gt;</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>Promise&lt;Map&lt;string, string&gt;&gt;</code></p>
</div>
  </div>
</details>

<details id="createenvironmentplugins" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">createEnvironmentPlugins</code><code class="ox-api-entry__signature">createEnvironmentPlugins(_options: ResolvedOptions)</code><span class="ox-api-entry__description">Environment plugin factory. Creates plugins specific to the Markdown environmen…</span></summary>
  <div class="ox-api-entry__body">
<p>Environment plugin factory.<br>Creates plugins specific to the Markdown environment.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/environment.ts#L144">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function createEnvironmentPlugins(_options: ResolvedOptions)</code></pre>
</div>
  </div>
</details>

