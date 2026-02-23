use std::fmt;

use serde::{Deserialize, Serialize};

use crate::error::{I18nError, I18nResult};

/// BCP 47 locale identifier.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Locale(String);

impl Locale {
    /// Creates a new `Locale` from a BCP 47 tag string, validating its basic structure.
    ///
    /// Accepts formats like `en`, `en-US`, `zh-Hans-CN`, etc.
    pub fn new(tag: &str) -> I18nResult<Self> {
        let tag = tag.trim();
        if tag.is_empty() {
            return Err(I18nError::InvalidLocale {
                locale: tag.to_string(),
                message: "locale tag must not be empty".to_string(),
            });
        }

        // Basic BCP 47 validation: alphanumeric subtags separated by hyphens
        for subtag in tag.split('-') {
            if subtag.is_empty() {
                return Err(I18nError::InvalidLocale {
                    locale: tag.to_string(),
                    message: "empty subtag".to_string(),
                });
            }
            if !subtag.chars().all(|c| c.is_ascii_alphanumeric()) {
                return Err(I18nError::InvalidLocale {
                    locale: tag.to_string(),
                    message: format!("invalid characters in subtag '{subtag}'"),
                });
            }
        }

        Ok(Self(tag.to_string()))
    }

    /// Returns the language subtag (the part before the first hyphen).
    #[must_use]
    pub fn language(&self) -> &str {
        self.0.split('-').next().unwrap_or(&self.0)
    }

    /// Returns the full BCP 47 tag as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Locale {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl AsRef<str> for Locale {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_locales() {
        assert!(Locale::new("en").is_ok());
        assert!(Locale::new("en-US").is_ok());
        assert!(Locale::new("zh-Hans-CN").is_ok());
        assert!(Locale::new("ja").is_ok());
    }

    #[test]
    fn invalid_locales() {
        assert!(Locale::new("").is_err());
        assert!(Locale::new("-").is_err());
        assert!(Locale::new("en-").is_err());
        assert!(Locale::new("en--US").is_err());
        assert!(Locale::new("en US").is_err());
    }

    #[test]
    fn language_subtag() {
        let locale = Locale::new("en-US").unwrap();
        assert_eq!(locale.language(), "en");

        let locale = Locale::new("ja").unwrap();
        assert_eq!(locale.language(), "ja");
    }
}
