/// MF2 tokens produced by the lexer.
#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    /// `.input` keyword
    DotInput,
    /// `.local` keyword
    DotLocal,
    /// `.match` keyword
    DotMatch,
    /// Variable reference `$name`
    Variable(String),
    /// Function name `:name`
    Function(String),
    /// Identifier / name
    Name(String),
    /// Numeric literal
    Number(String),
    /// Quoted literal `|...|`
    QuotedLiteral(String),
    /// Literal text (in pattern context)
    Text(String),
    /// `{`
    OpenBrace,
    /// `}`
    CloseBrace,
    /// `{{`
    DoubleOpenBrace,
    /// `}}`
    DoubleCloseBrace,
    /// `=`
    Equals,
    /// `*` wildcard
    Star,
    /// Newline
    Newline,
}

/// A positioned token with its byte offset span.
#[derive(Debug, Clone, PartialEq)]
pub struct SpannedToken {
    pub token: Token,
    pub span: std::ops::Range<usize>,
}

/// Context-aware MF2 tokenizer.
///
/// MF2 has two modes:
/// - **Pattern mode**: text is literal until `{` or `}}`.
/// - **Expression mode** (inside `{ }`): variables, functions, options.
/// - **Declaration mode**: `.input`, `.local`, `.match` and their arguments.
pub fn tokenize(source: &str) -> Result<Vec<SpannedToken>, usize> {
    let mut scanner = Scanner::new(source);
    scanner.scan_message()?;
    Ok(scanner.tokens)
}

struct Scanner<'a> {
    source: &'a str,
    bytes: &'a [u8],
    pos: usize,
    tokens: Vec<SpannedToken>,
}

impl<'a> Scanner<'a> {
    fn new(source: &'a str) -> Self {
        Self { source, bytes: source.as_bytes(), pos: 0, tokens: Vec::new() }
    }

    fn scan_message(&mut self) -> Result<(), usize> {
        self.skip_whitespace_and_newlines_with_tokens();

        // Check if complex message (starts with `.`)
        if self.peek() == Some(b'.') {
            self.scan_complex_message()?;
        } else {
            self.scan_simple_pattern()?;
        }
        Ok(())
    }

    fn scan_complex_message(&mut self) -> Result<(), usize> {
        // Scan declarations and body
        loop {
            self.skip_whitespace_and_newlines_with_tokens();
            if self.is_at_end() {
                break;
            }
            if self.starts_with(".input") {
                self.emit(Token::DotInput, 6);
                self.skip_whitespace();
                self.scan_expression()?;
            } else if self.starts_with(".local") {
                self.emit(Token::DotLocal, 6);
                self.skip_whitespace();
                self.scan_variable_token()?;
                self.skip_whitespace();
                self.scan_char_token(b'=', Token::Equals)?;
                self.skip_whitespace();
                self.scan_expression()?;
            } else if self.starts_with(".match") {
                self.emit(Token::DotMatch, 6);
                self.skip_whitespace();
                // Scan selectors (variables until newline)
                while !self.is_at_end() && self.peek() != Some(b'\n') && self.peek() != Some(b'\r')
                {
                    if self.peek() == Some(b'$') {
                        self.scan_variable_token()?;
                        self.skip_whitespace();
                    } else {
                        break;
                    }
                }
                self.skip_whitespace_and_newlines_with_tokens();
                // Scan variants
                while !self.is_at_end() {
                    self.scan_variant()?;
                    self.skip_whitespace_and_newlines_with_tokens();
                }
            } else {
                // Might be a quoted pattern body `{{ }}`
                if self.peek() == Some(b'{') && self.peek_at(1) == Some(b'{') {
                    self.scan_quoted_pattern()?;
                }
                break;
            }
        }
        Ok(())
    }

    fn scan_variant(&mut self) -> Result<(), usize> {
        // Scan variant keys until `{{`
        loop {
            self.skip_whitespace();
            if self.peek() == Some(b'{') && self.peek_at(1) == Some(b'{') {
                break;
            }
            if self.is_at_end() {
                return Ok(());
            }
            if self.peek() == Some(b'*') {
                self.emit(Token::Star, 1);
            } else if self.peek().is_some_and(|b| b.is_ascii_alphabetic() || b == b'_') {
                self.scan_name()?;
            } else if self.peek().is_some_and(|b| b.is_ascii_digit() || b == b'-') {
                self.scan_number()?;
            } else {
                return Err(self.pos);
            }
        }
        self.scan_quoted_pattern()?;
        Ok(())
    }

    fn scan_quoted_pattern(&mut self) -> Result<(), usize> {
        if self.peek() != Some(b'{') || self.peek_at(1) != Some(b'{') {
            return Err(self.pos);
        }
        self.emit(Token::DoubleOpenBrace, 2);

        // Scan pattern content until `}}`
        let mut text_start = self.pos;
        while !self.is_at_end() {
            if self.peek() == Some(b'}') && self.peek_at(1) == Some(b'}') {
                // Flush text
                if self.pos > text_start {
                    let text = self.source[text_start..self.pos].to_string();
                    self.tokens.push(SpannedToken {
                        token: Token::Text(text),
                        span: text_start..self.pos,
                    });
                }
                self.emit(Token::DoubleCloseBrace, 2);
                return Ok(());
            } else if self.peek() == Some(b'{') {
                // Flush text before expression
                if self.pos > text_start {
                    let text = self.source[text_start..self.pos].to_string();
                    self.tokens.push(SpannedToken {
                        token: Token::Text(text),
                        span: text_start..self.pos,
                    });
                }
                self.scan_expression()?;
                text_start = self.pos;
            } else {
                self.pos += 1;
            }
        }
        Err(self.pos) // unterminated `{{`
    }

    fn scan_simple_pattern(&mut self) -> Result<(), usize> {
        let mut text_start = self.pos;
        while !self.is_at_end() {
            if self.peek() == Some(b'{') {
                // Flush text before expression
                if self.pos > text_start {
                    let text = self.source[text_start..self.pos].to_string();
                    self.tokens.push(SpannedToken {
                        token: Token::Text(text),
                        span: text_start..self.pos,
                    });
                }
                self.scan_expression()?;
                text_start = self.pos;
            } else {
                self.pos += 1;
            }
        }
        // Flush trailing text
        if self.pos > text_start {
            let text = self.source[text_start..self.pos].to_string();
            self.tokens.push(SpannedToken { token: Token::Text(text), span: text_start..self.pos });
        }
        Ok(())
    }

    fn scan_expression(&mut self) -> Result<(), usize> {
        if self.peek() != Some(b'{') {
            return Err(self.pos);
        }
        self.emit(Token::OpenBrace, 1);
        self.skip_whitespace();

        // Expression body: operand + optional annotation + options
        // Operand: $var or number or |quoted|
        if self.peek() == Some(b'$') {
            self.scan_variable_token()?;
        } else if self.peek().is_some_and(|b| b.is_ascii_digit() || b == b'-') {
            self.scan_number()?;
        } else if self.peek() == Some(b'|') {
            self.scan_quoted_literal()?;
        }

        self.skip_whitespace();

        // Annotation: :function
        if self.peek() == Some(b':') {
            self.scan_function_token()?;
            self.skip_whitespace();
            // Options: name=value ...
            while !self.is_at_end() && self.peek() != Some(b'}') {
                if self.peek().is_some_and(|b| b.is_ascii_alphabetic() || b == b'_') {
                    self.scan_option()?;
                    self.skip_whitespace();
                } else {
                    break;
                }
            }
        }

        self.skip_whitespace();
        if self.peek() != Some(b'}') {
            return Err(self.pos);
        }
        self.emit(Token::CloseBrace, 1);
        Ok(())
    }

    fn scan_option(&mut self) -> Result<(), usize> {
        self.scan_name()?;
        self.skip_whitespace();
        if self.peek() == Some(b'=') {
            self.emit(Token::Equals, 1);
            self.skip_whitespace();
            // Value: $var or number or name or |quoted|
            if self.peek() == Some(b'$') {
                self.scan_variable_token()?;
            } else if self.peek().is_some_and(|b| b.is_ascii_digit() || b == b'-') {
                self.scan_number()?;
            } else if self.peek() == Some(b'|') {
                self.scan_quoted_literal()?;
            } else if self.peek().is_some_and(|b| b.is_ascii_alphabetic() || b == b'_') {
                self.scan_name()?;
            } else {
                return Err(self.pos);
            }
        }
        Ok(())
    }

    fn scan_variable_token(&mut self) -> Result<(), usize> {
        if self.peek() != Some(b'$') {
            return Err(self.pos);
        }
        let start = self.pos;
        self.pos += 1; // skip $
        let name_start = self.pos;
        while self.peek().is_some_and(|b| b.is_ascii_alphanumeric() || b == b'_') {
            self.pos += 1;
        }
        if self.pos == name_start {
            return Err(self.pos);
        }
        let name = self.source[name_start..self.pos].to_string();
        self.tokens.push(SpannedToken { token: Token::Variable(name), span: start..self.pos });
        Ok(())
    }

    fn scan_function_token(&mut self) -> Result<(), usize> {
        if self.peek() != Some(b':') {
            return Err(self.pos);
        }
        let start = self.pos;
        self.pos += 1; // skip :
        let name_start = self.pos;
        while self.peek().is_some_and(|b| b.is_ascii_alphanumeric() || b == b'_') {
            self.pos += 1;
        }
        if self.pos == name_start {
            return Err(self.pos);
        }
        let name = self.source[name_start..self.pos].to_string();
        self.tokens.push(SpannedToken { token: Token::Function(name), span: start..self.pos });
        Ok(())
    }

    fn scan_name(&mut self) -> Result<(), usize> {
        let start = self.pos;
        while self.peek().is_some_and(|b| b.is_ascii_alphanumeric() || b == b'_') {
            self.pos += 1;
        }
        if self.pos == start {
            return Err(self.pos);
        }
        let name = self.source[start..self.pos].to_string();
        self.tokens.push(SpannedToken { token: Token::Name(name), span: start..self.pos });
        Ok(())
    }

    fn scan_number(&mut self) -> Result<(), usize> {
        let start = self.pos;
        if self.peek() == Some(b'-') {
            self.pos += 1;
        }
        while self.peek().is_some_and(|b| b.is_ascii_digit()) {
            self.pos += 1;
        }
        if self.peek() == Some(b'.') && self.peek_at(1).is_some_and(|b| b.is_ascii_digit()) {
            self.pos += 1; // skip .
            while self.peek().is_some_and(|b| b.is_ascii_digit()) {
                self.pos += 1;
            }
        }
        if self.pos == start || (self.pos == start + 1 && self.bytes[start] == b'-') {
            return Err(self.pos);
        }
        let num = self.source[start..self.pos].to_string();
        self.tokens.push(SpannedToken { token: Token::Number(num), span: start..self.pos });
        Ok(())
    }

    fn scan_quoted_literal(&mut self) -> Result<(), usize> {
        if self.peek() != Some(b'|') {
            return Err(self.pos);
        }
        let start = self.pos;
        self.pos += 1; // skip opening |
        let content_start = self.pos;
        while !self.is_at_end() && self.peek() != Some(b'|') {
            self.pos += 1;
        }
        if self.is_at_end() {
            return Err(self.pos);
        }
        let content = self.source[content_start..self.pos].to_string();
        self.pos += 1; // skip closing |
        self.tokens
            .push(SpannedToken { token: Token::QuotedLiteral(content), span: start..self.pos });
        Ok(())
    }

    fn scan_char_token(&mut self, ch: u8, token: Token) -> Result<(), usize> {
        if self.peek() != Some(ch) {
            return Err(self.pos);
        }
        self.emit(token, 1);
        Ok(())
    }

    // ── Helpers ──

    fn emit(&mut self, token: Token, len: usize) {
        let start = self.pos;
        self.pos += len;
        self.tokens.push(SpannedToken { token, span: start..self.pos });
    }

    fn peek(&self) -> Option<u8> {
        self.bytes.get(self.pos).copied()
    }

    fn peek_at(&self, offset: usize) -> Option<u8> {
        self.bytes.get(self.pos + offset).copied()
    }

    fn is_at_end(&self) -> bool {
        self.pos >= self.bytes.len()
    }

    fn starts_with(&self, s: &str) -> bool {
        self.source[self.pos..].starts_with(s)
            && self.bytes.get(self.pos + s.len()).is_none_or(|b| !b.is_ascii_alphanumeric())
    }

    fn skip_whitespace(&mut self) {
        while self.peek().is_some_and(|b| b == b' ' || b == b'\t') {
            self.pos += 1;
        }
    }

    fn skip_whitespace_and_newlines_with_tokens(&mut self) {
        loop {
            if self.peek().is_some_and(|b| b == b' ' || b == b'\t') {
                self.pos += 1;
            } else if self.peek() == Some(b'\n') {
                self.emit(Token::Newline, 1);
            } else if self.peek() == Some(b'\r') {
                if self.peek_at(1) == Some(b'\n') {
                    self.emit(Token::Newline, 2);
                } else {
                    self.emit(Token::Newline, 1);
                }
            } else {
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_text() {
        let tokens = tokenize("Hello world").unwrap();
        assert_eq!(tokens.len(), 1);
        assert_eq!(tokens[0].token, Token::Text("Hello world".to_string()));
    }

    #[test]
    fn simple_variable() {
        let tokens = tokenize("{$name}").unwrap();
        assert_eq!(tokens.len(), 3);
        assert_eq!(tokens[0].token, Token::OpenBrace);
        assert_eq!(tokens[1].token, Token::Variable("name".to_string()));
        assert_eq!(tokens[2].token, Token::CloseBrace);
    }

    #[test]
    fn text_with_variable() {
        let tokens = tokenize("Hello {$name}!").unwrap();
        assert_eq!(tokens.len(), 5);
        assert_eq!(tokens[0].token, Token::Text("Hello ".to_string()));
        assert_eq!(tokens[1].token, Token::OpenBrace);
        assert_eq!(tokens[2].token, Token::Variable("name".to_string()));
        assert_eq!(tokens[3].token, Token::CloseBrace);
        assert_eq!(tokens[4].token, Token::Text("!".to_string()));
    }

    #[test]
    fn variable_with_function() {
        let tokens = tokenize("{$count :number}").unwrap();
        assert_eq!(tokens.len(), 4);
        assert_eq!(tokens[0].token, Token::OpenBrace);
        assert_eq!(tokens[1].token, Token::Variable("count".to_string()));
        assert_eq!(tokens[2].token, Token::Function("number".to_string()));
        assert_eq!(tokens[3].token, Token::CloseBrace);
    }

    #[test]
    fn function_with_option() {
        let tokens = tokenize("{$amount :number minimumFractionDigits=2}").unwrap();
        assert_eq!(tokens.len(), 7);
        assert_eq!(tokens[0].token, Token::OpenBrace);
        assert_eq!(tokens[1].token, Token::Variable("amount".to_string()));
        assert_eq!(tokens[2].token, Token::Function("number".to_string()));
        assert_eq!(tokens[3].token, Token::Name("minimumFractionDigits".to_string()));
        assert_eq!(tokens[4].token, Token::Equals);
        assert_eq!(tokens[5].token, Token::Number("2".to_string()));
        assert_eq!(tokens[6].token, Token::CloseBrace);
    }

    #[test]
    fn dot_input() {
        let tokens = tokenize(".input {$count :number}").unwrap();
        assert_eq!(tokens[0].token, Token::DotInput);
    }

    #[test]
    fn dot_match_with_variants() {
        let source = ".input {$count :number}\n.match $count\none {{Hello}}\n* {{default}}";
        let tokens = tokenize(source).unwrap();
        assert!(tokens.iter().any(|t| t.token == Token::DotInput));
        assert!(tokens.iter().any(|t| t.token == Token::DotMatch));
        assert!(tokens.iter().any(|t| t.token == Token::Star));
        assert!(tokens.iter().any(|t| t.token == Token::DoubleOpenBrace));
    }

    #[test]
    fn quoted_literal() {
        let tokens = tokenize("{|hello world| :string}").unwrap();
        assert_eq!(tokens[1].token, Token::QuotedLiteral("hello world".to_string()));
    }

    #[test]
    fn text_with_punctuation() {
        let tokens = tokenize("You have {$count} items.").unwrap();
        assert_eq!(tokens.len(), 5);
        assert_eq!(tokens[0].token, Token::Text("You have ".to_string()));
        assert_eq!(tokens[4].token, Token::Text(" items.".to_string()));
    }
}
