//! HTML renderer implementation.

use std::collections::BTreeMap;

use ox_content_ast::{
    BlockQuote, Break, CodeBlock, Definition, Delete, Document, Emphasis, FootnoteDefinition,
    FootnoteReference, Heading, Html, Image, InlineCode, Link, List, ListItem, Paragraph, Strong,
    Table, TableCell, TableRow, Text, ThematicBreak, Visit,
};

use crate::render::{RenderResult, Renderer};

/// HTML renderer options.
#[derive(Debug, Clone)]
pub struct HtmlRendererOptions {
    /// Use XHTML-style self-closing tags (e.g., `<br />`).
    pub xhtml: bool,
    /// Add soft breaks between inline elements.
    pub soft_break: String,
    /// Add hard breaks.
    pub hard_break: String,
    /// Enable syntax highlighting for code blocks.
    pub highlight: bool,
    /// Sanitize HTML output.
    pub sanitize: bool,
    /// Convert `.md` links to `.html` links for SSG output.
    pub convert_md_links: bool,
    /// Base URL for absolute link conversion (e.g., "/" or "/docs/").
    pub base_url: String,
    /// Source file path for relative link resolution.
    /// Used to determine if the current file is an index file.
    pub source_path: String,
    /// Enable line annotations for code blocks using fence meta.
    pub code_annotations: bool,
    /// Fence meta key used to read code annotations.
    pub code_annotation_meta_key: String,
}

impl HtmlRendererOptions {
    /// Creates new options with default values.
    #[must_use]
    pub fn new() -> Self {
        Self {
            xhtml: false,
            soft_break: "\n".to_string(),
            hard_break: "<br>\n".to_string(),
            highlight: false,
            sanitize: false,
            convert_md_links: false,
            base_url: "/".to_string(),
            source_path: String::new(),
            code_annotations: false,
            code_annotation_meta_key: "annotate".to_string(),
        }
    }
}

impl Default for HtmlRendererOptions {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum CodeAnnotationKind {
    Highlight,
    Warning,
    Error,
}

impl CodeAnnotationKind {
    fn from_str(value: &str) -> Option<Self> {
        match value {
            "highlight" => Some(Self::Highlight),
            "warning" => Some(Self::Warning),
            "error" => Some(Self::Error),
            _ => None,
        }
    }

    fn class_name(self) -> &'static str {
        match self {
            Self::Highlight => "ox-code-line--highlight",
            Self::Warning => "ox-code-line--warning",
            Self::Error => "ox-code-line--error",
        }
    }
}

fn parse_code_annotations(meta: &str, key: &str) -> BTreeMap<usize, Vec<CodeAnnotationKind>> {
    let Some(value) = extract_meta_attribute(meta, key) else {
        return BTreeMap::new();
    };

    let mut annotations = BTreeMap::new();

    for entry in value.split(';') {
        let Some((raw_kind, raw_lines)) = entry.split_once(':') else {
            continue;
        };

        let Some(kind) = CodeAnnotationKind::from_str(raw_kind.trim()) else {
            continue;
        };

        for line_number in parse_line_numbers(raw_lines.trim()) {
            push_code_annotation(&mut annotations, line_number, kind);
        }
    }

    annotations
}

fn extract_meta_attribute<'a>(meta: &'a str, target: &str) -> Option<&'a str> {
    let bytes = meta.as_bytes();
    let mut index = 0;

    while index < bytes.len() {
        while index < bytes.len() && bytes[index].is_ascii_whitespace() {
            index += 1;
        }

        if index >= bytes.len() {
            break;
        }

        let key_start = index;
        while index < bytes.len() && !bytes[index].is_ascii_whitespace() && bytes[index] != b'=' {
            index += 1;
        }

        if key_start == index {
            index += 1;
            continue;
        }

        let key = &meta[key_start..index];

        while index < bytes.len() && bytes[index].is_ascii_whitespace() {
            index += 1;
        }

        if index >= bytes.len() || bytes[index] != b'=' {
            continue;
        }

        index += 1;
        while index < bytes.len() && bytes[index].is_ascii_whitespace() {
            index += 1;
        }

        if index >= bytes.len() {
            break;
        }

        let value = if bytes[index] == b'"' || bytes[index] == b'\'' {
            let quote = bytes[index];
            index += 1;
            let value_start = index;

            while index < bytes.len() && bytes[index] != quote {
                index += 1;
            }

            let value_end = index;
            if index < bytes.len() {
                index += 1;
            }
            &meta[value_start..value_end]
        } else {
            let value_start = index;
            while index < bytes.len() && !bytes[index].is_ascii_whitespace() {
                index += 1;
            }
            &meta[value_start..index]
        };

        if key == target {
            return Some(value);
        }
    }

    None
}

fn parse_line_numbers(value: &str) -> Vec<usize> {
    let mut line_numbers = Vec::new();

    for part in value.split(',').map(str::trim).filter(|part| !part.is_empty()) {
        if let Some((raw_start, raw_end)) = part.split_once('-') {
            let Ok(start) = raw_start.trim().parse::<usize>() else {
                continue;
            };
            let Ok(end) = raw_end.trim().parse::<usize>() else {
                continue;
            };

            if start == 0 || end < start {
                continue;
            }

            for line_number in start..=end {
                if !line_numbers.contains(&line_number) {
                    line_numbers.push(line_number);
                }
            }
            continue;
        }

        let Ok(line_number) = part.parse::<usize>() else {
            continue;
        };

        if line_number > 0 && !line_numbers.contains(&line_number) {
            line_numbers.push(line_number);
        }
    }

    line_numbers.sort_unstable();
    line_numbers
}

fn push_code_annotation(
    annotations: &mut BTreeMap<usize, Vec<CodeAnnotationKind>>,
    line_number: usize,
    kind: CodeAnnotationKind,
) {
    let kinds = annotations.entry(line_number).or_default();
    if !kinds.contains(&kind) {
        kinds.push(kind);
    }
}

/// HTML renderer.
pub struct HtmlRenderer {
    options: HtmlRendererOptions,
    output: String,
}

impl HtmlRenderer {
    /// Creates a new HTML renderer with default options.
    #[must_use]
    pub fn new() -> Self {
        Self { options: HtmlRendererOptions::new(), output: String::new() }
    }

    /// Creates a new HTML renderer with the specified options.
    #[must_use]
    pub fn with_options(options: HtmlRendererOptions) -> Self {
        Self { options, output: String::new() }
    }

    /// Renders a document to HTML string.
    #[must_use]
    pub fn render(&mut self, document: &Document<'_>) -> String {
        self.output.clear();
        let estimated_len = (document.span.len() as usize).saturating_mul(3) / 2;
        if self.output.capacity() < estimated_len {
            self.output.reserve(estimated_len - self.output.capacity());
        }
        self.visit_document(document);
        std::mem::take(&mut self.output)
    }

    fn write(&mut self, s: &str) {
        self.output.push_str(s);
    }

    fn write_escaped(&mut self, s: &str) {
        let bytes = s.as_bytes();
        let mut start = 0;

        for (idx, byte) in bytes.iter().copied().enumerate() {
            let escaped = match byte {
                b'&' => Some("&amp;"),
                b'<' => Some("&lt;"),
                b'>' => Some("&gt;"),
                b'"' => Some("&quot;"),
                b'\'' => Some("&#39;"),
                _ => None,
            };

            if let Some(escaped) = escaped {
                if start < idx {
                    self.output.push_str(&s[start..idx]);
                }
                self.output.push_str(escaped);
                start = idx + 1;
            }
        }

        if start < s.len() {
            self.output.push_str(&s[start..]);
        }
    }

    fn write_url_escaped(&mut self, s: &str) {
        let bytes = s.as_bytes();
        let mut start = 0;

        for (idx, byte) in bytes.iter().copied().enumerate() {
            let escaped = match byte {
                b'&' => Some("&amp;"),
                b'<' => Some("%3C"),
                b'>' => Some("%3E"),
                b'"' => Some("%22"),
                b' ' => Some("%20"),
                _ => None,
            };

            if let Some(escaped) = escaped {
                if start < idx {
                    self.output.push_str(&s[start..idx]);
                }
                self.output.push_str(escaped);
                start = idx + 1;
            }
        }

        if start < s.len() {
            self.output.push_str(&s[start..]);
        }
    }

    fn code_block_annotations(
        &self,
        code_block: &CodeBlock<'_>,
    ) -> Option<BTreeMap<usize, Vec<CodeAnnotationKind>>> {
        if !self.options.code_annotations {
            return None;
        }

        let meta = code_block.meta?;
        let annotations = parse_code_annotations(meta, &self.options.code_annotation_meta_key);
        if annotations.is_empty() {
            None
        } else {
            Some(annotations)
        }
    }

    fn write_annotated_code_lines(
        &mut self,
        value: &str,
        annotations: &BTreeMap<usize, Vec<CodeAnnotationKind>>,
    ) {
        let lines: Vec<&str> = value.split('\n').collect();

        for (index, line) in lines.iter().enumerate() {
            let line_number = index + 1;

            self.write("<span class=\"line ox-code-line");
            if let Some(kinds) = annotations.get(&line_number) {
                for kind in kinds {
                    self.write(" ");
                    self.write(kind.class_name());
                }
            }
            self.write("\" data-line=\"");
            self.write(&line_number.to_string());
            self.write("\">");
            self.write_escaped(line);
            self.write("</span>");

            if index + 1 < lines.len() {
                self.write("\n");
            }
        }
    }

    /// Converts a `.md` URL to `.html` URL for SSG output.
    fn convert_md_url(&self, url: &str) -> String {
        // Split URL into path and fragment
        let (path, fragment) = match url.split_once('#') {
            Some((p, f)) => (p, Some(f)),
            None => (url, None),
        };

        let is_md = std::path::Path::new(path)
            .extension()
            .is_some_and(|ext| ext.eq_ignore_ascii_case("md"));

        if !self.options.convert_md_links || !is_md {
            return url.to_string();
        }

        // Remove the .md extension
        let path_without_ext = &path[..path.len() - 3];

        // Check if the source file is an index file
        // index.md stays at the directory level, so relative paths work differently
        let source_is_index = self.is_source_index();

        // Convert path
        let converted = if path.starts_with('/') {
            // Absolute path: /getting-started.md -> {base}getting-started/index.html
            let path_without_slash = &path_without_ext[1..];
            let base = &self.options.base_url;
            if path_without_slash.is_empty() || path_without_slash == "index" {
                format!("{base}index.html")
            } else {
                format!("{base}{path_without_slash}/index.html")
            }
        } else if path.starts_with("./") {
            // Same-directory relative path
            let name = &path_without_ext[2..]; // Remove "./"
            if name == "index" {
                // ./index.md -> ./index.html (stay in same directory)
                "./index.html".to_string()
            } else if source_is_index {
                // Source is index.md, so we're at directory level
                // ./types.md -> ./types/index.html
                format!("./{name}/index.html")
            } else {
                // Source is not index.md (e.g., types.md -> types/index.html)
                // So we need to go up one level
                // ./types.md -> ../types/index.html
                format!("../{name}/index.html")
            }
        } else if path.starts_with("../") {
            // Parent-relative path
            let rest = &path_without_ext[3..]; // Remove "../"
            if source_is_index {
                // Source is index.md at directory level
                // ../types.md -> ../types/index.html
                if rest == "index" || rest.ends_with("/index") {
                    let dir = rest.trim_end_matches("/index").trim_end_matches("index");
                    if dir.is_empty() {
                        "../index.html".to_string()
                    } else {
                        format!("../{dir}/index.html")
                    }
                } else {
                    format!("../{rest}/index.html")
                }
            } else {
                // Source is not index.md, need extra ../
                // ../types.md -> ../../types/index.html
                if rest == "index" || rest.ends_with("/index") {
                    let dir = rest.trim_end_matches("/index").trim_end_matches("index");
                    if dir.is_empty() {
                        "../../index.html".to_string()
                    } else {
                        format!("../../{dir}/index.html")
                    }
                } else {
                    format!("../../{rest}/index.html")
                }
            }
        } else {
            // Plain relative path: types.md
            if path_without_ext == "index" || path_without_ext.ends_with("/index") {
                let dir = path_without_ext.trim_end_matches("/index").trim_end_matches("index");
                if dir.is_empty() {
                    "./index.html".to_string()
                } else if source_is_index {
                    format!("./{dir}/index.html")
                } else {
                    format!("../{dir}/index.html")
                }
            } else if source_is_index {
                // Source is index.md
                // types.md -> ./types/index.html
                format!("./{path_without_ext}/index.html")
            } else {
                // Source is not index.md
                // types.md -> ../types/index.html
                format!("../{path_without_ext}/index.html")
            }
        };

        // Reattach fragment if present
        match fragment {
            Some(f) => format!("{converted}#{f}"),
            None => converted,
        }
    }

    /// Checks if the source file is an index file (index.md).
    fn is_source_index(&self) -> bool {
        if self.options.source_path.is_empty() {
            return false;
        }
        let source = std::path::Path::new(&self.options.source_path);
        source.file_stem().is_some_and(|stem| stem.eq_ignore_ascii_case("index"))
    }
}

impl Default for HtmlRenderer {
    fn default() -> Self {
        Self::new()
    }
}

impl Renderer for HtmlRenderer {
    type Output = String;

    fn render(&mut self, document: &Document<'_>) -> RenderResult<Self::Output> {
        Ok(self.render(document))
    }
}

impl<'a> Visit<'a> for HtmlRenderer {
    fn visit_paragraph(&mut self, paragraph: &Paragraph<'a>) {
        self.write("<p>");
        for child in &paragraph.children {
            self.visit_node(child);
        }
        self.write("</p>\n");
    }

    fn visit_heading(&mut self, heading: &Heading<'a>) {
        let tag = match heading.depth {
            1 => "h1",
            2 => "h2",
            3 => "h3",
            4 => "h4",
            5 => "h5",
            _ => "h6",
        };
        self.write("<");
        self.write(tag);
        self.write(">");
        for child in &heading.children {
            self.visit_node(child);
        }
        self.write("</");
        self.write(tag);
        self.write(">\n");
    }

    fn visit_thematic_break(&mut self, _thematic_break: &ThematicBreak) {
        if self.options.xhtml {
            self.write("<hr />\n");
        } else {
            self.write("<hr>\n");
        }
    }

    fn visit_block_quote(&mut self, block_quote: &BlockQuote<'a>) {
        self.write("<blockquote>\n");
        for child in &block_quote.children {
            self.visit_node(child);
        }
        self.write("</blockquote>\n");
    }

    fn visit_list(&mut self, list: &List<'a>) {
        if list.ordered {
            if let Some(start) = list.start {
                if start != 1 {
                    self.write("<ol start=\"");
                    self.write(&start.to_string());
                    self.write("\">\n");
                } else {
                    self.write("<ol>\n");
                }
            } else {
                self.write("<ol>\n");
            }
        } else {
            self.write("<ul>\n");
        }

        for child in &list.children {
            self.visit_list_item(child);
        }

        if list.ordered {
            self.write("</ol>\n");
        } else {
            self.write("</ul>\n");
        }
    }

    fn visit_list_item(&mut self, list_item: &ListItem<'a>) {
        self.write("<li>");

        if let Some(checked) = list_item.checked {
            if checked {
                self.write("<input type=\"checkbox\" checked disabled> ");
            } else {
                self.write("<input type=\"checkbox\" disabled> ");
            }
        }

        for child in &list_item.children {
            self.visit_node(child);
        }

        self.write("</li>\n");
    }

    fn visit_code_block(&mut self, code_block: &CodeBlock<'a>) {
        let annotations = self.code_block_annotations(code_block);

        self.write("<pre");
        if annotations.is_some() {
            self.write(" class=\"ox-code-block ox-code-block--annotated\"");
        }
        self.write("><code");
        if let Some(lang) = code_block.lang {
            self.write(" class=\"language-");
            self.write_escaped(lang);
            self.write("\"");
        }
        self.write(">");
        if let Some(ref annotations) = annotations {
            self.write_annotated_code_lines(code_block.value, annotations);
        } else {
            self.write_escaped(code_block.value);
        }
        self.write("</code></pre>\n");
    }

    fn visit_html(&mut self, html: &Html<'a>) {
        if self.options.sanitize {
            self.write_escaped(html.value);
        } else {
            self.write(html.value);
        }
        self.write("\n");
    }

    fn visit_table(&mut self, table: &Table<'a>) {
        self.write("<table>\n");
        for (i, row) in table.children.iter().enumerate() {
            if i == 0 {
                self.write("<thead>\n");
            } else if i == 1 {
                self.write("<tbody>\n");
            }
            self.visit_table_row_with_header(row, i == 0, &table.align);
            if i == 0 {
                self.write("</thead>\n");
            }
        }
        if !table.children.is_empty() {
            self.write("</tbody>\n");
        }
        self.write("</table>\n");
    }

    fn visit_text(&mut self, text: &Text<'a>) {
        self.write_escaped(text.value);
    }

    fn visit_emphasis(&mut self, emphasis: &Emphasis<'a>) {
        self.write("<em>");
        for child in &emphasis.children {
            self.visit_node(child);
        }
        self.write("</em>");
    }

    fn visit_strong(&mut self, strong: &Strong<'a>) {
        self.write("<strong>");
        for child in &strong.children {
            self.visit_node(child);
        }
        self.write("</strong>");
    }

    fn visit_inline_code(&mut self, inline_code: &InlineCode<'a>) {
        self.write("<code>");
        self.write_escaped(inline_code.value);
        self.write("</code>");
    }

    fn visit_break(&mut self, _break_node: &Break) {
        self.output.push_str(self.options.hard_break.as_str());
    }

    fn visit_link(&mut self, link: &Link<'a>) {
        self.write("<a href=\"");
        let url = self.convert_md_url(link.url);
        self.write_url_escaped(&url);
        self.write("\"");
        // Add target="_blank" for external links (http:// or https://)
        if link.url.starts_with("http://") || link.url.starts_with("https://") {
            self.write(" target=\"_blank\" rel=\"noopener noreferrer\"");
        }
        if let Some(title) = link.title {
            self.write(" title=\"");
            self.write_escaped(title);
            self.write("\"");
        }
        self.write(">");
        for child in &link.children {
            self.visit_node(child);
        }
        self.write("</a>");
    }

    fn visit_image(&mut self, image: &Image<'a>) {
        self.write("<img src=\"");
        self.write_url_escaped(image.url);
        self.write("\" alt=\"");
        self.write_escaped(image.alt);
        self.write("\"");
        if let Some(title) = image.title {
            self.write(" title=\"");
            self.write_escaped(title);
            self.write("\"");
        }
        if self.options.xhtml {
            self.write(" />");
        } else {
            self.write(">");
        }
    }

    fn visit_delete(&mut self, delete: &Delete<'a>) {
        self.write("<del>");
        for child in &delete.children {
            self.visit_node(child);
        }
        self.write("</del>");
    }

    fn visit_footnote_reference(&mut self, footnote_ref: &FootnoteReference<'a>) {
        self.write("<sup><a href=\"#fn-");
        self.write_escaped(footnote_ref.identifier);
        self.write("\" id=\"fnref-");
        self.write_escaped(footnote_ref.identifier);
        self.write("\">");
        self.write_escaped(footnote_ref.identifier);
        self.write("</a></sup>");
    }

    fn visit_definition(&mut self, _definition: &Definition<'a>) {
        // Definitions are not rendered directly
    }

    fn visit_footnote_definition(&mut self, footnote_def: &FootnoteDefinition<'a>) {
        self.write("<div id=\"fn-");
        self.write_escaped(footnote_def.identifier);
        self.write("\" class=\"footnote\">\n");
        for child in &footnote_def.children {
            self.visit_node(child);
        }
        self.write("<a href=\"#fnref-");
        self.write_escaped(footnote_def.identifier);
        self.write("\">↩</a>\n</div>\n");
    }
}

impl HtmlRenderer {
    fn visit_table_row_with_header(
        &mut self,
        row: &TableRow<'_>,
        is_header: bool,
        align: &ox_content_allocator::Vec<'_, ox_content_ast::AlignKind>,
    ) {
        self.write("<tr>\n");
        let tag = if is_header { "th" } else { "td" };
        for (idx, cell) in row.children.iter().enumerate() {
            self.write("<");
            self.write(tag);
            match align.get(idx).copied().unwrap_or(ox_content_ast::AlignKind::None) {
                ox_content_ast::AlignKind::Left => self.write(" align=\"left\""),
                ox_content_ast::AlignKind::Center => self.write(" align=\"center\""),
                ox_content_ast::AlignKind::Right => self.write(" align=\"right\""),
                ox_content_ast::AlignKind::None => {}
            }
            self.write(">");
            self.visit_table_cell(cell);
            self.write("</");
            self.write(tag);
            self.write(">\n");
        }
        self.write("</tr>\n");
    }

    fn visit_table_cell(&mut self, cell: &TableCell<'_>) {
        for child in &cell.children {
            self.visit_node(child);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ox_content_allocator::Allocator;
    use ox_content_parser::Parser;

    #[test]
    fn test_render_paragraph() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "Hello world").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert_eq!(html, "<p>Hello world</p>\n");
    }

    #[test]
    fn test_render_heading() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "# Hello").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert_eq!(html, "<h1>Hello</h1>\n");
    }

    #[test]
    fn test_render_block_quote() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "> Hello world").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert_eq!(html, "<blockquote>\n<p>Hello world</p>\n</blockquote>\n");
    }

    #[test]
    fn test_render_block_quote_with_inline() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "> **Note:** This is important").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<blockquote>"));
        assert!(html.contains("<strong>Note:</strong>"));
        assert!(html.contains("</blockquote>"));
    }

    #[test]
    fn test_render_code_block() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "```rust\nfn main() {}\n```").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<pre><code class=\"language-rust\">"));
    }

    #[test]
    fn test_render_code_block_with_annotations() {
        let allocator = Allocator::new();
        let doc = Parser::new(
            &allocator,
            "```ts file=main.ts annotate=\"highlight:1;warning:2;error:3\"\nconst ok = true;\nconst maybe = false;\nthrow new Error('boom');\n```",
        )
        .parse()
        .unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            code_annotations: true,
            ..Default::default()
        });
        let html = renderer.render(&doc);

        assert!(html.contains(
            "<pre class=\"ox-code-block ox-code-block--annotated\"><code class=\"language-ts\">"
        ));
        assert!(
            html.contains("class=\"line ox-code-line ox-code-line--highlight\" data-line=\"1\"")
        );
        assert!(html.contains("class=\"line ox-code-line ox-code-line--warning\" data-line=\"2\""));
        assert!(html.contains("class=\"line ox-code-line ox-code-line--error\" data-line=\"3\""));
        assert!(!html.contains("file=main.ts"));
    }

    #[test]
    fn test_render_code_block_with_custom_annotation_meta_key() {
        let allocator = Allocator::new();
        let doc = Parser::new(
            &allocator,
            "```ts markers=\"warning:2\"\nconst ok = true;\nconst maybe = false;\n```",
        )
        .parse()
        .unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            code_annotations: true,
            code_annotation_meta_key: "markers".to_string(),
            ..Default::default()
        });
        let html = renderer.render(&doc);

        assert!(html.contains("ox-code-block--annotated"));
        assert!(html.contains("ox-code-line--warning"));
    }

    #[test]
    fn test_render_nested_list() {
        let allocator = Allocator::new();
        // Indent with 2 spaces for nesting
        let doc = Parser::new(&allocator, "- item 1\n  - sub 1\n- item 2").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);

        // Normalize newlines for comparison
        let normalized = html.replace('\n', "");
        // We expect:
        // <ul>
        //   <li>
        //     <p>item 1</p>
        //     <ul>
        //       <li><p>sub 1</p></li>
        //     </ul>
        //   </li>
        //   <li><p>item 2</p></li>
        // </ul>
        // Note: The exact placement of <p> tags depends on how we handle list content.
        // Assuming tight list items might not have <p> if we implement loose/tight lists,
        // but currently everything is wrapped in <p> in parse_list implementation (wrapped in Paragraph).

        // Let's just check for the structure <li>...<ul>...</ul>...</li>
        assert!(normalized.contains("<li><p>item 1</p><ul><li><p>sub 1</p></li></ul></li>"));
        assert!(normalized.contains("<li><p>item 2</p></li>"));
    }

    #[test]
    fn test_render_table() {
        let allocator = Allocator::new();
        let parser_options = ox_content_parser::ParserOptions::gfm();
        let doc = Parser::with_options(&allocator, "| head |\n| --- |\n| body |", parser_options)
            .parse()
            .unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<table>"));
        assert!(html.contains("<thead>"));
        assert!(html.contains("<th>head</th>"));
        assert!(html.contains("<tbody>"));
        assert!(html.contains("<td>body</td>"));
    }

    #[test]
    fn test_render_table_no_gfm() {
        let allocator = Allocator::new();
        // Default options have tables: false
        let doc = Parser::new(&allocator, "| head |\n| --- |\n| body |").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(!html.contains("<table>"));
        assert!(html.contains("| head |"));
    }

    #[test]
    fn test_render_heading_with_link() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "### [index](./index-module.md)").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert_eq!(html, "<h3><a href=\"./index-module.md\">index</a></h3>\n");
    }

    #[test]
    fn test_render_list_with_bold() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "- **bold** text").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<strong>bold</strong>"));
    }

    #[test]
    fn test_render_task_list() {
        let allocator = Allocator::new();
        let parser_options = ox_content_parser::ParserOptions::gfm();
        let doc = Parser::with_options(&allocator, "- [x] task 1\n- [ ] task 2", parser_options)
            .parse()
            .unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<input type=\"checkbox\" checked disabled> <p>task 1</p>"));
        assert!(html.contains("<input type=\"checkbox\" disabled> <p>task 2</p>"));
    }

    #[test]
    fn test_render_strikethrough() {
        let allocator = Allocator::new();
        let doc =
            Parser::with_options(&allocator, "~~done~~", ox_content_parser::ParserOptions::gfm())
                .parse()
                .unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert_eq!(html, "<p><del>done</del></p>\n");
    }

    #[test]
    fn test_render_hard_break() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "line 1\\\nline 2").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert_eq!(html, "<p>line 1<br>\nline 2</p>\n");
    }

    #[test]
    fn test_render_image() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "![Alt text](/path/to/image.png)").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<img src=\"/path/to/image.png\" alt=\"Alt text\">"));
    }

    #[test]
    fn test_render_image_xhtml() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "![Logo](/logo.svg)").parse().unwrap();
        let mut renderer =
            HtmlRenderer::with_options(HtmlRendererOptions { xhtml: true, ..Default::default() });
        let html = renderer.render(&doc);
        assert!(html.contains("<img src=\"/logo.svg\" alt=\"Logo\" />"));
    }

    #[test]
    fn test_convert_md_link_from_index_file() {
        // When the source is an index file (api/index.md), relative links like ./docs.md
        // should become ./docs/index.html (not ../docs/index.html)
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "[Docs](./docs.md)").parse().unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "api/index.md".to_string(),
            ..Default::default()
        });
        let html = renderer.render(&doc);
        assert!(
            html.contains("href=\"./docs/index.html\""),
            "Expected ./docs/index.html but got: {html}"
        );
    }

    #[test]
    fn test_convert_md_link_from_non_index_file() {
        // When the source is NOT an index file (api/types.md -> becomes types/index.html),
        // relative links like ./docs.md should become ../docs/index.html
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "[Docs](./docs.md)").parse().unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "api/types.md".to_string(),
            ..Default::default()
        });
        let html = renderer.render(&doc);
        assert!(
            html.contains("href=\"../docs/index.html\""),
            "Expected ../docs/index.html but got: {html}"
        );
    }

    #[test]
    fn test_convert_md_link_plain_relative_from_index() {
        // Plain relative links (no ./) from index file
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "[Types](types.md)").parse().unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "api/index.md".to_string(),
            ..Default::default()
        });
        let html = renderer.render(&doc);
        assert!(
            html.contains("href=\"./types/index.html\""),
            "Expected ./types/index.html but got: {html}"
        );
    }

    #[test]
    fn test_convert_md_link_parent_relative_from_index() {
        // Parent-relative links from index file
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "[Guide](../guide.md)").parse().unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "api/index.md".to_string(),
            ..Default::default()
        });
        let html = renderer.render(&doc);
        assert!(
            html.contains("href=\"../guide/index.html\""),
            "Expected ../guide/index.html but got: {html}"
        );
    }

    #[test]
    fn test_convert_md_link_parent_relative_from_non_index() {
        // Parent-relative links from non-index file need extra ../
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "[Guide](../guide.md)").parse().unwrap();
        let mut renderer = HtmlRenderer::with_options(HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "api/types.md".to_string(),
            ..Default::default()
        });
        let html = renderer.render(&doc);
        assert!(
            html.contains("href=\"../../guide/index.html\""),
            "Expected ../../guide/index.html but got: {html}"
        );
    }
}
