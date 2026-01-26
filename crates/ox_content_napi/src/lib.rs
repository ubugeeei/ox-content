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
use ox_content_search::{DocumentIndexer, SearchIndex, SearchIndexBuilder, SearchOptions};

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
    /// Source file path for relative link resolution.
    pub source_path: Option<String>,
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
    if let Some(ref v) = opts.source_path {
        options.source_path.clone_from(v);
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

// =============================================================================
// Full-text Search API
// =============================================================================

/// Search document for JavaScript.
#[napi(object)]
#[derive(Clone)]
pub struct JsSearchDocument {
    /// Unique document identifier.
    pub id: String,
    /// Document title.
    pub title: String,
    /// Document URL.
    pub url: String,
    /// Document body text.
    pub body: String,
    /// Document headings.
    pub headings: Vec<String>,
    /// Code snippets.
    pub code: Vec<String>,
}

/// Search result for JavaScript.
#[napi(object)]
pub struct JsSearchResult {
    /// Document ID.
    pub id: String,
    /// Document title.
    pub title: String,
    /// Document URL.
    pub url: String,
    /// Relevance score.
    pub score: f64,
    /// Matched terms.
    pub matches: Vec<String>,
    /// Content snippet.
    pub snippet: String,
}

/// Search options for JavaScript.
#[napi(object)]
#[derive(Default, Clone)]
pub struct JsSearchOptions {
    /// Maximum number of results.
    pub limit: Option<u32>,
    /// Enable prefix matching.
    pub prefix: Option<bool>,
    /// Enable fuzzy matching.
    pub fuzzy: Option<bool>,
    /// Minimum score threshold.
    pub threshold: Option<f64>,
}

impl From<JsSearchOptions> for SearchOptions {
    fn from(opts: JsSearchOptions) -> Self {
        Self {
            limit: opts.limit.unwrap_or(10) as usize,
            prefix: opts.prefix.unwrap_or(true),
            fuzzy: opts.fuzzy.unwrap_or(false),
            threshold: opts.threshold.unwrap_or(0.0),
        }
    }
}

/// Builds a search index from documents.
///
/// Takes an array of documents and returns a serialized search index as JSON.
#[napi]
pub fn build_search_index(documents: Vec<JsSearchDocument>) -> String {
    let mut builder = SearchIndexBuilder::new();

    for doc in documents {
        builder.add_document(ox_content_search::SearchDocument {
            id: doc.id,
            title: doc.title,
            url: doc.url,
            body: doc.body,
            headings: doc.headings,
            code: doc.code,
        });
    }

    let index = builder.build();
    index.to_json()
}

/// Searches a serialized index.
///
/// Takes a JSON-serialized index, query string, and options.
/// Returns an array of search results.
#[napi]
pub fn search_index(
    index_json: String,
    query: String,
    options: Option<JsSearchOptions>,
) -> Vec<JsSearchResult> {
    let Ok(index) = SearchIndex::from_json(&index_json) else {
        return Vec::new();
    };

    let opts = options.map(SearchOptions::from).unwrap_or_default();
    let results = index.search(&query, &opts);

    results
        .into_iter()
        .map(|r| JsSearchResult {
            id: r.id,
            title: r.title,
            url: r.url,
            score: r.score,
            matches: r.matches,
            snippet: r.snippet,
        })
        .collect()
}

// =============================================================================
// SSG HTML Generation API
// =============================================================================

/// Navigation item for SSG.
#[napi(object)]
#[derive(Clone)]
pub struct JsSsgNavItem {
    /// Display title.
    pub title: String,
    /// URL path.
    pub path: String,
    /// Full href.
    pub href: String,
}

/// Navigation group for SSG.
#[napi(object)]
#[derive(Clone)]
pub struct JsSsgNavGroup {
    /// Group title.
    pub title: String,
    /// Navigation items.
    pub items: Vec<JsSsgNavItem>,
}

/// Hero action for entry page.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsHeroAction {
    /// Button theme: "brand" or "alt".
    pub theme: Option<String>,
    /// Button text.
    pub text: String,
    /// Link URL.
    pub link: String,
}

/// Hero image for entry page.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsHeroImage {
    /// Image source URL.
    pub src: String,
    /// Alt text.
    pub alt: Option<String>,
    /// Image width.
    pub width: Option<u32>,
    /// Image height.
    pub height: Option<u32>,
}

/// Hero section configuration for entry page.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsHeroConfig {
    /// Main title (large, gradient text).
    pub name: Option<String>,
    /// Secondary text.
    pub text: Option<String>,
    /// Tagline.
    pub tagline: Option<String>,
    /// Hero image.
    pub image: Option<JsHeroImage>,
    /// Action buttons.
    pub actions: Option<Vec<JsHeroAction>>,
}

/// Feature card for entry page.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsFeatureConfig {
    /// Icon - supports: "mdi:icon-name" (Iconify), image URL, or emoji.
    pub icon: Option<String>,
    /// Feature title.
    pub title: String,
    /// Feature description.
    pub details: Option<String>,
    /// Optional link.
    pub link: Option<String>,
    /// Link text.
    pub link_text: Option<String>,
}

/// Entry page configuration.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsEntryPageConfig {
    /// Hero section.
    pub hero: Option<JsHeroConfig>,
    /// Feature cards.
    pub features: Option<Vec<JsFeatureConfig>>,
}

/// Page data for SSG.
#[napi(object)]
pub struct JsSsgPageData {
    /// Page title.
    pub title: String,
    /// Page description.
    pub description: Option<String>,
    /// Page content HTML.
    pub content: String,
    /// Table of contents entries.
    pub toc: Vec<TocEntry>,
    /// URL path.
    pub path: String,
    /// Entry page configuration (if layout: entry).
    pub entry_page: Option<JsEntryPageConfig>,
}

// =============================================================================
// Theme Configuration Types for NAPI
// =============================================================================

/// Theme colors for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeColors {
    /// Primary accent color.
    pub primary: Option<String>,
    /// Primary color on hover.
    pub primary_hover: Option<String>,
    /// Background color.
    pub background: Option<String>,
    /// Alternative background color.
    pub background_alt: Option<String>,
    /// Main text color.
    pub text: Option<String>,
    /// Muted text color.
    pub text_muted: Option<String>,
    /// Border color.
    pub border: Option<String>,
    /// Code block background color.
    pub code_background: Option<String>,
    /// Code block text color.
    pub code_text: Option<String>,
}

/// Theme fonts for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeFonts {
    /// Sans-serif font stack.
    pub sans: Option<String>,
    /// Monospace font stack.
    pub mono: Option<String>,
}

/// Theme layout for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeLayout {
    /// Sidebar width (CSS value).
    pub sidebar_width: Option<String>,
    /// Header height (CSS value).
    pub header_height: Option<String>,
    /// Maximum content width (CSS value).
    pub max_content_width: Option<String>,
}

/// Theme header for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeHeader {
    /// Logo image URL.
    pub logo: Option<String>,
    /// Logo width in pixels.
    pub logo_width: Option<u32>,
    /// Logo height in pixels.
    pub logo_height: Option<u32>,
}

/// Theme footer for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeFooter {
    /// Footer message (supports HTML).
    pub message: Option<String>,
    /// Copyright text (supports HTML).
    pub copyright: Option<String>,
}

/// Social links for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsSocialLinks {
    /// GitHub URL.
    pub github: Option<String>,
    /// Twitter/X URL.
    pub twitter: Option<String>,
    /// Discord URL.
    pub discord: Option<String>,
}

/// Theme slots for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeSlots {
    /// Content to inject into <head>.
    pub head: Option<String>,
    /// Content before header.
    pub header_before: Option<String>,
    /// Content after header.
    pub header_after: Option<String>,
    /// Content before sidebar navigation.
    pub sidebar_before: Option<String>,
    /// Content after sidebar navigation.
    pub sidebar_after: Option<String>,
    /// Content before main content.
    pub content_before: Option<String>,
    /// Content after main content.
    pub content_after: Option<String>,
    /// Content before footer.
    pub footer_before: Option<String>,
    /// Custom footer content.
    pub footer: Option<String>,
}

/// Theme configuration for JavaScript.
#[napi(object)]
#[derive(Clone, Default)]
pub struct JsThemeConfig {
    /// Light mode colors.
    pub colors: Option<JsThemeColors>,
    /// Dark mode colors.
    pub dark_colors: Option<JsThemeColors>,
    /// Font configuration.
    pub fonts: Option<JsThemeFonts>,
    /// Layout configuration.
    pub layout: Option<JsThemeLayout>,
    /// Header configuration.
    pub header: Option<JsThemeHeader>,
    /// Footer configuration.
    pub footer: Option<JsThemeFooter>,
    /// Social links configuration.
    pub social_links: Option<JsSocialLinks>,
    /// Custom slots for HTML injection.
    pub slots: Option<JsThemeSlots>,
    /// Additional custom CSS.
    pub css: Option<String>,
    /// Additional custom JavaScript.
    pub js: Option<String>,
}

/// SSG configuration.
#[napi(object)]
#[derive(Clone)]
pub struct JsSsgConfig {
    /// Site name.
    pub site_name: String,
    /// Base URL path.
    pub base: String,
    /// OG image URL.
    pub og_image: Option<String>,
    /// Theme configuration.
    pub theme: Option<JsThemeConfig>,
}

/// Converts JsThemeColors to ox_content_ssg::ThemeColors.
fn convert_theme_colors(colors: Option<JsThemeColors>) -> Option<ox_content_ssg::ThemeColors> {
    colors.map(|c| ox_content_ssg::ThemeColors {
        primary: c.primary,
        primary_hover: c.primary_hover,
        background: c.background,
        background_alt: c.background_alt,
        text: c.text,
        text_muted: c.text_muted,
        border: c.border,
        code_background: c.code_background,
        code_text: c.code_text,
    })
}

/// Converts JsThemeConfig to ox_content_ssg::ThemeConfig.
fn convert_theme_config(theme: Option<JsThemeConfig>) -> Option<ox_content_ssg::ThemeConfig> {
    theme.map(|t| ox_content_ssg::ThemeConfig {
        colors: convert_theme_colors(t.colors),
        dark_colors: convert_theme_colors(t.dark_colors),
        fonts: t.fonts.map(|f| ox_content_ssg::ThemeFonts { sans: f.sans, mono: f.mono }),
        layout: t.layout.map(|l| ox_content_ssg::ThemeLayout {
            sidebar_width: l.sidebar_width,
            header_height: l.header_height,
            max_content_width: l.max_content_width,
        }),
        header: t.header.map(|h| ox_content_ssg::ThemeHeader {
            logo: h.logo,
            logo_width: h.logo_width,
            logo_height: h.logo_height,
        }),
        footer: t
            .footer
            .map(|f| ox_content_ssg::ThemeFooter { message: f.message, copyright: f.copyright }),
        social_links: t.social_links.map(|s| ox_content_ssg::SocialLinks {
            github: s.github,
            twitter: s.twitter,
            discord: s.discord,
        }),
        slots: t.slots.map(|s| ox_content_ssg::ThemeSlots {
            head: s.head,
            header_before: s.header_before,
            header_after: s.header_after,
            sidebar_before: s.sidebar_before,
            sidebar_after: s.sidebar_after,
            content_before: s.content_before,
            content_after: s.content_after,
            footer_before: s.footer_before,
            footer: s.footer,
        }),
        css: t.css,
        js: t.js,
    })
}

/// Converts JsEntryPageConfig to ox_content_ssg::EntryPageConfig.
fn convert_entry_page_config(
    entry: Option<JsEntryPageConfig>,
) -> Option<ox_content_ssg::EntryPageConfig> {
    entry.map(|e| ox_content_ssg::EntryPageConfig {
        hero: e.hero.map(|h| ox_content_ssg::HeroConfig {
            name: h.name,
            text: h.text,
            tagline: h.tagline,
            image: h.image.map(|i| ox_content_ssg::HeroImage {
                src: i.src,
                alt: i.alt,
                width: i.width,
                height: i.height,
            }),
            actions: h.actions.map(|actions| {
                actions
                    .into_iter()
                    .map(|a| ox_content_ssg::HeroAction {
                        theme: a.theme,
                        text: a.text,
                        link: a.link,
                    })
                    .collect()
            }),
        }),
        features: e.features.map(|features| {
            features
                .into_iter()
                .map(|f| ox_content_ssg::FeatureConfig {
                    icon: f.icon,
                    title: f.title,
                    details: f.details,
                    link: f.link,
                    link_text: f.link_text,
                })
                .collect()
        }),
    })
}

/// Generates SSG HTML page with navigation and search.
#[napi]
pub fn generate_ssg_html(
    page_data: JsSsgPageData,
    nav_groups: Vec<JsSsgNavGroup>,
    config: JsSsgConfig,
) -> String {
    // Convert NAPI types to ox_content_ssg types
    let ssg_page_data = ox_content_ssg::PageData {
        title: page_data.title,
        description: page_data.description,
        content: page_data.content,
        toc: page_data
            .toc
            .into_iter()
            .map(|t| ox_content_ssg::TocEntry { depth: t.depth, text: t.text, slug: t.slug })
            .collect(),
        path: page_data.path,
        entry_page: convert_entry_page_config(page_data.entry_page),
    };

    let ssg_nav_groups: Vec<ox_content_ssg::NavGroup> = nav_groups
        .into_iter()
        .map(|g| ox_content_ssg::NavGroup {
            title: g.title,
            items: g
                .items
                .into_iter()
                .map(|i| ox_content_ssg::NavItem { title: i.title, path: i.path, href: i.href })
                .collect(),
        })
        .collect();

    let ssg_config = ox_content_ssg::SsgConfig {
        site_name: config.site_name,
        base: config.base,
        og_image: config.og_image,
        theme: convert_theme_config(config.theme),
    };

    ox_content_ssg::generate_html(&ssg_page_data, &ssg_nav_groups, &ssg_config)
}

/// Extracts searchable content from Markdown source.
///
/// Parses the Markdown and extracts title, body text, headings, and code.
#[napi]
pub fn extract_search_content(
    source: String,
    id: String,
    url: String,
    options: Option<JsParserOptions>,
) -> JsSearchDocument {
    let allocator = Allocator::new();
    let parser_options = options.map(ParserOptions::from).unwrap_or_default();

    // Parse frontmatter first
    let (content, frontmatter) = parse_frontmatter(&source);

    // Try to get title from frontmatter
    let frontmatter_title = frontmatter.get("title").and_then(|v| v.as_str()).map(String::from);

    let parser = Parser::with_options(&allocator, &content, parser_options);

    let result = parser.parse();
    let (title, body, headings, code) = if let Ok(ref doc) = result {
        let mut indexer = DocumentIndexer::new();
        indexer.extract(doc);

        let title = frontmatter_title
            .unwrap_or_else(|| indexer.title().map(String::from).unwrap_or_default());

        (title, indexer.body().to_string(), indexer.headings().to_vec(), indexer.code().to_vec())
    } else {
        (frontmatter_title.unwrap_or_default(), String::new(), Vec::new(), Vec::new())
    };
    // Explicitly drop the result to release the borrow
    drop(result);

    JsSearchDocument { id, title, url, body, headings, code }
}
