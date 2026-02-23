use thiserror::Error;

pub type I18nResult<T> = Result<T, I18nError>;

#[derive(Debug, Error)]
pub enum I18nError {
    #[error("MF2 parse error at offset {offset}: {message}")]
    Mf2Parse { offset: usize, message: String },

    #[error("MF2 validation error: {message}")]
    Mf2Validation { message: String },

    #[error("dictionary load error for locale '{locale}': {message}")]
    DictionaryLoad { locale: String, message: String },

    #[error("missing translation key '{key}' in locale '{locale}'")]
    MissingKey { key: String, locale: String },

    #[error("invalid locale '{locale}': {message}")]
    InvalidLocale { locale: String, message: String },

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON parse error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("YAML parse error: {0}")]
    Yaml(#[from] serde_yaml::Error),
}
