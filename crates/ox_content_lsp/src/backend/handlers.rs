use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::LanguageServer;

use crate::frontmatter;
use crate::preview;

use super::commands::{
    insert_actions, COMMAND_INSERT_CALLOUT, COMMAND_INSERT_CODE_FENCE, COMMAND_INSERT_TABLE,
    COMMAND_PREVIEW_HTML,
};
use super::snippets::markdown_snippet_items;
use super::Backend;

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, params: InitializeParams) -> Result<InitializeResult> {
        self.init_from_params(&params).await;
        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::FULL,
                )),
                completion_provider: Some(CompletionOptions {
                    trigger_characters: Some(vec![
                        "#".into(),
                        "-".into(),
                        "[".into(),
                        "`".into(),
                        "!".into(),
                        ">".into(),
                        "|".into(),
                        ":".into(),
                    ]),
                    ..Default::default()
                }),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                document_symbol_provider: Some(OneOf::Left(true)),
                code_action_provider: Some(CodeActionProviderCapability::Simple(true)),
                execute_command_provider: Some(ExecuteCommandOptions {
                    commands: vec![
                        COMMAND_INSERT_TABLE.into(),
                        COMMAND_INSERT_CODE_FENCE.into(),
                        COMMAND_INSERT_CALLOUT.into(),
                        COMMAND_PREVIEW_HTML.into(),
                    ],
                    ..Default::default()
                }),
                ..Default::default()
            },
            server_info: Some(ServerInfo {
                name: "ox-content-lsp".to_string(),
                version: Some(env!("CARGO_PKG_VERSION").to_string()),
            }),
            ..Default::default()
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client.log_message(MessageType::INFO, "ox-content LSP initialized").await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        self.on_change(&params.text_document.uri, params.text_document.text).await;
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        if let Some(change) = params.content_changes.first() {
            self.on_change(&params.text_document.uri, change.text.clone()).await;
        }
    }

    async fn did_close(&self, params: DidCloseTextDocumentParams) {
        self.state.remove_document(&params.text_document.uri).await;
        self.client.publish_diagnostics(params.text_document.uri, Vec::new(), None).await;
    }

    async fn completion(&self, params: CompletionParams) -> Result<Option<CompletionResponse>> {
        let uri = &params.text_document_position.text_document.uri;
        let position = params.text_document_position.position;
        let Some(document) = self.state.document(uri).await else {
            return Ok(None);
        };
        let config = self.resolved_config().await;
        let frontmatter = frontmatter::parse_frontmatter(&document);
        let mut items = frontmatter
            .block
            .as_ref()
            .and_then(|block| {
                self.load_schema(&config).ok().flatten().and_then(|schema| {
                    frontmatter::completion_items(&document, position, block, &schema)
                })
            })
            .unwrap_or_default();
        items.extend(markdown_snippet_items(&document, position));
        Ok((!items.is_empty()).then_some(CompletionResponse::Array(items)))
    }

    async fn hover(&self, params: HoverParams) -> Result<Option<Hover>> {
        let uri = &params.text_document_position_params.text_document.uri;
        let position = params.text_document_position_params.position;
        let Some(document) = self.state.document(uri).await else {
            return Ok(None);
        };
        let config = self.resolved_config().await;
        let Some(block) = frontmatter::parse_frontmatter(&document).block else {
            return Ok(None);
        };
        let Ok(Some(schema)) = self.load_schema(&config) else {
            return Ok(None);
        };
        Ok(frontmatter::hover(&block, position, &schema))
    }

    async fn document_symbol(
        &self,
        params: DocumentSymbolParams,
    ) -> Result<Option<DocumentSymbolResponse>> {
        let Some(document) = self.state.document(&params.text_document.uri).await else {
            return Ok(None);
        };
        match preview::document_symbols(document.text(), &document) {
            Ok(symbols) if !symbols.is_empty() => Ok(Some(DocumentSymbolResponse::Nested(symbols))),
            _ => Ok(None),
        }
    }

    async fn code_action(&self, params: CodeActionParams) -> Result<Option<CodeActionResponse>> {
        Ok(Some(insert_actions(&params.text_document.uri, params.range.start)))
    }

    async fn execute_command(
        &self,
        params: ExecuteCommandParams,
    ) -> Result<Option<serde_json::Value>> {
        match params.command.as_str() {
            COMMAND_INSERT_TABLE | COMMAND_INSERT_CODE_FENCE | COMMAND_INSERT_CALLOUT => {
                self.insert_template(&params.command, params.arguments).await
            }
            COMMAND_PREVIEW_HTML => self.preview_html(params.arguments).await,
            _ => Ok(None),
        }
    }
}
