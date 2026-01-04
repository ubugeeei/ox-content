const s=`<div class="ox-content"><h1 id="svelte-integration-example">Svelte Integration Example</h1>

<p>Demonstrates embedding Svelte 5 components in Markdown.</p>

<h2 id="setup">Setup</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#B8A965">cd</span><span style="color:#C98A7D"> examples/integ-svelte</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> install</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> dev</span></span></code></pre>

<h2 id="configuration">Configuration</h2>

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
<span class="line"><span style="color:#758575DD">      // Auto-discover all Svelte components</span></span>
<span class="line"><span style="color:#B8A965">      components</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/*.svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="components-svelte-5-runes">Components (Svelte 5 Runes)</h2>

<h3 id="counter">Counter</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">script</span><span style="color:#BD976A"> lang</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">ts</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#CB7676">  interface</span><span style="color:#5DA994"> Props</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">    initial</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#5DA994">number</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#666666">  }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let </span><span style="color:#666666">{</span><span style="color:#BD976A"> initial</span><span style="color:#666666"> =</span><span style="color:#4C9A91"> 0</span><span style="color:#666666"> }: </span><span style="color:#5DA994">Props</span><span style="color:#666666"> =</span><span style="color:#666666"> $</span><span style="color:#80A665">props</span><span style="color:#666666">();</span><span style="color:#CB7676">  let </span><span style="color:#BD976A">count</span><span style="color:#666666"> =</span><span style="color:#666666"> $</span><span style="color:#80A665">state</span><span style="color:#666666">(</span><span style="color:#BD976A">initial</span><span style="color:#666666">);&#x3C;/</span><span style="color:#4D9375">script</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> class</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">counter</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onclick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#BD976A"> count</span><span style="color:#CB7676">--</span><span style="color:#666666">}></span><span style="color:#DBD7CAEE">-</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">span</span><span style="color:#666666">>{</span><span style="color:#BD976A">count</span><span style="color:#666666">}&#x3C;/</span><span style="color:#4D9375">span</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onclick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#BD976A"> count</span><span style="color:#CB7676">++</span><span style="color:#666666">}></span><span style="color:#DBD7CAEE">+</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span></code></pre>

<h3 id="alert">Alert</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">script</span><span style="color:#BD976A"> lang</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">ts</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#4D9375">  import</span><span style="color:#4D9375"> type</span><span style="color:#666666"> {</span><span style="color:#BD976A"> Snippet</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">svelte</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">interface</span><span style="color:#5DA994"> Props</span><span style="color:#666666"> {</span><span style="color:#BD976A">    type</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">info</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">error</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">success</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span><span style="color:#BD976A">    children</span><span style="color:#666666">: </span><span style="color:#5DA994">Snippet</span><span style="color:#666666">;</span><span style="color:#666666">  }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let </span><span style="color:#666666">{</span><span style="color:#BD976A"> type</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">info</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#BD976A"> children</span><span style="color:#666666"> }: </span><span style="color:#5DA994">Props</span><span style="color:#666666"> =</span><span style="color:#666666"> $</span><span style="color:#80A665">props</span><span style="color:#666666">();&#x3C;/</span><span style="color:#4D9375">script</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> class</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">alert alert-</span><span style="color:#666666">{</span><span style="color:#C98A7D">type</span><span style="color:#666666">}</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  {@</span><span style="color:#4D9375">render</span><span style="color:#80A665"> children</span><span style="color:#666666">()}</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span></code></pre>

<h2 id="usage-in-markdown">Usage in Markdown</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666;font-weight:bold">#</span><span style="color:#4D9375;font-weight:bold"> My Documentation</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Counter</span><span style="color:#BD976A"> initial</span><span style="color:#666666">=</span><span style="color:#C98A7D">{10}</span><span style="color:#666666"> /></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Alert</span><span style="color:#BD976A"> type</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#DBD7CAEE">  Be careful with this feature!</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">Alert</span><span style="color:#666666">></span></span></code></pre>

<h2 id="svelte-5-features">Svelte 5 Features</h2>

<p>This example uses Svelte 5's new features:</p>

<ul>
<li><strong>$state</strong> - Reactive state declaration</li>
<li><strong>$props</strong> - Component props</li>
<li><strong>$derived</strong> - Computed values</li>
<li><strong>Snippets</strong> - Composable template fragments</li>
<li><strong>New event syntax</strong> - <code>onclick</code> instead of <code>on:click</code></li>
</ul>

<h2 id="file-structure">File Structure</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>integ-svelte/</span></span>
<span class="line"><span>├── docs/</span></span>
<span class="line"><span>│   └── index.md</span></span>
<span class="line"><span>├── src/</span></span>
<span class="line"><span>│   ├── components/</span></span>
<span class="line"><span>│   │   ├── Counter.svelte</span></span>
<span class="line"><span>│   │   └── Alert.svelte</span></span>
<span class="line"><span>│   ├── App.svelte</span></span>
<span class="line"><span>│   └── main.ts</span></span>
<span class="line"><span>├── index.html</span></span>
<span class="line"><span>├── package.json</span></span>
<span class="line"><span>├── svelte.config.js</span></span>
<span class="line"><span>└── vite.config.ts</span></span></code></pre>

</div>`,n={},a=[{depth:1,text:"Svelte Integration Example",slug:"svelte-integration-example",children:[{depth:2,text:"Setup",slug:"setup",children:[]},{depth:2,text:"Configuration",slug:"configuration",children:[]},{depth:2,text:"Components (Svelte 5 Runes)",slug:"components-svelte-5-runes",children:[{depth:3,text:"Counter",slug:"counter",children:[]},{depth:3,text:"Alert",slug:"alert",children:[]}]},{depth:2,text:"Usage in Markdown",slug:"usage-in-markdown",children:[]}]},{depth:1,text:"My Documentation",slug:"my-documentation",children:[{depth:2,text:"Svelte 5 Features",slug:"svelte-5-features",children:[]},{depth:2,text:"File Structure",slug:"file-structure",children:[]}]}],l={html:s,frontmatter:n,toc:a};export{l as default,n as frontmatter,s as html,a as toc};
