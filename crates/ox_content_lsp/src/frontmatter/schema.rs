use std::fs;
use std::path::Path;

use crate::frontmatter::FrontmatterSchema;

pub fn load_schema(path: &Path) -> Result<FrontmatterSchema, String> {
    let content = fs::read_to_string(path)
        .map_err(|error| format!("Failed to read schema {path:?}: {error}"))?;
    let extension = path.extension().and_then(|value| value.to_str()).unwrap_or_default();

    if matches!(extension, "yaml" | "yml") {
        serde_yaml::from_str::<FrontmatterSchema>(&content)
            .map_err(|error| format!("Failed to parse schema {path:?}: {error}"))
    } else {
        serde_json::from_str::<FrontmatterSchema>(&content)
            .map_err(|error| format!("Failed to parse schema {path:?}: {error}"))
    }
}
