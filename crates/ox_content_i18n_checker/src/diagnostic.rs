use ox_content_i18n::checker::Diagnostic;
use serde::Serialize;

/// Serializable diagnostic for structured output.
#[derive(Debug, Serialize)]
pub struct SerializableDiagnostic {
    pub severity: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locale: Option<String>,
}

impl From<&Diagnostic> for SerializableDiagnostic {
    fn from(d: &Diagnostic) -> Self {
        Self {
            severity: match d.severity {
                ox_content_i18n::checker::Severity::Error => "error".to_string(),
                ox_content_i18n::checker::Severity::Warning => "warning".to_string(),
                ox_content_i18n::checker::Severity::Info => "info".to_string(),
            },
            message: d.message.clone(),
            key: d.key.clone(),
            locale: d.locale.clone(),
        }
    }
}

/// Output format for diagnostics.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OutputFormat {
    Text,
    Json,
}

/// Formats diagnostics to a string.
pub fn format_diagnostics(diagnostics: &[Diagnostic], format: OutputFormat) -> String {
    match format {
        OutputFormat::Text => {
            diagnostics.iter().map(std::string::ToString::to_string).collect::<Vec<_>>().join("\n")
        }
        OutputFormat::Json => {
            let serializable: Vec<SerializableDiagnostic> =
                diagnostics.iter().map(SerializableDiagnostic::from).collect();
            serde_json::to_string_pretty(&serializable).unwrap_or_default()
        }
    }
}
