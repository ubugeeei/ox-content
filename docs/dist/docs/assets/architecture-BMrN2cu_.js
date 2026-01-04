const s=`<div class="ox-content"><h1 id="architecture">Architecture</h1>

<p>This document provides a deep dive into the architecture and design decisions of Ox Content.</p>

<h2 id="overview">Overview</h2>

<p>Ox Content is designed as a modular, high-performance Markdown processing toolkit. The architecture follows the Oxc philosophy of prioritizing speed, memory efficiency, and correctness.</p>

<div class="ox-mermaid" data-mermaid="graph TB
    subgraph Applications[&#x22;User Applications&#x22;]
        App1[Your App]
        App2[Documentation Site]
        App3[Blog]
    end

subgraph Packages[&#x22;JavaScript Packages&#x22;]        Vite[&#x22;vite-plugin-ox-content&#x22;]        Vue[&#x22;vite-plugin-ox-content-vue&#x22;]        React[&#x22;vite-plugin-ox-content-react&#x22;]    end

subgraph NAPI[&#x22;Node.js Bindings&#x22;]        NapiPkg[&#x22;@ox-content/napi&#x22;]    end

subgraph Core[&#x22;Rust Core&#x22;]        Renderer[&#x22;oxcontentrenderer&#x22;]        Parser[&#x22;oxcontentparser&#x22;]        AST[&#x22;oxcontentast&#x22;]        Allocator[&#x22;oxcontentallocator&#x22;]    end

Applications --> Packages
    Packages --> NAPI
    NAPI --> Core
    Renderer --> AST
    Parser --> AST
    AST --> Allocator"><pre class="ox-mermaid-source">graph TB
    subgraph Applications["User Applications"]
        App1[Your App]
        App2[Documentation Site]
        App3[Blog]
    end

subgraph Packages["JavaScript Packages"]        Vite["vite-plugin-ox-content"]        Vue["vite-plugin-ox-content-vue"]        React["vite-plugin-ox-content-react"]    end

subgraph NAPI["Node.js Bindings"]        NapiPkg["@ox-content/napi"]    end

subgraph Core["Rust Core"]        Renderer["oxcontentrenderer"]        Parser["oxcontentparser"]        AST["oxcontentast"]        Allocator["oxcontentallocator"]    end

Applications --> Packages
    Packages --> NAPI
    NAPI --> Core
    Renderer --> AST
    Parser --> AST
    AST --> Allocator</pre></div>

<h2 id="crate-structure">Crate Structure</h2>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>ox-content/</span></span>
<span class="line"><span>├── crates/</span></span>
<span class="line"><span>│   ├── oxcontentallocator/   # Foundation: Arena allocator</span></span>
<span class="line"><span>│   ├── oxcontentast/         # Core: AST definitions</span></span>
<span class="line"><span>│   ├── oxcontentparser/      # Core: Markdown parser</span></span>
<span class="line"><span>│   ├── oxcontentrenderer/    # Core: HTML renderer</span></span>
<span class="line"><span>│   ├── oxcontentnapi/        # Bindings: Node.js via napi-rs</span></span>
<span class="line"><span>│   ├── oxcontentvite/        # Integration: Vite plugin</span></span>
<span class="line"><span>│   ├── oxcontentog_image/    # Feature: OG image generation</span></span>
<span class="line"><span>│   └── oxcontentdocs/        # Feature: Source code documentation</span></span>
<span class="line"><span>├── playground/                 # Interactive playground</span></span>
<span class="line"><span>└── docs/                       # Documentation (self-hosted)</span></span></code></pre>

<h2 id="memory-management">Memory Management</h2>

<h3 id="arena-allocation-with-bumpalo">Arena Allocation with bumpalo</h3>

<p>Ox Content uses <a href="https://docs.rs/bumpalo">bumpalo</a> for arena-based allocation. This is the key to our performance advantage.</p>

<h4 id="how-arena-allocation-works">How Arena Allocation Works</h4>

<div class="ox-mermaid" data-mermaid="graph LR
    subgraph Traditional[&#x22;Traditional Allocation&#x22;]
        direction TB
        A1[A] --> H1[Heap]
        B1[B] --> H2[Heap]
        C1[C] --> H3[Heap]
        D1[D] --> H4[Heap]
    end

subgraph Arena[&#x22;Arena Allocation&#x22;]
        direction TB
        Region[&#x22;Contiguous Memory Region&#x22;]
        A2[A] --> Region
        B2[B] --> Region
        C2[C] --> Region
        D2[D] --> Region
    end"><pre class="ox-mermaid-source">graph LR
    subgraph Traditional["Traditional Allocation"]
        direction TB
        A1[A] --> H1[Heap]
        B1[B] --> H2[Heap]
        C1[C] --> H3[Heap]
        D1[D] --> H4[Heap]
    end

subgraph Arena["Arena Allocation"]
        direction TB
        Region["Contiguous Memory Region"]
        A2[A] --> Region
        B2[B] --> Region
        C2[C] --> Region
        D2[D] --> Region
    end</pre></div>

<p><strong>Traditional</strong>: 4 separate heap allocations, 4 separate deallocations</p>

<p><strong>Arena</strong>: 1 contiguous region, 1 deallocation (drop arena)</p>

<h4 id="benefits">Benefits</h4>

<ul>
<li><strong>Fast Allocation</strong> - Just bump a pointer, no free list traversal</li>
<li><strong>Zero-Copy Parsing</strong> - AST nodes can reference source slices directly</li>
<li><strong>Efficient Deallocation</strong> - Drop the entire arena at once</li>
<li><strong>Cache-Friendly</strong> - Related data stored contiguously in memory</li>
<li><strong>No Fragmentation</strong> - Memory is allocated linearly</li>
</ul>

<h4 id="implementation">Implementation</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// oxcontentallocator/src/lib.rs</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> bumpalo</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Bump</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">/// Arena allocator for AST nodes.pub struct Allocator {    bump: Bump,}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">impl</span><span style="color:#5DA994"> Allocator</span><span style="color:#666666"> {</span><span style="color:#758575DD">    /// Creates a new allocator with default capacity.    pub fn new() -> Self {        Self { bump: Bump::new() }    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">/// Allocates a value in the arena.    pub fn alloc&#x3C;T>(&#x26;self, value: T) -> &#x26;mut T {        self.bump.alloc(value)    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">/// Allocates a string slice in the arena.    pub fn alloc_str(&#x26;self, s: &#x26;str) -> &#x26;str {        self.bump.alloc_str(s)    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">/// Creates a new Vec in the arena.    pub fn newvec&#x3C;T>(&#x26;self) -> Vec&#x3C;', T> {        Vec::new_in(&#x26;self.bump)    }}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Re-export arena-aware types with standard names</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> type</span><span style="color:#5DA994"> Box</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">,</span><span style="color:#5DA994"> T</span><span style="color:#666666">></span><span style="color:#666666"> =</span><span style="color:#80A665"> bumpalo</span><span style="color:#CB7676">::</span><span style="color:#80A665">boxed</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Box</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">,</span><span style="color:#5DA994"> T</span><span style="color:#666666">>;</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> type</span><span style="color:#5DA994"> Vec</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">,</span><span style="color:#5DA994"> T</span><span style="color:#666666">></span><span style="color:#666666"> =</span><span style="color:#80A665"> bumpalo</span><span style="color:#CB7676">::</span><span style="color:#80A665">collections</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Vec</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">,</span><span style="color:#5DA994"> T</span><span style="color:#666666">>;</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> type</span><span style="color:#5DA994"> String</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">></span><span style="color:#666666"> =</span><span style="color:#80A665"> bumpalo</span><span style="color:#CB7676">::</span><span style="color:#80A665">collections</span><span style="color:#CB7676">::</span><span style="color:#5DA994">String</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">>;</span></span></code></pre>

<h4 id="usage-pattern">Usage Pattern</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> process_markdown</span><span style="color:#666666">(</span><span style="color:#BD976A">source</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">str</span><span style="color:#666666">)</span><span style="color:#CB7676"> -></span><span style="color:#5DA994"> String</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#758575DD">    // Create arena - all allocations happen here</span></span>
<span class="line"><span style="color:#CB7676">    let</span><span style="color:#BD976A"> allocator</span><span style="color:#666666"> =</span><span style="color:#5DA994"> Allocator</span><span style="color:#CB7676">::</span><span style="color:#80A665">new</span><span style="color:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Parse document - AST allocated in arena    let parser = Parser::new(&#x26;allocator, source);    let document = parser.parse().unwrap();</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// Render to HTML - output is owned String    let mut renderer = HtmlRenderer::new();    let html = renderer.render(&#x26;document);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#BD976A">html</span></span>
<span class="line"><span style="color:#758575DD">    // allocator dropped here - all AST memory freed at once</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h2 id="ast-design">AST Design</h2>

<h3 id="mdast-specification">mdast Specification</h3>

<p>The AST follows the <a href="https://github.com/syntax-tree/mdast">mdast</a> specification, which is part of the <a href="https://unifiedjs.com/">unified</a> ecosystem. This ensures compatibility with existing tools and plugins.</p>

<h3 id="node-hierarchy">Node Hierarchy</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span>Document (root)</span></span>
<span class="line"><span>├── Block Nodes</span></span>
<span class="line"><span>│   ├── Paragraph</span></span>
<span class="line"><span>│   │   └── Inline Nodes...</span></span>
<span class="line"><span>│   ├── Heading (depth: 1-6)</span></span>
<span class="line"><span>│   │   └── Inline Nodes...</span></span>
<span class="line"><span>│   ├── CodeBlock (lang, meta, value)</span></span>
<span class="line"><span>│   ├── BlockQuote</span></span>
<span class="line"><span>│   │   └── Block Nodes...</span></span>
<span class="line"><span>│   ├── List (ordered, start, spread)</span></span>
<span class="line"><span>│   │   └── ListItem (checked)</span></span>
<span class="line"><span>│   │       └── Block Nodes...</span></span>
<span class="line"><span>│   ├── Table</span></span>
<span class="line"><span>│   │   └── TableRow</span></span>
<span class="line"><span>│   │       └── TableCell</span></span>
<span class="line"><span>│   │           └── Inline Nodes...</span></span>
<span class="line"><span>│   ├── ThematicBreak</span></span>
<span class="line"><span>│   └── Html (raw)</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>└── Inline Nodes</span></span>
<span class="line"><span>    ├── Text (value)</span></span>
<span class="line"><span>    ├── Emphasis</span></span>
<span class="line"><span>    │   └── Inline Nodes...</span></span>
<span class="line"><span>    ├── Strong</span></span>
<span class="line"><span>    │   └── Inline Nodes...</span></span>
<span class="line"><span>    ├── InlineCode (value)</span></span>
<span class="line"><span>    ├── Link (url, title)</span></span>
<span class="line"><span>    │   └── Inline Nodes...</span></span>
<span class="line"><span>    ├── Image (url, alt, title)</span></span>
<span class="line"><span>    ├── Break</span></span>
<span class="line"><span>    ├── Delete (GFM)</span></span>
<span class="line"><span>    │   └── Inline Nodes...</span></span>
<span class="line"><span>    └── FootnoteReference (identifier)</span></span></code></pre>

<h3 id="span-information">Span Information</h3>

<p>Every node includes source location information:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">/// Source span (byte offsets).</span></span>
<span class="line"><span style="color:#666666">#[</span><span style="color:#DBD7CAEE">derive</span><span style="color:#666666">(</span><span style="color:#5DA994">Debug</span><span style="color:#666666">,</span><span style="color:#5DA994"> Clone</span><span style="color:#666666">,</span><span style="color:#5DA994"> Copy</span><span style="color:#666666">)]</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> struct</span><span style="color:#5DA994"> Span</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#758575DD">    /// Start byte offset (inclusive).</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> start</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> u32</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// End byte offset (exclusive).</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> end</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> u32</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">impl</span><span style="color:#5DA994"> Span</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#4D9375"> fn</span><span style="color:#80A665"> new</span><span style="color:#666666">(</span><span style="color:#BD976A">start</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> u32</span><span style="color:#666666">,</span><span style="color:#BD976A"> end</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> u32</span><span style="color:#666666">)</span><span style="color:#CB7676"> -></span><span style="color:#C99076"> Self</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#C99076">        Self</span><span style="color:#666666"> {</span><span style="color:#BD976A"> start</span><span style="color:#666666">,</span><span style="color:#BD976A"> end</span><span style="color:#666666"> }</span></span>
<span class="line"><span style="color:#666666">    }</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

This enables:
<ul>
<li>Error messages with precise source locations</li>
<li>Source maps for debugging</li>
<li>Syntax highlighting in editors</li>
<li>Incremental re-parsing</li>
</ul>

<h3 id="visitor-pattern">Visitor Pattern</h3>

<p>The AST can be traversed using the visitor pattern:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">/// Trait for visiting AST nodes.</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> trait</span><span style="color:#5DA994"> Visit</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">></span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#4D9375">    fn</span><span style="color:#80A665"> visit_document</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;mut</span><span style="color:#C99076"> self</span><span style="color:#666666">,</span><span style="color:#BD976A"> document</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Document</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">>)</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#4D9375">        for</span><span style="color:#BD976A"> node</span><span style="color:#4D9375"> in</span><span style="color:#CB7676"> &#x26;</span><span style="color:#BD976A">document</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">children </span><span style="color:#666666">{</span></span>
<span class="line"><span style="color:#C99076">            self</span><span style="color:#CB7676">.</span><span style="color:#80A665">visit_node</span><span style="color:#666666">(</span><span style="color:#BD976A">node</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#666666">        }</span></span>
<span class="line"><span style="color:#666666">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> visit_node</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;mut</span><span style="color:#C99076"> self</span><span style="color:#666666">,</span><span style="color:#BD976A"> node</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Node</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">>)</span><span style="color:#666666"> {</span><span style="color:#4D9375">        match</span><span style="color:#BD976A"> node</span><span style="color:#666666"> {</span><span style="color:#5DA994">            Node</span><span style="color:#CB7676">::</span><span style="color:#80A665">Paragraph</span><span style="color:#666666">(</span><span style="color:#BD976A">n</span><span style="color:#666666">)</span><span style="color:#CB7676"> =></span><span style="color:#C99076"> self</span><span style="color:#CB7676">.</span><span style="color:#80A665">visit_paragraph</span><span style="color:#666666">(</span><span style="color:#BD976A">n</span><span style="color:#666666">),</span><span style="color:#5DA994">            Node</span><span style="color:#CB7676">::</span><span style="color:#80A665">Heading</span><span style="color:#666666">(</span><span style="color:#BD976A">n</span><span style="color:#666666">)</span><span style="color:#CB7676"> =></span><span style="color:#C99076"> self</span><span style="color:#CB7676">.</span><span style="color:#80A665">visit_heading</span><span style="color:#666666">(</span><span style="color:#BD976A">n</span><span style="color:#666666">),</span><span style="color:#5DA994">            Node</span><span style="color:#CB7676">::</span><span style="color:#80A665">CodeBlock</span><span style="color:#666666">(</span><span style="color:#BD976A">n</span><span style="color:#666666">)</span><span style="color:#CB7676"> =></span><span style="color:#C99076"> self</span><span style="color:#CB7676">.</span><span style="color:#80A665">visitcodeblock</span><span style="color:#666666">(</span><span style="color:#BD976A">n</span><span style="color:#666666">),</span><span style="color:#758575DD">            // ... other variants        }    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> visit_paragraph</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;mut</span><span style="color:#C99076"> self</span><span style="color:#666666">,</span><span style="color:#BD976A"> paragraph</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Paragraph</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">>)</span><span style="color:#666666"> {</span><span style="color:#4D9375">        for</span><span style="color:#BD976A"> child</span><span style="color:#4D9375"> in</span><span style="color:#CB7676"> &#x26;</span><span style="color:#BD976A">paragraph</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">children </span><span style="color:#666666">{</span><span style="color:#C99076">            self</span><span style="color:#CB7676">.</span><span style="color:#80A665">visit_node</span><span style="color:#666666">(</span><span style="color:#BD976A">child</span><span style="color:#666666">);</span><span style="color:#666666">        }</span><span style="color:#666666">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> visit_heading</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;mut</span><span style="color:#C99076"> self</span><span style="color:#666666">,</span><span style="color:#BD976A"> heading</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Heading</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">>)</span><span style="color:#666666"> {</span><span style="color:#4D9375">        for</span><span style="color:#BD976A"> child</span><span style="color:#4D9375"> in</span><span style="color:#CB7676"> &#x26;</span><span style="color:#BD976A">heading</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">children </span><span style="color:#666666">{</span><span style="color:#C99076">            self</span><span style="color:#CB7676">.</span><span style="color:#80A665">visit_node</span><span style="color:#666666">(</span><span style="color:#BD976A">child</span><span style="color:#666666">);</span><span style="color:#666666">        }</span><span style="color:#666666">    }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">// ... other visit methods with default implementations</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h4 id="example-table-of-contents-generator">Example: Table of Contents Generator</h4>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#4D9375">use</span><span style="color:#80A665"> oxcontentast</span><span style="color:#CB7676">::</span><span style="color:#666666">{</span><span style="color:#5DA994">Visit</span><span style="color:#666666">,</span><span style="color:#5DA994"> Document</span><span style="color:#666666">,</span><span style="color:#5DA994"> Heading</span><span style="color:#666666">,</span><span style="color:#5DA994"> Node</span><span style="color:#666666">,</span><span style="color:#5DA994"> Text</span><span style="color:#666666">};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">struct</span><span style="color:#5DA994"> TocGenerator</span><span style="color:#666666"> {</span><span style="color:#BD976A">    entries</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> Vec</span><span style="color:#666666">&#x3C;</span><span style="color:#5DA994">TocEntry</span><span style="color:#666666">>,}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">struct</span><span style="color:#5DA994"> TocEntry</span><span style="color:#666666"> {</span><span style="color:#BD976A">    depth</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> u8</span><span style="color:#666666">,</span><span style="color:#BD976A">    text</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> String</span><span style="color:#666666">,</span><span style="color:#BD976A">    id</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> String</span><span style="color:#666666">,}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">impl</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">></span><span style="color:#5DA994"> Visit</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">></span><span style="color:#4D9375"> for</span><span style="color:#5DA994"> TocGenerator</span><span style="color:#666666"> {</span><span style="color:#4D9375">    fn</span><span style="color:#80A665"> visit_heading</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;mut</span><span style="color:#C99076"> self</span><span style="color:#666666">,</span><span style="color:#BD976A"> heading</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Heading</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">a</span><span style="color:#666666">>)</span><span style="color:#666666"> {</span><span style="color:#CB7676">        let</span><span style="color:#CB7676"> mut</span><span style="color:#BD976A"> text</span><span style="color:#666666"> =</span><span style="color:#5DA994"> String</span><span style="color:#CB7676">::</span><span style="color:#80A665">new</span><span style="color:#666666">();</span><span style="color:#4D9375">        for</span><span style="color:#BD976A"> child</span><span style="color:#4D9375"> in</span><span style="color:#CB7676"> &#x26;</span><span style="color:#BD976A">heading</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">children </span><span style="color:#666666">{</span><span style="color:#4D9375">            if</span><span style="color:#CB7676"> let</span><span style="color:#5DA994"> Node</span><span style="color:#CB7676">::</span><span style="color:#80A665">Text</span><span style="color:#666666">(</span><span style="color:#BD976A">t</span><span style="color:#666666">)</span><span style="color:#666666"> =</span><span style="color:#BD976A"> child</span><span style="color:#666666"> {</span><span style="color:#BD976A">                text</span><span style="color:#CB7676">.</span><span style="color:#80A665">push_str</span><span style="color:#666666">(</span><span style="color:#BD976A">t</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">value</span><span style="color:#666666">);</span><span style="color:#666666">            }</span><span style="color:#666666">        }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> id</span><span style="color:#666666"> =</span><span style="color:#80A665"> slugify</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;</span><span style="color:#BD976A">text</span><span style="color:#666666">);</span><span style="color:#C99076">        self</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">entries</span><span style="color:#CB7676">.</span><span style="color:#80A665">push</span><span style="color:#666666">(</span><span style="color:#5DA994">TocEntry</span><span style="color:#666666"> {</span><span style="color:#BD976A">            depth</span><span style="color:#CB7676">:</span><span style="color:#BD976A"> heading</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">depth</span><span style="color:#666666">,</span><span style="color:#BD976A">            text</span><span style="color:#666666">,</span><span style="color:#BD976A">            id</span><span style="color:#666666">,</span><span style="color:#666666">        });</span><span style="color:#666666">    }}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> generatetoc</span><span style="color:#666666">(</span><span style="color:#BD976A">document</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Document</span><span style="color:#666666">&#x3C;</span><span style="color:#DBD7CAEE">'</span><span style="color:#666666">>)</span><span style="color:#CB7676"> -></span><span style="color:#5DA994"> Vec</span><span style="color:#666666">&#x3C;</span><span style="color:#5DA994">TocEntry</span><span style="color:#666666">></span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#CB7676">    let</span><span style="color:#CB7676"> mut</span><span style="color:#BD976A"> generator</span><span style="color:#666666"> =</span><span style="color:#5DA994"> TocGenerator</span><span style="color:#666666"> {</span><span style="color:#BD976A"> entries</span><span style="color:#CB7676">:</span><span style="color:#80A665"> vec!</span><span style="color:#666666">[]</span><span style="color:#666666"> };</span></span>
<span class="line"><span style="color:#BD976A">    generator</span><span style="color:#CB7676">.</span><span style="color:#80A665">visit_document</span><span style="color:#666666">(</span><span style="color:#BD976A">document</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#BD976A">    generator</span><span style="color:#CB7676">.</span><span style="color:#DBD7CAEE">entries</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h2 id="parser-design">Parser Design</h2>

<h3 id="architecture">Architecture</h3>

<div class="ox-mermaid" data-mermaid="flowchart TB
    Source[&#x22;Source Text<br/>(Markdown)&#x22;]
    Lexer[&#x22;Lexer<br/><small>Tokenizes input (logos crate)</small>&#x22;]
    Parser[&#x22;Parser<br/><small>Builds AST from tokens</small>&#x22;]
    AST[&#x22;AST<br/><small>Arena-allocated nodes</small>&#x22;]

Source --> Lexer
    Lexer --> Parser
    Parser --> AST"><pre class="ox-mermaid-source">flowchart TB
    Source["Source Text&#x3C;br/>(Markdown)"]
    Lexer["Lexer&#x3C;br/>&#x3C;small>Tokenizes input (logos crate)&#x3C;/small>"]
    Parser["Parser&#x3C;br/>&#x3C;small>Builds AST from tokens&#x3C;/small>"]
    AST["AST&#x3C;br/>&#x3C;small>Arena-allocated nodes&#x3C;/small>"]

Source --> Lexer
    Lexer --> Parser
    Parser --> AST</pre></div>

<h3 id="parser-options">Parser Options</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">/// Parser configuration options.</span></span>
<span class="line"><span style="color:#666666">#[</span><span style="color:#DBD7CAEE">derive</span><span style="color:#666666">(</span><span style="color:#5DA994">Debug</span><span style="color:#666666">,</span><span style="color:#5DA994"> Clone</span><span style="color:#666666">,</span><span style="color:#5DA994"> Default</span><span style="color:#666666">)]</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> struct</span><span style="color:#5DA994"> ParserOptions</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable GFM (GitHub Flavored Markdown) extensions.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> gfm</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable footnotes.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> footnotes</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable task lists.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> task_lists</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable tables.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> tables</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable strikethrough.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> strikethrough</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable autolinks.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> autolinks</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Maximum nesting depth for block elements.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> maxnestingdepth</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> usize</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">impl</span><span style="color:#5DA994"> ParserOptions</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#758575DD">    /// Creates options with all GFM extensions enabled.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#4D9375"> fn</span><span style="color:#80A665"> gfm</span><span style="color:#666666">()</span><span style="color:#CB7676"> -></span><span style="color:#C99076"> Self</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#C99076">        Self</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">            gfm</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">            footnotes</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">            task_lists</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">            tables</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">            strikethrough</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">            autolinks</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">            maxnestingdepth</span><span style="color:#CB7676">:</span><span style="color:#4C9A91"> 100</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">        }</span></span>
<span class="line"><span style="color:#666666">    }</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="parsing-strategy">Parsing Strategy</h3>

<ul>
<li><strong>Block-First</strong> - Parse block structure first (paragraphs, headings, etc.)</li>
<li><strong>Inline Later</strong> - Parse inline content within blocks</li>
<li><strong>Lazy Evaluation</strong> - Only parse what's needed</li>
<li><strong>Error Recovery</strong> - Continue parsing after errors when possible</li>
</ul>

<h3 id="commonmark-compliance">CommonMark Compliance</h3>

<p>The parser follows the <a href="https://spec.commonmark.org/">CommonMark spec</a>:</p>

<ul>
<li>ATX headings (<code># Heading</code>)</li>
<li>Setext headings (underlined)</li>
<li>Fenced code blocks (\`\`\` or ~~~)</li>
<li>Indented code blocks</li>
<li>Block quotes (<code>></code>)</li>
<li>Lists (ordered and unordered)</li>
<li>Thematic breaks (<code>---</code>, <code>***</code>, <code>___</code>)</li>
<li>Emphasis and strong emphasis</li>
<li>Links and images</li>
<li>Hard and soft line breaks</li>
</ul>

<h2 id="renderer-design">Renderer Design</h2>

<h3 id="html-renderer">HTML Renderer</h3>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">/// HTML renderer with customizable options.</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> struct</span><span style="color:#5DA994"> HtmlRenderer</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">    options</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> HtmlRendererOptions</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#BD976A">    output</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> String</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#758575DD">/// Renderer configuration.</span></span>
<span class="line"><span style="color:#666666">#[</span><span style="color:#DBD7CAEE">derive</span><span style="color:#666666">(</span><span style="color:#5DA994">Debug</span><span style="color:#666666">,</span><span style="color:#5DA994"> Clone</span><span style="color:#666666">)]</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> struct</span><span style="color:#5DA994"> HtmlRendererOptions</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#758575DD">    /// Use XHTML-style self-closing tags.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> xhtml</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Soft break string.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> soft_break</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> String</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Hard break string.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> hard_break</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> String</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Enable syntax highlighting.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> highlight</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#758575DD">    /// Sanitize HTML output.</span></span>
<span class="line"><span style="color:#4D9375">    pub</span><span style="color:#BD976A"> sanitize</span><span style="color:#CB7676">:</span><span style="color:#5DA994"> bool</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="renderer-trait">Renderer Trait</h3>

<p>Custom renderers can be implemented:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">/// Trait for rendering AST to output format.</span></span>
<span class="line"><span style="color:#4D9375">pub</span><span style="color:#CB7676"> trait</span><span style="color:#5DA994"> Renderer</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#CB7676">    type</span><span style="color:#5DA994"> Output</span><span style="color:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#4D9375">fn</span><span style="color:#80A665"> render</span><span style="color:#666666">(</span><span style="color:#CB7676">&#x26;mut</span><span style="color:#C99076"> self</span><span style="color:#666666">,</span><span style="color:#BD976A"> document</span><span style="color:#CB7676">:</span><span style="color:#CB7676"> &#x26;</span><span style="color:#5DA994">Document</span><span style="color:#666666">&#x3C;'</span><span style="color:#5DA994">_</span><span style="color:#666666">>)</span><span style="color:#CB7676"> -></span><span style="color:#5DA994"> RenderResult</span><span style="color:#666666">&#x3C;</span><span style="color:#C99076">Self</span><span style="color:#CB7676">::</span><span style="color:#5DA994">Output</span><span style="color:#666666">>;</span></span>
<span class="line"><span style="color:#666666">}</span></span></code></pre>

<h3 id="html-escaping">HTML Escaping</h3>

<p>The renderer properly escapes HTML entities:</p>

<table>
<thead><tr><th>Character</th><th>Entity</th></tr></thead>
<tbody>
<tr><td><code>&#x26;</code></td><td><code>&#x26;</code></td></tr>
<tr><td><code>&#x3C;</code></td><td><code>&#x3C;</code></td></tr>
<tr><td><code>></code></td><td><code>></code></td></tr>
<tr><td><code>"</code></td><td><code>"</code></td></tr>
<tr><td><code>'</code></td><td><code>'</code></td></tr>
</tbody>
</table>

<p>URL encoding is also handled for link/image URLs.</p>

<h2 id="napi-bindings">NAPI Bindings</h2>

<h3 id="architecture">Architecture</h3>

<div class="ox-mermaid" data-mermaid="flowchart TB
    JS[&#x22;JavaScript / TypeScript&#x22;]
    NPM[&#x22;@ox-content/napi<br/><small>TypeScript types + JS wrapper</small>&#x22;]
    NAPI[&#x22;oxcontentnapi<br/><small>Rust NAPI binding layer</small>&#x22;]
    Core[&#x22;oxcontent*<br/><small>Core Rust crates</small>&#x22;]

JS --> NPM
    NPM --> NAPI
    NAPI --> Core"><pre class="ox-mermaid-source">flowchart TB
    JS["JavaScript / TypeScript"]
    NPM["@ox-content/napi&#x3C;br/>&#x3C;small>TypeScript types + JS wrapper&#x3C;/small>"]
    NAPI["oxcontentnapi&#x3C;br/>&#x3C;small>Rust NAPI binding layer&#x3C;/small>"]
    Core["oxcontent*&#x3C;br/>&#x3C;small>Core Rust crates&#x3C;/small>"]

JS --> NPM
    NPM --> NAPI
    NAPI --> Core</pre></div>

<h3 id="data-transfer">Data Transfer</h3>

<ul>
<li>AST is serialized to JSON for JavaScript interop</li>
<li>HTML rendering happens in Rust for maximum performance</li>
<li>Async support for large documents</li>
</ul>

<h3 id="thread-safety">Thread Safety</h3>

The NAPI bindings are designed to be thread-safe:
<ul>
<li>Each parse operation creates its own allocator</li>
<li>No shared mutable state between calls</li>
</ul>

<h2 id="vite-integration">Vite Integration</h2>

<h3 id="environment-api">Environment API</h3>

<p>Ox Content integrates with Vite's Environment API for SSG:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#758575DD">// Creates a server-side environment for Markdown processing</span></span>
<span class="line"><span style="color:#CB7676">const </span><span style="color:#BD976A">mdEnv</span><span style="color:#666666"> =</span><span style="color:#CB7676"> new </span><span style="color:#80A665">Environment</span><span style="color:#666666">(</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">markdown</span><span style="color:#C98A7D77">'</span><span style="color:#666666">,</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#758575DD">  // Custom module resolution for .md files</span></span>
<span class="line"><span style="color:#B8A965">  resolve</span><span style="color:#666666">: {</span></span>
<span class="line"><span style="color:#B8A965">    extensions</span><span style="color:#666666">: [</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">.md</span><span style="color:#C98A7D77">'</span><span style="color:#666666">],</span></span>
<span class="line"><span style="color:#666666">  },</span></span>
<span class="line"><span style="color:#758575DD">  // Transform .md to JS modules</span></span>
<span class="line"><span style="color:#80A665">  transform</span><span style="color:#666666">: </span><span style="color:#CB7676">async</span><span style="color:#666666"> (</span><span style="color:#BD976A">code</span><span style="color:#666666">, </span><span style="color:#BD976A">id</span><span style="color:#666666">) => {</span></span>
<span class="line"><span style="color:#4D9375">    if</span><span style="color:#666666"> (</span><span style="color:#BD976A">id</span><span style="color:#666666">.</span><span style="color:#80A665">endsWith</span><span style="color:#666666">(</span><span style="color:#C98A7D77">'</span><span style="color:#C98A7D">.md</span><span style="color:#C98A7D77">'</span><span style="color:#666666">)) {</span></span>
<span class="line"><span style="color:#CB7676">      const </span><span style="color:#BD976A">result</span><span style="color:#666666"> =</span><span style="color:#4D9375"> await</span><span style="color:#80A665"> parseAndRender</span><span style="color:#666666">(</span><span style="color:#BD976A">code</span><span style="color:#666666">);</span></span>
<span class="line"><span style="color:#4D9375">      return</span><span style="color:#BD976A"> export</span><span style="color:#BD976A"> default</span><span style="color:#BD976A"> $</span><span style="color:#666666">{JSON.stringify(result)};</span></span>
<span class="line"><span style="color:#666666">    }</span></span>
<span class="line"><span style="color:#666666">  },</span></span>
<span class="line"><span style="color:#666666">});</span></span></code></pre>

<h3 id="hot-module-replacement">Hot Module Replacement</h3>

<p>The Vite plugin supports HMR for Markdown files:</p>

<ul>
<li>File change detected</li>
<li>Re-parse changed file</li>
<li>Send update to client</li>
<li>Update rendered content without full reload</li>
</ul>

<h2 id="performance-characteristics">Performance Characteristics</h2>

<h3 id="memory-usage">Memory Usage</h3>

<table>
<thead><tr><th>Content Size</th><th>Traditional Parser</th><th>Ox Content</th></tr></thead>
<tbody>
<tr><td>1 KB</td><td>~50 KB heap</td><td>~8 KB arena</td></tr>
<tr><td>10 KB</td><td>~500 KB heap</td><td>~80 KB arena</td></tr>
<tr><td>100 KB</td><td>~5 MB heap</td><td>~800 KB arena</td></tr>
</tbody>
</table>

<h3 id="parse-speed-approximate">Parse Speed (approximate)</h3>

<table>
<thead><tr><th>Content Size</th><th>Traditional Parser</th><th>Ox Content</th></tr></thead>
<tbody>
<tr><td>1 KB</td><td>~1 ms</td><td>~0.1 ms</td></tr>
<tr><td>10 KB</td><td>~10 ms</td><td>~1 ms</td></tr>
<tr><td>100 KB</td><td>~100 ms</td><td>~10 ms</td></tr>
</tbody>
</table>

<p><em>Benchmarks vary by content complexity and hardware.</em></p>

<h2 id="security-considerations">Security Considerations</h2>

<h3 id="html-sanitization">HTML Sanitization</h3>

<p>When rendering untrusted Markdown, enable sanitization:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> options</span><span style="color:#666666"> =</span><span style="color:#5DA994"> HtmlRendererOptions</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">    sanitize</span><span style="color:#CB7676">:</span><span style="color:#4D9375"> true</span><span style="color:#666666">,</span></span>
<span class="line"><span style="color:#CB7676">    ..</span><span style="color:#5DA994">Default</span><span style="color:#CB7676">::</span><span style="color:#80A665">default</span><span style="color:#666666">()</span></span>
<span class="line"><span style="color:#666666">};</span></span>
<span class="line"><span style="color:#CB7676">let</span><span style="color:#CB7676"> mut</span><span style="color:#BD976A"> renderer</span><span style="color:#666666"> =</span><span style="color:#5DA994"> HtmlRenderer</span><span style="color:#CB7676">::</span><span style="color:#80A665">with_options</span><span style="color:#666666">(</span><span style="color:#BD976A">options</span><span style="color:#666666">);</span></span></code></pre>

<h3 id="nesting-limits">Nesting Limits</h3>

<p>The parser enforces maximum nesting depth to prevent stack overflow:</p>

<pre class="shiki vitesse-dark" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#CB7676">let</span><span style="color:#BD976A"> options</span><span style="color:#666666"> =</span><span style="color:#5DA994"> ParserOptions</span><span style="color:#666666"> {</span></span>
<span class="line"><span style="color:#BD976A">    maxnestingdepth</span><span style="color:#CB7676">:</span><span style="color:#4C9A91"> 50</span><span style="color:#666666">,</span><span style="color:#758575DD">  // Limit nesting</span></span>
<span class="line"><span style="color:#CB7676">    ..</span><span style="color:#5DA994">Default</span><span style="color:#CB7676">::</span><span style="color:#80A665">default</span><span style="color:#666666">()</span></span>
<span class="line"><span style="color:#666666">};</span></span></code></pre>

<h3 id="input-validation">Input Validation</h3>

<ul>
<li>Maximum input size limits</li>
<li>Invalid UTF-8 handling</li>
<li>Malformed Markdown graceful handling</li>
</ul>

<h2 id="future-directions">Future Directions</h2>

<ul>
<li><strong>Incremental Parsing</strong> - Re-parse only changed portions</li>
<li><strong>Streaming Parser</strong> - Parse large documents in chunks</li>
<li><strong>WASM Build</strong> - Run in browsers without NAPI</li>
<li><strong>Custom Syntax Extensions</strong> - Plugin system for custom blocks</li>
<li><strong>Source Maps</strong> - Full source map generation</li>
</ul></div>`,n={},a=[{depth:1,text:"Architecture",slug:"architecture",children:[{depth:2,text:"Overview",slug:"overview",children:[]},{depth:2,text:"Crate Structure",slug:"crate-structure",children:[]},{depth:2,text:"Memory Management",slug:"memory-management",children:[{depth:3,text:"Arena Allocation with bumpalo",slug:"arena-allocation-with-bumpalo",children:[]}]},{depth:2,text:"AST Design",slug:"ast-design",children:[{depth:3,text:"mdast Specification",slug:"mdast-specification",children:[]},{depth:3,text:"Node Hierarchy",slug:"node-hierarchy",children:[]},{depth:3,text:"Span Information",slug:"span-information",children:[]},{depth:3,text:"Visitor Pattern",slug:"visitor-pattern",children:[]}]},{depth:2,text:"Parser Design",slug:"parser-design",children:[{depth:3,text:"Architecture",slug:"architecture",children:[]},{depth:3,text:"Parser Options",slug:"parser-options",children:[]},{depth:3,text:"Parsing Strategy",slug:"parsing-strategy",children:[]},{depth:3,text:"CommonMark Compliance",slug:"commonmark-compliance",children:[]}]},{depth:2,text:"Renderer Design",slug:"renderer-design",children:[{depth:3,text:"HTML Renderer",slug:"html-renderer",children:[]},{depth:3,text:"Renderer Trait",slug:"renderer-trait",children:[]},{depth:3,text:"HTML Escaping",slug:"html-escaping",children:[]}]},{depth:2,text:"NAPI Bindings",slug:"napi-bindings",children:[{depth:3,text:"Architecture",slug:"architecture",children:[]},{depth:3,text:"Data Transfer",slug:"data-transfer",children:[]},{depth:3,text:"Thread Safety",slug:"thread-safety",children:[]}]},{depth:2,text:"Vite Integration",slug:"vite-integration",children:[{depth:3,text:"Environment API",slug:"environment-api",children:[]},{depth:3,text:"Hot Module Replacement",slug:"hot-module-replacement",children:[]}]},{depth:2,text:"Performance Characteristics",slug:"performance-characteristics",children:[{depth:3,text:"Memory Usage",slug:"memory-usage",children:[]},{depth:3,text:"Parse Speed (approximate)",slug:"parse-speed-approximate",children:[]}]},{depth:2,text:"Security Considerations",slug:"security-considerations",children:[{depth:3,text:"HTML Sanitization",slug:"html-sanitization",children:[]},{depth:3,text:"Nesting Limits",slug:"nesting-limits",children:[]},{depth:3,text:"Input Validation",slug:"input-validation",children:[]}]},{depth:2,text:"Future Directions",slug:"future-directions",children:[]}]}],l={html:s,frontmatter:n,toc:a};export{l as default,n as frontmatter,s as html,a as toc};
