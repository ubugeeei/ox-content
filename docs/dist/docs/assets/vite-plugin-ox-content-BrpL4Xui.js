const s=`<div class="ox-content"><h1 id="vite-plugin-ox-content">vite-plugin-ox-content</h1>

<p>Base Vite plugin for Ox Content with Environment API support.</p>

<h2 id="installation">Installation</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> add</span><span style="color:#C98A7D"> vite-plugin-ox-content</span></span></code></pre>

<h2 id="basic-usage">Basic Usage</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// vite.config.ts</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContent</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite-plugin-ox-content</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    oxContent</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="options">Options</h2>

<h3 id="srcdir">srcDir</h3>

<ul>
<li>Type: <code>string</code></li>
<li>Default: <code>'docs'</code></li>
</ul>

<p>Source directory for Markdown files.</p>

<h3 id="outdir">outDir</h3>

<ul>
<li>Type: <code>string</code></li>
<li>Default: <code>'dist'</code></li>
</ul>

<p>Output directory for built files.</p>

<h3 id="gfm">gfm</h3>

<ul>
<li>Type: <code>boolean</code></li>
<li>Default: <code>true</code></li>
</ul>

<p>Enable GitHub Flavored Markdown extensions.</p>

<h3 id="toc">toc</h3>

<ul>
<li>Type: <code>boolean</code></li>
<li>Default: <code>true</code></li>
</ul>

<p>Generate table of contents.</p>

<h3 id="docs">docs</h3>

<ul>
<li>Type: <code>DocsOptions | false</code></li>
<li>Default: <code>{ enabled: true }</code></li>
</ul>

<p>Source documentation generation options. Set to <code>false</code> to disable.</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">oxContent</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  docs</span><span style="color:#666666">: {</span></span>
<span class="line"><span style="color:#B8A965">    enabled</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">    src</span><span style="color:#666666">: [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src</span><span style="color:#C98A7D77">'</span><span style="color:#666666">],</span></span>
<span class="line"><span style="color:#B8A965">    out</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs/api</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">    include</span><span style="color:#666666">: [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">*/.ts</span><span style="color:#C98A7D77">'</span><span style="color:#666666">],</span></span>
<span class="line"><span style="color:#B8A965">    exclude</span><span style="color:#666666">: [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">*/.test.*</span><span style="color:#C98A7D77">'</span><span style="color:#666666">],</span></span>
<span class="line"><span style="color:#B8A965">    format</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">markdown</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">    toc</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">    groupBy</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">file</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">  },</span></span>
<span class="line"><span style="color:#666666">})</span></span></code></pre>

<h4 id="docsoptions">DocsOptions</h4>

<table>
<thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>enabled</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Enable/disable docs generation</td></tr>
<tr><td><code>src</code></td><td><code>string[]</code></td><td><code>['./src']</code></td><td>Source directories to scan</td></tr>
<tr><td><code>out</code></td><td><code>string</code></td><td><code>'docs/api'</code></td><td>Output directory</td></tr>
<tr><td><code>include</code></td><td><code>string[]</code></td><td><code>['<strong>/<em>.ts', '</em></strong><em>/</em>.tsx']</code></td><td>Files to include</td></tr>
<tr><td><code>exclude</code></td><td><code>string[]</code></td><td><code>['<strong>/<em>.test.</em>', '</strong>/<em>.spec.</em>']</code></td><td>Files to exclude</td></tr>
<tr><td><code>format</code></td><td><code>'markdown' \\</code></td><td>'json' \\</td><td>'html'</td><td><code>'markdown'</code></td><td>Output format</td></tr>
<tr><td><code>private</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Include @private members</td></tr>
<tr><td><code>toc</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Generate table of contents</td></tr>
<tr><td><code>groupBy</code></td><td><code>'file' \\</code></td><td>'category'</td><td><code>'file'</code></td><td>Group docs by file or category</td></tr>
</tbody>
</table>

<h2 id="disabling-docs-generation">Disabling Docs Generation</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">oxContent</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  docs</span><span style="color:#666666">: </span><span style="color:#4D9375">false</span><span style="color:#666666">, </span><span style="color:#758575DD">// Opt-out of builtin docs generation</span></span>
<span class="line"><span style="color:#666666">})</span></span></code></pre>

<h2 id="environment-api">Environment API</h2>

<p>The plugin creates a <code>markdown</code> environment using Vite's Environment API for SSG-focused rendering.</p>

<h2 id="hmr-support">HMR Support</h2>

<p>Markdown files are hot-reloaded during development. The plugin sends custom HMR events:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// Client-side</span></span>
<span class="line"><span style="color:#4D9375">if</span><span style="color:#666666"> (</span><span style="color:#4D9375">import</span><span style="color:#666666">.</span><span style="color:#B8A965">meta</span><span style="color:#666666">.</span><span style="color:#BD976A">hot</span><span style="color:#666666">)</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#4D9375">  import</span><span style="color:#666666">.</span><span style="color:#B8A965">meta</span><span style="color:#666666">.</span><span style="color:#BD976A">hot</span><span style="color:#666666">.</span><span style="color:#80A665">on</span><span style="color:#666666">(</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">ox-content:update</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#666666"> (</span><span style="color:#BD976A">data</span><span style="color:#666666">)</span><span style="color:#666666"> =></span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">    console</span><span style="color:#666666">.</span><span style="color:#80A665">log</span><span style="color:#666666">(</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">Markdown updated:</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#BD976A"> data</span><span style="color:#666666">.</span><span style="color:#BD976A">file</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#666666">  });</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h2 id="virtual-modules">Virtual Modules</h2>

<p>The plugin provides virtual modules:</p>

<ul>
<li><code>virtual:ox-content/config</code> - Resolved plugin configuration</li>
<li><code>virtual:ox-content/runtime</code> - Runtime utilities</li>
</ul>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> config</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content/config</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> useMarkdown</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">virtual:ox-content/runtime</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span></code></pre>

</div>`,o={},n=[{depth:1,text:"vite-plugin-ox-content",slug:"vite-plugin-ox-content",children:[{depth:2,text:"Installation",slug:"installation",children:[]},{depth:2,text:"Basic Usage",slug:"basic-usage",children:[]},{depth:2,text:"Options",slug:"options",children:[{depth:3,text:"srcDir",slug:"srcdir",children:[]},{depth:3,text:"outDir",slug:"outdir",children:[]},{depth:3,text:"gfm",slug:"gfm",children:[]},{depth:3,text:"toc",slug:"toc",children:[]},{depth:3,text:"docs",slug:"docs",children:[]}]},{depth:2,text:"Disabling Docs Generation",slug:"disabling-docs-generation",children:[]},{depth:2,text:"Environment API",slug:"environment-api",children:[]},{depth:2,text:"HMR Support",slug:"hmr-support",children:[]},{depth:2,text:"Virtual Modules",slug:"virtual-modules",children:[]}]}],e={html:s,frontmatter:o,toc:n};export{e as default,o as frontmatter,s as html,n as toc};
