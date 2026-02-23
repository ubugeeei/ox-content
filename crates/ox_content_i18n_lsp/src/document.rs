use ox_content_i18n_checker::key_collector::KeyUsage;
use tower_lsp::lsp_types::Position;

/// Finds the translation key at the given cursor position.
///
/// Matches if the cursor's line (0-based) and character (0-based) fall within
/// a `KeyUsage` range (which uses 1-based line/column).
pub fn key_at_position(usages: &[KeyUsage], position: Position) -> Option<String> {
    let cursor_line = position.line + 1; // LSP is 0-based, KeyUsage is 1-based
    let cursor_col = position.character + 1;

    for usage in usages {
        if usage.line == cursor_line && cursor_col >= usage.column && cursor_col <= usage.end_column
        {
            return Some(usage.key.clone());
        }
    }
    None
}

/// Finds the line number (0-based) where a key is defined in a dictionary file.
///
/// Searches for patterns like `"key":` (JSON) or `key:` (YAML).
pub fn find_key_line_in_file(file_path: &str, key: &str) -> Option<u32> {
    let content = std::fs::read_to_string(file_path).ok()?;

    // For nested keys like "common.greeting", search for the leaf key
    let leaf_key = key.rsplit('.').next().unwrap_or(key);

    for (i, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        // JSON: "key": ...
        if trimmed.starts_with(&format!("\"{leaf_key}\"")) {
            return Some(i as u32);
        }
        // YAML: key: ...
        if trimmed.starts_with(&format!("{leaf_key}:")) {
            return Some(i as u32);
        }
    }
    None
}
