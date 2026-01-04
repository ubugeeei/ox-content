const s=`<div class="ox-content"><h1 id="getting-started">Getting Started</h1>

<p>This guide will help you set up Ox Content and start using it in your projects.</p>

<h2 id="prerequisites">Prerequisites</h2>

<p>Before you begin, ensure you have the following installed:</p>

<table>
<thead><tr><th>Requirement</th><th>Version</th><th>Installation</th></tr></thead>
<tbody>
<tr><td><strong>Rust</strong></td><td>1.83+</td><td><a href="https://rustup.rs/">rustup.rs</a></td></tr>
<tr><td><strong>Node.js</strong></td><td>22+</td><td><a href="https://nodejs.org/">nodejs.org</a></td></tr>
<tr><td><strong>mise</strong></td><td>Latest</td><td><a href="https://mise.jdx.dev/">mise.jdx.dev</a></td></tr>
</tbody>
</table>

<h2 id="installation">Installation</h2>

<h3 id="for-development-building-from-source">For Development (Building from Source)</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD"># Clone the repository</span></span>
<span class="line"><span style="color:#80A665">git</span><span style="color:#C98A7D"> clone</span><span style="color:#C98A7D"> https://github.com/ubugeeei/ox-content.git</span></span>
<span class="line"><span style="color:#B8A965">cd</span><span style="color:#C98A7D"> ox-content</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Setup</span><span style="color:#C98A7D"> with</span><span style="color:#C98A7D"> mise</span><span style="color:#DBD7CAEE"> (recommended)</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> trust</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> install</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Build</span><span style="color:#C98A7D"> all</span><span style="color:#C98A7D"> crates</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> build</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Run</span><span style="color:#C98A7D"> tests</span><span style="color:#C98A7D"> to</span><span style="color:#C98A7D"> verify</span><span style="color:#C98A7D"> installation</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> test</span></span></code></pre>

<h3 id="as-a-rust-dependency">As a Rust Dependency</h3>

<p>Add to your <code>Cargo.toml</code>:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#666666">[</span><span style="color:#80A665">dependencies</span><span style="color:#666666">]</span></span>
<span class="line"><span style="color:#BD976A">oxcontentallocator</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D">0.1</span><span style="color:#C98A7D77">"</span></span>
<span class="line"><span style="color:#BD976A">oxcontentast</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D">0.1</span><span style="color:#C98A7D77">"</span></span>
<span class="line"><span style="color:#BD976A">oxcontentparser</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D">0.1</span><span style="color:#C98A7D77">"</span></span>
<span class="line"><span style="color:#BD976A">oxcontentrenderer</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D">0.1</span><span style="color:#C98A7D77">"</span></span></code></pre>

<h3 id="as-an-npm-package">As an npm Package</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">npm</span><span style="color:#C98A7D"> install</span><span style="color:#C98A7D"> @ox-content/napi</span></span>
<span class="line"><span style="color:#80A665">or</span></span>
<span class="line"><span style="color:#80A665">pnpm</span><span style="color:#C98A7D"> add</span><span style="color:#C98A7D"> @ox-content/napi</span></span>
<span class="line"><span style="color:#80A665">or</span></span>
<span class="line"><span style="color:#80A665">yarn</span><span style="color:#C98A7D"> add</span><span style="color:#C98A7D"> @ox-content/napi</span></span></code></pre>

<h2 id="quick-start-examples">Quick Start Examples</h2>

<h3 id="basic-parsing-and-rendering-rust">Basic Parsing and Rendering (Rust)</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentallocator</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Allocator</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentparser</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Parser</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentrenderer</span><span style="color:#CB7676">::</span><span style="color:#5DA994">HtmlRenderer</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> main</span><span style="color:#666666">()</span><span style="color:#666666"> {</span><span style="color:#758575DD">    // Step 1: Create an arena allocator    let allocator = Allocator::new();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Step 2: Define your Markdown content</span></span>
<span class="line"><span style="color:#CB7676">    let</span><span style="color:#BD976A"> markdown</span><span style="color:#666666"> =</span><span style="color:#C98A7D"> r</span><span style="color:#C98A7D77">#"</span></span>
<span class="line"><span style="color:#C98A7D">Welcome to Ox Content</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">This is a fast Markdown parser written in Rust.</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">Features</span></span>
<span class="line"></span>
<span class="line"></span></code></pre>

rust
let x = 42;

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>"#;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Step 3: Parse the Markdown    let parser = Parser::new(&#x26;allocator, markdown);    let document = parser.parse().expect("Failed to parse");</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Step 4: Render to HTML    let mut renderer = HtmlRenderer::new();    let html = renderer.render(&#x26;document);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>println!("{}", html);</span></span>
<span class="line"><span>}</span></span></code></pre>

<h3 id="with-gfm-extensions-rust">With GFM Extensions (Rust)</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentallocator</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Allocator</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentparser</span><span style="color:#CB7676">::</span><span style="color:#666666">{</span><span style="color:#5DA994">Parser</span><span style="color:#666666">,</span><span style="color:#5DA994"> ParserOptions</span><span style="color:#666666">};</span></span>
<span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentrenderer</span><span style="color:#CB7676">::</span><span style="color:#5DA994">HtmlRenderer</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> main</span><span style="color:#666666">()</span><span style="color:#666666"> {</span><span style="color:#CB7676">    let</span><span style="color:#BD976A"> allocator</span><span style="color:#666666"> =</span><span style="color:#5DA994"> Allocator</span><span style="color:#CB7676">::</span><span style="color:#80A665">new</span><span style="color:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> markdown</span><span style="color:#666666"> =</span><span style="color:#C98A7D"> r</span><span style="color:#C98A7D77">#"</span></span>
<span class="line"><span style="color:#C98A7D">Task List</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D"> Learn Rust</span></span>
<span class="line"><span style="color:#C98A7D"> Build a parser</span></span>
<span class="line"><span style="color:#C98A7D"> Conquer the world</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">Data Table</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">NameAgeCity</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">Alice30NYC</span></span>
<span class="line"><span style="color:#C98A7D">Bob25LA</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">Formatting</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">deleted text and www.example.com autolink</span><span style="color:#C98A7D77">"#</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Enable GFM extensions    let options = ParserOptions::gfm();    let parser = Parser::with_options(&#x26;allocator, markdown, options);    let document = parser.parse().unwrap();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#CB7676"> mut</span><span style="color:#BD976A"> renderer</span><span style="color:#666666"> =</span><span style="color:#5DA994"> HtmlRenderer</span><span style="color:#CB7676">::</span><span style="color:#80A665">new</span><span style="color:#666666">();</span><span style="color:#CB7676">    let</span><span style="color:#BD976A"> html</span><span style="color:#666666"> =</span><span style="color:#BD976A"> renderer</span><span style="color:#CB7676">.</span><span style="color:#80A665">render</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;</span><span style="color:#BD976A">document</span><span style="color:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">println!</span><span style="color:#666666">(</span><span style="color:#C98A7D77">"</span><span style="color:#666666">{}</span><span style="color:#C98A7D77">"</span><span style="color:#666666">,</span><span style="color:#BD976A"> html</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="nodejs-usage">Node.js Usage</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> parseMarkdown</span><span style="color:#666666">,</span><span style="color:#BD976A"> parseAndRender</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@ox-content/napi</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Option 1: Get AST onlyconst markdown = '# Hello World\\n\\nThis is bold text.';const ast = parseMarkdown(markdown, { gfm: true });console.log(JSON.stringify(ast, null, 2));</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Option 2: Parse and render in one call</span></span>
<span class="line"><span style="color:#CB7676">const</span><span style="color:#BD976A"> result</span><span style="color:#666666"> =</span><span style="color:#80A665"> parseAndRender</span><span style="color:#666666">(</span><span style="color:#BD976A">markdown</span><span style="color:#666666">,</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#B8A965">  gfm</span><span style="color:#666666">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">});</span></span>
<span class="line"><span style="color:#BD976A">console</span><span style="color:#666666">.</span><span style="color:#80A665">log</span><span style="color:#666666">(</span><span style="color:#BD976A">result</span><span style="color:#666666">.</span><span style="color:#BD976A">html</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#758575DD">// Output: &#x3C;h1>Hello World&#x3C;/h1>\\n&#x3C;p>This is &#x3C;strong>bold&#x3C;/strong> text.&#x3C;/p>\\n</span></span></code></pre>

<h3 id="typescript-with-types">TypeScript with Types</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> parseMarkdown</span><span style="color:#666666">,</span><span style="color:#BD976A"> parseAndRender</span><span style="color:#666666">,</span><span style="color:#4D9375"> type</span><span style="color:#BD976A"> ParseOptions</span><span style="color:#666666">,</span><span style="color:#4D9375"> type</span><span style="color:#BD976A"> RenderResult</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@ox-content/napi</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">options</span><span style="color:#666666">: </span><span style="color:#5DA994">ParseOptions</span><span style="color:#666666"> =</span><span style="color:#666666"> {  </span><span style="color:#B8A965">gfm</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,  </span><span style="color:#B8A965">footnotes</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,  </span><span style="color:#B8A965">tables</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">markdown</span><span style="color:#666666"> =</span><span style="color:#C98A7D77"> \`</span></span>
<span class="line"><span style="color:#C98A7D">API Documentation</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">Endpoints</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">MethodPathDescription</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D">GET/usersList users</span></span>
<span class="line"><span style="color:#C98A7D">POST/usersCreate user</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#C98A7D77">\`</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">result</span><span style="color:#666666">: </span><span style="color:#5DA994">RenderResult</span><span style="color:#666666"> =</span><span style="color:#80A665"> parseAndRender</span><span style="color:#666666">(</span><span style="color:#BD976A">markdown</span><span style="color:#666666">,</span><span style="color:#BD976A"> options</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#BD976A">console</span><span style="color:#666666">.</span><span style="color:#80A665">log</span><span style="color:#666666">(</span><span style="color:#BD976A">result</span><span style="color:#666666">.</span><span style="color:#BD976A">html</span><span style="color:#666666">);</span></span></code></pre>

<h3 id="with-vite">With Vite</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// vite.config.ts</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> defineConfig</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"><span style="color:#4D9375">import</span><span style="color:#666666"> {</span><span style="color:#BD976A"> oxContent</span><span style="color:#666666"> }</span><span style="color:#4D9375"> from</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">@ox-content/vite</span><span style="color:#C98A7D77">'</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">export</span><span style="color:#4D9375"> default</span><span style="color:#80A665"> defineConfig</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">  plugins</span><span style="color:#666666">: [</span></span>
<span class="line"><span style="color:#80A665">    oxContent</span><span style="color:#666666">({</span></span>
<span class="line"><span style="color:#B8A965">      srcDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">docs</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">      outDir</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">dist</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">      // Enable syntax highlighting</span></span>
<span class="line"><span style="color:#B8A965">      highlight</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">      // Generate OG images</span></span>
<span class="line"><span style="color:#B8A965">      ogImage</span><span style="color:#666666">: {</span></span>
<span class="line"><span style="color:#B8A965">        enabled</span><span style="color:#666666">: </span><span style="color:#4D9375">true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#B8A965">        background</span><span style="color:#666666">: </span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">#1a1a2e</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">      },</span></span>
<span class="line"><span style="color:#666666">    }),</span></span>
<span class="line"><span style="color:#666666">  ],</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h2 id="development-workflow">Development Workflow</h2>

<h3 id="available-mise-tasks">Available mise Tasks</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD"># Building</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> build</span><span style="color:#758575DD">          # Build all crates in release mode</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> build-debug</span><span style="color:#758575DD">    # Build in debug mode</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Testing</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> test</span><span style="color:#758575DD">           # Run all tests</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> test-verbose</span><span style="color:#758575DD">   # Run tests with verbose output</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> watch</span><span style="color:#758575DD">          # Watch for changes and run tests</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Code</span><span style="color:#C98A7D"> Quality</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> fmt</span><span style="color:#758575DD">            # Format all Rust code</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> fmt-check</span><span style="color:#758575DD">      # Check formatting (CI mode)</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> clippy</span><span style="color:#758575DD">         # Run clippy lints</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> lint</span><span style="color:#758575DD">           # Run all lints (fmt-check + clippy)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Pre-commit</span><span style="color:#C98A7D"> Check</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> ready</span><span style="color:#758575DD">          # Run fmt, clippy, and tests</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Documentation</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> docs</span><span style="color:#758575DD">           # Generate Rust documentation</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> docs-open</span><span style="color:#758575DD">      # Generate and open in browser</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Playground</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> playground</span><span style="color:#758575DD">         # Start playground dev server</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> playground-build</span><span style="color:#758575DD">   # Build playground for production</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> playground-install</span><span style="color:#758575DD"> # Install playground dependencies</span></span></code></pre>

<h3 id="project-structure">Project Structure</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>ox-content/</span></span>
<span class="line"><span>├── Cargo.toml              # Workspace configuration</span></span>
<span class="line"><span>├── Cargo.lock              # Locked dependencies</span></span>
<span class="line"><span>├── mise.toml               # mise task definitions</span></span>
<span class="line"><span>├── crates/</span></span>
<span class="line"><span>│   ├── oxcontentallocator/</span></span>
<span class="line"><span>│   │   ├── Cargo.toml</span></span>
<span class="line"><span>│   │   └── src/</span></span>
<span class="line"><span>│   │       └── lib.rs      # Arena allocator</span></span>
<span class="line"><span>│   ├── oxcontentast/</span></span>
<span class="line"><span>│   │   ├── Cargo.toml</span></span>
<span class="line"><span>│   │   └── src/</span></span>
<span class="line"><span>│   │       ├── lib.rs      # Module exports</span></span>
<span class="line"><span>│   │       ├── ast.rs      # Node definitions</span></span>
<span class="line"><span>│   │       ├── span.rs     # Source locations</span></span>
<span class="line"><span>│   │       └── visit.rs    # Visitor pattern</span></span>
<span class="line"><span>│   ├── oxcontentparser/</span></span>
<span class="line"><span>│   │   ├── Cargo.toml</span></span>
<span class="line"><span>│   │   └── src/</span></span>
<span class="line"><span>│   │       ├── lib.rs      # Module exports</span></span>
<span class="line"><span>│   │       ├── parser.rs   # Main parser</span></span>
<span class="line"><span>│   │       ├── lexer.rs    # Tokenizer</span></span>
<span class="line"><span>│   │       └── error.rs    # Error types</span></span>
<span class="line"><span>│   ├── oxcontentrenderer/</span></span>
<span class="line"><span>│   │   ├── Cargo.toml</span></span>
<span class="line"><span>│   │   └── src/</span></span>
<span class="line"><span>│   │       ├── lib.rs      # Module exports</span></span>
<span class="line"><span>│   │       ├── html.rs     # HTML renderer</span></span>
<span class="line"><span>│   │       └── render.rs   # Renderer trait</span></span>
<span class="line"><span>│   ├── oxcontentnapi/</span></span>
<span class="line"><span>│   │   ├── Cargo.toml</span></span>
<span class="line"><span>│   │   ├── package.json    # npm package config</span></span>
<span class="line"><span>│   │   └── src/</span></span>
<span class="line"><span>│   │       └── lib.rs      # NAPI bindings</span></span>
<span class="line"><span>│   ├── oxcontentvite/</span></span>
<span class="line"><span>│   │   └── ...             # Vite plugin</span></span>
<span class="line"><span>│   ├── oxcontentog_image/</span></span>
<span class="line"><span>│   │   └── ...             # OG image generation</span></span>
<span class="line"><span>│   └── oxcontentdocs/</span></span>
<span class="line"><span>│       └── ...             # Source code documentation</span></span>
<span class="line"><span>├── playground/             # Interactive web playground</span></span>
<span class="line"><span>│   ├── package.json</span></span>
<span class="line"><span>│   ├── vite.config.ts</span></span>
<span class="line"><span>│   ├── index.html</span></span>
<span class="line"><span>│   └── src/</span></span>
<span class="line"><span>│       └── main.ts</span></span>
<span class="line"><span>├── docs/                   # Documentation (you are here!)</span></span>
<span class="line"><span>│   ├── index.md</span></span>
<span class="line"><span>│   ├── getting-started.md</span></span>
<span class="line"><span>│   ├── architecture.md</span></span>
<span class="line"><span>│   └── ox-content.config.ts</span></span>
<span class="line"><span>└── .github/</span></span>
<span class="line"><span>    └── workflows/</span></span>
<span class="line"><span>        ├── ci.yml          # Continuous integration</span></span>
<span class="line"><span>        ├── deploy.yml      # GitHub Pages deployment</span></span>
<span class="line"><span>        └── release.yml     # npm release automation</span></span></code></pre>

<h2 id="running-tests">Running Tests</h2>

<h3 id="all-tests">All Tests</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD"># With mise</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> test</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">With</span><span style="color:#C98A7D"> cargo</span><span style="color:#C98A7D"> directly</span></span>
<span class="line"><span style="color:#80A665">cargo</span><span style="color:#C98A7D"> test</span><span style="color:#C99076"> --workspace</span></span></code></pre>

<h3 id="specific-crate">Specific Crate</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">cargo</span><span style="color:#C98A7D"> test</span><span style="color:#C99076"> -p</span><span style="color:#C98A7D"> oxcontentparser</span></span>
<span class="line"><span style="color:#80A665">cargo</span><span style="color:#C98A7D"> test</span><span style="color:#C99076"> -p</span><span style="color:#C98A7D"> oxcontentrenderer</span></span></code></pre>

<h3 id="with-output">With Output</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">cargo</span><span style="color:#C98A7D"> test</span><span style="color:#C99076"> --workspace</span><span style="color:#C99076"> --</span><span style="color:#C99076"> --nocapture</span></span></code></pre>

<h3 id="watch-mode">Watch Mode</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> watch</span></span>
<span class="line"><span style="color:#80A665">or</span></span>
<span class="line"><span style="color:#80A665">cargo</span><span style="color:#C98A7D"> watch</span><span style="color:#C99076"> -x</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D">test --workspace</span><span style="color:#C98A7D77">"</span></span></code></pre>

<h2 id="using-the-playground">Using the Playground</h2>

<p>The playground provides an interactive environment to test the parser:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD"># Install dependencies and start dev server</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> playground-install</span></span>
<span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> playground</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Or</span><span style="color:#C98A7D"> manually</span></span>
<span class="line"><span style="color:#B8A965">cd</span><span style="color:#C98A7D"> playground</span></span>
<span class="line"><span style="color:#80A665">npm</span><span style="color:#C98A7D"> install</span></span>
<span class="line"><span style="color:#80A665">npm</span><span style="color:#C98A7D"> run</span><span style="color:#C98A7D"> dev</span></span></code></pre>

<p>Then open <a href="http://localhost:5173">http://localhost:5173</a> in your browser.</p>

<strong>Features:</strong>
<ul>
<li>Live Markdown preview</li>
<li>AST visualization</li>
<li>Syntax highlighting</li>
<li>Performance metrics</li>
</ul>

<h2 id="troubleshooting">Troubleshooting</h2>

<h3 id="common-issues">Common Issues</h3>

<h4 id="cargo-command-not-found">"cargo: command not found"</h4>

<p>Ensure Rust is installed and in your PATH:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">curl</span><span style="color:#C99076"> --proto</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">=https</span><span style="color:#C98A7D77">'</span><span style="color:#C99076"> --tlsv1.2</span><span style="color:#C99076"> -sSf</span><span style="color:#C98A7D"> https://sh.rustup.rs</span><span style="color:#CB7676"> |</span><span style="color:#80A665"> sh</span></span>
<span class="line"><span style="color:#B8A965">source</span><span style="color:#C98A7D"> ~/.cargo/env</span></span></code></pre>

<h4 id="mise-not-recognized">mise Not Recognized</h4>

<p>Install mise:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">curl</span><span style="color:#C98A7D"> https://mise.run</span><span style="color:#CB7676"> |</span><span style="color:#80A665"> sh</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Add</span><span style="color:#C98A7D"> to</span><span style="color:#C98A7D"> your</span><span style="color:#C98A7D"> shell</span><span style="color:#C98A7D"> config</span></span>
<span class="line"><span style="color:#B8A965">echo</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">eval "$(mise activate bash)"</span><span style="color:#C98A7D77">'</span><span style="color:#CB7676"> >></span><span style="color:#C98A7D"> ~/.bashrc</span></span>
<span class="line"><span style="color:#80A665">or</span><span style="color:#C98A7D"> for</span><span style="color:#C98A7D"> zsh</span></span>
<span class="line"><span style="color:#B8A965">echo</span><span style="color:#C98A7D77"> '</span><span style="color:#C98A7D">eval "$(mise activate zsh)"</span><span style="color:#C98A7D77">'</span><span style="color:#CB7676"> >></span><span style="color:#C98A7D"> ~/.zshrc</span></span></code></pre>

<h4 id="build-fails-with-linking-errors">Build Fails with Linking Errors</h4>

<p>On Linux, you may need to install build essentials:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD"># Ubuntu/Debian</span></span>
<span class="line"><span style="color:#80A665">sudo</span><span style="color:#C98A7D"> apt-get</span><span style="color:#C98A7D"> install</span><span style="color:#C98A7D"> build-essential</span></span>
<span class="line"></span>
<span class="line"><span style="color:#80A665">Fedora</span></span>
<span class="line"><span style="color:#80A665">sudo</span><span style="color:#C98A7D"> dnf</span><span style="color:#C98A7D"> groupinstall</span><span style="color:#C98A7D77"> "</span><span style="color:#C98A7D">Development Tools</span><span style="color:#C98A7D77">"</span></span></code></pre>

<p>On macOS, install Xcode Command Line Tools:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">xcode-select</span><span style="color:#C99076"> --install</span></span></code></pre>

<h4 id="napi-build-fails">NAPI Build Fails</h4>

<p>Ensure you have the correct Node.js version:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#80A665">mise</span><span style="color:#C98A7D"> use</span><span style="color:#C98A7D"> node@22</span></span>
<span class="line"><span style="color:#80A665">or</span></span>
<span class="line"><span style="color:#80A665">nvm</span><span style="color:#C98A7D"> use</span><span style="color:#4C9A91"> 22</span></span></code></pre>

<h3 id="getting-help">Getting Help</h3>

<ul>
<li><a href="https://github.com/ubugeeei/ox-content/issues">GitHub Issues</a> - Bug reports and feature requests</li>
<li><a href="https://github.com/ubugeeei/ox-content/discussions">Discussions</a> - Questions and ideas</li>
</ul>

<h2 id="next-steps">Next Steps</h2>

<ul>
<li><a href="./architecture.md">Architecture Overview</a> - Learn about the design</li>
<li><a href="./api/">API Reference</a> - Explore the Rust API</li>
<li><a href="/playground/">Playground</a> - Try it interactively</li>
</ul></div>`,n={},a=[{depth:1,text:"Getting Started",slug:"getting-started",children:[{depth:2,text:"Prerequisites",slug:"prerequisites",children:[]},{depth:2,text:"Installation",slug:"installation",children:[{depth:3,text:"For Development (Building from Source)",slug:"for-development-building-from-source",children:[]}]}]},{depth:1,text:"Clone the repository",slug:"clone-the-repository",children:[]},{depth:1,text:"Setup with mise (recommended)",slug:"setup-with-mise-recommended",children:[]},{depth:1,text:"Build all crates",slug:"build-all-crates",children:[]},{depth:1,text:"Run tests to verify installation",slug:"run-tests-to-verify-installation",children:[{depth:3,text:"As a Rust Dependency",slug:"as-a-rust-dependency",children:[]},{depth:3,text:"As an npm Package",slug:"as-an-npm-package",children:[]}]},{depth:1,text:"or",slug:"or",children:[]},{depth:1,text:"or",slug:"or",children:[{depth:2,text:"Quick Start Examples",slug:"quick-start-examples",children:[{depth:3,text:"Basic Parsing and Rendering (Rust)",slug:"basic-parsing-and-rendering-rust",children:[]}]}]},{depth:1,text:"Welcome to Ox Content",slug:"welcome-to-ox-content",children:[{depth:2,text:"Features",slug:"features",children:[{depth:3,text:"With GFM Extensions (Rust)",slug:"with-gfm-extensions-rust",children:[]}]}]},{depth:1,text:"Task List",slug:"task-list",children:[{depth:2,text:"Data Table",slug:"data-table",children:[]},{depth:2,text:"Formatting",slug:"formatting",children:[{depth:3,text:"Node.js Usage",slug:"nodejs-usage",children:[]},{depth:3,text:"TypeScript with Types",slug:"typescript-with-types",children:[]}]}]},{depth:1,text:"API Documentation",slug:"api-documentation",children:[{depth:2,text:"Endpoints",slug:"endpoints",children:[{depth:3,text:"With Vite",slug:"with-vite",children:[]}]},{depth:2,text:"Development Workflow",slug:"development-workflow",children:[{depth:3,text:"Available mise Tasks",slug:"available-mise-tasks",children:[]}]}]},{depth:1,text:"Building",slug:"building",children:[]},{depth:1,text:"Testing",slug:"testing",children:[]},{depth:1,text:"Code Quality",slug:"code-quality",children:[]},{depth:1,text:"Pre-commit Check",slug:"pre-commit-check",children:[]},{depth:1,text:"Documentation",slug:"documentation",children:[]},{depth:1,text:"Playground",slug:"playground",children:[{depth:3,text:"Project Structure",slug:"project-structure",children:[]},{depth:2,text:"Running Tests",slug:"running-tests",children:[{depth:3,text:"All Tests",slug:"all-tests",children:[]}]}]},{depth:1,text:"With mise",slug:"with-mise",children:[]},{depth:1,text:"With cargo directly",slug:"with-cargo-directly",children:[{depth:3,text:"Specific Crate",slug:"specific-crate",children:[]},{depth:3,text:"With Output",slug:"with-output",children:[]},{depth:3,text:"Watch Mode",slug:"watch-mode",children:[]}]},{depth:1,text:"or",slug:"or",children:[{depth:2,text:"Using the Playground",slug:"using-the-playground",children:[]}]},{depth:1,text:"Install dependencies and start dev server",slug:"install-dependencies-and-start-dev-server",children:[]},{depth:1,text:"Or manually",slug:"or-manually",children:[{depth:2,text:"Troubleshooting",slug:"troubleshooting",children:[{depth:3,text:"Common Issues",slug:"common-issues",children:[]}]}]},{depth:1,text:"Add to your shell config",slug:"add-to-your-shell-config",children:[]},{depth:1,text:"or for zsh",slug:"or-for-zsh",children:[]},{depth:1,text:"Ubuntu/Debian",slug:"ubuntudebian",children:[]},{depth:1,text:"Fedora",slug:"fedora",children:[]},{depth:1,text:"or",slug:"or",children:[{depth:3,text:"Getting Help",slug:"getting-help",children:[]},{depth:2,text:"Next Steps",slug:"next-steps",children:[]}]}],l={html:s,frontmatter:n,toc:a};export{l as default,n as frontmatter,s as html,a as toc};
