const s=`<div class="ox-content"><h1 id="vue-integration-example">Vue Integration Example</h1>

<p>Demonstrates embedding Vue 3 components in Markdown.</p>

<h2 id="setup">Setup</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#B8A965">cd</span><span style="color:#C98A7D"> examples/integ-vue</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> install</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> dev</span></span></code></pre>

<h2 id="configuration">Configuration</h2>

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
<span class="line"><span style="color:#758575DD">      // Auto-discover all Vue components</span></span>
<span class="line"><span style="color:#B8A965">      components</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src/components/*.vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="components">Components</h2>

<h3 id="counter">Counter</h3>

<p>Interactive counter with increment/decrement buttons.</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">script</span><span style="color:#BD976A"> setup</span><span style="color:#BD976A"> lang</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">ts</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> ref</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vue</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">props</span><span style="color:#666666"> =</span><span style="color:#80A665"> defineProps</span><span style="color:#666666">&#x3C;{</span><span style="color:#BD976A">  initial</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#5DA994">number</span><span style="color:#666666">;}>();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">count</span><span style="color:#666666"> =</span><span style="color:#80A665"> ref</span><span style="color:#666666">(</span><span style="color:#BD976A">props</span><span style="color:#666666">.</span><span style="color:#BD976A">initial</span><span style="color:#CB7676"> ?? </span><span style="color:#4C9A91">0</span><span style="color:#666666">);&#x3C;/</span><span style="color:#4D9375">script</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">template</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> @click</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">count--</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">-</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">span</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">{{ count }}</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">span</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">button</span><span style="color:#BD976A"> @click</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">count++</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">+</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">button</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">template</span><span style="color:#666666">></span></span></code></pre>

<h3 id="alert">Alert</h3>

<p>Styled alert box with different types.</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">script</span><span style="color:#BD976A"> setup</span><span style="color:#BD976A"> lang</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">ts</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#80A665">defineProps</span><span style="color:#666666">&#x3C;{</span></span>
<span class="line"><span style="color:#BD976A">  type</span><span style="color:#CB7676">?</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">info</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">error</span><span style="color:#C98A7D77">'</span><span style="color:#666666"> | </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">success</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#666666">}>();</span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">script</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">template</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;</span><span style="color:#4D9375">div</span><span style="color:#BD976A"> :class</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">['alert', type ?? 'info']</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">    &#x3C;</span><span style="color:#4D9375">slot</span><span style="color:#666666;font-style:italic"> /</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">  &#x3C;/</span><span style="color:#4D9375">div</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">template</span><span style="color:#666666">></span></span></code></pre>

<h3 id="codedemo">CodeDemo</h3>

<p>Live code demonstration with preview.</p>

<h2 id="usage-in-markdown">Usage in Markdown</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666;font-weight:bold">#</span><span style="color:#4D9375;font-weight:bold"> My Documentation</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Counter</span><span style="color:#BD976A"> :initial</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">10</span><span style="color:#C98A7D77">"</span><span style="color:#666666"> /></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">Alert</span><span style="color:#BD976A"> type</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">warning</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span><span style="color:#DBD7CAEE">  Be careful with this feature!</span><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">Alert</span><span style="color:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">&#x3C;</span><span style="color:#4D9375">CodeDemo</span><span style="color:#BD976A"> language</span><span style="color:#666666">=</span><span style="color:#C98A7D77">"</span><span style="color:#C98A7D">vue</span><span style="color:#C98A7D77">"</span><span style="color:#666666">></span></span>
<span class="line"><span style="color:#758575DD">  &#x3C;!-- Your code here --></span></span>
<span class="line"><span style="color:#666666">&#x3C;/</span><span style="color:#4D9375">CodeDemo</span><span style="color:#666666">></span></span></code></pre>

<h2 id="file-structure">File Structure</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>integ-vue/</span></span>
<span class="line"><span>├── docs/</span></span>
<span class="line"><span>│   └── index.md</span></span>
<span class="line"><span>├── src/</span></span>
<span class="line"><span>│   ├── components/</span></span>
<span class="line"><span>│   │   ├── Counter.vue</span></span>
<span class="line"><span>│   │   ├── Alert.vue</span></span>
<span class="line"><span>│   │   └── CodeDemo.vue</span></span>
<span class="line"><span>│   ├── App.vue</span></span>
<span class="line"><span>│   └── main.ts</span></span>
<span class="line"><span>├── index.html</span></span>
<span class="line"><span>├── package.json</span></span>
<span class="line"><span>└── vite.config.ts</span></span></code></pre>

</div>`,n={},a=[{depth:1,text:"Vue Integration Example",slug:"vue-integration-example",children:[{depth:2,text:"Setup",slug:"setup",children:[]},{depth:2,text:"Configuration",slug:"configuration",children:[]},{depth:2,text:"Components",slug:"components",children:[{depth:3,text:"Counter",slug:"counter",children:[]},{depth:3,text:"Alert",slug:"alert",children:[]},{depth:3,text:"CodeDemo",slug:"codedemo",children:[]}]},{depth:2,text:"Usage in Markdown",slug:"usage-in-markdown",children:[]}]},{depth:1,text:"My Documentation",slug:"my-documentation",children:[{depth:2,text:"File Structure",slug:"file-structure",children:[]}]}],p={html:s,frontmatter:n,toc:a};export{p as default,n as frontmatter,s as html,a as toc};
