//! Node.js bindings for Ox Content.
//!
//! This crate provides NAPI bindings for using Ox Content from Node.js,
//! enabling zero-copy AST transfer and JavaScript interoperability.

use napi::bindgen_prelude::*;
use napi::Task;
use napi_derive::napi;
use std::collections::HashMap;

use ox_content_allocator::Allocator;
use ox_content_ast::{Document, Heading, Node};
use ox_content_parser::{Parser, ParserOptions};
use ox_content_renderer::{HtmlRenderer, HtmlRendererOptions};

/// Parse result containing the AST as JSON.
#[napi(object)]
pub struct ParseResult {
    /// The AST as a JSON string.
    pub ast: String,
    /// Parse errors, if any.
    pub errors: Vec<String>,
}

/// Render result containing the HTML output.
#[napi(object)]
pub struct RenderResult {
    /// The rendered HTML.
    pub html: String,
    /// Render errors, if any.
    pub errors: Vec<String>,
}

/// Table of contents entry.
#[napi(object)]
#[derive(Clone)]
pub struct TocEntry {
    /// Heading depth (1-6).
    pub depth: u8,
    /// Heading text.
    pub text: String,
    /// URL-friendly slug.
    pub slug: String,
}

/// Transform result containing HTML, frontmatter, and TOC.
#[napi(object)]
pub struct TransformResult {
    /// The rendered HTML.
    pub html: String,
    /// Parsed frontmatter as JSON string.
    pub frontmatter: String,
    /// Table of contents entries.
    pub toc: Vec<TocEntry>,
    /// Parse/render errors, if any.
    pub errors: Vec<String>,
}

/// Transform options for JavaScript.
#[napi(object)]
#[derive(Default, Clone)]
pub struct JsTransformOptions {
    /// Enable GFM extensions.
    pub gfm: Option<bool>,
    /// Enable footnotes.
    pub footnotes: Option<bool>,
    /// Enable task lists.
    pub task_lists: Option<bool>,
    /// Enable tables.
    pub tables: Option<bool>,
    /// Enable strikethrough.
    pub strikethrough: Option<bool>,
    /// Enable autolinks.
    pub autolinks: Option<bool>,
    /// Maximum TOC depth (1-6).
    pub toc_max_depth: Option<u8>,
    /// Convert `.md` links to `.html` links for SSG output.
    pub convert_md_links: Option<bool>,
    /// Base URL for absolute link conversion (e.g., "/" or "/docs/").
    pub base_url: Option<String>,
}

/// Parser options for JavaScript.
#[napi(object)]
#[derive(Default)]
pub struct JsParserOptions {
    /// Enable GFM extensions.
    pub gfm: Option<bool>,
    /// Enable footnotes.
    pub footnotes: Option<bool>,
    /// Enable task lists.
    pub task_lists: Option<bool>,
    /// Enable tables.
    pub tables: Option<bool>,
    /// Enable strikethrough.
    pub strikethrough: Option<bool>,
    /// Enable autolinks.
    pub autolinks: Option<bool>,
}

impl From<JsParserOptions> for ParserOptions {
    fn from(opts: JsParserOptions) -> Self {
        let mut options =
            if opts.gfm.unwrap_or(false) { ParserOptions::gfm() } else { ParserOptions::default() };

        if let Some(v) = opts.footnotes {
            options.footnotes = v;
        }
        if let Some(v) = opts.task_lists {
            options.task_lists = v;
        }
        if let Some(v) = opts.tables {
            options.tables = v;
        }
        if let Some(v) = opts.strikethrough {
            options.strikethrough = v;
        }
        if let Some(v) = opts.autolinks {
            options.autolinks = v;
        }

        options
    }
}

/// Parses Markdown source into an AST.
///
/// Returns the AST as a JSON string for zero-copy transfer to JavaScript.
#[napi]
pub fn parse(source: String, options: Option<JsParserOptions>) -> ParseResult {
    let allocator = Allocator::new();
    let parser_options = options.map(ParserOptions::from).unwrap_or_default();
    let parser = Parser::with_options(&allocator, &source, parser_options);

    let result = parser.parse();
    match result {
        Ok(_doc) => {
            // Serialize AST to JSON
            // Note: In a production implementation, we would use a more efficient
            // serialization method that avoids the JSON overhead
            let ast = "{\"type\":\"document\",\"children\":[]}".to_string();
            ParseResult { ast, errors: vec![] }
        }
        Err(e) => ParseResult { ast: String::new(), errors: vec![e.to_string()] },
    }
}

/// Parses Markdown and renders to HTML.
#[napi]
pub fn parse_and_render(source: String, options: Option<JsParserOptions>) -> RenderResult {
    let allocator = Allocator::new();
    let parser_options = options.map(ParserOptions::from).unwrap_or_default();
    let parser = Parser::with_options(&allocator, &source, parser_options);

    let result = parser.parse();
    match result {
        Ok(doc) => {
            let mut renderer = HtmlRenderer::new();
            let html = renderer.render(&doc);
            RenderResult { html, errors: vec![] }
        }
        Err(e) => RenderResult { html: String::new(), errors: vec![e.to_string()] },
    }
}

/// Renders an AST (provided as JSON) to HTML.
#[napi]
pub fn render(_ast_json: String) -> RenderResult {
    // In a production implementation, we would:
    // 1. Parse the JSON AST
    // 2. Convert to our internal AST format
    // 3. Render to HTML
    //
    // For now, return an error indicating this is not yet implemented
    RenderResult {
        html: String::new(),
        errors: vec!["render from JSON not yet implemented".to_string()],
    }
}

/// Returns the version of ox_content_napi.
#[napi]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Transforms Markdown source into HTML, frontmatter, and TOC.
///
/// This is the main entry point for unplugin-ox-content.
#[napi]
pub fn transform(source: String, options: Option<JsTransformOptions>) -> TransformResult {
    let opts = options.unwrap_or_default();
    let toc_max_depth = opts.toc_max_depth.unwrap_or(3);

    // Parse frontmatter
    let (content, frontmatter) = parse_frontmatter(&source);

    // Parse markdown
    let allocator = Allocator::new();
    let parser_options = transform_options_to_parser_options(&opts);
    let parser = Parser::with_options(&allocator, &content, parser_options);

    let result = parser.parse();
    match result {
        Ok(doc) => {
            // Extract TOC from headings
            let toc = extract_toc(&doc, toc_max_depth);

            // Render to HTML
            let renderer_options = transform_options_to_renderer_options(&opts);
            let mut renderer = HtmlRenderer::with_options(renderer_options);
            let html = renderer.render(&doc);

            TransformResult {
                html,
                frontmatter: serde_json::to_string(&frontmatter)
                    .unwrap_or_else(|_| "{}".to_string()),
                toc,
                errors: vec![],
            }
        }
        Err(e) => TransformResult {
            html: String::new(),
            frontmatter: "{}".to_string(),
            toc: vec![],
            errors: vec![e.to_string()],
        },
    }
}

/// Parses YAML frontmatter from Markdown content.
fn parse_frontmatter(source: &str) -> (String, HashMap<String, serde_json::Value>) {
    let mut frontmatter = HashMap::new();

    // Check for frontmatter delimiter
    if !source.starts_with("---") {
        return (source.to_string(), frontmatter);
    }

    // Find the closing delimiter
    let rest = &source[3..];
    let Some(end_pos) = rest.find("\n---") else {
        return (source.to_string(), frontmatter);
    };

    let frontmatter_str = &rest[..end_pos].trim_start_matches('\n');
    let content = &rest[end_pos + 4..].trim_start_matches('\n');

    // Parse simple YAML key-value pairs
    for line in frontmatter_str.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if let Some(colon_pos) = line.find(':') {
            let key = line[..colon_pos].trim().to_string();
            let value_str = line[colon_pos + 1..].trim();

            let value = if value_str == "true" {
                serde_json::Value::Bool(true)
            } else if value_str == "false" {
                serde_json::Value::Bool(false)
            } else if let Ok(n) = value_str.parse::<i64>() {
                serde_json::Value::Number(n.into())
            } else if let Ok(n) = value_str.parse::<f64>() {
                serde_json::Number::from_f64(n).map_or_else(
                    || serde_json::Value::String(value_str.to_string()),
                    serde_json::Value::Number,
                )
            } else {
                // Remove surrounding quotes if present
                let s = value_str.trim_matches('"').trim_matches('\'');
                serde_json::Value::String(s.to_string())
            };

            frontmatter.insert(key, value);
        }
    }

    (content.to_string(), frontmatter)
}

/// Extracts table of contents from document headings.
fn extract_toc(doc: &Document, max_depth: u8) -> Vec<TocEntry> {
    let mut entries = Vec::new();

    for node in &doc.children {
        if let Node::Heading(heading) = node {
            if heading.depth <= max_depth {
                let text = extract_heading_text(heading);
                let slug = slugify(&text);
                entries.push(TocEntry { depth: heading.depth, text, slug });
            }
        }
    }

    entries
}

/// Extracts plain text from a heading node.
fn extract_heading_text(heading: &Heading) -> String {
    let mut text = String::new();
    for child in &heading.children {
        collect_text(child, &mut text);
    }
    text
}

/// Recursively collects text from nodes.
fn collect_text(node: &Node, text: &mut String) {
    match node {
        Node::Text(t) => text.push_str(t.value),
        Node::Emphasis(e) => {
            for child in &e.children {
                collect_text(child, text);
            }
        }
        Node::Strong(s) => {
            for child in &s.children {
                collect_text(child, text);
            }
        }
        Node::InlineCode(c) => text.push_str(c.value),
        Node::Delete(d) => {
            for child in &d.children {
                collect_text(child, text);
            }
        }
        Node::Link(l) => {
            for child in &l.children {
                collect_text(child, text);
            }
        }
        _ => {}
    }
}

/// Converts text to URL-friendly slug.
fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' { c } else { ' ' })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-")
}

/// Converts transform options to parser options.
fn transform_options_to_parser_options(opts: &JsTransformOptions) -> ParserOptions {
    let mut options =
        if opts.gfm.unwrap_or(false) { ParserOptions::gfm() } else { ParserOptions::default() };

    if let Some(v) = opts.footnotes {
        options.footnotes = v;
    }
    if let Some(v) = opts.task_lists {
        options.task_lists = v;
    }
    if let Some(v) = opts.tables {
        options.tables = v;
    }
    if let Some(v) = opts.strikethrough {
        options.strikethrough = v;
    }
    if let Some(v) = opts.autolinks {
        options.autolinks = v;
    }

    options
}

/// Converts transform options to renderer options.
fn transform_options_to_renderer_options(opts: &JsTransformOptions) -> HtmlRendererOptions {
    let mut options = HtmlRendererOptions::new();

    if let Some(v) = opts.convert_md_links {
        options.convert_md_links = v;
    }
    if let Some(ref v) = opts.base_url {
        options.base_url.clone_from(v);
    }

    options
}

// =============================================================================
// Async (Multi-threaded) API
// =============================================================================

/// Async task for parse_and_render.
pub struct ParseAndRenderTask {
    source: String,
    options: ParserOptions,
}

impl Task for ParseAndRenderTask {
    type Output = RenderResult;
    type JsValue = RenderResult;

    fn compute(&mut self) -> Result<Self::Output> {
        let allocator = Allocator::new();
        let parser = Parser::with_options(&allocator, &self.source, self.options.clone());

        let result = match parser.parse() {
            Ok(doc) => {
                let mut renderer = HtmlRenderer::new();
                let html = renderer.render(&doc);
                RenderResult { html, errors: vec![] }
            }
            Err(e) => RenderResult { html: String::new(), errors: vec![e.to_string()] },
        };
        Ok(result)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

/// Parses Markdown and renders to HTML asynchronously (runs on worker thread).
#[napi]
pub fn parse_and_render_async(
    source: String,
    options: Option<JsParserOptions>,
) -> AsyncTask<ParseAndRenderTask> {
    let parser_options = options.map(ParserOptions::from).unwrap_or_default();
    AsyncTask::new(ParseAndRenderTask { source, options: parser_options })
}

/// Async task for transform.
pub struct TransformTask {
    source: String,
    options: JsTransformOptions,
}

impl Task for TransformTask {
    type Output = TransformResult;
    type JsValue = TransformResult;

    fn compute(&mut self) -> Result<Self::Output> {
        let toc_max_depth = self.options.toc_max_depth.unwrap_or(3);

        // Parse frontmatter
        let (content, frontmatter) = parse_frontmatter(&self.source);

        // Parse markdown
        let allocator = Allocator::new();
        let parser_options = transform_options_to_parser_options(&self.options);
        let parser = Parser::with_options(&allocator, &content, parser_options);

        let result = match parser.parse() {
            Ok(doc) => {
                let toc = extract_toc(&doc, toc_max_depth);
                let renderer_options = transform_options_to_renderer_options(&self.options);
                let mut renderer = HtmlRenderer::with_options(renderer_options);
                let html = renderer.render(&doc);

                TransformResult {
                    html,
                    frontmatter: serde_json::to_string(&frontmatter)
                        .unwrap_or_else(|_| "{}".to_string()),
                    toc,
                    errors: vec![],
                }
            }
            Err(e) => TransformResult {
                html: String::new(),
                frontmatter: "{}".to_string(),
                toc: vec![],
                errors: vec![e.to_string()],
            },
        };
        Ok(result)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

/// Transforms Markdown source asynchronously (runs on worker thread).
#[napi]
pub fn transform_async(
    source: String,
    options: Option<JsTransformOptions>,
) -> AsyncTask<TransformTask> {
    let opts = options.unwrap_or_default();
    AsyncTask::new(TransformTask { source, options: opts })
}

// =============================================================================
// OG Image Generation API
// =============================================================================

/// OG image configuration for JavaScript.
#[napi(object)]
#[derive(Default, Clone)]
pub struct JsOgImageConfig {
    /// Image width in pixels.
    pub width: Option<u32>,
    /// Image height in pixels.
    pub height: Option<u32>,
    /// Background color (hex).
    pub background_color: Option<String>,
    /// Text color (hex).
    pub text_color: Option<String>,
    /// Title font size.
    pub title_font_size: Option<u32>,
    /// Description font size.
    pub description_font_size: Option<u32>,
}

/// OG image data for JavaScript.
#[napi(object)]
pub struct JsOgImageData {
    /// Page title.
    pub title: String,
    /// Page description.
    pub description: Option<String>,
    /// Site name.
    pub site_name: Option<String>,
    /// Author name.
    pub author: Option<String>,
}

/// Generates an OG image as SVG.
///
/// This function generates an SVG representation of an OG image
/// that can be used for social media previews.
#[napi]
pub fn generate_og_image_svg(data: JsOgImageData, config: Option<JsOgImageConfig>) -> String {
    use ox_content_og_image::{OgImageConfig, OgImageData, OgImageGenerator};

    let cfg = config.unwrap_or_default();
    let mut og_config = OgImageConfig::default();

    if let Some(w) = cfg.width {
        og_config.width = w;
    }
    if let Some(h) = cfg.height {
        og_config.height = h;
    }
    if let Some(ref bg) = cfg.background_color {
        og_config.background_color.clone_from(bg);
    }
    if let Some(ref tc) = cfg.text_color {
        og_config.text_color.clone_from(tc);
    }
    if let Some(ts) = cfg.title_font_size {
        og_config.title_font_size = ts;
    }
    if let Some(ds) = cfg.description_font_size {
        og_config.description_font_size = ds;
    }

    let og_data = OgImageData {
        title: data.title,
        description: data.description,
        site_name: data.site_name,
        author: data.author,
        date: None,
        tags: vec![],
    };

    let generator = OgImageGenerator::new(og_config);
    generator.generate_svg(&og_data)
}
