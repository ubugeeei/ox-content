//! Documentation extraction from source code using OXC parser.

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    BindingPatternKind, Class, Declaration, ExportDefaultDeclarationKind, Function, Statement,
    TSSignature, TSType, TSTypeName,
};
use oxc_ast::visit::walk;
use oxc_ast::Visit;
use oxc_parser::Parser;
use oxc_span::SourceType;
use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

/// Result type for extraction operations.
pub type ExtractResult<T> = Result<T, ExtractError>;

/// Errors during documentation extraction.
#[derive(Debug, Error)]
pub enum ExtractError {
    /// IO error.
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    /// Parse error.
    #[error("Parse error: {0}")]
    Parse(String),

    /// Unsupported file type.
    #[error("Unsupported file type: {0}")]
    UnsupportedFile(String),
}

/// Documentation item extracted from source code.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocItem {
    /// Item name.
    pub name: String,
    /// Item kind (function, class, interface, etc.).
    pub kind: DocItemKind,
    /// Documentation comment (JSDoc).
    pub doc: Option<String>,
    /// Source file path.
    pub source_path: String,
    /// Line number in source.
    pub line: u32,
    /// Column number in source.
    pub column: u32,
    /// Whether the item is exported.
    pub exported: bool,
    /// Type signature (if applicable).
    pub signature: Option<String>,
    /// Parameters (for functions/methods).
    pub params: Vec<ParamDoc>,
    /// Return type (for functions/methods).
    pub return_type: Option<String>,
    /// Child items (for classes, modules, etc.).
    pub children: Vec<DocItem>,
    /// JSDoc tags.
    pub tags: Vec<DocTag>,
}

/// Parameter documentation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParamDoc {
    /// Parameter name.
    pub name: String,
    /// Parameter type.
    pub type_annotation: Option<String>,
    /// Whether the parameter is optional.
    pub optional: bool,
    /// Default value (if any).
    pub default_value: Option<String>,
    /// Description from JSDoc @param tag.
    pub description: Option<String>,
}

/// JSDoc tag.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocTag {
    /// Tag name (e.g., "param", "returns", "example").
    pub tag: String,
    /// Tag value.
    pub value: String,
}

/// Kind of documentation item.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DocItemKind {
    /// Module or namespace.
    Module,
    /// Function.
    Function,
    /// Class.
    Class,
    /// Interface (TypeScript).
    Interface,
    /// Type alias.
    Type,
    /// Enum.
    Enum,
    /// Variable or constant.
    Variable,
    /// Class method.
    Method,
    /// Class property.
    Property,
    /// Constructor.
    Constructor,
    /// Getter.
    Getter,
    /// Setter.
    Setter,
}

/// Documentation extractor.
pub struct DocExtractor {
    /// Include private items.
    include_private: bool,
}

impl DocExtractor {
    /// Creates a new documentation extractor.
    #[must_use]
    pub fn new() -> Self {
        Self { include_private: false }
    }

    /// Creates a new extractor that includes private items.
    #[must_use]
    pub fn with_private(include_private: bool) -> Self {
        Self { include_private }
    }

    /// Extracts documentation from a source file.
    pub fn extract_file(&self, path: &Path) -> ExtractResult<Vec<DocItem>> {
        let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("");

        match extension {
            "ts" | "tsx" | "js" | "jsx" | "mts" | "mjs" | "cts" | "cjs" => self.extract_js_ts(path),
            _ => Err(ExtractError::UnsupportedFile(extension.to_string())),
        }
    }

    /// Extracts documentation from source code string.
    pub fn extract_source(
        &self,
        source: &str,
        file_path: &str,
        source_type: SourceType,
    ) -> ExtractResult<Vec<DocItem>> {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, source, source_type).parse();

        if !ret.errors.is_empty() {
            let error_msg = ret
                .errors
                .iter()
                .map(std::string::ToString::to_string)
                .collect::<Vec<_>>()
                .join(", ");
            return Err(ExtractError::Parse(error_msg));
        }

        let mut visitor = DocVisitor::new(source, file_path, self.include_private);
        visitor.visit_program(&ret.program);

        Ok(visitor.items)
    }

    /// Extracts documentation from a JavaScript/TypeScript file.
    fn extract_js_ts(&self, path: &Path) -> ExtractResult<Vec<DocItem>> {
        let content = std::fs::read_to_string(path)?;
        let file_path = path.to_string_lossy().to_string();
        let source_type = SourceType::from_path(path).unwrap_or_default();

        self.extract_source(&content, &file_path, source_type)
    }
}

impl Default for DocExtractor {
    fn default() -> Self {
        Self::new()
    }
}

/// AST visitor for extracting documentation.
struct DocVisitor<'a> {
    source: &'a str,
    file_path: &'a str,
    include_private: bool,
    items: Vec<DocItem>,
    /// Track default export
    has_default_export: bool,
}

impl<'a> DocVisitor<'a> {
    fn new(source: &'a str, file_path: &'a str, include_private: bool) -> Self {
        Self { source, file_path, include_private, items: Vec::new(), has_default_export: false }
    }

    /// Extract JSDoc comment before a given position.
    /// Only extracts if the JSDoc is immediately adjacent to the declaration
    /// (with only whitespace and keywords like 'export', 'async', etc. in between).
    fn extract_jsdoc(&self, start: u32) -> Option<(String, Vec<DocTag>)> {
        let source_before = &self.source[..start as usize];

        // Find the last JSDoc comment (/** ... */)
        if let Some(end) = source_before.rfind("*/") {
            let remaining = &source_before[..end];
            if let Some(start_idx) = remaining.rfind("/**") {
                // Check that between the comment end and declaration start,
                // there's only whitespace and allowed keywords
                let between = &source_before[end + 2..];
                let between_trimmed = between.trim();

                // Skip if there's actual code between the comment and declaration
                // Allow: whitespace, 'export', 'default', 'async', 'function', 'class', 'interface', 'type', 'const', 'let', 'var', 'enum'
                let allowed_keywords = [
                    "export",
                    "default",
                    "async",
                    "function",
                    "class",
                    "interface",
                    "type",
                    "const",
                    "let",
                    "var",
                    "enum",
                    "abstract",
                    "declare",
                ];

                // Check if the content between is just allowed keywords
                let words: Vec<&str> = between_trimmed.split_whitespace().collect();
                let is_adjacent =
                    words.iter().all(|word| allowed_keywords.contains(word) || word.is_empty());

                if is_adjacent {
                    let comment = &source_before[start_idx..end + 2];
                    let (doc, tags) = Self::parse_jsdoc(comment);
                    return Some((doc, tags));
                }
            }
        }
        None
    }

    /// Parse JSDoc comment into description and tags.
    fn parse_jsdoc(comment: &str) -> (String, Vec<DocTag>) {
        let mut description = String::new();
        let mut tags = Vec::new();
        let mut current_tag: Option<(String, String)> = None;

        // Remove /** and */ and leading asterisks
        let lines: Vec<&str> = comment
            .trim_start_matches("/**")
            .trim_end_matches("*/")
            .lines()
            .map(|line| line.trim().trim_start_matches('*').trim())
            .filter(|line| !line.is_empty())
            .collect();

        for line in lines {
            if line.starts_with('@') {
                // Save previous tag if any
                if let Some((tag, value)) = current_tag.take() {
                    tags.push(DocTag { tag, value });
                }

                // Parse new tag
                let parts: Vec<&str> = line.splitn(2, ' ').collect();
                let tag_name = parts[0].trim_start_matches('@').to_string();
                let tag_value = parts.get(1).unwrap_or(&"").to_string();
                current_tag = Some((tag_name, tag_value));
            } else if let Some((_, ref mut value)) = current_tag {
                // Continue previous tag value
                if !value.is_empty() {
                    value.push(' ');
                }
                value.push_str(line);
            } else {
                // Add to description
                if !description.is_empty() {
                    description.push(' ');
                }
                description.push_str(line);
            }
        }

        // Save last tag if any
        if let Some((tag, value)) = current_tag {
            tags.push(DocTag { tag, value });
        }

        (description, tags)
    }

    /// Format a function signature.
    fn format_function_signature(&self, func: &Function) -> String {
        let mut sig = String::new();

        // Function name
        if let Some(id) = &func.id {
            sig.push_str(id.name.as_str());
        }

        // Type parameters
        if let Some(type_params) = &func.type_parameters {
            sig.push('<');
            let params: Vec<String> =
                type_params.params.iter().map(|p| p.name.name.to_string()).collect();
            sig.push_str(&params.join(", "));
            sig.push('>');
        }

        // Parameters
        sig.push('(');
        let params: Vec<String> =
            func.params.items.iter().map(|p| self.format_binding_pattern(&p.pattern)).collect();
        sig.push_str(&params.join(", "));
        sig.push(')');

        // Return type
        if let Some(return_type) = &func.return_type {
            sig.push_str(": ");
            sig.push_str(&self.format_ts_type(&return_type.type_annotation));
        }

        sig
    }

    /// Format a binding pattern.
    fn format_binding_pattern(&self, pattern: &oxc_ast::ast::BindingPattern) -> String {
        match &pattern.kind {
            BindingPatternKind::BindingIdentifier(id) => {
                let mut s = id.name.to_string();
                if pattern.optional {
                    s.push('?');
                }
                if let Some(type_ann) = &pattern.type_annotation {
                    s.push_str(": ");
                    s.push_str(&self.format_ts_type(&type_ann.type_annotation));
                }
                s
            }
            BindingPatternKind::ObjectPattern(_) => "{...}".to_string(),
            BindingPatternKind::ArrayPattern(_) => "[...]".to_string(),
            BindingPatternKind::AssignmentPattern(assign) => {
                self.format_binding_pattern(&assign.left)
            }
        }
    }

    /// Format a TypeScript type.
    fn format_ts_type(&self, ts_type: &TSType) -> String {
        match ts_type {
            TSType::TSAnyKeyword(_) => "any".to_string(),
            TSType::TSBooleanKeyword(_) => "boolean".to_string(),
            TSType::TSNumberKeyword(_) => "number".to_string(),
            TSType::TSStringKeyword(_) => "string".to_string(),
            TSType::TSVoidKeyword(_) => "void".to_string(),
            TSType::TSNullKeyword(_) => "null".to_string(),
            TSType::TSUndefinedKeyword(_) => "undefined".to_string(),
            TSType::TSNeverKeyword(_) => "never".to_string(),
            TSType::TSBigIntKeyword(_) => "bigint".to_string(),
            TSType::TSSymbolKeyword(_) => "symbol".to_string(),
            TSType::TSObjectKeyword(_) => "object".to_string(),
            TSType::TSTypeReference(ref_type) => Self::format_ts_type_name(&ref_type.type_name),
            TSType::TSArrayType(arr) => format!("{}[]", self.format_ts_type(&arr.element_type)),
            TSType::TSUnionType(union) => {
                let types: Vec<String> =
                    union.types.iter().map(|t| self.format_ts_type(t)).collect();
                types.join(" | ")
            }
            TSType::TSIntersectionType(inter) => {
                let types: Vec<String> =
                    inter.types.iter().map(|t| self.format_ts_type(t)).collect();
                types.join(" & ")
            }
            TSType::TSFunctionType(func) => {
                let params: Vec<String> = func
                    .params
                    .items
                    .iter()
                    .map(|p| self.format_binding_pattern(&p.pattern))
                    .collect();
                let ret = self.format_ts_type(&func.return_type.type_annotation);
                format!("({}) => {}", params.join(", "), ret)
            }
            TSType::TSTypeLiteral(_) => "{ ... }".to_string(),
            TSType::TSTupleType(tuple) => {
                let types: Vec<String> = tuple
                    .element_types
                    .iter()
                    .map(|t| self.format_ts_type(t.to_ts_type()))
                    .collect();
                format!("[{}]", types.join(", "))
            }
            TSType::TSLiteralType(lit) => match &lit.literal {
                oxc_ast::ast::TSLiteral::StringLiteral(s) => format!("\"{}\"", s.value),
                oxc_ast::ast::TSLiteral::NumericLiteral(n) => n
                    .raw
                    .as_ref()
                    .map_or_else(|| n.value.to_string(), std::string::ToString::to_string),
                oxc_ast::ast::TSLiteral::BooleanLiteral(b) => b.value.to_string(),
                _ => "literal".to_string(),
            },
            _ => "unknown".to_string(),
        }
    }

    /// Format a TypeScript type name.
    fn format_ts_type_name(name: &TSTypeName) -> String {
        match name {
            TSTypeName::IdentifierReference(id) => id.name.to_string(),
            TSTypeName::QualifiedName(qn) => {
                format!("{}.{}", Self::format_ts_type_name(&qn.left), qn.right.name)
            }
        }
    }

    /// Extract parameters from a function.
    fn extract_params(&self, func: &Function, tags: &[DocTag]) -> Vec<ParamDoc> {
        func.params
            .items
            .iter()
            .map(|param| {
                let name = match &param.pattern.kind {
                    BindingPatternKind::BindingIdentifier(id) => id.name.to_string(),
                    _ => "param".to_string(),
                };

                let type_annotation = param
                    .pattern
                    .type_annotation
                    .as_ref()
                    .map(|t| self.format_ts_type(&t.type_annotation));

                let description =
                    tags.iter().find(|t| t.tag == "param" && t.value.starts_with(&name)).map(|t| {
                        t.value
                            .trim_start_matches(&name)
                            .trim_start_matches(" - ")
                            .trim()
                            .to_string()
                    });

                ParamDoc {
                    name,
                    type_annotation,
                    optional: param.pattern.optional,
                    default_value: None,
                    description,
                }
            })
            .collect()
    }

    /// Extract return type from tags.
    fn extract_return_type(&self, func: &Function, tags: &[DocTag]) -> Option<String> {
        func.return_type.as_ref().map(|r| self.format_ts_type(&r.type_annotation)).or_else(|| {
            tags.iter().find(|t| t.tag == "returns" || t.tag == "return").map(|t| t.value.clone())
        })
    }

    /// Create a DocItem from a function.
    fn create_function_item(&self, func: &Function, exported: bool) -> Option<DocItem> {
        let name = func.id.as_ref()?.name.to_string();

        // Skip private items if not included
        if !self.include_private && name.starts_with('_') {
            return None;
        }

        let (doc, tags) =
            self.extract_jsdoc(func.span.start).unwrap_or((String::new(), Vec::new()));

        Some(DocItem {
            name,
            kind: DocItemKind::Function,
            doc: if doc.is_empty() { None } else { Some(doc) },
            source_path: self.file_path.to_string(),
            line: func.span.start,
            column: 0,
            exported,
            signature: Some(self.format_function_signature(func)),
            params: self.extract_params(func, &tags),
            return_type: self.extract_return_type(func, &tags),
            children: Vec::new(),
            tags,
        })
    }

    /// Create a DocItem from a class.
    fn create_class_item(&self, class: &Class, name: &str, exported: bool) -> Option<DocItem> {
        // Skip private items if not included
        if !self.include_private && name.starts_with('_') {
            return None;
        }

        let (doc, tags) =
            self.extract_jsdoc(class.span.start).unwrap_or((String::new(), Vec::new()));

        let mut children = Vec::new();

        // Extract class members
        for element in &class.body.body {
            match element {
                oxc_ast::ast::ClassElement::MethodDefinition(method) => {
                    let method_name = match &method.key {
                        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => id.name.to_string(),
                        _ => continue,
                    };

                    if !self.include_private && method_name.starts_with('_') {
                        continue;
                    }

                    let kind = match method.kind {
                        oxc_ast::ast::MethodDefinitionKind::Constructor => DocItemKind::Constructor,
                        oxc_ast::ast::MethodDefinitionKind::Get => DocItemKind::Getter,
                        oxc_ast::ast::MethodDefinitionKind::Set => DocItemKind::Setter,
                        oxc_ast::ast::MethodDefinitionKind::Method => DocItemKind::Method,
                    };

                    let (method_doc, method_tags) = self
                        .extract_jsdoc(method.span.start)
                        .unwrap_or((String::new(), Vec::new()));

                    children.push(DocItem {
                        name: method_name,
                        kind,
                        doc: if method_doc.is_empty() { None } else { Some(method_doc) },
                        source_path: self.file_path.to_string(),
                        line: method.span.start,
                        column: 0,
                        exported: false,
                        signature: Some(self.format_function_signature(&method.value)),
                        params: self.extract_params(&method.value, &method_tags),
                        return_type: self.extract_return_type(&method.value, &method_tags),
                        children: Vec::new(),
                        tags: method_tags,
                    });
                }
                oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
                    let prop_name = match &prop.key {
                        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => id.name.to_string(),
                        _ => continue,
                    };

                    if !self.include_private && prop_name.starts_with('_') {
                        continue;
                    }

                    let (prop_doc, prop_tags) =
                        self.extract_jsdoc(prop.span.start).unwrap_or((String::new(), Vec::new()));

                    let type_annotation = prop
                        .type_annotation
                        .as_ref()
                        .map(|t| self.format_ts_type(&t.type_annotation));

                    children.push(DocItem {
                        name: prop_name,
                        kind: DocItemKind::Property,
                        doc: if prop_doc.is_empty() { None } else { Some(prop_doc) },
                        source_path: self.file_path.to_string(),
                        line: prop.span.start,
                        column: 0,
                        exported: false,
                        signature: type_annotation,
                        params: Vec::new(),
                        return_type: None,
                        children: Vec::new(),
                        tags: prop_tags,
                    });
                }
                _ => {}
            }
        }

        Some(DocItem {
            name: name.to_string(),
            kind: DocItemKind::Class,
            doc: if doc.is_empty() { None } else { Some(doc) },
            source_path: self.file_path.to_string(),
            line: class.span.start,
            column: 0,
            exported,
            signature: None,
            params: Vec::new(),
            return_type: None,
            children,
            tags,
        })
    }
}

impl<'a> Visit<'a> for DocVisitor<'a> {
    fn visit_statement(&mut self, stmt: &Statement<'a>) {
        match stmt {
            Statement::ExportNamedDeclaration(export) => {
                if let Some(ref decl) = export.declaration {
                    self.visit_declaration_as_exported(decl);
                }
            }
            Statement::ExportDefaultDeclaration(export) => {
                self.has_default_export = true;
                match &export.declaration {
                    ExportDefaultDeclarationKind::FunctionDeclaration(func) => {
                        if let Some(item) = self.create_function_item(func, true) {
                            self.items.push(item);
                        }
                    }
                    ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                        let name = class
                            .id
                            .as_ref()
                            .map_or_else(|| "default".to_string(), |id| id.name.to_string());
                        if let Some(item) = self.create_class_item(class, &name, true) {
                            self.items.push(item);
                        }
                    }
                    _ => {}
                }
            }
            _ => {
                walk::walk_statement(self, stmt);
            }
        }
    }

    fn visit_declaration(&mut self, decl: &Declaration<'a>) {
        // Only visit non-exported declarations
        self.visit_declaration_internal(decl, false);
    }
}

impl<'a> DocVisitor<'a> {
    fn visit_declaration_as_exported(&mut self, decl: &Declaration<'a>) {
        self.visit_declaration_internal(decl, true);
    }

    fn visit_declaration_internal(&mut self, decl: &Declaration<'a>, exported: bool) {
        match decl {
            Declaration::FunctionDeclaration(func) => {
                if let Some(item) = self.create_function_item(func, exported) {
                    self.items.push(item);
                }
            }
            Declaration::ClassDeclaration(class) => {
                if let Some(id) = &class.id {
                    let name = id.name.to_string();
                    if let Some(item) = self.create_class_item(class, &name, exported) {
                        self.items.push(item);
                    }
                }
            }
            Declaration::VariableDeclaration(var_decl) => {
                for declarator in &var_decl.declarations {
                    if let BindingPatternKind::BindingIdentifier(id) = &declarator.id.kind {
                        let name = id.name.to_string();

                        if !self.include_private && name.starts_with('_') {
                            continue;
                        }

                        let (doc, tags) = self
                            .extract_jsdoc(var_decl.span.start)
                            .unwrap_or((String::new(), Vec::new()));

                        let type_annotation = declarator
                            .id
                            .type_annotation
                            .as_ref()
                            .map(|t| self.format_ts_type(&t.type_annotation));

                        self.items.push(DocItem {
                            name,
                            kind: DocItemKind::Variable,
                            doc: if doc.is_empty() { None } else { Some(doc) },
                            source_path: self.file_path.to_string(),
                            line: var_decl.span.start,
                            column: 0,
                            exported,
                            signature: type_annotation,
                            params: Vec::new(),
                            return_type: None,
                            children: Vec::new(),
                            tags,
                        });
                    }
                }
            }
            Declaration::TSTypeAliasDeclaration(type_alias) => {
                let name = type_alias.id.name.to_string();

                if !self.include_private && name.starts_with('_') {
                    return;
                }

                let (doc, tags) = self
                    .extract_jsdoc(type_alias.span.start)
                    .unwrap_or((String::new(), Vec::new()));

                self.items.push(DocItem {
                    name,
                    kind: DocItemKind::Type,
                    doc: if doc.is_empty() { None } else { Some(doc) },
                    source_path: self.file_path.to_string(),
                    line: type_alias.span.start,
                    column: 0,
                    exported,
                    signature: Some(self.format_ts_type(&type_alias.type_annotation)),
                    params: Vec::new(),
                    return_type: None,
                    children: Vec::new(),
                    tags,
                });
            }
            Declaration::TSInterfaceDeclaration(interface) => {
                let name = interface.id.name.to_string();

                if !self.include_private && name.starts_with('_') {
                    return;
                }

                let (doc, tags) =
                    self.extract_jsdoc(interface.span.start).unwrap_or((String::new(), Vec::new()));

                let mut children = Vec::new();

                // Extract interface members
                for sig in &interface.body.body {
                    match sig {
                        TSSignature::TSPropertySignature(prop) => {
                            let prop_name = match &prop.key {
                                oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
                                    id.name.to_string()
                                }
                                _ => continue,
                            };

                            let (prop_doc, prop_tags) = self
                                .extract_jsdoc(prop.span.start)
                                .unwrap_or((String::new(), Vec::new()));

                            let type_annotation = prop
                                .type_annotation
                                .as_ref()
                                .map(|t| self.format_ts_type(&t.type_annotation));

                            children.push(DocItem {
                                name: prop_name,
                                kind: DocItemKind::Property,
                                doc: if prop_doc.is_empty() { None } else { Some(prop_doc) },
                                source_path: self.file_path.to_string(),
                                line: prop.span.start,
                                column: 0,
                                exported: false,
                                signature: type_annotation,
                                params: Vec::new(),
                                return_type: None,
                                children: Vec::new(),
                                tags: prop_tags,
                            });
                        }
                        TSSignature::TSMethodSignature(method) => {
                            let method_name = match &method.key {
                                oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
                                    id.name.to_string()
                                }
                                _ => continue,
                            };

                            let (method_doc, method_tags) = self
                                .extract_jsdoc(method.span.start)
                                .unwrap_or((String::new(), Vec::new()));

                            let params: Vec<ParamDoc> = method
                                .params
                                .items
                                .iter()
                                .map(|p| {
                                    let param_name = match &p.pattern.kind {
                                        BindingPatternKind::BindingIdentifier(id) => {
                                            id.name.to_string()
                                        }
                                        _ => "param".to_string(),
                                    };
                                    ParamDoc {
                                        name: param_name,
                                        type_annotation: p
                                            .pattern
                                            .type_annotation
                                            .as_ref()
                                            .map(|t| self.format_ts_type(&t.type_annotation)),
                                        optional: p.pattern.optional,
                                        default_value: None,
                                        description: None,
                                    }
                                })
                                .collect();

                            let return_type = method
                                .return_type
                                .as_ref()
                                .map(|r| self.format_ts_type(&r.type_annotation));

                            children.push(DocItem {
                                name: method_name,
                                kind: DocItemKind::Method,
                                doc: if method_doc.is_empty() { None } else { Some(method_doc) },
                                source_path: self.file_path.to_string(),
                                line: method.span.start,
                                column: 0,
                                exported: false,
                                signature: None,
                                params,
                                return_type,
                                children: Vec::new(),
                                tags: method_tags,
                            });
                        }
                        _ => {}
                    }
                }

                self.items.push(DocItem {
                    name,
                    kind: DocItemKind::Interface,
                    doc: if doc.is_empty() { None } else { Some(doc) },
                    source_path: self.file_path.to_string(),
                    line: interface.span.start,
                    column: 0,
                    exported,
                    signature: None,
                    params: Vec::new(),
                    return_type: None,
                    children,
                    tags,
                });
            }
            Declaration::TSEnumDeclaration(enum_decl) => {
                let name = enum_decl.id.name.to_string();

                if !self.include_private && name.starts_with('_') {
                    return;
                }

                let (doc, tags) =
                    self.extract_jsdoc(enum_decl.span.start).unwrap_or((String::new(), Vec::new()));

                let children: Vec<DocItem> = enum_decl
                    .members
                    .iter()
                    .map(|member| {
                        let member_name = match &member.id {
                            oxc_ast::ast::TSEnumMemberName::Identifier(id) => id.name.to_string(),
                            oxc_ast::ast::TSEnumMemberName::String(s) => s.value.to_string(),
                        };
                        DocItem {
                            name: member_name,
                            kind: DocItemKind::Property,
                            doc: None,
                            source_path: self.file_path.to_string(),
                            line: member.span.start,
                            column: 0,
                            exported: false,
                            signature: None,
                            params: Vec::new(),
                            return_type: None,
                            children: Vec::new(),
                            tags: Vec::new(),
                        }
                    })
                    .collect();

                self.items.push(DocItem {
                    name,
                    kind: DocItemKind::Enum,
                    doc: if doc.is_empty() { None } else { Some(doc) },
                    source_path: self.file_path.to_string(),
                    line: enum_decl.span.start,
                    column: 0,
                    exported,
                    signature: None,
                    params: Vec::new(),
                    return_type: None,
                    children,
                    tags,
                });
            }
            _ => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_function() {
        let source = r"
/**
 * Adds two numbers together.
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
    return a + b;
}
";

        let extractor = DocExtractor::new();
        let items = extractor.extract_source(source, "test.ts", SourceType::ts()).unwrap();

        assert_eq!(items.len(), 1);
        assert_eq!(items[0].name, "add");
        assert_eq!(items[0].kind, DocItemKind::Function);
        assert!(items[0].exported);
        assert!(items[0].doc.as_ref().unwrap().contains("Adds two numbers"));
        assert_eq!(items[0].params.len(), 2);
    }

    #[test]
    fn test_extract_interface() {
        let source = r"
/**
 * User interface.
 */
export interface User {
    /** User's name */
    name: string;
    /** User's age */
    age: number;
}
";

        let extractor = DocExtractor::new();
        let items = extractor.extract_source(source, "test.ts", SourceType::ts()).unwrap();

        assert_eq!(items.len(), 1);
        assert_eq!(items[0].name, "User");
        assert_eq!(items[0].kind, DocItemKind::Interface);
        assert_eq!(items[0].children.len(), 2);
    }
}
