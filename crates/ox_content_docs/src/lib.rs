//! Source code documentation generator for Ox Content.
//!
//! This crate provides functionality similar to `cargo doc`,
//! generating documentation from source code using OXC parser
//! for JavaScript/TypeScript files.

mod config;
mod extractor;
mod generator;

pub use config::DocsConfig;
pub use extractor::{
    DocExtractor, DocItem, DocItemKind, DocTag, ExtractError, ExtractResult, ParamDoc,
};
pub use generator::{DocsGenerator, GenerateError, GenerateResult};
