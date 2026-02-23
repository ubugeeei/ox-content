use crate::error::{I18nError, I18nResult};
use crate::mf2::ast::{
    Annotation, ComplexBody, ComplexMessage, Declaration, Expression, FunctionOption,
    InputDeclaration, LocalDeclaration, Matcher, Message, Operand, OptionValue, Pattern,
    PatternPart, Variant, VariantKey,
};
use crate::mf2::lexer::{SpannedToken, Token};

/// Recursive descent parser for MF2 messages.
pub struct Parser {
    tokens: Vec<SpannedToken>,
    pos: usize,
}

impl Parser {
    #[must_use]
    pub fn new(tokens: Vec<SpannedToken>) -> Self {
        Self { tokens, pos: 0 }
    }

    pub fn parse(&mut self) -> I18nResult<Message> {
        self.skip_newlines();

        if self.check(&Token::DotInput)
            || self.check(&Token::DotLocal)
            || self.check(&Token::DotMatch)
        {
            let complex = self.parse_complex_message()?;
            Ok(Message::Complex(complex))
        } else {
            let pattern = self.parse_simple_pattern()?;
            Ok(Message::Simple(pattern))
        }
    }

    fn parse_complex_message(&mut self) -> I18nResult<ComplexMessage> {
        let mut declarations = Vec::new();

        while self.check(&Token::DotInput) || self.check(&Token::DotLocal) {
            declarations.push(self.parse_declaration()?);
            self.skip_newlines();
        }

        let body = if self.check(&Token::DotMatch) {
            ComplexBody::Matcher(self.parse_matcher()?)
        } else if self.check(&Token::DoubleOpenBrace) {
            ComplexBody::QuotedPattern(self.parse_quoted_pattern()?)
        } else {
            return Err(self.error("expected .match or quoted pattern {{...}}"));
        };

        Ok(ComplexMessage { declarations, body })
    }

    fn parse_declaration(&mut self) -> I18nResult<Declaration> {
        if self.check(&Token::DotInput) {
            self.advance();
            let decl = self.parse_input_declaration()?;
            Ok(Declaration::Input(decl))
        } else {
            self.advance(); // consume .local
            let decl = self.parse_local_declaration()?;
            Ok(Declaration::Local(decl))
        }
    }

    fn parse_input_declaration(&mut self) -> I18nResult<InputDeclaration> {
        self.expect(&Token::OpenBrace)?;
        let variable = self.expect_variable()?;
        let annotation = self.try_parse_annotation()?;
        self.expect(&Token::CloseBrace)?;
        Ok(InputDeclaration { variable, annotation })
    }

    fn parse_local_declaration(&mut self) -> I18nResult<LocalDeclaration> {
        let variable = self.expect_variable()?;
        self.expect_tok(&Token::Equals)?;
        self.expect(&Token::OpenBrace)?;
        let expression = self.parse_expression_body()?;
        self.expect(&Token::CloseBrace)?;
        Ok(LocalDeclaration { variable, expression })
    }

    fn parse_matcher(&mut self) -> I18nResult<Matcher> {
        self.advance(); // consume .match

        let mut selectors = Vec::new();
        while let Some(var) = self.try_consume_variable() {
            selectors.push(var);
        }
        if selectors.is_empty() {
            return Err(self.error("expected at least one selector variable after .match"));
        }

        self.skip_newlines();

        let mut variants = Vec::new();
        while !self.is_at_end() {
            if let Some(variant) = self.try_parse_variant(selectors.len())? {
                variants.push(variant);
                self.skip_newlines();
            } else {
                break;
            }
        }

        if variants.is_empty() {
            return Err(self.error("expected at least one variant"));
        }

        Ok(Matcher { selectors, variants })
    }

    fn try_parse_variant(&mut self, selector_count: usize) -> I18nResult<Option<Variant>> {
        let mut keys = Vec::new();

        for _ in 0..selector_count {
            if let Some(key) = self.try_parse_variant_key() {
                keys.push(key);
            } else if keys.is_empty() {
                return Ok(None);
            } else {
                return Err(self.error(&format!(
                    "expected {selector_count} variant keys, found {}",
                    keys.len()
                )));
            }
        }

        let pattern = self.parse_quoted_pattern()?;
        Ok(Some(Variant { keys, pattern }))
    }

    fn try_parse_variant_key(&mut self) -> Option<VariantKey> {
        if self.check(&Token::Star) {
            self.advance();
            Some(VariantKey::Wildcard)
        } else if let Some(name) = self.try_consume_name() {
            Some(VariantKey::Literal(name))
        } else {
            self.try_consume_number().map(VariantKey::Literal)
        }
    }

    fn parse_quoted_pattern(&mut self) -> I18nResult<Pattern> {
        self.expect(&Token::DoubleOpenBrace)?;
        let pattern = self.parse_pattern_until(true)?;
        self.expect(&Token::DoubleCloseBrace)?;
        Ok(pattern)
    }

    fn parse_simple_pattern(&mut self) -> I18nResult<Pattern> {
        self.parse_pattern_until(false)
    }

    /// Parses pattern parts.
    /// If `in_quoted` is true, stops at `DoubleCloseBrace`.
    /// If false, consumes until end of tokens.
    fn parse_pattern_until(&mut self, in_quoted: bool) -> I18nResult<Pattern> {
        let mut parts = Vec::new();

        while !self.is_at_end() {
            if in_quoted && self.check(&Token::DoubleCloseBrace) {
                break;
            }

            match &self.tokens[self.pos].token {
                Token::Text(text) => {
                    parts.push(PatternPart::Text(text.clone()));
                    self.advance();
                }
                Token::OpenBrace => {
                    let expr = self.parse_expression()?;
                    parts.push(PatternPart::Expression(expr));
                }
                _ => {
                    // Shouldn't happen in pattern context, treat as text
                    break;
                }
            }
        }

        Ok(Pattern { parts })
    }

    fn parse_expression(&mut self) -> I18nResult<Expression> {
        self.expect(&Token::OpenBrace)?;
        let expression = self.parse_expression_body()?;
        self.expect(&Token::CloseBrace)?;
        Ok(expression)
    }

    fn parse_expression_body(&mut self) -> I18nResult<Expression> {
        let operand = self.try_parse_operand();
        let annotation = self.try_parse_annotation()?;

        if operand.is_none() && annotation.is_none() {
            return Err(self.error("expected variable, literal, or function in expression"));
        }

        Ok(Expression { operand, annotation })
    }

    fn try_parse_operand(&mut self) -> Option<Operand> {
        if let Some(var) = self.try_consume_variable() {
            Some(Operand::Variable(var))
        } else if let Some(num) = self.try_consume_number() {
            Some(Operand::Literal(num))
        } else {
            self.try_consume_quoted_literal().map(Operand::Literal)
        }
    }

    fn try_parse_annotation(&mut self) -> I18nResult<Option<Annotation>> {
        if let Some(function) = self.try_consume_function() {
            let mut options = Vec::new();
            while let Some(opt) = self.try_parse_function_option()? {
                options.push(opt);
            }
            Ok(Some(Annotation { function, options }))
        } else {
            Ok(None)
        }
    }

    fn try_parse_function_option(&mut self) -> I18nResult<Option<FunctionOption>> {
        if self.pos + 1 < self.tokens.len() {
            if let Token::Name(ref name) = self.tokens[self.pos].token {
                if self.tokens[self.pos + 1].token == Token::Equals {
                    let name = name.clone();
                    self.advance(); // name
                    self.advance(); // =
                    let value = self.parse_option_value()?;
                    return Ok(Some(FunctionOption { name, value }));
                }
            }
        }
        Ok(None)
    }

    fn parse_option_value(&mut self) -> I18nResult<OptionValue> {
        if let Some(var) = self.try_consume_variable() {
            Ok(OptionValue::Variable(var))
        } else if let Some(num) = self.try_consume_number() {
            Ok(OptionValue::Literal(num))
        } else if let Some(name) = self.try_consume_name() {
            Ok(OptionValue::Literal(name))
        } else if let Some(lit) = self.try_consume_quoted_literal() {
            Ok(OptionValue::Literal(lit))
        } else {
            Err(self.error("expected option value"))
        }
    }

    // ── Token helpers ────────────────────────────────────────────

    fn check(&self, expected: &Token) -> bool {
        self.pos < self.tokens.len()
            && std::mem::discriminant(&self.tokens[self.pos].token)
                == std::mem::discriminant(expected)
    }

    fn advance(&mut self) {
        if self.pos < self.tokens.len() {
            self.pos += 1;
        }
    }

    fn is_at_end(&self) -> bool {
        self.pos >= self.tokens.len()
    }

    fn expect(&mut self, expected: &Token) -> I18nResult<()> {
        if self.check(expected) {
            self.advance();
            Ok(())
        } else {
            let found = if self.is_at_end() {
                "end of input".to_string()
            } else {
                format!("{:?}", self.tokens[self.pos].token)
            };
            Err(self.error(&format!("expected {expected:?}, found {found}")))
        }
    }

    fn expect_tok(&mut self, expected: &Token) -> I18nResult<()> {
        self.expect(expected)
    }

    fn expect_variable(&mut self) -> I18nResult<String> {
        self.try_consume_variable().ok_or_else(|| self.error("expected variable ($name)"))
    }

    fn try_consume_variable(&mut self) -> Option<String> {
        if let Some(Token::Variable(name)) = self.tokens.get(self.pos).map(|t| &t.token) {
            let name = name.clone();
            self.advance();
            Some(name)
        } else {
            None
        }
    }

    fn try_consume_name(&mut self) -> Option<String> {
        if let Some(Token::Name(name)) = self.tokens.get(self.pos).map(|t| &t.token) {
            let name = name.clone();
            self.advance();
            Some(name)
        } else {
            None
        }
    }

    fn try_consume_number(&mut self) -> Option<String> {
        if let Some(Token::Number(num)) = self.tokens.get(self.pos).map(|t| &t.token) {
            let num = num.clone();
            self.advance();
            Some(num)
        } else {
            None
        }
    }

    fn try_consume_function(&mut self) -> Option<String> {
        if let Some(Token::Function(name)) = self.tokens.get(self.pos).map(|t| &t.token) {
            let name = name.clone();
            self.advance();
            Some(name)
        } else {
            None
        }
    }

    fn try_consume_quoted_literal(&mut self) -> Option<String> {
        if let Some(Token::QuotedLiteral(val)) = self.tokens.get(self.pos).map(|t| &t.token) {
            let val = val.clone();
            self.advance();
            Some(val)
        } else {
            None
        }
    }

    fn skip_newlines(&mut self) {
        while self.pos < self.tokens.len() && self.tokens[self.pos].token == Token::Newline {
            self.advance();
        }
    }

    fn error(&self, message: &str) -> I18nError {
        let offset = self.tokens.get(self.pos).map_or(0, |t| t.span.start);
        I18nError::Mf2Parse { offset, message: message.to_string() }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mf2;

    #[test]
    fn simple_text() {
        let msg = mf2::parse("Hello world").unwrap();
        match msg {
            Message::Simple(pat) => {
                assert_eq!(pat.parts.len(), 1);
                assert!(matches!(&pat.parts[0], PatternPart::Text(t) if t == "Hello world"));
            }
            _ => panic!("expected simple message"),
        }
    }

    #[test]
    fn simple_variable() {
        let msg = mf2::parse("Hello {$name}").unwrap();
        match msg {
            Message::Simple(pat) => {
                assert_eq!(pat.parts.len(), 2);
                assert!(matches!(&pat.parts[0], PatternPart::Text(t) if t == "Hello "));
                match &pat.parts[1] {
                    PatternPart::Expression(expr) => {
                        assert_eq!(expr.operand, Some(Operand::Variable("name".to_string())));
                    }
                    _ => panic!("expected expression"),
                }
            }
            _ => panic!("expected simple message"),
        }
    }

    #[test]
    fn variable_with_function() {
        let msg = mf2::parse("{$amount :number minimumFractionDigits=2}").unwrap();
        match msg {
            Message::Simple(pat) => {
                assert_eq!(pat.parts.len(), 1);
                match &pat.parts[0] {
                    PatternPart::Expression(expr) => {
                        assert_eq!(expr.operand, Some(Operand::Variable("amount".to_string())));
                        let ann = expr.annotation.as_ref().unwrap();
                        assert_eq!(ann.function, "number");
                        assert_eq!(ann.options.len(), 1);
                        assert_eq!(ann.options[0].name, "minimumFractionDigits");
                        assert_eq!(ann.options[0].value, OptionValue::Literal("2".to_string()));
                    }
                    _ => panic!("expected expression"),
                }
            }
            _ => panic!("expected simple message"),
        }
    }

    #[test]
    fn complex_input_match() {
        let source = ".input {$count :number}\n.match $count\none {{You have {$count} notification.}}\n* {{You have {$count} notifications.}}";
        let msg = mf2::parse(source).unwrap();
        match msg {
            Message::Complex(cm) => {
                assert_eq!(cm.declarations.len(), 1);
                match &cm.declarations[0] {
                    Declaration::Input(input) => {
                        assert_eq!(input.variable, "count");
                        assert_eq!(input.annotation.as_ref().unwrap().function, "number");
                    }
                    _ => panic!("expected input declaration"),
                }

                match &cm.body {
                    ComplexBody::Matcher(matcher) => {
                        assert_eq!(matcher.selectors, vec!["count"]);
                        assert_eq!(matcher.variants.len(), 2);
                        assert_eq!(
                            matcher.variants[0].keys,
                            vec![VariantKey::Literal("one".to_string())]
                        );
                        assert_eq!(matcher.variants[1].keys, vec![VariantKey::Wildcard]);
                    }
                    _ => panic!("expected matcher body"),
                }
            }
            _ => panic!("expected complex message"),
        }
    }

    #[test]
    fn local_declaration() {
        let source =
            ".local $greeting = {$name :string}\n.match $greeting\n* {{Hello {$greeting}}}";
        let msg = mf2::parse(source).unwrap();
        match msg {
            Message::Complex(cm) => {
                assert_eq!(cm.declarations.len(), 1);
                match &cm.declarations[0] {
                    Declaration::Local(local) => {
                        assert_eq!(local.variable, "greeting");
                    }
                    _ => panic!("expected local declaration"),
                }
            }
            _ => panic!("expected complex message"),
        }
    }

    #[test]
    fn empty_message() {
        let msg = mf2::parse("").unwrap();
        match msg {
            Message::Simple(pat) => {
                assert!(pat.parts.is_empty());
            }
            _ => panic!("expected simple message"),
        }
    }

    #[test]
    fn text_with_punctuation() {
        let msg = mf2::parse("You have {$count} items.").unwrap();
        match msg {
            Message::Simple(pat) => {
                assert_eq!(pat.parts.len(), 3);
                assert!(matches!(&pat.parts[0], PatternPart::Text(t) if t == "You have "));
                assert!(matches!(&pat.parts[1], PatternPart::Expression(_)));
                assert!(matches!(&pat.parts[2], PatternPart::Text(t) if t == " items."));
            }
            _ => panic!("expected simple message"),
        }
    }
}
