const s=`<div class="ox-content"><h1 id="ox-content">Ox Content</h1>

<p>A VoidZero Oxc family project - Framework-agnostic documentation tooling for Vite+.</p>

<h2 id="what-is-ox-content">What is Ox Content?</h2>

<p>Ox Content is a high-performance documentation toolkit built in Rust, designed to bring the speed and reliability of the Oxc ecosystem to Markdown processing. It provides everything you need to build documentation sites, technical blogs, and content-driven applications.</p>

<h3 id="why-ox-content">Why Ox Content?</h3>

<table>
<thead><tr><th>Feature</th><th>Ox Content</th><th>Traditional JS Parsers</th></tr></thead>
<tbody>
<tr><td>Parse Speed</td><td><strong>~10x faster</strong></td><td>Baseline</td></tr>
<tr><td>Memory Usage</td><td><strong>Zero-copy</strong></td><td>Multiple allocations</td></tr>
<tr><td>Type Safety</td><td><strong>Rust + TypeScript</strong></td><td>Runtime checks only</td></tr>
<tr><td>AST Spec</td><td><strong>mdast compatible</strong></td><td>Varies by library</td></tr>
<tr><td>Bundle Size</td><td><strong>Native binary</strong></td><td>Large JS bundles</td></tr>
</tbody>
</table>

<h3 id="core-philosophy">Core Philosophy</h3>

<ul>
<li><strong>Performance First</strong> - Arena-based allocation for zero-copy parsing</li>
<li><strong>Standards Compliant</strong> - Full CommonMark + GFM support with mdast-compatible AST</li>
<li><strong>Framework Agnostic</strong> - Works with any JavaScript framework via NAPI</li>
<li><strong>Developer Experience</strong> - Excellent TypeScript types and error messages</li>
</ul>

<h2 id="features">Features</h2>

<h3 id="blazing-fast-markdown-parser">Blazing Fast Markdown Parser</h3>

<p>The parser uses <a href="https://docs.rs/bumpalo">bumpalo</a> arena allocation for maximum performance:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentallocator</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Allocator</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentparser</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Parser</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> allocator</span><span style="color:#666666"> =</span><span style="color:#5DA994"> Allocator</span><span style="color:#CB7676">::</span><span style="color:#80A665">new</span><span style="color:#666666">();</span></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> parser</span><span style="color:#666666"> =</span><span style="color:#5DA994"> Parser</span><span style="color:#CB7676">::</span><span style="color:#80A665">new</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;</span><span style="color:#BD976A">allocator</span><span style="color:#666666">,</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D"># Hello World</span><span style="color:#C98A7D77">"</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> doc</span><span style="color:#666666"> =</span><span style="color:#BD976A"> parser</span><span style="color:#CB7676">.</span><span style="color:#80A665">parse</span><span style="color:#666666">()</span><span style="color:#CB7676">.</span><span style="color:#80A665">unwrap</span><span style="color:#666666">();</span></span>
<span class="line"><span style="color:#758575DD">// All AST nodes are allocated in the arena</span></span>
<span class="line"><span style="color:#758575DD">// Freed all at once when allocator is dropped</span></span></code></pre>

<h3 id="mdast-compatible-ast">mdast-Compatible AST</h3>

<p>The AST follows the <a href="https://github.com/syntax-tree/mdast">mdast</a> specification, making it compatible with the unified ecosystem:</p>

<strong>Block Nodes:</strong>
<ul>
<li><code>Document</code> - Root node containing all content</li>
<li><code>Paragraph</code> - Block of text</li>
<li><code>Heading</code> - h1-h6 headings with depth</li>
<li><code>CodeBlock</code> - Fenced (\`\`\`) or indented code blocks</li>
<li><code>BlockQuote</code> - Quoted content (>)</li>
<li><code>List</code> / <code>ListItem</code> - Ordered and unordered lists</li>
<li><code>Table</code> / <code>TableRow</code> / <code>TableCell</code> - GFM tables</li>
<li><code>ThematicBreak</code> - Horizontal rules (---, ***, ___)</li>
<li><code>Html</code> - Raw HTML blocks</li>
</ul>

<strong>Inline Nodes:</strong>
<ul>
<li><code>Text</code> - Plain text content</li>
<li><code>Emphasis</code> - Italic (<em>text</em> or <em>text</em>)</li>
<li><code>Strong</code> - Bold (<strong>text</strong> or <strong>text</strong>)</li>
<li><code>InlineCode</code> - Inline code spans (<code>code</code>)</li>
<li><code>Link</code> - Hyperlinks <a href="url">text</a></li>
<li><code>Image</code> - Images <img src="url" alt="alt"></li>
<li><code>Break</code> - Hard line breaks</li>
<li><code>Delete</code> - Strikethrough (<del>text</del>) (GFM)</li>
<li><code>FootnoteReference</code> - Footnote references (GFM)</li>
</ul>

<h3 id="gfm-extensions">GFM Extensions</h3>

<p>Full support for GitHub Flavored Markdown:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Feature </span><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Status </span><span style="color:#666666">|</span></span>
<span class="line"><span style="color:#666666">|---------|--------|</span></span>
<span class="line"><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Tables </span><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> ✅ </span><span style="color:#666666">|</span></span>
<span class="line"><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Task Lists </span><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> ✅ </span><span style="color:#666666">|</span></span>
<span class="line"><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Strikethrough </span><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> ✅ </span><span style="color:#666666">|</span></span>
<span class="line"><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Autolinks </span><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> ✅ </span><span style="color:#666666">|</span></span>
<span class="line"><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> Footnotes </span><span style="color:#666666">|</span><span style="color:#DBD7CAEE"> ✅ </span><span style="color:#666666">|</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE"> Completed task</span></span>
<span class="line"><span style="color:#DBD7CAEE"> Pending task</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">deleted text</span></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">www.example.com (autolinked)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#DBD7CAEE">Here is a footnote</span><span style="color:#666666">[</span><span style="color:#C98A7D">^1</span><span style="color:#666666">]</span><span style="color:#DBD7CAEE">.</span></span>
<span class="line"></span>
<span class="line"><span style="color:#666666">[</span><span style="color:#C98A7D">^1</span><span style="color:#666666">]</span><span style="color:#DBD7CAEE">: Footnote content.</span></span></code></pre>

<h3 id="vite-environment-api-integration">Vite Environment API Integration</h3>

<p>SSG-focused rendering with Astro-like islands architecture:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// vite.config.ts</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContent</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite-plugin-ox-content</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    oxContent</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">      // Auto-generate API docs from source</span></span>
<span class="line"><span style="color:#B8A965">      docs</span><span style="color:#666666">: {</span></span>
<span class="line"><span style="color:#B8A965">        src</span><span style="color:#666666">: [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">./src</span><span style="color:#C98A7D77">'</span><span style="color:#666666">],</span></span>
<span class="line"><span style="color:#B8A965">        out</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs/api</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">      },</span></span>
<span class="line"><span style="color:#666666">    })</span></span>
<span class="line"><span style="color:#666666">  ]</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h3 id="og-image-generation">OG Image Generation</h3>

<p>Automatic social media preview images for your content:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> generateOgImage</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@ox-content/og-image</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">image</span><span style="color:#666666"> =</span><span style="color:#4D9375"> await</span><span style="color:#80A665"> generateOgImage</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  title</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">My Article Title</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">  description</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">A brief description</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">  background</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">#1a1a2e</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">  textColor</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">#ffffff</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h3 id="nodejs-bindings">Node.js Bindings</h3>

<p>High-performance NAPI bindings for seamless JavaScript integration:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> parseMarkdown</span><span style="color:#666666">,</span><span style="color:#BD976A"> parseAndRender</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@ox-content/napi</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Parse to ASTconst ast = parseMarkdown('# Hello', { gfm: true });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Parse and render in one call</span></span>
<span class="line"><span style="color:#CB7676">const</span><span style="color:#666666"> {</span><span style="color:#BD976A"> html</span><span style="color:#666666">,</span><span style="color:#BD976A"> frontmatter</span><span style="color:#666666"> }</span><span style="color:#666666"> =</span><span style="color:#80A665"> parseAndRender</span><span style="color:#666666">(</span><span style="color:#BD976A">content</span><span style="color:#666666">,</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#B8A965">  gfm</span><span style="color:#666666">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">  highlight</span><span style="color:#666666">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="packages">Packages</h2>

<h3 id="rust-crates">Rust Crates</h3>

<table>
<thead><tr><th>Crate</th><th>Description</th><th>Key Features</th></tr></thead>
<tbody>
<tr><td><code>ox<em>content</em>allocator</code></td><td>Arena allocator</td><td>bumpalo wrapper, Vec/Box/String types</td></tr>
<tr><td><code>ox<em>content</em>ast</code></td><td>AST definitions</td><td>mdast-compatible nodes, Visitor pattern</td></tr>
<tr><td><code>ox<em>content</em>parser</code></td><td>Markdown parser</td><td>CommonMark + GFM, streaming support</td></tr>
<tr><td><code>ox<em>content</em>renderer</code></td><td>HTML renderer</td><td>Customizable, XHTML support, sanitization</td></tr>
<tr><td><code>ox<em>content</em>napi</code></td><td>Node.js bindings</td><td>napi-rs, TypeScript types</td></tr>
<tr><td><code>ox<em>content</em>og_image</code></td><td>OG images</td><td>SVG-based, customizable templates</td></tr>
</tbody>
</table>

<h3 id="vite-plugins">Vite Plugins</h3>

<table>
<thead><tr><th>Package</th><th>Description</th><th>Key Features</th></tr></thead>
<tbody>
<tr><td><a href="./packages/vite-plugin-ox-content.md">vite-plugin-ox-content</a></td><td>Base Vite plugin</td><td>Environment API, HMR, Builtin docs generation</td></tr>
<tr><td><a href="./packages/vite-plugin-ox-content-vue.md">vite-plugin-ox-content-vue</a></td><td>Vue integration</td><td>Embed Vue components in Markdown</td></tr>
<tr><td><a href="./packages/vite-plugin-ox-content-react.md">vite-plugin-ox-content-react</a></td><td>React integration</td><td>Embed React components in Markdown</td></tr>
<tr><td><a href="./packages/vite-plugin-ox-content-svelte.md">vite-plugin-ox-content-svelte</a></td><td>Svelte integration</td><td>Embed Svelte 5 components in Markdown</td></tr>
</tbody>
</table>

<h2 id="quick-links">Quick Links</h2>

<ul>
<li><a href="./getting-started.md">Getting Started</a> - Installation and first steps</li>
<li><a href="./architecture.md">Architecture</a> - Deep dive into the design</li>
<li><a href="./api/">API Reference</a> - Generated Rust documentation</li>
<li><a href="/playground/">Playground</a> - Try it in your browser</li>
<li><a href="https://github.com/ubugeeei/ox-content">GitHub</a> - Source code and issues</li>
</ul>

<h2 id="license">License</h2>

<p>MIT License - Free for personal and commercial use.</p></div>`,n={},e=[{depth:1,text:"Ox Content",slug:"ox-content",children:[{depth:2,text:"What is Ox Content?",slug:"what-is-ox-content",children:[{depth:3,text:"Why Ox Content?",slug:"why-ox-content",children:[]},{depth:3,text:"Core Philosophy",slug:"core-philosophy",children:[]}]},{depth:2,text:"Features",slug:"features",children:[{depth:3,text:"Blazing Fast Markdown Parser",slug:"blazing-fast-markdown-parser",children:[]},{depth:3,text:"mdast-Compatible AST",slug:"mdast-compatible-ast",children:[]},{depth:3,text:"GFM Extensions",slug:"gfm-extensions",children:[]},{depth:3,text:"Vite Environment API Integration",slug:"vite-environment-api-integration",children:[]},{depth:3,text:"OG Image Generation",slug:"og-image-generation",children:[]},{depth:3,text:"Node.js Bindings",slug:"nodejs-bindings",children:[]}]},{depth:2,text:"Packages",slug:"packages",children:[{depth:3,text:"Rust Crates",slug:"rust-crates",children:[]},{depth:3,text:"Vite Plugins",slug:"vite-plugins",children:[]}]},{depth:2,text:"Quick Links",slug:"quick-links",children:[]},{depth:2,text:"License",slug:"license",children:[]}]}],a={html:s,frontmatter:n,toc:e};export{a as default,n as frontmatter,s as html,e as toc};
