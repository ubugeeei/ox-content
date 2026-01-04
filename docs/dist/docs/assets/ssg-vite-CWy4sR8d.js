const s=`<div class="ox-content"><h1 id="basic-ssg-with-vite">Basic SSG with Vite</h1>

<p>This example demonstrates how to use Ox Content with Vite for static site generation.</p>

<h2 id="setup">Setup</h2>

<p>Create a new Vite project and install dependencies:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">npm</span><span style="color:#C98A7D"> create</span><span style="color:#C98A7D"> vite@latest</span><span style="color:#C98A7D"> my-docs</span><span style="color:#C99076"> --</span><span style="color:#C99076"> --template</span><span style="color:#C98A7D"> vanilla-ts</span></span>
<span class="line"><span style="color:#B8A965">cd</span><span style="color:#C98A7D"> my-docs</span></span>
<span class="line"><span style="color:#80A665">npm</span><span style="color:#C98A7D"> install</span><span style="color:#C98A7D"> vite-plugin-ox-content</span></span></code></pre>

<h2 id="configuration">Configuration</h2>

<p>Create or update <code>vite.config.ts</code>:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContent</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite-plugin-ox-content</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    oxContent</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">      gfm</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">      highlight</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">      highlightTheme</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">github-dark</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="usage">Usage</h2>

<p>Create markdown files in your <code>docs</code> directory:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">---</span></span>
<span class="line"><span style="color:#B8A965">title</span><span style="color:#666666">:</span><span style="color:#C98A7D"> My First Page</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">Hello World</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">This is my first page with Ox Content.</span></span></code></pre>

<p>Import and use in your application:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#BD976A"> content</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">./docs/hello.md</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#BD976A">document</span><span style="color:#666666">.</span><span style="color:#80A665">getElementById</span><span style="color:#666666">(</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">app</span><span style="color:#C98A7D77">'</span><span style="color:#666666">).</span><span style="color:#BD976A">innerHTML</span><span style="color:#666666"> =</span><span style="color:#BD976A"> content</span><span style="color:#666666">.</span><span style="color:#BD976A">html</span><span style="color:#666666">;</span></span></code></pre>

<h2 id="building-for-production">Building for Production</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">npm</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> build</span></span></code></pre>

<p>The output will be in the <code>dist</code> directory, ready for deployment.</p>

<h2 id="features">Features</h2>

<ul>
<li>Fast Rust-based Markdown parsing</li>
<li>Syntax highlighting with Shiki</li>
<li>GitHub Flavored Markdown support</li>
<li>Frontmatter parsing</li>
<li>Table of contents generation</li>
</ul></div>`,n={},a=[{depth:1,text:"Basic SSG with Vite",slug:"basic-ssg-with-vite",children:[{depth:2,text:"Setup",slug:"setup",children:[]},{depth:2,text:"Configuration",slug:"configuration",children:[]},{depth:2,text:"Usage",slug:"usage",children:[]}]},{depth:1,text:"Hello World",slug:"hello-world",children:[{depth:2,text:"Building for Production",slug:"building-for-production",children:[]},{depth:2,text:"Features",slug:"features",children:[]}]}],l={html:s,frontmatter:n,toc:a};export{l as default,n as frontmatter,s as html,a as toc};
