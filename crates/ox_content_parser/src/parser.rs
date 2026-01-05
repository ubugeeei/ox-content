//! Markdown parser implementation.

use ox_content_allocator::{Allocator, Vec};
use ox_content_ast::{
    AlignKind, Document, Link, List, ListItem, Node, Paragraph, Span, Table, TableCell, TableRow,
    Text,
};

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

        if self.options.tables && self.try_parse_table() {
            return self.parse_table(start);
        }

        if self.try_parse_list() {
            return self.parse_list(start);
        }

        // Default: parse as paragraph
        self.parse_paragraph(start)
    }

    /// Checks if the current position starts a list.
    fn try_parse_list(&self) -> bool {
        let remaining = self.remaining();
        let line = remaining.lines().next().unwrap_or("");
        let trimmed = line.trim_start();

        // Unordered list: starts with -, *, or + followed by space
        if trimmed.starts_with("- ") || trimmed.starts_with("* ") || trimmed.starts_with("+ ") {
            return true;
        }

        // Ordered list: starts with digit(s) followed by . or ) and space
        let mut chars = trimmed.chars().peekable();
        let mut has_digit = false;
        while let Some(ch) = chars.peek() {
            if ch.is_ascii_digit() {
                has_digit = true;
                chars.next();
            } else {
                break;
            }
        }
        if has_digit {
            if let Some(ch) = chars.next() {
                if (ch == '.' || ch == ')') && chars.peek() == Some(&' ') {
                    return true;
                }
            }
        }

        false
    }

    /// Calculates the indentation level (number of spaces) of the current line.
    fn calc_indentation(&self, start: usize) -> usize {
        let mut indent = 0;
        let bytes = self.source.as_bytes();
        for byte in bytes.iter().skip(start) {
            match byte {
                b' ' => indent += 1,
                b'\t' => indent += 4, // Assume tab is 4 spaces
                _ => break,
            }
        }
        indent
    }

    /// Parses a list (ordered or unordered).
    fn parse_list(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        let baseline_indent = self.calc_indentation(start);

        // Determine list type from the first line (already verified by try_parse_list)
        let first_line_start = self.position;
        // Skip whitespace to get to content
        let mut pos = first_line_start;
        while pos < self.source.len() {
            let ch = self.source.as_bytes()[pos];
            if ch != b' ' && ch != b'\t' {
                break;
            }
            pos += 1;
        }
        let trimmed_start = &self.source[pos..];
        let ordered = trimmed_start.chars().next().is_some_and(|c| c.is_ascii_digit());
        let list_start = if ordered {
            let num_str: String = trimmed_start.chars().take_while(char::is_ascii_digit).collect();
            num_str.parse::<u32>().ok()
        } else {
            None
        };

        let mut children: Vec<'a, ListItem<'a>> = self.allocator.new_vec();

        loop {
            if self.is_at_end() {
                break;
            }

            let line_start = self.position;
            self.skip_whitespace();
            if self.peek() == Some('\n') || self.is_at_end() {
                self.position = line_start; // Backtrack to handle end of block
                break;
            }

            // Check indentation
            let current_indent = self.calc_indentation(line_start);

            // If less indented, list ends
            if current_indent < baseline_indent {
                self.position = line_start;
                break;
            }

            // If indented more, check if it's a nested list
            if current_indent > baseline_indent {
                // Peek to see if it's a list marker
                self.position = line_start; // Reset position to check marker properly
                if self.try_parse_list() {
                    // Parse nested list
                    if let Some(Node::List(nested_list)) = self.parse_list(line_start)? {
                        // Add to the LAST item's children
                        if let Some(last_item) = children.last_mut() {
                            last_item.children.push(Node::List(nested_list));
                        }
                    }
                } else {
                    // Continuation content?
                    // For now, we only support simple lists.
                    // Just skip line to avoid infinite loop
                    while let Some(ch) = self.peek() {
                        self.advance();
                        if ch == '\n' {
                            break;
                        }
                    }
                }
                continue;
            }

            // Same indentation (or close enough? Standard is complex, we use strict >= baseline)
            self.position = line_start; // Reset

            // Check if it's a list item
            let remaining = self.remaining();
            let line = remaining.lines().next().unwrap_or("");
            let trimmed = line.trim_start();

            // Check marker
            let (is_list_item, content, checked) = if trimmed.starts_with("- ")
                || trimmed.starts_with("* ")
                || trimmed.starts_with("+ ")
            {
                let mut content = &trimmed[2..];
                let mut checked = None;

                // Check for task list
                if self.options.task_lists && content.len() >= 3 {
                    if (content.starts_with("[x]") || content.starts_with("[X]"))
                        && (content.len() == 3
                            || content.starts_with("[x] ")
                            || content.starts_with("[X] "))
                    {
                        checked = Some(true);
                        content = if content.len() > 3 { &content[4..] } else { "" };
                    } else if content.starts_with("[ ]")
                        && (content.len() == 3 || content.starts_with("[ ] "))
                    {
                        checked = Some(false);
                        content = if content.len() > 3 { &content[4..] } else { "" };
                    }
                }
                (true, content.to_string(), checked)
            } else if ordered {
                // Simplified ordered list check
                // ... (reuse logic)
                let mut chars = trimmed.chars().peekable();
                let mut has_digit = false;
                while let Some(ch) = chars.peek() {
                    if ch.is_ascii_digit() {
                        has_digit = true;
                        chars.next();
                    } else {
                        break;
                    }
                }
                if has_digit {
                    chars.next().map_or_else(
                        || (false, String::new(), None),
                        |ch| {
                            if (ch == '.' || ch == ')') && chars.peek() == Some(&' ') {
                                chars.next(); // skip space
                                let content: String = chars.collect();
                                (true, content, None)
                            } else {
                                (false, String::new(), None)
                            }
                        },
                    )
                } else {
                    (false, String::new(), None)
                }
            } else {
                (false, String::new(), None)
            };

            if !is_list_item {
                // Not a list item, break
                break;
            }

            // Consume line
            while let Some(ch) = self.peek() {
                self.advance();
                if ch == '\n' {
                    break;
                }
            }

            // Create list item
            let content_str = self.allocator.alloc_str(&content);
            let item_children_inline = self.parse_inline(content_str, 0)?;

            // Wrap in Paragraph
            let mut para_children = self.allocator.new_vec();
            for child in item_children_inline {
                para_children.push(child);
            }
            let para = Paragraph { children: para_children, span: Span::new(0, 0) };

            let mut list_item_children = self.allocator.new_vec();
            list_item_children.push(Node::Paragraph(para));

            let list_item = ListItem {
                checked,
                spread: false,
                children: list_item_children,
                span: Span::new(0, 0),
            };
            children.push(list_item);
        }

        let span = Span::new(start as u32, self.position as u32);
        Ok(Some(Node::List(List { ordered, start: list_start, spread: false, children, span })))
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

    /// Checks if the current position starts a table.
    fn try_parse_table(&self) -> bool {
        let remaining = self.remaining();
        let lines: std::vec::Vec<&str> = remaining.lines().take(2).collect();

        if lines.len() < 2 {
            return false;
        }

        // First line must start with | or contain |
        let first_line = lines[0].trim();
        if !first_line.starts_with('|') && !first_line.contains('|') {
            return false;
        }

        // Second line must be the delimiter row (contains | and -)
        let second_line = lines[1].trim();
        if !second_line.contains('|') || !second_line.contains('-') {
            return false;
        }

        // Check delimiter row pattern: |---|---|
        let is_delimiter = second_line.split('|').filter(|s| !s.is_empty()).all(|cell| {
            let trimmed = cell.trim();
            if trimmed.is_empty() {
                return true;
            }
            // Allow :---:, :---, ---:, ---
            trimmed.chars().all(|c| c == '-' || c == ':')
        });

        is_delimiter
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

        // Parse inline content
        let children = if !content.is_empty() {
            self.parse_inline(content, content_start)?
        } else {
            self.allocator.new_vec()
        };

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

    /// Parses a table.
    fn parse_table(&mut self, start: usize) -> ParseResult<Option<Node<'a>>> {
        let mut rows: std::vec::Vec<std::vec::Vec<&str>> = std::vec::Vec::new();
        let mut align: Vec<'a, AlignKind> = self.allocator.new_vec();

        // Parse header row
        let header_line = self.consume_line();
        let header_cells = Self::parse_table_row_cells(header_line);
        rows.push(header_cells);

        // Parse delimiter row to get alignment
        let delimiter_line = self.consume_line();
        for cell in delimiter_line.split('|').filter(|s| !s.trim().is_empty()) {
            let cell = cell.trim();
            let starts_colon = cell.starts_with(':');
            let ends_colon = cell.ends_with(':');
            let alignment = match (starts_colon, ends_colon) {
                (true, true) => AlignKind::Center,
                (true, false) => AlignKind::Left,
                (false, true) => AlignKind::Right,
                (false, false) => AlignKind::None,
            };
            align.push(alignment);
        }

        // Parse body rows
        loop {
            if self.is_at_end() {
                break;
            }

            let line_start = self.position;
            self.skip_whitespace();

            // Check for blank line or non-table line
            if self.peek() == Some('\n') || self.is_at_end() {
                self.position = line_start;
                break;
            }

            // Check if line contains | (table continuation)
            let remaining = self.remaining();
            let line = remaining.lines().next().unwrap_or("");
            if !line.contains('|') {
                self.position = line_start;
                break;
            }

            self.position = line_start;
            let row_line = self.consume_line();
            let row_cells = Self::parse_table_row_cells(row_line);
            rows.push(row_cells);
        }

        // Build the table AST
        let mut children: Vec<'a, TableRow<'a>> = self.allocator.new_vec();

        for row_cells in rows {
            let mut cells: Vec<'a, TableCell<'a>> = self.allocator.new_vec();
            for cell_content in row_cells {
                let cell_children = self.parse_inline(cell_content, 0)?;
                let cell = TableCell { children: cell_children, span: Span::new(0, 0) };
                cells.push(cell);
            }
            let row = TableRow { children: cells, span: Span::new(0, 0) };
            children.push(row);
        }

        let span = Span::new(start as u32, self.position as u32);
        Ok(Some(Node::Table(Table { align, children, span })))
    }

    /// Consumes a line and returns it.
    fn consume_line(&mut self) -> &'a str {
        let start = self.position;
        while let Some(ch) = self.peek() {
            self.advance();
            if ch == '\n' {
                break;
            }
        }
        self.source[start..self.position].trim_end_matches('\n')
    }

    /// Parses table row cells from a line.
    fn parse_table_row_cells(line: &'a str) -> std::vec::Vec<&'a str> {
        let trimmed = line.trim();
        let trimmed = trimmed.strip_prefix('|').unwrap_or(trimmed);
        let trimmed = trimmed.strip_suffix('|').unwrap_or(trimmed);
        trimmed.split('|').map(str::trim).collect()
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
                || (self.options.tables && self.try_parse_table())
                || self.try_parse_list()
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

            // Handle special characters
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
                b'*' | b'_' => {
                    // Emphasis or Strong
                    let marker = ch;
                    let mut count = 1;
                    while pos + count < content.len() && bytes[pos + count] == marker {
                        count += 1;
                    }

                    // Simple logic: find next matching sequence of same length
                    let inner_start = pos + count;
                    let mut inner_end = inner_start;
                    let mut found = false;

                    while inner_end < content.len() {
                        if bytes[inner_end] == marker {
                            let mut end_count = 1;
                            while inner_end + end_count < content.len()
                                && bytes[inner_end + end_count] == marker
                            {
                                end_count += 1;
                            }

                            if end_count >= count {
                                found = true;
                                break;
                            }
                            inner_end += end_count;
                        } else {
                            inner_end += 1;
                        }
                    }

                    if found {
                        let inner_content = &content[inner_start..inner_end];
                        // Recursively parse inner content
                        let inner_children =
                            self.parse_inline(inner_content, offset + inner_start)?;

                        let span =
                            Span::new((offset + pos) as u32, (offset + inner_end + count) as u32);

                        if count >= 2 {
                            // Strong
                            let strong = ox_content_ast::Strong { children: inner_children, span };
                            children.push(Node::Strong(strong));
                            pos = inner_end + count;
                        } else {
                            // Emphasis
                            let emphasis =
                                ox_content_ast::Emphasis { children: inner_children, span };
                            children.push(Node::Emphasis(emphasis));
                            pos = inner_end + count;
                        }
                    } else {
                        // Treat as text
                        let text = Text {
                            value: self.allocator.alloc_str(&content[pos..pos + count]),
                            span: Span::new((offset + pos) as u32, (offset + pos + count) as u32),
                        };
                        children.push(Node::Text(text));
                        pos += count;
                    }
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
                b'[' => {
                    // Link: [text](url)
                    let link_start = pos;
                    pos += 1;
                    let text_start = pos;

                    // Find closing ]
                    let mut bracket_depth = 1;
                    while pos < content.len() && bracket_depth > 0 {
                        match bytes[pos] {
                            b'[' => bracket_depth += 1,
                            b']' => bracket_depth -= 1,
                            _ => {} // Ignore other characters
                        }
                        if bracket_depth > 0 {
                            pos += 1;
                        }
                    }

                    if pos < content.len()
                        && bytes[pos] == b']'
                        && pos + 1 < content.len()
                        && bytes[pos + 1] == b'('
                    {
                        let link_text = &content[text_start..pos];
                        pos += 2; // skip ](

                        // Find closing )
                        let url_start = pos;
                        let mut paren_depth = 1;
                        while pos < content.len() && paren_depth > 0 {
                            match bytes[pos] {
                                b'(' => paren_depth += 1,
                                b')' => paren_depth -= 1,
                                _ => {} // Ignore other characters
                            }
                            if paren_depth > 0 {
                                pos += 1;
                            }
                        }

                        if pos < content.len() && bytes[pos] == b')' {
                            let url = &content[url_start..pos];
                            pos += 1; // skip )

                            // Parse link text as inline content
                            let link_children =
                                self.parse_inline(link_text, offset + text_start)?;

                            let link = Link {
                                url: self.allocator.alloc_str(url),
                                title: None,
                                children: link_children,
                                span: Span::new(
                                    (offset + link_start) as u32,
                                    (offset + pos) as u32,
                                ),
                            };
                            children.push(Node::Link(link));
                        } else {
                            // Invalid link, treat as text
                            let text = Text {
                                value: self.allocator.alloc_str(&content[link_start..pos]),
                                span: Span::new(
                                    (offset + link_start) as u32,
                                    (offset + pos) as u32,
                                ),
                            };
                            children.push(Node::Text(text));
                        }
                    } else {
                        // Not a link, just a [
                        let text = Text {
                            value: self.allocator.alloc_str("["),
                            span: Span::new(
                                (offset + link_start) as u32,
                                (offset + link_start + 1) as u32,
                            ),
                        };
                        children.push(Node::Text(text));
                        pos = link_start + 1;
                    }
                }
                _ => {
                    // Other special characters
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
        let doc = Parser::new(
            &allocator,
            "```rust\nfn main() {}
```",
        )
        .parse()
        .unwrap();
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

    #[test]
    fn test_parse_table() {
        let allocator = Allocator::new();
        let table_md = "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |";
        let parser = Parser::with_options(&allocator, table_md, ParserOptions::gfm());
        let doc = parser.parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        match &doc.children[0] {
            Node::Table(t) => {
                assert_eq!(t.children.len(), 2); // header + 1 body row
            }
            _ => panic!("expected table, got {:?}", &doc.children[0]),
        }
    }

    #[test]
    fn test_parse_unordered_list() {
        let allocator = Allocator::new();
        let list_md = "- Item 1\n- Item 2\n- Item 3";
        let parser = Parser::new(&allocator, list_md);
        let doc = parser.parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        match &doc.children[0] {
            Node::List(list) => {
                assert!(!list.ordered);
                assert_eq!(list.children.len(), 3);
            }
            _ => panic!("expected list, got {:?}", &doc.children[0]),
        }
    }

    #[test]
    fn test_parse_ordered_list() {
        let allocator = Allocator::new();
        let list_md = "1. First\n2. Second\n3. Third";
        let parser = Parser::new(&allocator, list_md);
        let doc = parser.parse().unwrap();
        assert_eq!(doc.children.len(), 1);
        match &doc.children[0] {
            Node::List(list) => {
                assert!(list.ordered);
                assert_eq!(list.children.len(), 3);
            }
            _ => panic!("expected list, got {:?}", &doc.children[0]),
        }
    }
}
