const s=`<div class="ox-content"><h1 id="react-integration-example">React Integration Example</h1>

<p>Demonstrates embedding React components in Markdown.</p>

<h2 id="setup">Setup</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#B8A965">cd</span><span style="color:#C98A7D"> examples/integ-react</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> install</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> dev</span></span></code></pre>

<h2 id="configuration">Configuration</h2>

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
<span class="line"><span style="color:#758575DD">      // Auto-discover all React components</span></span>
<span class="line"><span style="color:#B8A965">      components</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/*.tsx</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="components">Components</h2>

<h3 id="counter">Counter</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> useState</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">react</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">interface</span><span style="color:#5DA994"> Props</span><span style="color:#666666"> {</span><span style="color:#BD976A">  initial</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#5DA994">number</span><span style="color:#666666">;}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#CB7676"> function</span><span style="color:#80A665"> Counter</span><span style="color:#666666">({</span><span style="color:#BD976A"> initial</span><span style="color:#666666"> =</span><span style="color:#4C9A91"> 0</span><span style="color:#666666"> }: </span><span style="color:#5DA994">Props</span><span style="color:#666666">)</span><span style="color:#666666"> {</span><span style="color:#CB7676">  const</span><span style="color:#666666"> [</span><span style="color:#BD976A">count</span><span style="color:#666666">,</span><span style="color:#BD976A"> setCount</span><span style="color:#666666">]</span><span style="color:#666666"> =</span><span style="color:#80A665"> useState</span><span style="color:#666666">(</span><span style="color:#BD976A">initial</span><span style="color:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">return</span><span style="color:#666666"> (</span></span>
<span class="line"><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> className</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">counter</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">      &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onClick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#80A665"> setCount</span><span style="color:#666666">(</span><span style="color:#BD976A">c</span><span style="color:#666666"> =></span><span style="color:#BD976A"> c</span><span style="color:#CB7676"> -</span><span style="color:#4C9A91"> 1</span><span style="color:#666666">)}></span><span style="color:#DBD7CAEE">-</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">      &#x3C;</span><span style="color:#4D9375">span</span><span style="color:#666666">>{</span><span style="color:#BD976A">count</span><span style="color:#666666">}&#x3C;/</span><span style="color:#4D9375">span</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">      &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> onClick</span><span style="color:#666666">={()</span><span style="color:#666666"> =></span><span style="color:#80A665"> setCount</span><span style="color:#666666">(</span><span style="color:#BD976A">c</span><span style="color:#666666"> =></span><span style="color:#BD976A"> c</span><span style="color:#CB7676"> +</span><span style="color:#4C9A91"> 1</span><span style="color:#666666">)}></span><span style="color:#DBD7CAEE">+</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">    &#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  );</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="alert">Alert</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#CB7676">interface</span><span style="color:#5DA994"> Props</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">  type</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">info</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">error</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">success</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#BD976A">  children</span><span style="color:#666666">: </span><span style="color:#5DA994">React</span><span style="color:#666666">.</span><span style="color:#5DA994">ReactNode</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#CB7676"> function</span><span style="color:#80A665"> Alert</span><span style="color:#666666">({</span><span style="color:#BD976A"> type</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">info</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#BD976A"> children</span><span style="color:#666666"> }: </span><span style="color:#5DA994">Props</span><span style="color:#666666">)</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#4D9375">  return</span><span style="color:#666666"> (</span></span>
<span class="line"><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> className</span><span style="color:#666666">={</span><span style="color:#BD976A">alert</span><span style="color:#BD976A"> alert</span><span style="color:#CB7676">-</span><span style="color:#BD976A">$</span><span style="color:#666666">{</span><span style="color:#BD976A">type</span><span style="color:#666666">}}></span></span>
<span class="line"><span style="color:#666666">      {</span><span style="color:#BD976A">children</span><span style="color:#666666">}</span></span>
<span class="line"><span style="color:#666666">    &#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  );</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h2 id="usage-in-markdown">Usage in Markdown</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666;font-weight:bold">#</span><span style="color:#4D9375;font-weight:bold"> My Documentation</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Counter</span><span style="color:#BD976A"> initial</span><span style="color:#666666">=</span><span style="color:#C98A7D">{10}</span><span style="color:#666666"> /></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Alert</span><span style="color:#BD976A"> type</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#DBD7CAEE">  Be careful with this feature!</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">Alert</span><span style="color:#666666">></span></span></code></pre>

<h2 id="file-structure">File Structure</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>integ-react/</span></span>
<span class="line"><span>├── docs/</span></span>
<span class="line"><span>│   └── index.md</span></span>
<span class="line"><span>├── src/</span></span>
<span class="line"><span>│   ├── components/</span></span>
<span class="line"><span>│   │   ├── Counter.tsx</span></span>
<span class="line"><span>│   │   └── Alert.tsx</span></span>
<span class="line"><span>│   ├── App.tsx</span></span>
<span class="line"><span>│   └── main.tsx</span></span>
<span class="line"><span>├── index.html</span></span>
<span class="line"><span>├── package.json</span></span>
<span class="line"><span>└── vite.config.ts</span></span></code></pre>

</div>`,n={},a=[{depth:1,text:"React Integration Example",slug:"react-integration-example",children:[{depth:2,text:"Setup",slug:"setup",children:[]},{depth:2,text:"Configuration",slug:"configuration",children:[]},{depth:2,text:"Components",slug:"components",children:[{depth:3,text:"Counter",slug:"counter",children:[]},{depth:3,text:"Alert",slug:"alert",children:[]}]},{depth:2,text:"Usage in Markdown",slug:"usage-in-markdown",children:[]}]},{depth:1,text:"My Documentation",slug:"my-documentation",children:[{depth:2,text:"File Structure",slug:"file-structure",children:[]}]}],p={html:s,frontmatter:n,toc:a};export{p as default,n as frontmatter,s as html,a as toc};
