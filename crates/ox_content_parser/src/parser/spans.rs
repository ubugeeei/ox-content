use ox_content_ast::{ListItem, Node, Span};
use smallvec::SmallVec;

use super::Parser;

mod remap;

#[derive(Debug, Default)]
pub(in crate::parser) struct SourceMap {
    lines: SmallVec<[SourceMapLine; 8]>,
}

#[derive(Debug, Clone, Copy)]
struct SourceMapLine {
    generated_start: usize,
    generated_end: usize,
    source_block_start: usize,
    source_start: usize,
    source_end: usize,
}

impl SourceMap {
    pub(in crate::parser) fn push_line(
        &mut self,
        generated_start: usize,
        generated_len: usize,
        source_start: usize,
        source_len: usize,
    ) {
        self.push_line_with_block_start(
            generated_start,
            generated_len,
            source_start,
            source_start,
            source_len,
        );
    }

    pub(in crate::parser) fn push_line_with_block_start(
        &mut self,
        generated_start: usize,
        generated_len: usize,
        source_block_start: usize,
        source_start: usize,
        source_len: usize,
    ) {
        self.lines.push(SourceMapLine {
            generated_start,
            generated_end: generated_start + generated_len,
            source_block_start,
            source_start,
            source_end: source_start + source_len,
        });
    }

    pub(in crate::parser) fn remap_node_spans<'a>(&self, node: &mut Node<'a>) {
        Parser::remap_node_spans(node, self);
    }

    fn map_span(&self, span: Span) -> Span {
        if self.lines.is_empty() {
            return span;
        }

        let start = self.map_start(span.start as usize);
        let end = if span.start == span.end { start } else { self.map_end(span.end as usize) };
        Span::new(start, end)
    }

    fn map_start(&self, generated: usize) -> u32 {
        let index = self.lines.partition_point(|line| generated >= line.generated_end);
        let Some(line) = self.lines.get(index).copied() else {
            return self.lines.last().map_or(generated, |line| line.source_end) as u32;
        };
        Self::map_inside(line, generated) as u32
    }

    fn map_end(&self, generated: usize) -> u32 {
        let index = self.lines.partition_point(|line| generated > line.generated_end);
        let Some(line) = self.lines.get(index).copied() else {
            return self.lines.last().map_or(generated, |line| line.source_end) as u32;
        };
        Self::map_inside(line, generated) as u32
    }

    fn map_inside(line: SourceMapLine, generated: usize) -> usize {
        if generated == line.generated_start {
            return line.source_block_start;
        }
        let generated_delta = generated.saturating_sub(line.generated_start);
        let source_len = line.source_end.saturating_sub(line.source_start);
        line.source_start + generated_delta.min(source_len)
    }
}

impl<'a> Parser<'a> {
    pub(super) fn offset_span(span: &mut Span, offset: u32) {
        span.start += offset;
        span.end += offset;
    }

    pub(super) fn offset_node_spans(node: &mut Node<'a>, offset: u32) {
        match node {
            Node::Paragraph(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::Heading(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::ThematicBreak(node) => Self::offset_span(&mut node.span, offset),
            Node::BlockQuote(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::List(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_list_item_spans(child, offset);
                }
            }
            Node::ListItem(node) => Self::offset_list_item_spans(node, offset),
            Node::CodeBlock(node) => Self::offset_span(&mut node.span, offset),
            Node::MathBlock(node) => Self::offset_span(&mut node.span, offset),
            Node::Html(node) => Self::offset_span(&mut node.span, offset),
            Node::Table(node) => {
                Self::offset_span(&mut node.span, offset);
                for row in &mut node.children {
                    Self::offset_span(&mut row.span, offset);
                    for cell in &mut row.children {
                        Self::offset_span(&mut cell.span, offset);
                        for child in &mut cell.children {
                            Self::offset_node_spans(child, offset);
                        }
                    }
                }
            }
            Node::DefinitionList(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::DefinitionListTerm(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::DefinitionListDefinition(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::Text(node) => Self::offset_span(&mut node.span, offset),
            Node::Emphasis(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::Strong(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::InlineCode(node) => Self::offset_span(&mut node.span, offset),
            Node::InlineMath(node) => Self::offset_span(&mut node.span, offset),
            Node::Break(node) => Self::offset_span(&mut node.span, offset),
            Node::Link(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::Image(node) => Self::offset_span(&mut node.span, offset),
            Node::Delete(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::Superscript(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::Subscript(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::FootnoteReference(node) => Self::offset_span(&mut node.span, offset),
            Node::Definition(node) => Self::offset_span(&mut node.span, offset),
            Node::FootnoteDefinition(node) => {
                Self::offset_span(&mut node.span, offset);
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::MdxJsxFlowElement(node) => {
                Self::offset_span(&mut node.span, offset);
                for attribute in &mut node.attributes {
                    Self::offset_mdx_attribute_entry(attribute, offset);
                }
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::MdxJsxTextElement(node) => {
                Self::offset_span(&mut node.span, offset);
                for attribute in &mut node.attributes {
                    Self::offset_mdx_attribute_entry(attribute, offset);
                }
                for child in &mut node.children {
                    Self::offset_node_spans(child, offset);
                }
            }
            Node::MdxjsEsm(node) => Self::offset_span(&mut node.span, offset),
            Node::MdxFlowExpression(node) => Self::offset_span(&mut node.span, offset),
            Node::MdxTextExpression(node) => Self::offset_span(&mut node.span, offset),
        }
    }

    fn offset_mdx_attribute_entry(
        entry: &mut ox_content_ast::MdxJsxAttributeEntry<'a>,
        offset: u32,
    ) {
        match entry {
            ox_content_ast::MdxJsxAttributeEntry::Attribute(attribute) => {
                Self::offset_span(&mut attribute.span, offset);
                if let Some(ox_content_ast::MdxJsxAttributeValue::Expression(expr)) =
                    &mut attribute.value
                {
                    Self::offset_span(&mut expr.span, offset);
                }
            }
            ox_content_ast::MdxJsxAttributeEntry::Expression(expr) => {
                Self::offset_span(&mut expr.span, offset);
            }
        }
    }

    pub(super) fn offset_list_item_spans(list_item: &mut ListItem<'a>, offset: u32) {
        Self::offset_span(&mut list_item.span, offset);
        for child in &mut list_item.children {
            Self::offset_node_spans(child, offset);
        }
    }
}
