//! Markdown parser implementation.

use ox_content_allocator::{Allocator, Vec};
use ox_content_ast::{Document, Node, Paragraph, Span, Text};

use crate::error::{ParseError, ParseResult};

/// Parser options.
#[derive(Debug, Clone, Default)]
pub struct ParserOptions {
    /// Enable GFM (GitHub Flavored Markdown) extensions.
    pub gfm: bool,
    /// Enable footnotes.
    pub footnotes: bool,
    /// Enable task lists.
    pub task_lists: bool,
    /// Enable tables.
    pub tables: bool,
    /// Enable strikethrough.
    pub strikethrough: bool,
    /// Enable autolinks.
    pub autolinks: bool,
    /// Maximum nesting depth for block elements.
    pub max_nesting_depth: usize,
}

impl ParserOptions {
    /// Creates new parser options with GFM extensions enabled.
    #[must_use]
    pub fn gfm() -> Self {
        Self {
            gfm: true,
            footnotes: true,
            task_lists: true,
            tables: true,
            strikethrough: true,
            autolinks: true,
            max_nesting_depth: 100,
        }
    }
}

/// Markdown parser.
pub struct Parser<'a> {
    /// Arena allocator.
    allocator: &'a Allocator,
    /// Source text.
    source: &'a str,
    /// Parser options.
    options: ParserOptions,
    /// Current position in the source.
    position: usize,
    /// Current nesting depth.
    nesting_depth: usize,
}

impl<'a> Parser<'a> {
    /// Creates a new parser with default options.
    #[must_use]
    pub fn new(allocator: &'a Allocator, source: &'a str) -> Self {
        Self { allocator, source, options: ParserOptions::default(), position: 0, nesting_depth: 0 }
    }

    /// Creates a new parser with the specified options.
    #[must_use]
    pub fn with_options(allocator: &'a Allocator, source: &'a str, options: ParserOptions) -> Self {
        Self { allocator, source, options, position: 0, nesting_depth: 0 }
    }

    /// Parses the source into a document AST.
    pub fn parse(mut self) -> ParseResult<Document<'a>> {
        let mut children = self.allocator.new_vec();

        while !self.is_at_end() {
            if let Some(node) = self.parse_block()? {
                children.push(node);
            }
        }

        let span = Span::new(0, self.source.len() as u32);
        Ok(Document { children, span })
    }

    /// Checks if we've reached the end of input.
    fn is_at_end(&self) -> bool {
        self.position >= self.source.len()
    }

    /// Returns the remaining source.
    fn remaining(&self) -> &'a str {
        &self.source[self.position..]
    }

    /// Peeks at the current character.
    fn peek(&self) -> Option<char> {
        self.remaining().chars().next()
    }

    /// Advances by one character.
    fn advance(&mut self) -> Option<char> {
        let ch = self.peek()?;
        self.position += ch.len_utf8();
        Some(ch)
    }

    /// Skips whitespace characters.
    fn skip_whitespace(&mut self) {
        while let Some(ch) = self.peek() {
            if ch == ' ' || ch == '\t' {
                self.advance();
            } else {
                break;
            }
        }
    }

    /// Skips blank lines.
    fn skip_blank_lines(&mut self) {
        while !self.is_at_end() {
            let start = self.position;
            self.skip_whitespace();
            if self.peek() == Some('\n') {
                self.advance();
            } else {
                self.position = start;
                break;
            }
        }
    }

    /// Parses a block element.
    fn parse_block(&mut self) -> ParseResult<Option<Node<'a>>> {
        self.skip_blank_lines();

        if self.is_at_end() {
            return Ok(None);
        }

        // Check nesting depth
        if self.nesting_depth > self.options.max_nesting_depth {
            return Err(ParseError::NestingTooDeep {
                span: Span::new(self.position as u32, self.position as u32),
                max_depth: self.options.max_nesting_depth,
            });
        }

        let start = self.position;

        // Try to parse different block types
        if self.try_parse_heading() {
            return self.parse_heading(start);
        }

        if self.try_parse_thematic_break() {
            return self.parse_thematic_break(start);
        }

        if self.try_parse_fenced_code() {
            return self.parse_fenced_code(start);
        }

        // Default: parse as paragraph
        self.parse_paragraph(start)
    }

    /// Checks if the current position starts a heading.
    fn try_parse_heading(&self) -> bool {
        let remaining = self.remaining();
        let mut chars = remaining.chars().peekable();
        let mut hash_count = 0;

        while chars.peek() == Some(&'#') {
            chars.next();
            hash_count += 1;
            if hash_count > 6 {
                return false;
            }
        }

        hash_count > 0 && matches!(chars.peek(), Some(' ') | Some('\t') | Some('\n') | None)
    }

    /// Checks if the current position starts a thematic break.
    fn try_parse_thematic_break(&self) -> bool {
        let remaining = self.remaining();
        let line = remaining.lines().next().unwrap_or("");
        let trimmed = line.trim();

        if trimmed.len() < 3 {
            return false;
        }

        let first = trimmed.chars().next().unwrap();
        if !matches!(first, '-' | '*' | '_') {
            return false;
        }

        trimmed.chars().all(|c| c == first || c == ' ' || c == '\t')
            && trimmed.chars().filter(|&c| c == first).count() >= 3
    }

    /// Checks if the current position starts a fenced code block.
    fn try_parse_fenced_code(&self) -> bool {
        let remaining = self.remaining();
        remaining.starts_with("```") || remaining.starts_with("~~~")
    }

    /// Parses a heading.
    fn parse_heading(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        let mut depth = 0u8;
        while self.peek() == Some('#') {
            depth += 1;
            self.advance();
        }

        self.skip_whitespace();

        let content_start = self.position;
        let mut content_end = content_start;

        // Read until end of line
        while let Some(ch) = self.peek() {
            if ch == '\n' {
                break;
            }
            self.advance();
            content_end = self.position;
        }

        // Skip trailing hashes and whitespace
        let content = self.source[content_start..content_end].trim_end();
        let content = content.trim_end_matches('#').trim_end();

        // Consume newline
        if self.peek() == Some('\n') {
            self.advance();
        }

        let span = Span::new(start as u32, self.position as u32);

        let mut children = self.allocator.new_vec();
        if !content.is_empty() {
            let text = Text {
                value: self.allocator.alloc_str(content),
                span: Span::new(content_start as u32, content_end as u32),
            };
            children.push(Node::Text(text));
        }

        Ok(Some(Node::Heading(ox_content_ast::Heading { depth, children, span })))
    }

    /// Parses a thematic break.
    fn parse_thematic_break(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        // Skip to end of line
        while let Some(ch) = self.peek() {
            self.advance();
            if ch == '\n' {
                break;
            }
        }

        let span = Span::new(start as u32, self.position as u32);
        Ok(Some(Node::ThematicBreak(ox_content_ast::ThematicBreak { span })))
    }

    /// Parses a fenced code block.
    fn parse_fenced_code(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        let fence_char = self.peek().unwrap();
        let mut fence_len = 0;

        while self.peek() == Some(fence_char) {
            fence_len += 1;
            self.advance();
        }

        // Parse info string (language)
        self.skip_whitespace();
        let info_start = self.position;
        while let Some(ch) = self.peek() {
            if ch == '\n' {
                break;
            }
            self.advance();
        }
        let info = self.source[info_start..self.position].trim();
        let (lang, meta) = if info.is_empty() {
            (None, None)
        } else if let Some(space_idx) = info.find(' ') {
            (
                Some(self.allocator.alloc_str(&info[..space_idx])),
                Some(self.allocator.alloc_str(&info[space_idx + 1..])),
            )
        } else {
            (Some(self.allocator.alloc_str(info)), None)
        };

        // Skip newline after info string
        if self.peek() == Some('\n') {
            self.advance();
        }

        // Parse code content
        let content_start = self.position;
        let mut content_end = content_start;

        loop {
            if self.is_at_end() {
                break;
            }

            let line_start = self.position;

            // Check for closing fence
            let mut closing_fence_len = 0;
            while self.peek() == Some(fence_char) {
                closing_fence_len += 1;
                self.advance();
            }

            if closing_fence_len >= fence_len {
                // Skip rest of line
                while let Some(ch) = self.peek() {
                    if ch == '\n' {
                        self.advance();
                        break;
                    }
                    self.advance();
                }
                content_end = line_start;
                break;
            }

            // Not a closing fence, reset and consume line
            self.position = line_start;
            while let Some(ch) = self.peek() {
                self.advance();
                if ch == '\n' {
                    break;
                }
            }
            content_end = self.position;
        }

        let value = self.allocator.alloc_str(&self.source[content_start..content_end]);
        let span = Span::new(start as u32, self.position as u32);

        Ok(Some(Node::CodeBlock(ox_content_ast::CodeBlock { lang, meta, value, span })))
    }

    /// Parses a paragraph.
    fn parse_paragraph(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        let mut content_end = start;

        loop {
            if self.is_at_end() {
                break;
            }

            // Check for blank line (paragraph end)
            let line_start = self.position;
            self.skip_whitespace();
            if self.peek() == Some('\n') || self.is_at_end() {
                self.position = line_start;
                break;
            }

            self.position = line_start;

            // Check for block-level element that would end paragraph
            if self.try_parse_heading()
                || self.try_parse_thematic_break()
                || self.try_parse_fenced_code()
            {
                break;
            }

            // Consume line
            while let Some(ch) = self.peek() {
                self.advance();
                if ch == '\n' {
                    break;
                }
            }
            content_end = self.position;
        }

        let content = self.source[start..content_end].trim();
        if content.is_empty() {
            return Ok(None);
        }

        let span = Span::new(start as u32, content_end as u32);

        // Parse inline content
        let children = self.parse_inline(content, start)?;

        Ok(Some(Node::Paragraph(Paragraph { children, span })))
    }

    /// Parses inline content.
    fn parse_inline(&self, content: &'a str, offset: usize) -> ParseResult<Vec<'a, Node<'a>>> {
        let mut children = self.allocator.new_vec();
        let mut pos = 0;
        let bytes = content.as_bytes();

        while pos < content.len() {
            let start = pos;

            // Look for special characters
            while pos < content.len() {
                let ch = bytes[pos];
                if matches!(ch, b'*' | b'_' | b'`' | b'[' | b'!' | b'~' | b'\\') {
                    break;
                }
                pos += 1;
            }

            // Emit text before special character
            if pos > start {
                let text_content = &content[start..pos];
                let text = Text {
                    value: self.allocator.alloc_str(text_content),
                    span: Span::new((offset + start) as u32, (offset + pos) as u32),
                };
                children.push(Node::Text(text));
            }

            if pos >= content.len() {
                break;
            }

            // Handle special characters (simplified for now)
            let ch = bytes[pos];
            match ch {
                b'\\' if pos + 1 < content.len() => {
                    // Escape sequence
                    pos += 1;
                    let escaped = &content[pos..pos + 1];
                    let text = Text {
                        value: self.allocator.alloc_str(escaped),
                        span: Span::new((offset + pos - 1) as u32, (offset + pos + 1) as u32),
                    };
                    children.push(Node::Text(text));
                    pos += 1;
                }
                b'`' => {
                    // Inline code
                    pos += 1;
                    let code_start = pos;
                    while pos < content.len() && bytes[pos] != b'`' {
                        pos += 1;
                    }
                    if pos < content.len() {
                        let code_content = &content[code_start..pos];
                        let inline_code = ox_content_ast::InlineCode {
                            value: self.allocator.alloc_str(code_content),
                            span: Span::new(
                                (offset + code_start - 1) as u32,
                                (offset + pos + 1) as u32,
                            ),
                        };
                        children.push(Node::InlineCode(inline_code));
                        pos += 1;
                    } else {
                        // No closing backtick, treat as text
                        let text = Text {
                            value: self.allocator.alloc_str(&content[code_start - 1..]),
                            span: Span::new(
                                (offset + code_start - 1) as u32,
                                (offset + content.len()) as u32,
                            ),
                        };
                        children.push(Node::Text(text));
                    }
                }
                _ => {
                    // Other special characters - treat as text for now
                    let text = Text {
                        value: self.allocator.alloc_str(&content[pos..pos + 1]),
                        span: Span::new((offset + pos) as u32, (offset + pos + 1) as u32),
                    };
                    children.push(Node::Text(text));
                    pos += 1;
                }
            }
        }

        Ok(children)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_heading() {
        let allocator = Allocator::new();
        // Use "# " with trailing space - our parser requires space/tab/newline after #
        let doc = Parser::new(&allocator, "# Hello\n").parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        match &doc.children[0] {
            Node::Heading(h) => {
                assert_eq!(h.depth, 1);
            }
            _ => panic!("expected heading"),
        }
    }

    #[test]
    fn test_parse_paragraph() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "Hello world").parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        assert!(matches!(&doc.children[0], Node::Paragraph(_)));
    }

    #[test]
    fn test_parse_thematic_break() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "---").parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        assert!(matches!(&doc.children[0], Node::ThematicBreak(_)));
    }

    #[test]
    fn test_parse_fenced_code() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "```rust\nfn main() {}\n```").parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        match &doc.children[0] {
            Node::CodeBlock(cb) => {
                assert_eq!(cb.lang, Some("rust"));
            }
            _ => panic!("expected code block"),
        }
    }

    #[test]
    fn test_parse_inline_code() {
        let allocator = Allocator::new();
        let doc = Parser::new(&allocator, "Use `code` here").parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        match &doc.children[0] {
            Node::Paragraph(p) => {
                assert!(p.children.iter().any(|n| matches!(n, Node::InlineCode(_))));
            }
            _ => panic!("expected paragraph"),
        }
    }
}
