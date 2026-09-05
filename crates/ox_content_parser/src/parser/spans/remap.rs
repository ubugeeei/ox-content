use ox_content_ast::{ListItem, Node, Span};

use super::super::Parser;
use super::SourceMap;

impl<'a> Parser<'a> {
    fn remap_span(span: &mut Span, source_map: &SourceMap) {
        *span = source_map.map_span(*span);
    }

    pub(super) fn remap_node_spans(node: &mut Node<'a>, source_map: &SourceMap) {
        match node {
            Node::Paragraph(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::Heading(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::ThematicBreak(node) => Self::remap_span(&mut node.span, source_map),
            Node::BlockQuote(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::List(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_list_item_spans(child, source_map);
                }
            }
            Node::ListItem(node) => Self::remap_list_item_spans(node, source_map),
            Node::CodeBlock(node) => Self::remap_span(&mut node.span, source_map),
            Node::MathBlock(node) => Self::remap_span(&mut node.span, source_map),
            Node::Html(node) => Self::remap_span(&mut node.span, source_map),
            Node::Table(node) => {
                Self::remap_span(&mut node.span, source_map);
                for row in &mut node.children {
                    Self::remap_span(&mut row.span, source_map);
                    for cell in &mut row.children {
                        Self::remap_span(&mut cell.span, source_map);
                        for child in &mut cell.children {
                            Self::remap_node_spans(child, source_map);
                        }
                    }
                }
            }
            Node::DefinitionList(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::DefinitionListTerm(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::DefinitionListDefinition(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::Text(node) => Self::remap_span(&mut node.span, source_map),
            Node::Emphasis(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::Strong(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::InlineCode(node) => Self::remap_span(&mut node.span, source_map),
            Node::InlineMath(node) => Self::remap_span(&mut node.span, source_map),
            Node::Break(node) => Self::remap_span(&mut node.span, source_map),
            Node::Link(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::Image(node) => Self::remap_span(&mut node.span, source_map),
            Node::Delete(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::Superscript(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::Subscript(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::FootnoteReference(node) => Self::remap_span(&mut node.span, source_map),
            Node::Definition(node) => Self::remap_span(&mut node.span, source_map),
            Node::FootnoteDefinition(node) => {
                Self::remap_span(&mut node.span, source_map);
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::MdxJsxFlowElement(node) => {
                Self::remap_span(&mut node.span, source_map);
                for attribute in &mut node.attributes {
                    Self::remap_mdx_attribute_entry(attribute, source_map);
                }
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::MdxJsxTextElement(node) => {
                Self::remap_span(&mut node.span, source_map);
                for attribute in &mut node.attributes {
                    Self::remap_mdx_attribute_entry(attribute, source_map);
                }
                for child in &mut node.children {
                    Self::remap_node_spans(child, source_map);
                }
            }
            Node::MdxjsEsm(node) => Self::remap_span(&mut node.span, source_map),
            Node::MdxFlowExpression(node) => Self::remap_span(&mut node.span, source_map),
            Node::MdxTextExpression(node) => Self::remap_span(&mut node.span, source_map),
        }
    }

    fn remap_mdx_attribute_entry(
        entry: &mut ox_content_ast::MdxJsxAttributeEntry<'a>,
        source_map: &SourceMap,
    ) {
        match entry {
            ox_content_ast::MdxJsxAttributeEntry::Attribute(attribute) => {
                Self::remap_span(&mut attribute.span, source_map);
                if let Some(ox_content_ast::MdxJsxAttributeValue::Expression(expr)) =
                    &mut attribute.value
                {
                    Self::remap_span(&mut expr.span, source_map);
                }
            }
            ox_content_ast::MdxJsxAttributeEntry::Expression(expr) => {
                Self::remap_span(&mut expr.span, source_map);
            }
        }
    }

    fn remap_list_item_spans(list_item: &mut ListItem<'a>, source_map: &SourceMap) {
        Self::remap_span(&mut list_item.span, source_map);
        for child in &mut list_item.children {
            Self::remap_node_spans(child, source_map);
        }
    }
}
