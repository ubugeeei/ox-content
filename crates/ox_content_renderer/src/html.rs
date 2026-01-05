//! HTML renderer implementation.

use ox_content_ast::{
    BlockQuote, Break, CodeBlock, Definition, Delete, Document, Emphasis, FootnoteDefinition,
    FootnoteReference, Heading, Html, Image, InlineCode, Link, List, ListItem, Paragraph, Strong,
    Table, TableCell, TableRow, Text, ThematicBreak, Visit,
};

use crate::render::{RenderResult, Renderer};

/// HTML renderer options.
#[derive(Debug, Clone, Default)]
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
        }
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
        self.visit_document(document);
        std::mem::take(&mut self.output)
    }

    fn write(&mut self, s: &str) {
        self.output.push_str(s);
    }

    fn write_escaped(&mut self, s: &str) {
        for ch in s.chars() {
            match ch {
                '&' => self.output.push_str("&amp;"),
                '<' => self.output.push_str("&lt;"),
                '>' => self.output.push_str("&gt;"),
                '"' => self.output.push_str("&quot;"),
                '\'' => self.output.push_str("&#39;"),
                _ => self.output.push(ch),
            }
        }
    }

    fn write_url_escaped(&mut self, s: &str) {
        for ch in s.chars() {
            match ch {
                '&' => self.output.push_str("&amp;"),
                '<' => self.output.push_str("%3C"),
                '>' => self.output.push_str("%3E"),
                '"' => self.output.push_str("%22"),
                ' ' => self.output.push_str("%20"),
                _ => self.output.push(ch),
            }
        }
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
        self.write("<pre><code");
        if let Some(lang) = code_block.lang {
            self.write(" class=\"language-");
            self.write_escaped(lang);
            self.write("\"");
        }
        self.write(">");
        self.write_escaped(code_block.value);
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
        self.write(&self.options.hard_break.clone());
    }

    fn visit_link(&mut self, link: &Link<'a>) {
        self.write("<a href=\"");
        self.write_url_escaped(link.url);
        self.write("\"");
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
        _align: &ox_content_allocator::Vec<'_, ox_content_ast::AlignKind>,
    ) {
        self.write("<tr>\n");
        let tag = if is_header { "th" } else { "td" };
        for cell in &row.children {
            self.write("<");
            self.write(tag);
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
    fn test_render_code_block() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "```rust\nfn main() {}\n```").parse().unwrap();
        let mut renderer = HtmlRenderer::new();
        let html = renderer.render(&doc);
        assert!(html.contains("<pre><code class=\"language-rust\">"));
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
}
