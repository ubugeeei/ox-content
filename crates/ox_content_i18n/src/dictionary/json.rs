use crate::error::I18nResult;
use crate::key::KeyPath;

use super::Dictionary;

/// Loads a JSON string into a `Dictionary`, prefixing each key with `namespace.`.
///
/// The JSON must be an object with string values (possibly nested).
/// Nested objects are flattened with dot separators.
///
/// # Example
///
/// ```json
/// {
///   "greeting": "Hello {$name}",
///   "nav": {
///     "home": "Home",
///     "about": "About"
///   }
/// }
/// ```
///
/// With namespace `"common"`, produces keys:
/// - `common.greeting`
/// - `common.nav.home`
/// - `common.nav.about`
pub fn load_into(json_str: &str, namespace: &str, dict: &mut Dictionary) -> I18nResult<()> {
    let value: serde_json::Value = serde_json::from_str(json_str)?;
    if let serde_json::Value::Object(map) = value {
        flatten_object(&map, namespace, dict);
    }
    Ok(())
}

/// Parses a JSON string into a standalone `Dictionary` with the given namespace.
pub fn load(json_str: &str, namespace: &str) -> I18nResult<Dictionary> {
    let mut dict = Dictionary::new();
    load_into(json_str, namespace, &mut dict)?;
    Ok(dict)
}

fn flatten_object(
    map: &serde_json::Map<String, serde_json::Value>,
    prefix: &str,
    dict: &mut Dictionary,
) {
    for (key, value) in map {
        let full_key = format!("{prefix}.{key}");
        match value {
            serde_json::Value::String(s) => {
                dict.insert(KeyPath::new(&full_key), s.clone());
            }
            serde_json::Value::Object(nested) => {
                flatten_object(nested, &full_key, dict);
            }
            // Store non-string primitives as their JSON representation
            other => {
                dict.insert(KeyPath::new(&full_key), other.to_string());
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flat_json() {
        let json = r#"{ "greeting": "Hello {$name}", "farewell": "Goodbye" }"#;
        let dict = load(json, "common").unwrap();
        assert_eq!(dict.get("common.greeting"), Some("Hello {$name}"));
        assert_eq!(dict.get("common.farewell"), Some("Goodbye"));
    }

    #[test]
    fn nested_json() {
        let json = r#"{ "nav": { "home": "Home", "about": "About" } }"#;
        let dict = load(json, "common").unwrap();
        assert_eq!(dict.get("common.nav.home"), Some("Home"));
        assert_eq!(dict.get("common.nav.about"), Some("About"));
    }

    #[test]
    fn numeric_value() {
        let json = r#"{ "count": 42 }"#;
        let dict = load(json, "ns").unwrap();
        assert_eq!(dict.get("ns.count"), Some("42"));
    }

    #[test]
    fn empty_object() {
        let json = "{}";
        let dict = load(json, "ns").unwrap();
        assert!(dict.is_empty());
    }

    #[test]
    fn invalid_json() {
        let result = load("not json", "ns");
        assert!(result.is_err());
    }
}
