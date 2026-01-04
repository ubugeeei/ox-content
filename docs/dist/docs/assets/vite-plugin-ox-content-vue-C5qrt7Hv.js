const s=`<div class="ox-content"><h1 id="vite-plugin-ox-content-vue">vite-plugin-ox-content-vue</h1>

<p>Vue integration for Ox Content - embed Vue components in Markdown.</p>

<h2 id="installation">Installation</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> add</span><span style="color:#C98A7D"> vite-plugin-ox-content-vue</span><span style="color:#C98A7D"> vue</span><span style="color:#C98A7D"> @vitejs/plugin-vue</span></span></code></pre>

<h2 id="usage">Usage</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// vite.config.ts</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> vue</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@vitejs/plugin-vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContentVue</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite-plugin-ox-content-vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    vue</span><span style="color:#666666">(),</span></span>
<span class="line"><span style="color:#80A665">    oxContentVue</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">      // Auto-discover components with glob pattern</span></span>
<span class="line"><span style="color:#B8A965">      components</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/*.vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
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
<span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/*.vue</span><span style="color:#C98A7D77">'</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Multiple patterns</span></span>
<span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#666666"> [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/.vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/ui/.vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">]</span></span></code></pre>

Component names are derived from file names in PascalCase:
<ul>
<li><code>counter.vue</code> → <code>Counter</code></li>
<li><code>my-button.vue</code> → <code>MyButton</code></li>
<li><code>AlertBox.vue</code> → <code>AlertBox</code></li>
</ul>

<h4 id="explicit-map">Explicit Map</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#80A665">  Counter</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/Counter.vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#80A665">  MyAlert</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/AlertBox.vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="reactivitytransform">reactivityTransform</h3>

<ul>
<li>Type: <code>boolean</code></li>
<li>Default: <code>false</code></li>
</ul>

<p>Enable Vue Reactivity Transform.</p>

<h3 id="customblocks">customBlocks</h3>

<ul>
<li>Type: <code>boolean</code></li>
<li>Default: <code>true</code></li>
</ul>

<p>Enable custom blocks in Markdown (e.g., <code>:::tip</code>).</p>

<h2 id="using-components-in-markdown">Using Components in Markdown</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666;font-weight:bold">#</span><span style="color:#4D9375;font-weight:bold"> My Page</span></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">Here's an interactive counter:</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Counter</span><span style="color:#BD976A"> :initial</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">5</span><span style="color:#C98A7D77">"</span><span style="color:#666666"> /></span></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">And an alert:</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Alert</span><span style="color:#BD976A"> type</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#DBD7CAEE">  This is a warning message!</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">Alert</span><span style="color:#666666">></span></span></code></pre>

<h2 id="example-component">Example Component</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">&#x3C;!-- src/components/Counter.vue --></span></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">script</span><span style="color:#BD976A"> setup</span><span style="color:#BD976A"> lang</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">ts</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> ref</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">props</span><span style="color:#666666"> =</span><span style="color:#80A665"> defineProps</span><span style="color:#666666">&#x3C;{</span><span style="color:#BD976A">  initial</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#5DA994">number</span><span style="color:#666666">;}>();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">count</span><span style="color:#666666"> =</span><span style="color:#80A665"> ref</span><span style="color:#666666">(</span><span style="color:#BD976A">props</span><span style="color:#666666">.</span><span style="color:#BD976A">initial</span><span style="color:#CB7676"> ?? </span><span style="color:#4C9A91">0</span><span style="color:#666666">);&#x3C;/</span><span style="color:#4D9375">script</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">template</span><span style="color:#666666">></span><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> class</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">counter</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> @click</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">count--</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">-</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">span</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">{{ count }}</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">span</span><span style="color:#666666">></span><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> @click</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">count++</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">+</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span><span style="color:#666666">  &#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">>&#x3C;/</span><span style="color:#4D9375">template</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">style</span><span style="color:#BD976A"> scoped</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">.</span><span style="color:#BD976A">counter</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#B8A965">  display</span><span style="color:#666666">:</span><span style="color:#C99076"> inline-flex</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#B8A965">  gap</span><span style="color:#666666">:</span><span style="color:#4C9A91"> 8</span><span style="color:#CB7676">px</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#B8A965">  align-items</span><span style="color:#666666">:</span><span style="color:#C99076"> center</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#666666">}</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">style</span><span style="color:#666666">></span></span></code></pre>

<h2 id="virtual-modules">Virtual Modules</h2>

<ul>
<li><code>virtual:ox-content-vue/runtime</code> - Vue-specific runtime</li>
<li><code>virtual:ox-content-vue/components</code> - Registered components</li>
</ul>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> OxContentRenderer</span><span style="color:#666666">,</span><span style="color:#BD976A"> useOxContent</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content-vue/runtime</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> components</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content-vue/components</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span></code></pre>

<h2 id="hmr">HMR</h2>

<p>Components are hot-reloaded when modified. Markdown files using those components are also refreshed.</p></div>`,n={},a=[{depth:1,text:"vite-plugin-ox-content-vue",slug:"vite-plugin-ox-content-vue",children:[{depth:2,text:"Installation",slug:"installation",children:[]},{depth:2,text:"Usage",slug:"usage",children:[]},{depth:2,text:"Options",slug:"options",children:[{depth:3,text:"components",slug:"components",children:[]},{depth:3,text:"reactivityTransform",slug:"reactivitytransform",children:[]},{depth:3,text:"customBlocks",slug:"customblocks",children:[]}]},{depth:2,text:"Using Components in Markdown",slug:"using-components-in-markdown",children:[]}]},{depth:1,text:"My Page",slug:"my-page",children:[{depth:2,text:"Example Component",slug:"example-component",children:[]},{depth:2,text:"Virtual Modules",slug:"virtual-modules",children:[]},{depth:2,text:"HMR",slug:"hmr",children:[]}]}],o={html:s,frontmatter:n,toc:a};export{o as default,n as frontmatter,s as html,a as toc};
