//! # ox-content-i18n-lsp
//!
//! Language Server Protocol (LSP) server for i18n translation keys.
//!
//! Provides:
//! - **Completion** — Suggests dictionary keys inside `t("")` calls
//! - **Hover** — Shows translations for all locales (TODO)
//! - **Go-to-definition** — Jumps to the dictionary file defining a key (TODO)
//! - **Inlay hints** — Displays default-locale translations inline (TODO)
//! - **Diagnostics** — Reports missing/unused keys in real-time (TODO)
//!
//! ## Usage
//!
//! ```bash
//! ox-content-i18n-lsp
//! ```
//!
//! The server communicates over stdio using the LSP protocol.

mod backend;
mod document;
mod state;

use tower_lsp::{LspService, Server};

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(backend::Backend::new);

    Server::new(stdin, stdout, socket).serve(service).await;
}
