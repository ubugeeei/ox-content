# Architecture

This document provides a deep dive into the architecture and design decisions of Ox Content.

## Overview

Ox Content is designed as a modular, high-performance Markdown processing toolkit. The architecture follows the Oxc philosophy of prioritizing speed, memory efficiency, and correctness.

<svg width="600" height="480" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
    </marker>
  </defs>
  <!-- User Applications -->
  <rect x="40" y="20" width="520" height="80" rx="8" fill="#e8f4f8" stroke="#5ba3c0" stroke-width="2"/>
  <text x="300" y="45" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2c7a9c">User Applications</text>
  <rect x="60" y="55" width="100" height="35" rx="4" fill="#fff" stroke="#5ba3c0"/>
  <text x="110" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#333">Your App</text>
  <rect x="180" y="55" width="140" height="35" rx="4" fill="#fff" stroke="#5ba3c0"/>
  <text x="250" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#333">Documentation Site</text>
  <rect x="340" y="55" width="100" height="35" rx="4" fill="#fff" stroke="#5ba3c0"/>
  <text x="390" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#333">Blog</text>
  <!-- JavaScript Packages -->
  <rect x="40" y="130" width="520" height="80" rx="8" fill="#f0e8f8" stroke="#9b59b6" stroke-width="2"/>
  <text x="300" y="155" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#7d3c98">JavaScript Packages</text>
  <rect x="60" y="165" width="160" height="35" rx="4" fill="#fff" stroke="#9b59b6"/>
  <text x="140" y="188" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">vite-plugin-ox-content</text>
  <rect x="240" y="165" width="180" height="35" rx="4" fill="#fff" stroke="#9b59b6"/>
  <text x="330" y="188" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">vite-plugin-ox-content-vue</text>
  <rect x="440" y="165" width="100" height="35" rx="4" fill="#fff" stroke="#9b59b6"/>
  <text x="490" y="188" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">...-react</text>
  <!-- NAPI -->
  <rect x="40" y="240" width="520" height="60" rx="8" fill="#fef9e7" stroke="#f39c12" stroke-width="2"/>
  <text x="300" y="265" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#b7950b">Node.js Bindings</text>
  <rect x="200" y="275" width="200" height="20" rx="4" fill="#fff" stroke="#f39c12"/>
  <text x="300" y="290" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">@ox-content/napi</text>
  <!-- Rust Core -->
  <rect x="40" y="330" width="520" height="130" rx="8" fill="#fdebd0" stroke="#e67e22" stroke-width="2"/>
  <text x="300" y="355" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ca6f1e">Rust Core</text>
  <rect x="60" y="370" width="140" height="35" rx="4" fill="#fff" stroke="#e67e22"/>
  <text x="130" y="393" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">ox_content_renderer</text>
  <rect x="220" y="370" width="140" height="35" rx="4" fill="#fff" stroke="#e67e22"/>
  <text x="290" y="393" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">ox_content_parser</text>
  <rect x="150" y="420" width="130" height="30" rx="4" fill="#fff" stroke="#e67e22"/>
  <text x="215" y="440" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">ox_content_ast</text>
  <rect x="300" y="420" width="150" height="30" rx="4" fill="#fff" stroke="#e67e22"/>
  <text x="375" y="440" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">ox_content_allocator</text>
  <!-- Arrows -->
  <line x1="300" y1="100" x2="300" y2="125" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="300" y1="210" x2="300" y2="235" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="300" y1="300" x2="300" y2="325" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="130" y1="405" x2="180" y2="420" stroke="#666" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="290" y1="405" x2="240" y2="420" stroke="#666" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="280" y1="435" x2="300" y2="435" stroke="#666" stroke-width="1.5" marker-end="url(#arrow)"/>
</svg>

## Crate Structure

```
ox-content/
├── crates/
│   ├── ox_content_allocator/   # Foundation: Arena allocator
│   ├── ox_content_ast/         # Core: AST definitions
│   ├── ox_content_parser/      # Core: Markdown parser
│   ├── ox_content_renderer/    # Core: HTML renderer
│   ├── ox_content_napi/        # Bindings: Node.js via napi-rs
│   ├── ox_content_vite/        # Integration: Vite plugin
│   ├── ox_content_og_image/    # Feature: OG image generation
│   └── ox_content_docs/        # Feature: Source code documentation
├── playground/                 # Interactive playground
└── docs/                       # Documentation (self-hosted)
```

## Memory Management

### Arena Allocation with bumpalo

Ox Content uses [bumpalo](https://docs.rs/bumpalo) for arena-based allocation. This is the key to our performance advantage.

#### How Arena Allocation Works

<svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow2" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L8,3 z" fill="#666"/>
    </marker>
  </defs>
  <!-- Traditional Allocation -->
  <rect x="20" y="20" width="260" height="160" rx="8" fill="#fce4ec" stroke="#e91e63" stroke-width="2"/>
  <text x="150" y="45" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#880e4f">Traditional Allocation</text>
  <rect x="40" y="65" width="30" height="25" rx="3" fill="#fff" stroke="#e91e63"/>
  <text x="55" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">A</text>
  <rect x="40" y="100" width="30" height="25" rx="3" fill="#fff" stroke="#e91e63"/>
  <text x="55" y="117" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">B</text>
  <rect x="40" y="135" width="30" height="25" rx="3" fill="#fff" stroke="#e91e63"/>
  <text x="55" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">C</text>
  <line x1="70" y1="77" x2="120" y2="77" stroke="#666" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <line x1="70" y1="112" x2="160" y2="112" stroke="#666" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <line x1="70" y1="147" x2="200" y2="147" stroke="#666" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <rect x="130" y="65" width="50" height="25" rx="3" fill="#ffcdd2" stroke="#e91e63"/>
  <text x="155" y="82" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#333">Heap</text>
  <rect x="170" y="100" width="50" height="25" rx="3" fill="#ffcdd2" stroke="#e91e63"/>
  <text x="195" y="117" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#333">Heap</text>
  <rect x="210" y="135" width="50" height="25" rx="3" fill="#ffcdd2" stroke="#e91e63"/>
  <text x="235" y="152" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#333">Heap</text>
  <!-- Arena Allocation -->
  <rect x="320" y="20" width="260" height="160" rx="8" fill="#e8f5e9" stroke="#4caf50" stroke-width="2"/>
  <text x="450" y="45" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1b5e20">Arena Allocation</text>
  <rect x="340" y="65" width="30" height="25" rx="3" fill="#fff" stroke="#4caf50"/>
  <text x="355" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">A</text>
  <rect x="340" y="100" width="30" height="25" rx="3" fill="#fff" stroke="#4caf50"/>
  <text x="355" y="117" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">B</text>
  <rect x="340" y="135" width="30" height="25" rx="3" fill="#fff" stroke="#4caf50"/>
  <text x="355" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#333">C</text>
  <line x1="370" y1="77" x2="410" y2="100" stroke="#666" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <line x1="370" y1="112" x2="410" y2="112" stroke="#666" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <line x1="370" y1="147" x2="410" y2="124" stroke="#666" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <rect x="420" y="70" width="140" height="80" rx="4" fill="#c8e6c9" stroke="#4caf50" stroke-width="2"/>
  <text x="490" y="115" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1b5e20">Contiguous Memory</text>
</svg>

**Traditional**: 4 separate heap allocations, 4 separate deallocations

**Arena**: 1 contiguous region, 1 deallocation (drop arena)

#### Benefits

1. **Fast Allocation** - Just bump a pointer, no free list traversal
2. **Zero-Copy Parsing** - AST nodes can reference source slices directly
3. **Efficient Deallocation** - Drop the entire arena at once
4. **Cache-Friendly** - Related data stored contiguously in memory
5. **No Fragmentation** - Memory is allocated linearly

#### Implementation

```rust
// ox_content_allocator/src/lib.rs

use bumpalo::Bump;

/// Arena allocator for AST nodes.
pub struct Allocator {
    bump: Bump,
}

impl Allocator {
    /// Creates a new allocator with default capacity.
    pub fn new() -> Self {
        Self { bump: Bump::new() }
    }

    /// Allocates a value in the arena.
    pub fn alloc<T>(&self, value: T) -> &mut T {
        self.bump.alloc(value)
    }

    /// Allocates a string slice in the arena.
    pub fn alloc_str(&self, s: &str) -> &str {
        self.bump.alloc_str(s)
    }

    /// Creates a new Vec in the arena.
    pub fn new_vec<T>(&self) -> Vec<'_, T> {
        Vec::new_in(&self.bump)
    }
}

// Re-export arena-aware types with standard names
pub type Box<'a, T> = bumpalo::boxed::Box<'a, T>;
pub type Vec<'a, T> = bumpalo::collections::Vec<'a, T>;
pub type String<'a> = bumpalo::collections::String<'a>;
```

#### Usage Pattern

```rust
fn process_markdown(source: &str) -> String {
    // Create arena - all allocations happen here
    let allocator = Allocator::new();

    // Parse document - AST allocated in arena
    let parser = Parser::new(&allocator, source);
    let document = parser.parse().unwrap();

    // Render to HTML - output is owned String
    let mut renderer = HtmlRenderer::new();
    let html = renderer.render(&document);

    html
    // allocator dropped here - all AST memory freed at once
}
```

## AST Design

### mdast Specification

The AST follows the [mdast](https://github.com/syntax-tree/mdast) specification, which is part of the [unified](https://unifiedjs.com/) ecosystem. This ensures compatibility with existing tools and plugins.

### Node Hierarchy

```
Document (root)
├── Block Nodes
│   ├── Paragraph
│   │   └── Inline Nodes...
│   ├── Heading (depth: 1-6)
│   │   └── Inline Nodes...
│   ├── CodeBlock (lang, meta, value)
│   ├── BlockQuote
│   │   └── Block Nodes...
│   ├── List (ordered, start, spread)
│   │   └── ListItem (checked)
│   │       └── Block Nodes...
│   ├── Table
│   │   └── TableRow
│   │       └── TableCell
│   │           └── Inline Nodes...
│   ├── ThematicBreak
│   └── Html (raw)
│
└── Inline Nodes
    ├── Text (value)
    ├── Emphasis
    │   └── Inline Nodes...
    ├── Strong
    │   └── Inline Nodes...
    ├── InlineCode (value)
    ├── Link (url, title)
    │   └── Inline Nodes...
    ├── Image (url, alt, title)
    ├── Break
    ├── Delete (GFM)
    │   └── Inline Nodes...
    └── FootnoteReference (identifier)
```

### Span Information

Every node includes source location information:

```rust
/// Source span (byte offsets).
#[derive(Debug, Clone, Copy)]
pub struct Span {
    /// Start byte offset (inclusive).
    pub start: u32,
    /// End byte offset (exclusive).
    pub end: u32,
}

impl Span {
    pub fn new(start: u32, end: u32) -> Self {
        Self { start, end }
    }
}
```

This enables:
- Error messages with precise source locations
- Source maps for debugging
- Syntax highlighting in editors
- Incremental re-parsing

### Visitor Pattern

The AST can be traversed using the visitor pattern:

```rust
/// Trait for visiting AST nodes.
pub trait Visit<'a> {
    fn visit_document(&mut self, document: &Document<'a>) {
        for node in &document.children {
            self.visit_node(node);
        }
    }

    fn visit_node(&mut self, node: &Node<'a>) {
        match node {
            Node::Paragraph(n) => self.visit_paragraph(n),
            Node::Heading(n) => self.visit_heading(n),
            Node::CodeBlock(n) => self.visit_code_block(n),
            // ... other variants
        }
    }

    fn visit_paragraph(&mut self, paragraph: &Paragraph<'a>) {
        for child in &paragraph.children {
            self.visit_node(child);
        }
    }

    fn visit_heading(&mut self, heading: &Heading<'a>) {
        for child in &heading.children {
            self.visit_node(child);
        }
    }

    // ... other visit methods with default implementations
}
```

#### Example: Table of Contents Generator

```rust
use ox_content_ast::{Visit, Document, Heading, Node, Text};

struct TocGenerator {
    entries: Vec<TocEntry>,
}

struct TocEntry {
    depth: u8,
    text: String,
    id: String,
}

impl<'a> Visit<'a> for TocGenerator {
    fn visit_heading(&mut self, heading: &Heading<'a>) {
        let mut text = String::new();
        for child in &heading.children {
            if let Node::Text(t) = child {
                text.push_str(t.value);
            }
        }

        let id = slugify(&text);
        self.entries.push(TocEntry {
            depth: heading.depth,
            text,
            id,
        });
    }
}

fn generate_toc(document: &Document<'_>) -> Vec<TocEntry> {
    let mut generator = TocGenerator { entries: vec![] };
    generator.visit_document(document);
    generator.entries
}
```

## Parser Design

### Architecture

<svg width="500" height="280" viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
    </marker>
  </defs>
  <!-- Source Text -->
  <rect x="175" y="20" width="150" height="50" rx="8" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
  <text x="250" y="42" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0d47a1">Source Text</text>
  <text x="250" y="58" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">(Markdown)</text>
  <!-- Arrow -->
  <line x1="250" y1="70" x2="250" y2="90" stroke="#666" stroke-width="2" marker-end="url(#arrow3)"/>
  <!-- Lexer -->
  <rect x="150" y="95" width="200" height="50" rx="8" fill="#fff3e0" stroke="#ff9800" stroke-width="2"/>
  <text x="250" y="117" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e65100">Lexer</text>
  <text x="250" y="133" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">Tokenizes input (logos crate)</text>
  <!-- Arrow -->
  <line x1="250" y1="145" x2="250" y2="165" stroke="#666" stroke-width="2" marker-end="url(#arrow3)"/>
  <!-- Parser -->
  <rect x="150" y="170" width="200" height="50" rx="8" fill="#f3e5f5" stroke="#9c27b0" stroke-width="2"/>
  <text x="250" y="192" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#6a1b9a">Parser</text>
  <text x="250" y="208" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">Builds AST from tokens</text>
  <!-- Arrow -->
  <line x1="250" y1="220" x2="250" y2="240" stroke="#666" stroke-width="2" marker-end="url(#arrow3)"/>
  <!-- AST -->
  <rect x="150" y="245" width="200" height="50" rx="8" fill="#e8f5e9" stroke="#4caf50" stroke-width="2"/>
  <text x="250" y="267" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1b5e20">AST</text>
  <text x="250" y="283" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">Arena-allocated nodes</text>
</svg>

### Parser Options

```rust
/// Parser configuration options.
#[derive(Debug, Clone, Default)]
pub struct ParserOptions {
    /// Enable GFM (GitHub Flavored Markdown) extensions.
    pub gfm: bool,
    /// Enable footnotes.
    pub footnotes: bool,
    /// Enable task lists.
    pub task_lists: bool,
    /// Enable tables.
    pub tables: bool,
    /// Enable strikethrough.
    pub strikethrough: bool,
    /// Enable autolinks.
    pub autolinks: bool,
    /// Maximum nesting depth for block elements.
    pub max_nesting_depth: usize,
}

impl ParserOptions {
    /// Creates options with all GFM extensions enabled.
    pub fn gfm() -> Self {
        Self {
            gfm: true,
            footnotes: true,
            task_lists: true,
            tables: true,
            strikethrough: true,
            autolinks: true,
            max_nesting_depth: 100,
        }
    }
}
```

### Parsing Strategy

1. **Block-First** - Parse block structure first (paragraphs, headings, etc.)
2. **Inline Later** - Parse inline content within blocks
3. **Lazy Evaluation** - Only parse what's needed
4. **Error Recovery** - Continue parsing after errors when possible

### CommonMark Compliance

The parser follows the [CommonMark spec](https://spec.commonmark.org/):

- ATX headings (`# Heading`)
- Setext headings (underlined)
- Fenced code blocks (``` or ~~~)
- Indented code blocks
- Block quotes (`>`)
- Lists (ordered and unordered)
- Thematic breaks (`---`, `***`, `___`)
- Emphasis and strong emphasis
- Links and images
- Hard and soft line breaks

## Renderer Design

### HTML Renderer

```rust
/// HTML renderer with customizable options.
pub struct HtmlRenderer {
    options: HtmlRendererOptions,
    output: String,
}

/// Renderer configuration.
#[derive(Debug, Clone)]
pub struct HtmlRendererOptions {
    /// Use XHTML-style self-closing tags.
    pub xhtml: bool,
    /// Soft break string.
    pub soft_break: String,
    /// Hard break string.
    pub hard_break: String,
    /// Enable syntax highlighting.
    pub highlight: bool,
    /// Sanitize HTML output.
    pub sanitize: bool,
}
```

### Renderer Trait

Custom renderers can be implemented:

```rust
/// Trait for rendering AST to output format.
pub trait Renderer {
    type Output;

    fn render(&mut self, document: &Document<'_>) -> RenderResult<Self::Output>;
}
```

### HTML Escaping

The renderer properly escapes HTML entities:

| Character | Entity |
|-----------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

URL encoding is also handled for link/image URLs.

## NAPI Bindings

### Architecture

<svg width="400" height="280" viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
    </marker>
  </defs>
  <!-- JavaScript / TypeScript -->
  <rect x="100" y="15" width="200" height="45" rx="8" fill="#fff9c4" stroke="#fbc02d" stroke-width="2"/>
  <text x="200" y="42" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f57f17">JavaScript / TypeScript</text>
  <!-- Arrow -->
  <line x1="200" y1="60" x2="200" y2="75" stroke="#666" stroke-width="2" marker-end="url(#arrow4)"/>
  <!-- NPM Package -->
  <rect x="75" y="80" width="250" height="50" rx="8" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
  <text x="200" y="102" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0d47a1">@ox-content/napi</text>
  <text x="200" y="118" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">TypeScript types + JS wrapper</text>
  <!-- Arrow -->
  <line x1="200" y1="130" x2="200" y2="145" stroke="#666" stroke-width="2" marker-end="url(#arrow4)"/>
  <!-- NAPI Binding -->
  <rect x="75" y="150" width="250" height="50" rx="8" fill="#fff3e0" stroke="#ff9800" stroke-width="2"/>
  <text x="200" y="172" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e65100">ox_content_napi</text>
  <text x="200" y="188" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">Rust NAPI binding layer</text>
  <!-- Arrow -->
  <line x1="200" y1="200" x2="200" y2="215" stroke="#666" stroke-width="2" marker-end="url(#arrow4)"/>
  <!-- Core -->
  <rect x="75" y="220" width="250" height="50" rx="8" fill="#fce4ec" stroke="#e91e63" stroke-width="2"/>
  <text x="200" y="242" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#880e4f">ox_content_*</text>
  <text x="200" y="258" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">Core Rust crates</text>
</svg>

### Data Transfer

- AST is serialized to JSON for JavaScript interop
- HTML rendering happens in Rust for maximum performance
- Async support for large documents

### Thread Safety

The NAPI bindings are designed to be thread-safe:
- Each parse operation creates its own allocator
- No shared mutable state between calls

## Vite Integration

### Environment API

Ox Content integrates with Vite's Environment API for SSG:

```typescript
// Creates a server-side environment for Markdown processing
const mdEnv = new Environment('markdown', {
  // Custom module resolution for .md files
  resolve: {
    extensions: ['.md'],
  },
  // Transform .md to JS modules
  transform: async (code, id) => {
    if (id.endsWith('.md')) {
      const result = await parseAndRender(code);
      return `export default ${JSON.stringify(result)}`;
    }
  },
});
```

### Hot Module Replacement

The Vite plugin supports HMR for Markdown files:

1. File change detected
2. Re-parse changed file
3. Send update to client
4. Update rendered content without full reload

## Performance Characteristics

### Memory Usage

| Content Size | Traditional Parser | Ox Content |
|-------------|-------------------|------------|
| 1 KB | ~50 KB heap | ~8 KB arena |
| 10 KB | ~500 KB heap | ~80 KB arena |
| 100 KB | ~5 MB heap | ~800 KB arena |

### Parse Speed (approximate)

| Content Size | Traditional Parser | Ox Content |
|-------------|-------------------|------------|
| 1 KB | ~1 ms | ~0.1 ms |
| 10 KB | ~10 ms | ~1 ms |
| 100 KB | ~100 ms | ~10 ms |

*Benchmarks vary by content complexity and hardware.*

## Security Considerations

### HTML Sanitization

When rendering untrusted Markdown, enable sanitization:

```rust
let options = HtmlRendererOptions {
    sanitize: true,
    ..Default::default()
};
let mut renderer = HtmlRenderer::with_options(options);
```

### Nesting Limits

The parser enforces maximum nesting depth to prevent stack overflow:

```rust
let options = ParserOptions {
    max_nesting_depth: 50,  // Limit nesting
    ..Default::default()
};
```

### Input Validation

- Maximum input size limits
- Invalid UTF-8 handling
- Malformed Markdown graceful handling

## Future Directions

- **Incremental Parsing** - Re-parse only changed portions
- **Streaming Parser** - Parse large documents in chunks
- **WASM Build** - Run in browsers without NAPI
- **Custom Syntax Extensions** - Plugin system for custom blocks
- **Source Maps** - Full source map generation
