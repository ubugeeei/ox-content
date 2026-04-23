mod commands;
mod diagnostics;
mod handlers;
mod snippets;

use tower_lsp::lsp_types::{Diagnostic, Url};
use tower_lsp::Client;

use crate::config::{InitializationOptions, ResolvedConfig};
use crate::document::{is_markdown_path, TextDocumentState};
use crate::frontmatter::{self, FrontmatterSchema};
use crate::state::LspState;

pub struct Backend {
    pub(super) client: Client,
    pub(super) state: LspState,
}

impl Backend {
    pub fn new(client: Client) -> Self {
        Self { client, state: LspState::new() }
    }

    pub(super) async fn on_change(&self, uri: &Url, text: String) {
        if uri.to_file_path().ok().is_some_and(|path| !is_markdown_path(&path)) {
            return;
        }

        self.state.upsert_document(uri.clone(), text).await;
        self.publish_diagnostics_for(uri).await;
    }

    pub(super) async fn publish_diagnostics_for(&self, uri: &Url) {
        let Some(document) = self.state.document(uri).await else {
            return;
        };

        let diagnostics = self.diagnostics(&document).await;
        self.client.publish_diagnostics(uri.clone(), diagnostics, None).await;
    }

    async fn diagnostics(&self, document: &TextDocumentState) -> Vec<Diagnostic> {
        let config = self.resolved_config().await;
        let frontmatter = frontmatter::parse_frontmatter(document);
        let mut diagnostics = frontmatter
            .block
            .as_ref()
            .map_or_else(Vec::new, |block| self.frontmatter_diagnostics(block, &config));
        diagnostics
            .extend(diagnostics::markdown_parse_diagnostics(document, frontmatter.block.as_ref()));
        diagnostics
    }

    fn frontmatter_diagnostics(
        &self,
        block: &frontmatter::FrontmatterBlock,
        config: &ResolvedConfig,
    ) -> Vec<Diagnostic> {
        let mut diagnostics = block.diagnostics.clone();
        match self.load_schema(config) {
            Ok(Some(schema)) => {
                diagnostics.extend(frontmatter::validate_frontmatter(block, &schema))
            }
            Ok(None) => {}
            Err(message) => diagnostics.push(Diagnostic {
                range: block.block_range,
                severity: Some(tower_lsp::lsp_types::DiagnosticSeverity::ERROR),
                source: Some("ox-content".to_string()),
                message,
                ..Default::default()
            }),
        }
        diagnostics
    }

    pub(super) async fn resolved_config(&self) -> ResolvedConfig {
        let root = self.state.root().await;
        let init = self.state.init_options().await;
        ResolvedConfig::load(root.as_deref(), &init)
    }

    pub(super) fn load_schema(
        &self,
        config: &ResolvedConfig,
    ) -> std::result::Result<Option<FrontmatterSchema>, String> {
        let Some(path) = &config.frontmatter_schema else {
            return Ok(None);
        };
        if !path.exists() {
            return Err(format!(
                "Configured frontmatter schema does not exist: {}",
                path.display()
            ));
        }
        frontmatter::load_schema(path).map(Some)
    }

    pub(super) async fn init_from_params(&self, params: &tower_lsp::lsp_types::InitializeParams) {
        let root = params.root_uri.as_ref().and_then(|uri| uri.to_file_path().ok()).or_else(|| {
            params.workspace_folders.as_ref().and_then(|folders| {
                folders.first().and_then(|folder| folder.uri.to_file_path().ok())
            })
        });
        let init_options = params
            .initialization_options
            .clone()
            .and_then(|value| serde_json::from_value::<InitializationOptions>(value).ok())
            .unwrap_or_default();

        self.state.set_root(root).await;
        self.state.set_init_options(init_options).await;
    }
}
