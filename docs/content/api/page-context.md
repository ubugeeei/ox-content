# page-context.ts

**[Source](https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts)**

> 16 documented symbols. Skim the one-line surface first, then expand the accordions for details.

## Overview

- [`BasePageProps`](#basepageprops) `interface` - Base page props available for all pages.
- [`PageProps`](#pageprops) `type` - Extended page props with custom frontmatter.
- [`SiteConfig`](#siteconfig) `interface` - Site-wide configuration available in context.
- [`NavGroup`](#navgroup) `interface` - Navigation group.
- [`NavItem`](#navitem) `interface` - Navigation item.
- [`RenderContext`](#rendercontext) `interface` - Complete render context.
- [`setRenderContext`](#setrendercontext) `function` `setRenderContext(ctx: RenderContext): void` - Sets the current render context. Called internally during page rendering.
- [`clearRenderContext`](#clearrendercontext) `function` `clearRenderContext(): void` - Clears the current render context. Called internally after page rendering.
- [`usePageProps`](#usepageprops) `function` - Gets the current page props.
- [`useSiteConfig`](#usesiteconfig) `function` `useSiteConfig(): SiteConfig` - Gets the site configuration.
- [`useRenderContext`](#userendercontext) `function` - Gets the full render context.
- [`useNav`](#usenav) `function` `useNav(): NavGroup[]` - Gets the navigation groups.
- [`useIsActive`](#useisactive) `function` `useIsActive(path: string): boolean` - Checks if the given path is the current page.
- [`FrontmatterSchema`](#frontmatterschema) `interface` - Schema for frontmatter type generation.
- [`inferType`](#infertype) `function` `inferType(value: unknown): string` - Infers TypeScript types from frontmatter values.
- [`generateFrontmatterTypes`](#generatefrontmattertypes) `function` `generateFrontmatterTypes( samples: Record<string, unknown>[], interfaceName = "PageFrontmatter", ): string` - Generates TypeScript interface from frontmatter samples.

## Reference

<details id="basepageprops" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">BasePageProps</code><span class="ox-api-entry__description">Base page props available for all pages.</span></summary>
  <div class="ox-api-entry__body">
<p>Base page props available for all pages.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L31">View source</a></p>
  </div>
</details>

<details id="pageprops" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><code class="ox-api-entry__name">PageProps</code><span class="ox-api-entry__description">Extended page props with custom frontmatter.</span></summary>
  <div class="ox-api-entry__body">
<p>Extended page props with custom frontmatter.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L53">View source</a></p>
  </div>
</details>

<details id="siteconfig" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">SiteConfig</code><span class="ox-api-entry__description">Site-wide configuration available in context.</span></summary>
  <div class="ox-api-entry__body">
<p>Site-wide configuration available in context.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L62">View source</a></p>
  </div>
</details>

<details id="navgroup" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NavGroup</code><span class="ox-api-entry__description">Navigation group.</span></summary>
  <div class="ox-api-entry__body">
<p>Navigation group.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L76">View source</a></p>
  </div>
</details>

<details id="navitem" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">NavItem</code><span class="ox-api-entry__description">Navigation item.</span></summary>
  <div class="ox-api-entry__body">
<p>Navigation item.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L84">View source</a></p>
  </div>
</details>

<details id="rendercontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">RenderContext</code><span class="ox-api-entry__description">Complete render context.</span></summary>
  <div class="ox-api-entry__body">
<p>Complete render context.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L93">View source</a></p>
  </div>
</details>

<details id="setrendercontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">setRenderContext</code><code class="ox-api-entry__signature">setRenderContext(ctx: RenderContext): void</code><span class="ox-api-entry__description">Sets the current render context. Called internally during page rendering.</span></summary>
  <div class="ox-api-entry__body">
<p>Sets the current render context.<br>Called internally during page rendering.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L106">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function setRenderContext(ctx: RenderContext): void</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>void</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="clearrendercontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">clearRenderContext</code><code class="ox-api-entry__signature">clearRenderContext(): void</code><span class="ox-api-entry__description">Clears the current render context. Called internally after page rendering.</span></summary>
  <div class="ox-api-entry__body">
<p>Clears the current render context.<br>Called internally after page rendering.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L115">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function clearRenderContext(): void</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>void</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span></span></li></ul>
</div>
  </div>
</details>

<details id="usepageprops" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">usePageProps</code><span class="ox-api-entry__description">Gets the current page props.</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the current page props.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L124">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>PageProps&lt;T&gt;</code> — The current page props</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">function PageTitle() {
  const page = usePageProps();
  return &lt;h1&gt;{page.title}&lt;/h1&gt;;
}</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@throws</span><span>Error if called outside of a render context</span></li></ul>
</div>
  </div>
</details>

<details id="usesiteconfig" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">useSiteConfig</code><code class="ox-api-entry__signature">useSiteConfig(): SiteConfig</code><span class="ox-api-entry__description">Gets the site configuration.</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the site configuration.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L150">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function useSiteConfig(): SiteConfig</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>SiteConfig</code> — The site configuration</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">function SiteHeader() {
  const site = useSiteConfig();
  return &lt;header&gt;{site.name}&lt;/header&gt;;
}</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@throws</span><span>Error if called outside of a render context</span></li></ul>
</div>
  </div>
</details>

<details id="userendercontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">useRenderContext</code><span class="ox-api-entry__description">Gets the full render context.</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the full render context.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L174">View source</a></p>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>RenderContext&lt;T&gt;</code> — The complete render context</p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">function Layout({ children }) {
  const ctx = useRenderContext();
  return (
    &lt;html&gt;
      &lt;head&gt;&lt;title&gt;{ctx.page.title} - {ctx.site.name}&lt;/title&gt;&lt;/head&gt;
      &lt;body&gt;{children}&lt;/body&gt;
    &lt;/html&gt;
  );
}</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@throws</span><span>Error if called outside of a render context</span></li></ul>
</div>
  </div>
</details>

<details id="usenav" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">useNav</code><code class="ox-api-entry__signature">useNav(): NavGroup[]</code><span class="ox-api-entry__description">Gets the navigation groups.</span></summary>
  <div class="ox-api-entry__body">
<p>Gets the navigation groups.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L205">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function useNav(): NavGroup[]</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>NavGroup[]</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">function Sidebar() {
  const nav = useNav();
  return (
    &lt;nav&gt;
      {each(nav, (group) =&gt; (
        &lt;div&gt;
          &lt;h3&gt;{group.title}&lt;/h3&gt;
          &lt;ul&gt;
            {each(group.items, (item) =&gt; (
              &lt;li&gt;&lt;a href={item.href}&gt;{item.title}&lt;/a&gt;&lt;/li&gt;
            ))}
          &lt;/ul&gt;
        &lt;/div&gt;
      ))}
    &lt;/nav&gt;
  );
}</code></pre>
</div>
  </div>
</details>

<details id="useisactive" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">useIsActive</code><code class="ox-api-entry__signature">useIsActive(path: string): boolean</code><span class="ox-api-entry__description">Checks if the given path is the current page.</span></summary>
  <div class="ox-api-entry__body">
<p>Checks if the given path is the current page.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L233">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function useIsActive(path: string): boolean</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>boolean</code></p>
</div>
<div class="ox-api-entry__section">
<h4>Examples</h4>
<pre><code class="language-ts">function NavLink({ href, children }) {
  const isActive = useIsActive(href);
  return &lt;a href={href} class={isActive ? &#39;active&#39; : &#39;&#39;}&gt;{children}&lt;/a&gt;;
}</code></pre>
</div>
  </div>
</details>

<details id="frontmatterschema" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><code class="ox-api-entry__name">FrontmatterSchema</code><span class="ox-api-entry__description">Schema for frontmatter type generation.</span></summary>
  <div class="ox-api-entry__body">
<p>Schema for frontmatter type generation.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L251">View source</a></p>
  </div>
</details>

<details id="infertype" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">inferType</code><code class="ox-api-entry__signature">inferType(value: unknown): string</code><span class="ox-api-entry__description">Infers TypeScript types from frontmatter values.</span></summary>
  <div class="ox-api-entry__body">
<p>Infers TypeScript types from frontmatter values.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L265">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function inferType(value: unknown): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

<details id="generatefrontmattertypes" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">function</span><code class="ox-api-entry__name">generateFrontmatterTypes</code><code class="ox-api-entry__signature">generateFrontmatterTypes( samples: Record&lt;string, unknown&gt;[], interfaceName = &quot;PageFrontmatter&quot;, ): string</code><span class="ox-api-entry__description">Generates TypeScript interface from frontmatter samples.</span></summary>
  <div class="ox-api-entry__body">
<p>Generates TypeScript interface from frontmatter samples.</p>
<p class="ox-api-entry__source"><a href="https://github.com/ubugeeei/ox-content/blob/main/npm/vite-plugin-ox-content/src/page-context.ts#L289">View source</a></p>
<div class="ox-api-entry__section">
<h4>Signature</h4>
<pre><code class="language-typescript">export function generateFrontmatterTypes(
  samples: Record&lt;string, unknown&gt;[],
  interfaceName = &quot;PageFrontmatter&quot;,
  ): string</code></pre>
</div>
<div class="ox-api-entry__section">
<h4>Returns</h4>
<p><code>string</code></p>
</div>
  </div>
</details>

