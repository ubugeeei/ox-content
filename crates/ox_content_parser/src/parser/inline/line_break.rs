use ox_content_allocator::Vec;
use ox_content_ast::{Node, Span};

use super::super::line_scan::line_terminator_end;
use super::Parser;
#[allow(unused_imports)]
use crate::profile_span_detail;

impl<'a> Parser<'a> {
    /// Handles a newline inside inline content.
    pub(super) fn parse_line_break(
        content: &'a str,
        offset: usize,
        children: &mut Vec<'a, Node<'a>>,
        pos: &mut usize,
    ) {
        profile_span_detail!("parser::inline_line_break");
        let bytes = content.as_bytes();
        let mut hard = false;
        let mut trim_to = None;
        if let Some(Node::Text(text)) = children.last() {
            let trimmed_len = text.value.trim_end_matches(' ').len();
            if trimmed_len < text.value.len() {
                hard = text.value.len() - trimmed_len >= 2;
                trim_to = Some(trimmed_len);
            }
        }
        if let Some(new_len) = trim_to {
            if new_len == 0 {
                children.pop();
            } else if let Some(Node::Text(text)) = children.last_mut() {
                let removed = (text.value.len() - new_len) as u32;
                text.value = &text.value[..new_len];
                text.span = Span::new(text.span.start, text.span.end - removed);
            }
        }

        let newline_pos = *pos;
        let newline_end = line_terminator_end(bytes, newline_pos);
        *pos = newline_end;
        while *pos < content.len() && matches!(bytes[*pos], b' ' | b'\t') {
            *pos += 1;
        }

        let span = Span::new((offset + newline_pos) as u32, (offset + newline_end) as u32);
        if hard {
            children.push(Node::Break(ox_content_ast::Break { span }));
        } else {
            Self::push_text(children, "\n", offset + newline_pos, offset + newline_pos + 1);
        }
    }
}
