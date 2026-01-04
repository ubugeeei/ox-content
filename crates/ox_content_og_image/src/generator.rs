//! OG image generator.

use crate::config::OgImageConfig;
use crate::template::{OgImageData, OgImageTemplate};
use thiserror::Error;

/// Result type for OG image operations.
pub type OgImageResult<T> = Result<T, OgImageError>;

/// Errors that can occur during OG image generation.
#[derive(Debug, Error)]
pub enum OgImageError {
    /// IO error.
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    /// Font loading error.
    #[error("Failed to load font: {0}")]
    FontLoad(String),

    /// Image encoding error.
    #[error("Failed to encode image: {0}")]
    Encode(String),

    /// Invalid configuration.
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
}

/// OG image generator.
pub struct OgImageGenerator {
    config: OgImageConfig,
    template: OgImageTemplate,
}

impl OgImageGenerator {
    /// Creates a new generator with the given configuration.
    #[must_use]
    pub fn new(config: OgImageConfig) -> Self {
        Self { config, template: OgImageTemplate::default() }
    }

    /// Creates a new generator with custom config and template.
    #[must_use]
    pub fn with_template(config: OgImageConfig, template: OgImageTemplate) -> Self {
        Self { config, template }
    }

    /// Returns the current configuration.
    #[must_use]
    pub fn config(&self) -> &OgImageConfig {
        &self.config
    }

    /// Returns the current template.
    #[must_use]
    pub fn template(&self) -> &OgImageTemplate {
        &self.template
    }

    /// Generates an OG image for the given data.
    ///
    /// Returns the image as a byte vector.
    pub fn generate(&self, data: &OgImageData) -> OgImageResult<Vec<u8>> {
        // TODO: Implement actual image generation using an image library
        // For now, return a placeholder
        let _ = data;
        Err(OgImageError::Encode("Image generation not yet implemented".to_string()))
    }

    /// Generates an OG image and saves it to a file.
    pub fn generate_to_file(
        &self,
        data: &OgImageData,
        output_path: &std::path::Path,
    ) -> OgImageResult<()> {
        let bytes = self.generate(data)?;
        std::fs::write(output_path, bytes)?;
        Ok(())
    }

    /// Generates an SVG representation of the OG image.
    ///
    /// This can be useful for debugging or for rendering in web contexts.
    #[must_use]
    pub fn generate_svg(&self, data: &OgImageData) -> String {
        let width = self.config.width;
        let height = self.config.height;
        let bg = &self.config.background_color;
        let text_color = &self.config.text_color;
        let title_size = self.config.title_font_size;
        let desc_size = self.config.description_font_size;

        let title = escape_xml(&data.title);
        let description = data.description.as_ref().map(|d| escape_xml(d)).unwrap_or_default();

        format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="100%" height="100%" fill="{bg}"/>
  <text x="60" y="{title_y}" fill="{text_color}" font-size="{title_size}" font-weight="bold">
    {title}
  </text>
  <text x="60" y="{desc_y}" fill="{text_color}" font-size="{desc_size}" opacity="0.8">
    {description}
  </text>
</svg>"#,
            title_y = height / 2 - 30,
            desc_y = height / 2 + 40,
        )
    }
}

impl Default for OgImageGenerator {
    fn default() -> Self {
        Self::new(OgImageConfig::default())
    }
}

/// Escapes special XML characters.
fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_svg() {
        let generator = OgImageGenerator::default();
        let data = OgImageData {
            title: "Test Title".to_string(),
            description: Some("Test description".to_string()),
            site_name: None,
            author: None,
            date: None,
            tags: vec![],
        };

        let svg = generator.generate_svg(&data);
        assert!(svg.contains("Test Title"));
        assert!(svg.contains("Test description"));
    }
}
