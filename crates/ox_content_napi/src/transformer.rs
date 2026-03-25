use std::collections::HashMap;

use napi::bindgen_prelude::Uint8Array;
use ox_content_allocator::Allocator;
use ox_content_ast::{Document, Heading, Node};
use ox_content_parser::{ParseError, Parser, ParserOptions};
use ox_content_renderer::{HtmlRenderer, HtmlRendererOptions};

use crate::{
    mdast_raw::{self, MDAST_SECTION_CONTENT, MDAST_SECTION_FRONTMATTER},
    JsTransformOptions, TocEntry, TransformResult,
};

pub(crate) struct MarkdownTransformer {
    frontmatter: bool,
    toc_max_depth: u8,
    parser_options: ParserOptions,
    renderer_options: HtmlRendererOptions,
}

struct PreparedMarkdownSource {
    content: String,
    frontmatter: HashMap<String, serde_json::Value>,
}

impl MarkdownTransformer {
    pub(crate) fn from_options(options: &JsTransformOptions) -> Self {
        Self {
            frontmatter: options.frontmatter.unwrap_or(true),
            toc_max_depth: options.toc_max_depth.unwrap_or(3),
            parser_options: transform_options_to_parser_options(options),
            renderer_options: transform_options_to_renderer_options(options),
        }
    }

    pub(crate) fn transform(&self, source: &str) -> TransformResult {
        let prepared = self.prepare_source(source);
        let allocator = Allocator::new();
        let parse_result = self.parse_document(&allocator, &prepared.content);

        match parse_result {
            Ok(document) => TransformResult {
                html: self.render_html(&document),
                frontmatter: serde_json::to_string(&prepared.frontmatter)
                    .unwrap_or_else(|_| "{}".to_string()),
                toc: extract_toc(&document, self.toc_max_depth),
                errors: vec![],
            },
            Err(error) => TransformResult {
                html: String::new(),
                frontmatter: "{}".to_string(),
                toc: vec![],
                errors: vec![error.to_string()],
            },
        }
    }

    pub(crate) fn transform_mdast_raw(&self, source: &str) -> napi::Result<Uint8Array> {
        let prepared = self.prepare_source(source);
        let content_bytes = prepared.content.as_bytes().to_vec();
        let frontmatter_bytes = serde_json::to_vec(&prepared.frontmatter)
            .map_err(|error| napi::Error::from_reason(error.to_string()))?;
        let allocator = Allocator::new();
        let document = self
            .parse_document(&allocator, &prepared.content)
            .map_err(|error| napi::Error::from_reason(error.to_string()))?;

        mdast_raw::to_mdast_raw_with_sections(
            &document,
            vec![
                (MDAST_SECTION_CONTENT, content_bytes),
                (MDAST_SECTION_FRONTMATTER, frontmatter_bytes),
            ],
        )
    }

    pub(crate) fn parse_document<'a>(
        &self,
        allocator: &'a Allocator,
        source: &'a str,
    ) -> Result<Document<'a>, ParseError> {
        Parser::with_options(allocator, source, self.parser_options.clone()).parse()
    }

    pub(crate) fn render_html(&self, document: &Document<'_>) -> String {
        let mut renderer = HtmlRenderer::with_options(self.renderer_options.clone());
        renderer.render(document)
    }

    fn prepare_source(&self, source: &str) -> PreparedMarkdownSource {
        if self.frontmatter {
            let (content, frontmatter) = parse_frontmatter(source);
            PreparedMarkdownSource { content, frontmatter }
        } else {
            PreparedMarkdownSource { content: source.to_string(), frontmatter: HashMap::new() }
        }
    }
}

pub(crate) fn parse_frontmatter(source: &str) -> (String, HashMap<String, serde_json::Value>) {
    let mut frontmatter = HashMap::new();

    if !source.starts_with("---") {
        return (source.to_string(), frontmatter);
    }

    let rest = &source[3..];
    let Some(end_pos) = rest.find("\n---") else {
        return (source.to_string(), frontmatter);
    };

    let frontmatter_str = &rest[..end_pos].trim_start_matches('\n');
    let content = &rest[end_pos + 4..].trim_start_matches('\n');

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
                let s = value_str.trim_matches('"').trim_matches('\'');
                serde_json::Value::String(s.to_string())
            };

            frontmatter.insert(key, value);
        }
    }

    (content.to_string(), frontmatter)
}

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

fn extract_heading_text(heading: &Heading) -> String {
    let mut text = String::new();
    for child in &heading.children {
        collect_text(child, &mut text);
    }
    text
}

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

fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' { c } else { ' ' })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-")
}

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

fn transform_options_to_renderer_options(opts: &JsTransformOptions) -> HtmlRendererOptions {
    let mut options = HtmlRendererOptions::new();

    if let Some(v) = opts.convert_md_links {
        options.convert_md_links = v;
    }

    if let Some(v) = &opts.base_url {
        options.base_url.clone_from(v);
    }

    if let Some(v) = &opts.source_path {
        options.source_path.clone_from(v);
    }

    options
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transforms_markdown_with_frontmatter_and_toc() {
        let transformer = MarkdownTransformer::from_options(&JsTransformOptions {
            gfm: Some(true),
            toc_max_depth: Some(2),
            ..Default::default()
        });
        let result =
            transformer.transform("---\ntitle: Example\n---\n# Hello\n\nThis is a paragraph.");

        assert!(result.errors.is_empty());
        assert!(result.html.contains("<h1>Hello</h1>"));
        assert!(result.frontmatter.contains("\"title\":\"Example\""));
        assert_eq!(result.toc.len(), 1);
        assert_eq!(result.toc[0].slug, "hello");
    }

    #[test]
    fn leaves_non_frontmatter_documents_untouched() {
        let (content, frontmatter) = parse_frontmatter("# Hello");

        assert_eq!(content, "# Hello");
        assert!(frontmatter.is_empty());
    }

    #[test]
    fn skips_frontmatter_extraction_when_disabled() {
        let source = "---\ntitle: Example\n---\n# Hello";
        let transformer = MarkdownTransformer::from_options(&JsTransformOptions {
            frontmatter: Some(false),
            ..Default::default()
        });
        let prepared = transformer.prepare_source(source);

        assert_eq!(prepared.content, source);
        assert!(prepared.frontmatter.is_empty());
    }
}
