use serde::Serialize;

/// A complete MF2 message.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum Message {
    /// A simple message with a pattern body.
    Simple(Pattern),
    /// A complex message with declarations and/or a matcher.
    Complex(ComplexMessage),
}

/// A complex message containing optional declarations and a body.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ComplexMessage {
    pub declarations: Vec<Declaration>,
    pub body: ComplexBody,
}

/// The body of a complex message.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum ComplexBody {
    /// A matcher with variants.
    Matcher(Matcher),
    /// A quoted pattern (for complex messages with declarations but no matcher).
    QuotedPattern(Pattern),
}

/// A declaration (`.input` or `.local`).
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum Declaration {
    /// `.input {$var :function}`
    Input(InputDeclaration),
    /// `.local $var = {expression}`
    Local(LocalDeclaration),
}

/// `.input {$var :function options}`
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct InputDeclaration {
    pub variable: String,
    pub annotation: Option<Annotation>,
}

/// `.local $var = {expression}`
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct LocalDeclaration {
    pub variable: String,
    pub expression: Expression,
}

/// A matcher with selectors and variants.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Matcher {
    pub selectors: Vec<String>,
    pub variants: Vec<Variant>,
}

/// A single variant in a `.match`.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Variant {
    pub keys: Vec<VariantKey>,
    pub pattern: Pattern,
}

/// A key in a variant (literal value or wildcard `*`).
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum VariantKey {
    Literal(String),
    Wildcard,
}

/// A pattern is a sequence of text and expression parts.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Pattern {
    pub parts: Vec<PatternPart>,
}

/// A part of a pattern: either literal text or an expression in `{ }`.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum PatternPart {
    Text(String),
    Expression(Expression),
}

/// An expression inside `{ }` braces.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Expression {
    pub operand: Option<Operand>,
    pub annotation: Option<Annotation>,
}

/// The operand of an expression.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum Operand {
    Variable(String),
    Literal(String),
}

/// A function annotation (`:function option=value ...`).
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Annotation {
    pub function: String,
    pub options: Vec<FunctionOption>,
}

/// A function option (`key=value`).
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FunctionOption {
    pub name: String,
    pub value: OptionValue,
}

/// A function option value.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum OptionValue {
    Literal(String),
    Variable(String),
}
