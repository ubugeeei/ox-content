const s=`<div class="ox-content"><h1 id="vite-plugin-ox-content-react">vite-plugin-ox-content-react</h1>

<p>React integration for Ox Content - embed React components in Markdown.</p>

<h2 id="installation">Installation</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> add</span><span style="color:#C98A7D"> vite-plugin-ox-content-react</span><span style="color:#C98A7D"> react</span><span style="color:#C98A7D"> react-dom</span><span style="color:#C98A7D"> @vitejs/plugin-react</span></span></code></pre>

<h2 id="usage">Usage</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// vite.config.ts</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> react</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@vitejs/plugin-react</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContentReact</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite-plugin-ox-content-react</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    react</span><span style="color:#666666">(),</span></span>
<span class="line"><span style="color:#80A665">    oxContentReact</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">      // Auto-discover components with glob pattern</span></span>
<span class="line"><span style="color:#B8A965">      components</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/*.tsx</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
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
<span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/*.tsx</span><span style="color:#C98A7D77">'</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Multiple patterns</span></span>
<span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#666666"> [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/.tsx</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/ui/.tsx</span><span style="color:#C98A7D77">'</span><span style="color:#666666">]</span></span></code></pre>

Component names are derived from file names in PascalCase:
<ul>
<li><code>counter.tsx</code> → <code>Counter</code></li>
<li><code>my-button.tsx</code> → <code>MyButton</code></li>
</ul>

<h4 id="explicit-map">Explicit Map</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">components</span><span style="color:#666666">:</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#80A665">  Counter</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/Counter.tsx</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#80A665">  Alert</span><span style="color:#666666">:</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./src/components/Alert.tsx</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="jsxruntime">jsxRuntime</h3>

<ul>
<li>Type: <code>'automatic' | 'classic'</code></li>
<li>Default: <code>'automatic'</code></li>
</ul>

<p>JSX runtime mode for React 17+.</p>

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

<h2 id="example-component">Example Component</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// src/components/Counter.tsx</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> useState</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">react</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">interface</span><span style="color:#5DA994"> CounterProps</span><span style="color:#666666"> {</span><span style="color:#BD976A">  initial</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#5DA994">number</span><span style="color:#666666">;}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#CB7676"> function</span><span style="color:#80A665"> Counter</span><span style="color:#666666">({</span><span style="color:#BD976A"> initial</span><span style="color:#666666"> =</span><span style="color:#4C9A91"> 0</span><span style="color:#666666"> }: </span><span style="color:#5DA994">CounterProps</span><span style="color:#666666">)</span><span style="color:#666666"> {</span><span style="color:#CB7676">  const</span><span style="color:#666666"> [</span><span style="color:#BD976A">count</span><span style="color:#666666">,</span><span style="color:#BD976A"> setCount</span><span style="color:#666666">]</span><span style="color:#666666"> =</span><span style="color:#80A665"> useState</span><span style="color:#666666">(</span><span style="color:#BD976A">initial</span><span style="color:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">return</span><span style="color:#666666"> (</span></span>
<span class="line"><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> className</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">counter</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">      &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onClick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#80A665"> setCount</span><span style="color:#666666">(</span><span style="color:#BD976A">c</span><span style="color:#666666"> =></span><span style="color:#BD976A"> c</span><span style="color:#CB7676"> -</span><span style="color:#4C9A91"> 1</span><span style="color:#666666">)}></span><span style="color:#DBD7CAEE">-</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">      &#x3C;</span><span style="color:#4D9375">span</span><span style="color:#666666">>{</span><span style="color:#BD976A">count</span><span style="color:#666666">}&#x3C;/</span><span style="color:#4D9375">span</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">      &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onClick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#80A665"> setCount</span><span style="color:#666666">(</span><span style="color:#BD976A">c</span><span style="color:#666666"> =></span><span style="color:#BD976A"> c</span><span style="color:#CB7676"> +</span><span style="color:#4C9A91"> 1</span><span style="color:#666666">)}></span><span style="color:#DBD7CAEE">+</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">    &#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  );</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h2 id="virtual-modules">Virtual Modules</h2>

<ul>
<li><code>virtual:ox-content-react/runtime</code> - React-specific runtime</li>
<li><code>virtual:ox-content-react/components</code> - Registered components</li>
</ul>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> OxContentRenderer</span><span style="color:#666666">,</span><span style="color:#BD976A"> useOxContent</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content-react/runtime</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> components</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content-react/components</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span></code></pre>

<h2 id="hmr">HMR</h2>

<p>Components are hot-reloaded when modified. Fast Refresh is supported.</p></div>`,n={},a=[{depth:1,text:"vite-plugin-ox-content-react",slug:"vite-plugin-ox-content-react",children:[{depth:2,text:"Installation",slug:"installation",children:[]},{depth:2,text:"Usage",slug:"usage",children:[]},{depth:2,text:"Options",slug:"options",children:[{depth:3,text:"components",slug:"components",children:[]},{depth:3,text:"jsxRuntime",slug:"jsxruntime",children:[]}]},{depth:2,text:"Using Components in Markdown",slug:"using-components-in-markdown",children:[]}]},{depth:1,text:"My Page",slug:"my-page",children:[{depth:2,text:"Example Component",slug:"example-component",children:[]},{depth:2,text:"Virtual Modules",slug:"virtual-modules",children:[]},{depth:2,text:"HMR",slug:"hmr",children:[]}]}],o={html:s,frontmatter:n,toc:a};export{o as default,n as frontmatter,s as html,a as toc};
