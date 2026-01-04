//! Documentation extraction from source code.

use serde::{Deserialize, Serialize};
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
    /// Documentation comment.
    pub doc: Option<String>,
    /// Source file path.
    pub source_path: String,
    /// Line number in source.
    pub line: u32,
    /// Whether the item is exported.
    pub exported: bool,
    /// Type signature (if applicable).
    pub signature: Option<String>,
    /// Child items (for classes, modules, etc.).
    pub children: Vec<DocItem>,
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
    pub fn extract_file(&self, path: &std::path::Path) -> ExtractResult<Vec<DocItem>> {
        let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("");

        match extension {
            "ts" | "tsx" | "js" | "jsx" | "mts" | "mjs" | "cts" | "cjs" => self.extract_js_ts(path),
            _ => Err(ExtractError::UnsupportedFile(extension.to_string())),
        }
    }

    /// Extracts documentation from a JavaScript/TypeScript file.
    fn extract_js_ts(&self, path: &std::path::Path) -> ExtractResult<Vec<DocItem>> {
        let _content = std::fs::read_to_string(path)?;
        let _ = self.include_private;

        // TODO: Use OXC parser to extract documentation
        // For now, return an empty list
        Ok(vec![])
    }
}

impl Default for DocExtractor {
    fn default() -> Self {
        Self::new()
    }
}
