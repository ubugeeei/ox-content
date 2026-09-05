use ox_content_allocator::{String as ArenaString, Vec};
use ox_content_ast::{Link, Node, Text};

use super::Parser;
#[allow(unused_imports)]
use crate::profile_span_detail;

impl<'a> Parser<'a> {
    pub(super) fn apply_smart_punctuation(&self, children: &mut Vec<'a, Node<'a>>) {
        profile_span_detail!("parser::smart_punctuation");
        let mut state = SmartPunctuationState::default();
        self.apply_smart_punctuation_nodes(children, &mut state);
    }

    fn apply_smart_punctuation_nodes(
        &self,
        children: &mut Vec<'a, Node<'a>>,
        state: &mut SmartPunctuationState,
    ) {
        for child in children {
            match child {
                Node::Text(text) => self.apply_smart_punctuation_text(text, state),
                Node::Emphasis(node) => {
                    self.apply_smart_punctuation_nodes(&mut node.children, state);
                }
                Node::Strong(node) => self.apply_smart_punctuation_nodes(&mut node.children, state),
                Node::Delete(node) => self.apply_smart_punctuation_nodes(&mut node.children, state),
                Node::Superscript(node) => {
                    self.apply_smart_punctuation_nodes(&mut node.children, state);
                }
                Node::Subscript(node) => {
                    self.apply_smart_punctuation_nodes(&mut node.children, state);
                }
                Node::MdxJsxTextElement(node) => {
                    self.apply_smart_punctuation_nodes(&mut node.children, state);
                }
                Node::Link(link) if is_gfm_autolink_like(link) => {
                    state.observe_nodes(&link.children);
                }
                Node::Link(link) => {
                    self.apply_smart_punctuation_nodes(&mut link.children, state);
                }
                Node::InlineCode(code) => state.observe_str(code.value),
                Node::InlineMath(math) => state.observe_str(math.value),
                _ => {}
            }
        }
    }

    fn apply_smart_punctuation_text(&self, text: &mut Text<'a>, state: &mut SmartPunctuationState) {
        let Some(value) = self.smart_punctuation_text(text.value, state) else {
            return;
        };
        text.value = value;
    }

    fn smart_punctuation_text(
        &self,
        value: &'a str,
        state: &mut SmartPunctuationState,
    ) -> Option<&'a str> {
        let bytes = value.as_bytes();
        let mut output: Option<ArenaString<'a>> = None;
        let mut last_copy = 0usize;
        let mut pos = 0usize;

        while pos < value.len() {
            let replacement = match bytes[pos] {
                b'.' if value[pos..].starts_with("...") => Some((3, "\u{2026}")),
                b'-' if value[pos..].starts_with("---") => Some((3, "\u{2014}")),
                b'-' if value[pos..].starts_with("--") => Some((2, "\u{2013}")),
                b'"' => Some((
                    1,
                    if state.is_opening_quote_context() { "\u{201c}" } else { "\u{201d}" },
                )),
                b'\'' => Some((
                    1,
                    if state.is_opening_quote_context() { "\u{2018}" } else { "\u{2019}" },
                )),
                _ => None,
            };

            if let Some((len, replacement)) = replacement {
                let out = output.get_or_insert_with(|| {
                    ArenaString::with_capacity_in(value.len(), self.allocator.bump())
                });
                out.push_str(&value[last_copy..pos]);
                out.push_str(replacement);
                state.observe_str(replacement);
                pos += len;
                last_copy = pos;
            } else {
                let Some(ch) = value[pos..].chars().next() else {
                    break;
                };
                state.observe_char(ch);
                pos += ch.len_utf8();
            }
        }

        output.map(|mut output| {
            output.push_str(&value[last_copy..]);
            self.allocator.alloc_str(&output)
        })
    }
}

#[derive(Default)]
struct SmartPunctuationState {
    previous: Option<char>,
}

impl SmartPunctuationState {
    fn is_opening_quote_context(&self) -> bool {
        self.previous.is_none_or(|ch| ch.is_whitespace() || matches!(ch, '(' | '[' | '{' | '<'))
    }

    fn observe_char(&mut self, ch: char) {
        self.previous = Some(ch);
    }

    fn observe_str(&mut self, value: &str) {
        if let Some(ch) = value.chars().next_back() {
            self.previous = Some(ch);
        }
    }

    fn observe_nodes(&mut self, nodes: &[Node<'_>]) {
        for node in nodes {
            self.observe_node(node);
        }
    }

    fn observe_node(&mut self, node: &Node<'_>) {
        match node {
            Node::Text(text) => self.observe_str(text.value),
            Node::Emphasis(node) => self.observe_nodes(&node.children),
            Node::Strong(node) => self.observe_nodes(&node.children),
            Node::Delete(node) => self.observe_nodes(&node.children),
            Node::Superscript(node) => self.observe_nodes(&node.children),
            Node::Subscript(node) => self.observe_nodes(&node.children),
            Node::Link(node) => self.observe_nodes(&node.children),
            Node::InlineCode(node) => self.observe_str(node.value),
            Node::InlineMath(node) => self.observe_str(node.value),
            Node::MdxJsxTextElement(node) => self.observe_nodes(&node.children),
            _ => {}
        }
    }
}

fn is_gfm_autolink_like(link: &Link<'_>) -> bool {
    if link.title.is_some() || link.children.len() != 1 {
        return false;
    }
    let Some(Node::Text(text)) = link.children.iter().next() else {
        return false;
    };
    text.value == link.url
        || link.url.strip_prefix("http://") == Some(text.value)
        || link.url.strip_prefix("mailto:") == Some(text.value)
}
