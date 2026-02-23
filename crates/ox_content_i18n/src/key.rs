use std::fmt;

use serde::{Deserialize, Serialize};

/// A dot-separated translation key path (e.g., `"common.greeting"`).
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct KeyPath(String);

impl KeyPath {
    /// Creates a new `KeyPath` from a dot-separated string.
    #[must_use]
    pub fn new(path: &str) -> Self {
        Self(path.to_string())
    }

    /// Returns the key path as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Returns an iterator over the individual segments of the key path.
    pub fn segments(&self) -> impl Iterator<Item = &str> {
        self.0.split('.')
    }

    /// Returns the namespace (first segment) of the key path.
    #[must_use]
    pub fn namespace(&self) -> &str {
        self.0.split('.').next().unwrap_or(&self.0)
    }

    /// Returns the leaf key (last segment) of the key path.
    #[must_use]
    pub fn leaf(&self) -> &str {
        self.0.rsplit('.').next().unwrap_or(&self.0)
    }

    /// Returns the depth (number of segments) of the key path.
    #[must_use]
    pub fn depth(&self) -> usize {
        self.0.split('.').count()
    }
}

impl fmt::Display for KeyPath {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl AsRef<str> for KeyPath {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl From<&str> for KeyPath {
    fn from(s: &str) -> Self {
        Self::new(s)
    }
}

impl From<String> for KeyPath {
    fn from(s: String) -> Self {
        Self(s)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn key_path_segments() {
        let key = KeyPath::new("common.greeting");
        let segments: Vec<_> = key.segments().collect();
        assert_eq!(segments, vec!["common", "greeting"]);
    }

    #[test]
    fn key_path_namespace() {
        let key = KeyPath::new("navigation.home");
        assert_eq!(key.namespace(), "navigation");
    }

    #[test]
    fn key_path_leaf() {
        let key = KeyPath::new("navigation.home");
        assert_eq!(key.leaf(), "home");
    }

    #[test]
    fn key_path_depth() {
        assert_eq!(KeyPath::new("a").depth(), 1);
        assert_eq!(KeyPath::new("a.b").depth(), 2);
        assert_eq!(KeyPath::new("a.b.c").depth(), 3);
    }

    #[test]
    fn single_segment_key() {
        let key = KeyPath::new("greeting");
        assert_eq!(key.namespace(), "greeting");
        assert_eq!(key.leaf(), "greeting");
        assert_eq!(key.depth(), 1);
    }
}
