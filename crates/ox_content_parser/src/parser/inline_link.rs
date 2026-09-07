//! Inline link parsing.
//!
//! Split out of `inline_helpers` because CommonMark's "a link may not
//! contain a link" rule makes this the one inline construct that has to
//! parse its own text before it can decide what it is.

use ox_content_allocator::Vec;
use ox_content_ast::{Link, Node, Span};

use super::Parser;
use crate::error::ParseResult;
#[allow(unused_imports)]
use crate::profile_span_detail;

impl<'a> Parser<'a> {
    pub(super) fn parse_link(
        &self,
        content: &'a str,
        offset: usize,
        children: &mut Vec<'a, Node<'a>>,
        pos: &mut usize,
    ) -> ParseResult<()> {
        profile_span_detail!("parser::inline_link");
        let bytes = content.as_bytes();
        let link_start = *pos;

        // `[^label]` is a footnote reference when the extension is on and
        // a definition exists; otherwise it falls through to normal link
        // handling and may still be a link label.
        if self.options.footnotes
            && bytes.get(*pos + 1) == Some(&b'^')
            && self.try_parse_footnote_reference(content, offset, children, pos)
        {
            return Ok(());
        }

        // Every accepting branch below needs a `]`, and `scan_balanced`
        // only reports that there is none after walking to the end of the
        // content — once per bracket, which is quadratic over a run of
        // them. Settle it for the whole slice first.
        if !self.has_closer_from(content, *pos + 1, b']') {
            Self::push_text(children, "[", offset + link_start, offset + link_start + 1);
            *pos = link_start + 1;
            return Ok(());
        }

        if self.options.wiki_links
            && bytes.get(link_start + 1) == Some(&b'[')
            && let Some((link, end)) = self.try_parse_wiki_link(content, offset, link_start)?
        {
            children.push(link);
            *pos = end;
            return Ok(());
        }

        *pos += 1;
        let text_start = *pos;
        *pos = Self::scan_balanced(content, *pos, b'[', b']');

        if *pos < content.len() && bytes[*pos] == b']' {
            let close = *pos;
            let link_text = &content[text_start..close];
            // Links may not contain other links; when the bracket text
            // parses to one, the outer bracket stays literal and the
            // inner (re-parsed after the fallback) wins.
            //
            // The probe needs the parsed children, and so does every
            // accepting branch below, so parse once and hand the nodes on.
            // The verdict is memoized because the literal-bracket fallback
            // makes the caller re-scan these same bytes; re-probing there
            // is what turns nested brackets into exponential work.
            let mut inner_nodes = None;
            let inner_has_link = memchr::memchr(b'[', link_text.as_bytes()).is_some()
                && self.probe_link_text(link_text, offset + text_start, &mut inner_nodes);

            // Inline form: [text](dest "title")
            if !inner_has_link
                && bytes.get(close + 1) == Some(&b'(')
                && let Some(target) = self.parse_link_target(content, close + 1)
            {
                let children_nodes = match inner_nodes.take() {
                    Some(nodes) => nodes,
                    None => self.parse_inline(link_text, offset + text_start)?,
                };
                children.push(Node::Link(self.allocator.boxed(Link {
                    url: target.url,
                    title: target.title,
                    children: children_nodes,
                    span: Span::new((offset + link_start) as u32, (offset + target.end) as u32),
                })));
                *pos = target.end;
                return Ok(());
            }

            // Full [text][label] and collapsed [text][] reference forms.
            let mut well_formed_reference = false;
            if !inner_has_link
                && bytes.get(close + 1) == Some(&b'[')
                && self.has_closer_from(content, close + 2, b']')
            {
                let label_start = close + 2;
                let label_end = Self::scan_balanced(content, label_start, b'[', b']');
                if label_end < content.len() && bytes[label_end] == b']' {
                    well_formed_reference = true;
                    let raw_label = &content[label_start..label_end];
                    let key = if raw_label.trim().is_empty() { link_text } else { raw_label };
                    if let Some(reference) = self.lookup_reference(key) {
                        let (url, title) = (reference.url, reference.title);
                        let children_nodes = match inner_nodes.take() {
                            Some(nodes) => nodes,
                            None => self.parse_inline(link_text, offset + text_start)?,
                        };
                        children.push(Node::Link(self.allocator.boxed(Link {
                            url,
                            title,
                            children: children_nodes,
                            span: Span::new(
                                (offset + link_start) as u32,
                                (offset + label_end + 1) as u32,
                            ),
                        })));
                        *pos = label_end + 1;
                        return Ok(());
                    }
                }
            }

            // Shortcut form: [label]. Suppressed when an explicit (but
            // unknown) [label] followed, which must stay literal.
            if !inner_has_link
                && !well_formed_reference
                && let Some(reference) = self.lookup_reference(link_text)
            {
                let (url, title) = (reference.url, reference.title);
                let children_nodes = match inner_nodes.take() {
                    Some(nodes) => nodes,
                    None => self.parse_inline(link_text, offset + text_start)?,
                };
                children.push(Node::Link(self.allocator.boxed(Link {
                    url,
                    title,
                    children: children_nodes,
                    span: Span::new((offset + link_start) as u32, (offset + close + 1) as u32),
                })));
                *pos = close + 1;
                return Ok(());
            }
        }

        // No valid inline link here: the bracket is literal text and the
        // rest of the bracketed run is re-parsed for other inline markup.
        Self::push_text(children, "[", offset + link_start, offset + link_start + 1);
        *pos = link_start + 1;
        Ok(())
    }

    fn try_parse_wiki_link(
        &self,
        content: &'a str,
        offset: usize,
        link_start: usize,
    ) -> ParseResult<Option<(Node<'a>, usize)>> {
        let Some(close) = Self::scan_wiki_link_close(content.as_bytes(), link_start + 2) else {
            return Ok(None);
        };
        let (inner, inner_offset) =
            trim_with_offset(&content[link_start + 2..close], link_start + 2);
        if inner.is_empty() {
            return Ok(None);
        }

        let (target_part, label_part, label_part_offset) =
            split_wiki_link_inner(inner, inner_offset);
        let (target, target_offset) = trim_with_offset(target_part, inner_offset);
        if target.is_empty() {
            return Ok(None);
        }

        let (label, label_offset) = if let Some(label_part) = label_part {
            let (label, label_offset) = trim_with_offset(label_part, label_part_offset);
            if label.is_empty() { (target, target_offset) } else { (label, label_offset) }
        } else {
            (target, target_offset)
        };

        let mut label_nodes = None;
        if memchr::memchr(b'[', label.as_bytes()).is_some()
            && self.probe_link_text(label, offset + label_offset, &mut label_nodes)
        {
            return Ok(None);
        }

        let children = match label_nodes.take() {
            Some(nodes) => nodes,
            None => self.parse_inline(label, offset + label_offset)?,
        };
        Ok(Some((
            Node::Link(self.allocator.boxed(Link {
                url: target,
                title: None,
                children,
                span: Span::new((offset + link_start) as u32, (offset + close + 2) as u32),
            })),
            close + 2,
        )))
    }

    fn scan_wiki_link_close(bytes: &[u8], mut cursor: usize) -> Option<usize> {
        while cursor + 1 < bytes.len() {
            match bytes[cursor] {
                b'\\' => {
                    cursor += 2;
                }
                b'`' => {
                    cursor = Self::closed_code_span_end(bytes, cursor)
                        .unwrap_or_else(|| cursor.saturating_add(1));
                }
                b']' if bytes[cursor + 1] == b']' => return Some(cursor),
                _ => cursor += 1,
            }
        }
        None
    }

    /// Reports whether `link_text` already parses to something containing a
    /// link, so the surrounding bracket cannot become one.
    ///
    /// On a cache miss the parsed nodes are handed back through `nodes`,
    /// because an accepting branch in `parse_link` needs exactly those
    /// children and would otherwise parse the same bytes a second time.
    fn probe_link_text(
        &self,
        link_text: &'a str,
        offset: usize,
        nodes: &mut Option<Vec<'a, Node<'a>>>,
    ) -> bool {
        let key = (link_text.as_ptr() as usize, link_text.len());
        // Borrow only for the lookup: the parse below re-enters this method.
        let cached = self.link_probe_cache.borrow().get(&key).copied();
        if let Some(verdict) = cached {
            return verdict;
        }
        let Ok(parsed) = self.parse_inline(link_text, offset) else {
            // A failing sub-parse cannot yield a link, and the caller's own
            // parse of the same text surfaces the error.
            return false;
        };
        let verdict = contains_link(&parsed);
        self.link_probe_cache.borrow_mut().insert(key, verdict);
        *nodes = Some(parsed);
        verdict
    }
}

fn split_wiki_link_inner(inner: &str, offset: usize) -> (&str, Option<&str>, usize) {
    if let Some((target, label)) = inner.split_once('|') {
        (target, Some(label), offset + target.len() + 1)
    } else {
        (inner, None, offset)
    }
}

fn trim_with_offset(value: &str, offset: usize) -> (&str, usize) {
    let trimmed_start = value.trim_start();
    let leading = value.len() - trimmed_start.len();
    (trimmed_start.trim_end(), offset + leading)
}

/// Does any node in the tree contain a link?
fn contains_link(nodes: &[Node<'_>]) -> bool {
    nodes.iter().any(|node| match node {
        Node::Link(_) => true,
        Node::Emphasis(n) => contains_link(&n.children),
        Node::Strong(n) => contains_link(&n.children),
        Node::Delete(n) => contains_link(&n.children),
        Node::Superscript(n) => contains_link(&n.children),
        Node::Subscript(n) => contains_link(&n.children),
        _ => false,
    })
}
