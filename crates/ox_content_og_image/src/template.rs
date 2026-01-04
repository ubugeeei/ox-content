//! OG image templates.

use serde::{Deserialize, Serialize};

/// Data for generating an OG image.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OgImageData {
    /// Page title.
    pub title: String,
    /// Page description.
    pub description: Option<String>,
    /// Site name.
    pub site_name: Option<String>,
    /// Author name.
    pub author: Option<String>,
    /// Date string.
    pub date: Option<String>,
    /// Tags/categories.
    pub tags: Vec<String>,
}

/// OG image template.
#[derive(Debug, Clone)]
pub struct OgImageTemplate {
    /// Template name.
    pub name: String,
    /// Template layout.
    pub layout: TemplateLayout,
}

impl OgImageTemplate {
    /// Creates a new template with the default layout.
    #[must_use]
    pub fn new(name: &str) -> Self {
        Self { name: name.to_string(), layout: TemplateLayout::default() }
    }

    /// Creates a template with a centered layout.
    #[must_use]
    pub fn centered(name: &str) -> Self {
        Self { name: name.to_string(), layout: TemplateLayout::Centered }
    }

    /// Creates a template with a split layout.
    #[must_use]
    pub fn split(name: &str) -> Self {
        Self { name: name.to_string(), layout: TemplateLayout::Split }
    }
}

impl Default for OgImageTemplate {
    fn default() -> Self {
        Self::new("default")
    }
}

/// Template layout types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum TemplateLayout {
    /// Default layout with title and description.
    #[default]
    Default,
    /// Centered title layout.
    Centered,
    /// Split layout with image on one side.
    Split,
    /// Minimal layout with just title.
    Minimal,
    /// Card-style layout.
    Card,
}
