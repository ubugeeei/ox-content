const s=`<div class="ox-content"><h1 id="vite-plugin-ox-content-svelte">vite-plugin-ox-content-svelte</h1>

<p>Svelte integration for Ox Content - embed Svelte 5 components in Markdown.</p>

<h2 id="installation">Installation</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> add</span><span style="color:#C98A7D"> vite-plugin-ox-content-svelte</span><span style="color:#C98A7D"> svelte</span><span style="color:#C98A7D"> @sveltejs/vite-plugin-svelte</span></span></code></pre>

<h2 id="usage">Usage</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// vite.config.ts</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> svelte</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@sveltejs/vite-plugin-svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContentSvelte</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite-plugin-ox-content-svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    svelte</span><span style="color:#666666">(),</span></span>
<span class="line"><span style="color:#80A665">    oxContentSvelte</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">      // Auto-discover components with glob pattern</span></span>
<span class="line"><span style="color:#B8A965">      components</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/*.svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="options">Options</h2>

<h3 id="components">components</h3>

<ul>
<li>Type: <code>string | string[] | Record<string, string=""></string,></code></li>
</ul>

<p>Components to register for use in Markdown. Supports:</p>

<h4 id="glob-pattern-recommended">Glob Pattern (Recommended)</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// Single pattern</span></span>
<span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/*.svelte</span><span style="color:#C98A7D77">'</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Multiple patterns</span></span>
<span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#666666"> [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/.svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/ui/.svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">]</span></span></code></pre>

Component names are derived from file names in PascalCase:
<ul>
<li><code>counter.svelte</code> → <code>Counter</code></li>
<li><code>my-button.svelte</code> → <code>MyButton</code></li>
</ul>

<h4 id="explicit-map">Explicit Map</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#80A665">  Counter</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/Counter.svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#80A665">  Alert</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/Alert.svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="runes">runes</h3>

<ul>
<li>Type: <code>boolean</code></li>
<li>Default: <code>true</code></li>
</ul>

<p>Enable Svelte 5 Runes mode.</p>

<h2 id="using-components-in-markdown">Using Components in Markdown</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666;font-weight:bold">#</span><span style="color:#4D9375;font-weight:bold"> My Page</span></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">Here's an interactive counter:</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Counter</span><span style="color:#BD976A"> initial</span><span style="color:#666666">=</span><span style="color:#C98A7D">{5}</span><span style="color:#666666"> /></span></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">And an alert:</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Alert</span><span style="color:#BD976A"> type</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#DBD7CAEE">  This is a warning message!</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">Alert</span><span style="color:#666666">></span></span></code></pre>

<h2 id="example-component-svelte-5-runes">Example Component (Svelte 5 Runes)</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">&#x3C;!-- src/components/Counter.svelte --></span></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">script</span><span style="color:#BD976A"> lang</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">ts</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#CB7676">  interface</span><span style="color:#5DA994"> Props</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">    initial</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#5DA994">number</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#666666">  }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let </span><span style="color:#666666">{</span><span style="color:#BD976A"> initial</span><span style="color:#666666"> =</span><span style="color:#4C9A91"> 0</span><span style="color:#666666"> }: </span><span style="color:#5DA994">Props</span><span style="color:#666666"> =</span><span style="color:#666666"> $</span><span style="color:#80A665">props</span><span style="color:#666666">();</span><span style="color:#CB7676">  let </span><span style="color:#BD976A">count</span><span style="color:#666666"> =</span><span style="color:#666666"> $</span><span style="color:#80A665">state</span><span style="color:#666666">(</span><span style="color:#BD976A">initial</span><span style="color:#666666">);&#x3C;/</span><span style="color:#4D9375">script</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> class</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">counter</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onclick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#BD976A"> count</span><span style="color:#CB7676">--</span><span style="color:#666666">}></span><span style="color:#DBD7CAEE">-</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">span</span><span style="color:#666666">>{</span><span style="color:#BD976A">count</span><span style="color:#666666">}&#x3C;/</span><span style="color:#4D9375">span</span><span style="color:#666666">></span><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onclick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#BD976A"> count</span><span style="color:#CB7676">++</span><span style="color:#666666">}></span><span style="color:#DBD7CAEE">+</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">>&#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">style</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  .</span><span style="color:#BD976A">counter</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#B8A965">    display</span><span style="color:#666666">:</span><span style="color:#C99076"> inline-flex</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#B8A965">    gap</span><span style="color:#666666">:</span><span style="color:#4C9A91"> 8</span><span style="color:#CB7676">px</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#B8A965">    align-items</span><span style="color:#666666">:</span><span style="color:#C99076"> center</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#666666">  }</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">style</span><span style="color:#666666">></span></span></code></pre>

<h2 id="virtual-modules">Virtual Modules</h2>

<ul>
<li><code>virtual:ox-content-svelte/runtime</code> - Svelte-specific runtime</li>
<li><code>virtual:ox-content-svelte/components</code> - Registered components</li>
</ul>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> mount</span><span style="color:#666666">,</span><span style="color:#BD976A"> unmount</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content-svelte/runtime</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> components</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content-svelte/components</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span></code></pre>

<h2 id="hmr">HMR</h2>

<p>Components are hot-reloaded when modified. Svelte's built-in HMR is supported.</p>

<h2 id="svelte-5-features">Svelte 5 Features</h2>

<p>This plugin is designed for Svelte 5 and supports:</p>

<ul>
<li><strong>Runes</strong>: <code>$state</code>, <code>$derived</code>, <code>$effect</code>, <code>$props</code></li>
<li><strong>Snippets</strong>: <code>{#snippet}</code> and <code>{@render}</code></li>
<li><strong>New event syntax</strong>: <code>onclick</code> instead of <code>on:click</code></li>
</ul></div>`,n={},l=[{depth:1,text:"vite-plugin-ox-content-svelte",slug:"vite-plugin-ox-content-svelte",children:[{depth:2,text:"Installation",slug:"installation",children:[]},{depth:2,text:"Usage",slug:"usage",children:[]},{depth:2,text:"Options",slug:"options",children:[{depth:3,text:"components",slug:"components",children:[]},{depth:3,text:"runes",slug:"runes",children:[]}]},{depth:2,text:"Using Components in Markdown",slug:"using-components-in-markdown",children:[]}]},{depth:1,text:"My Page",slug:"my-page",children:[{depth:2,text:"Example Component (Svelte 5 Runes)",slug:"example-component-svelte-5-runes",children:[]},{depth:2,text:"Virtual Modules",slug:"virtual-modules",children:[]},{depth:2,text:"HMR",slug:"hmr",children:[]},{depth:2,text:"Svelte 5 Features",slug:"svelte-5-features",children:[]}]}],a={html:s,frontmatter:n,toc:l};export{a as default,n as frontmatter,s as html,l as toc};
