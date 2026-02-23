use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer};

use crate::state::LspState;

pub struct Backend {
    pub client: Client,
    pub state: LspState,
}

impl Backend {
    pub fn new(client: Client) -> Self {
        Self { client, state: LspState::new() }
    }

    async fn on_change(&self, uri: &Url, text: &str) {
        if let Ok(path) = uri.to_file_path() {
            let path_str = path.to_string_lossy().to_string();

            let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");

            match ext {
                "ts" | "tsx" | "js" | "jsx" => {
                    self.state.update_file_keys(&path_str, text).await;
                }
                "json" | "yaml" | "yml" => {
                    // Dictionary file changed — reload dictionaries
                    self.state.reload_dictionaries().await;
                }
                _ => {}
            }
        }
    }
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, params: InitializeParams) -> Result<InitializeResult> {
        // Set workspace root
        if let Some(root_uri) = params.root_uri {
            if let Ok(root_path) = root_uri.to_file_path() {
                self.state.set_root(root_path).await;
            }
        }

        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::FULL,
                )),
                completion_provider: Some(CompletionOptions {
                    trigger_characters: Some(vec!["'".to_string(), "\"".to_string()]),
                    ..Default::default()
                }),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                definition_provider: Some(OneOf::Left(true)),
                inlay_hint_provider: Some(OneOf::Left(true)),
                ..Default::default()
            },
            ..Default::default()
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client.log_message(MessageType::INFO, "ox-content-i18n LSP initialized").await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        self.on_change(&params.text_document.uri, &params.text_document.text).await;
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        if let Some(change) = params.content_changes.first() {
            self.on_change(&params.text_document.uri, &change.text).await;
        }
    }

    async fn did_close(&self, params: DidCloseTextDocumentParams) {
        if let Ok(path) = params.text_document.uri.to_file_path() {
            self.state.remove_file(&path.to_string_lossy()).await;
        }
    }

    async fn completion(&self, _params: CompletionParams) -> Result<Option<CompletionResponse>> {
        let keys = self.state.all_dictionary_keys().await;

        let items: Vec<CompletionItem> = keys
            .into_iter()
            .map(|key| CompletionItem {
                label: key,
                kind: Some(CompletionItemKind::TEXT),
                detail: Some("i18n translation key".to_string()),
                ..Default::default()
            })
            .collect();

        Ok(Some(CompletionResponse::Array(items)))
    }

    async fn hover(&self, _params: HoverParams) -> Result<Option<Hover>> {
        // TODO: Extract the key at cursor position from document text,
        // then show translations for all locales
        Ok(None)
    }

    async fn goto_definition(
        &self,
        _params: GotoDefinitionParams,
    ) -> Result<Option<GotoDefinitionResponse>> {
        // TODO: Extract key at cursor, then jump to dictionary file definition
        Ok(None)
    }

    async fn inlay_hint(&self, _params: InlayHintParams) -> Result<Option<Vec<InlayHint>>> {
        // TODO: Scan document for t('key') calls and show inline translations
        Ok(None)
    }
}
