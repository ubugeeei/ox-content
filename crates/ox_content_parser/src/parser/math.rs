//! Opt-in `$...$` inline and `$$...$$` display math nodes.

use memchr::{memchr, memchr2};
use ox_content_allocator::Vec;
use ox_content_ast::{InlineMath, MathBlock, Node, Span};

use super::Parser;
use crate::error::ParseResult;
#[allow(unused_imports)]
use crate::profile_span_detail;

impl<'a> Parser<'a> {
    pub(super) fn try_parse_math_block_at(
        &self,
        line_start: usize,
        line: &str,
        trimmed: &str,
    ) -> bool {
        let trimmed_offset = trimmed.as_ptr() as usize - line.as_ptr() as usize;
        self.options.math
            && Self::indentation_columns(line) <= 3
            && trimmed.starts_with("$$")
            && math_block_close(self.source.as_bytes(), line_start + trimmed_offset + 2).is_some()
    }

    pub(super) fn parse_math_block(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        profile_span_detail!("parser::math_block");
        let line = self.line_at(start);
        let trimmed_offset = line.len() - line.trim_start_matches([' ', '\t']).len();
        let open = start + trimmed_offset;
        let Some(close) = math_block_close(self.source.as_bytes(), open + 2) else {
            return self.parse_paragraph(start, None);
        };
        let close_end = close + 2;
        let line_end = line_end_after(self.source.as_bytes(), close_end);
        self.position = if line_end < self.source.len() { line_end + 1 } else { line_end };
        let value = &self.source[open + 2..close];
        Ok(Some(Node::MathBlock(
            self.allocator
                .boxed(MathBlock { value, span: Span::new(start as u32, self.position as u32) }),
        )))
    }

    pub(super) fn parse_inline_math(
        content: &'a str,
        offset: usize,
        children: &mut Vec<'a, Node<'a>>,
        pos: &mut usize,
    ) {
        profile_span_detail!("parser::inline_math");
        let bytes = content.as_bytes();
        let open_len = if bytes.get(*pos + 1) == Some(&b'$') { 2 } else { 1 };
        if !can_open_inline(bytes, *pos, open_len)
            && !can_open_digit_prefixed_inline_math(bytes, *pos, open_len)
        {
            Self::push_text(children, &content[*pos..*pos + 1], offset + *pos, offset + *pos + 1);
            *pos += 1;
            return;
        }

        let inner_start = *pos + open_len;
        let mut cursor = inner_start;
        while let Some(relative) = memchr2(b'$', b'`', &bytes[cursor..]) {
            let candidate = cursor + relative;
            if bytes[candidate] == b'`' {
                if let Some(end) = Self::closed_code_span_end(bytes, candidate) {
                    cursor = end;
                } else {
                    cursor = candidate + Self::marker_run_len(bytes, candidate, b'`');
                }
                continue;
            }
            if is_escaped_marker(bytes, candidate) {
                cursor = candidate + 1;
                continue;
            }
            if marker_len_at(bytes, candidate) >= open_len
                && can_close_inline(bytes, candidate, open_len)
            {
                let span =
                    Span::new((offset + *pos) as u32, (offset + candidate + open_len) as u32);
                children.push(Node::InlineMath(InlineMath {
                    value: &content[inner_start..candidate],
                    span,
                }));
                *pos = candidate + open_len;
                return;
            }
            cursor = candidate + 1;
        }

        Self::push_text(
            children,
            &content[*pos..*pos + open_len],
            offset + *pos,
            offset + *pos + open_len,
        );
        *pos += open_len;
    }
}

fn math_block_close(bytes: &[u8], mut cursor: usize) -> Option<usize> {
    while let Some(relative) = memchr(b'$', &bytes[cursor..]) {
        let dollar = cursor + relative;
        if is_escaped_marker(bytes, dollar) {
            cursor = dollar + 1;
            continue;
        }
        if bytes.get(dollar + 1) == Some(&b'$') && is_line_end(bytes, dollar + 2) {
            return Some(dollar);
        }
        cursor = dollar + 1;
    }
    None
}

fn can_open_inline(bytes: &[u8], index: usize, open_len: usize) -> bool {
    let next = bytes.get(index + open_len).copied();
    let prev = index.checked_sub(1).and_then(|prev| bytes.get(prev).copied());
    !matches!(next, None | Some(b' ' | b'\t' | b'\n' | b'0'..=b'9'))
        && !matches!(prev, Some(b'0'..=b'9'))
}

fn can_open_digit_prefixed_inline_math(bytes: &[u8], index: usize, open_len: usize) -> bool {
    let next = bytes.get(index + open_len).copied();
    let prev = index.checked_sub(1).and_then(|prev| bytes.get(prev).copied());
    matches!(next, Some(b'0'..=b'9'))
        && !matches!(prev, Some(b'0'..=b'9'))
        && has_closing_inline_math(bytes, index, open_len)
}

fn has_closing_inline_math(bytes: &[u8], index: usize, open_len: usize) -> bool {
    let mut cursor = index + open_len;
    while let Some(relative) = memchr2(b'$', b'`', &bytes[cursor..]) {
        let candidate = cursor + relative;
        if bytes[candidate] == b'`' {
            if let Some(end) = Parser::closed_code_span_end(bytes, candidate) {
                cursor = end;
            } else {
                cursor = candidate + Parser::marker_run_len(bytes, candidate, b'`');
            }
            continue;
        }
        if !is_escaped_marker(bytes, candidate)
            && marker_len_at(bytes, candidate) >= open_len
            && can_close_inline(bytes, candidate, open_len)
        {
            return bytes[index + open_len..candidate]
                .iter()
                .any(|byte| matches!(byte, b'*' | b'_'));
        }
        cursor = candidate + 1;
    }
    false
}

fn can_close_inline(bytes: &[u8], index: usize, close_len: usize) -> bool {
    let prev = index.checked_sub(1).and_then(|prev| bytes.get(prev).copied());
    let next = bytes.get(index + close_len).copied();
    !matches!(prev, None | Some(b' ' | b'\t' | b'\n')) && !matches!(next, Some(b'0'..=b'9'))
}

fn marker_len_at(bytes: &[u8], start: usize) -> usize {
    let mut len = 0;
    while bytes.get(start + len) == Some(&b'$') {
        len += 1;
    }
    len
}

fn is_escaped_marker(bytes: &[u8], pos: usize) -> bool {
    let mut count = 0usize;
    let mut cursor = pos;
    while cursor > 0 && bytes[cursor - 1] == b'\\' {
        count += 1;
        cursor -= 1;
    }
    count % 2 == 1
}

fn is_line_end(bytes: &[u8], index: usize) -> bool {
    index >= bytes.len()
        || bytes[index..].iter().take_while(|byte| **byte != b'\n').all(u8::is_ascii_whitespace)
}

fn line_end_after(bytes: &[u8], index: usize) -> usize {
    memchr(b'\n', &bytes[index..]).map_or(bytes.len(), |relative| index + relative)
}
