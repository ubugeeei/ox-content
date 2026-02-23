use crate::error::I18nResult;
use crate::key::KeyPath;

use super::Dictionary;

/// Loads a YAML string into a `Dictionary`, prefixing each key with `namespace.`.
///
/// Nested mappings are flattened with dot separators, same as JSON loading.
pub fn load_into(yaml_str: &str, namespace: &str, dict: &mut Dictionary) -> I18nResult<()> {
    let value: serde_yaml::Value = serde_yaml::from_str(yaml_str)?;
    if let serde_yaml::Value::Mapping(map) = value {
        flatten_mapping(&map, namespace, dict);
    }
    Ok(())
}

/// Parses a YAML string into a standalone `Dictionary` with the given namespace.
pub fn load(yaml_str: &str, namespace: &str) -> I18nResult<Dictionary> {
    let mut dict = Dictionary::new();
    load_into(yaml_str, namespace, &mut dict)?;
    Ok(dict)
}

fn flatten_mapping(map: &serde_yaml::Mapping, prefix: &str, dict: &mut Dictionary) {
    for (key, value) in map {
        let key_str = match key {
            serde_yaml::Value::String(s) => s.clone(),
            other => format!("{other:?}"),
        };
        let full_key = format!("{prefix}.{key_str}");

        match value {
            serde_yaml::Value::String(s) => {
                dict.insert(KeyPath::new(&full_key), s.clone());
            }
            serde_yaml::Value::Mapping(nested) => {
                flatten_mapping(nested, &full_key, dict);
            }
            serde_yaml::Value::Number(n) => {
                dict.insert(KeyPath::new(&full_key), n.to_string());
            }
            serde_yaml::Value::Bool(b) => {
                dict.insert(KeyPath::new(&full_key), b.to_string());
            }
            serde_yaml::Value::Null => {
                dict.insert(KeyPath::new(&full_key), String::new());
            }
            _ => {
                // Sequences and tagged values: store as debug representation
                dict.insert(KeyPath::new(&full_key), format!("{value:?}"));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flat_yaml() {
        let yaml = "greeting: Hello {$name}\nfarewell: Goodbye\n";
        let dict = load(yaml, "common").unwrap();
        assert_eq!(dict.get("common.greeting"), Some("Hello {$name}"));
        assert_eq!(dict.get("common.farewell"), Some("Goodbye"));
    }

    #[test]
    fn nested_yaml() {
        let yaml = "nav:\n  home: Home\n  about: About\n";
        let dict = load(yaml, "common").unwrap();
        assert_eq!(dict.get("common.nav.home"), Some("Home"));
        assert_eq!(dict.get("common.nav.about"), Some("About"));
    }

    #[test]
    fn empty_yaml() {
        let yaml = "{}";
        let dict = load(yaml, "ns").unwrap();
        assert!(dict.is_empty());
    }

    #[test]
    fn invalid_yaml() {
        let result = load(":\n  :\n    :", "ns");
        // serde_yaml may or may not error on weird YAML; just ensure no panic
        let _ = result;
    }
}
