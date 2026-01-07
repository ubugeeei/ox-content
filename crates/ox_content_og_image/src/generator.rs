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

        // Truncate and escape text
        let title = truncate_text(&data.title, 50);
        let title = escape_xml(&title);
        let description = data
            .description
            .as_ref()
            .map(|d| truncate_text(d, 120))
            .map(|d| escape_xml(&d))
            .unwrap_or_default();
        let site_name =
            data.site_name.as_ref().map_or_else(|| "Ox Content".to_string(), |s| escape_xml(s));

        // Generate description lines (wrap at ~60 chars)
        let desc_lines = wrap_text(&description, 60);
        let desc_svg = desc_lines.iter().enumerate().fold(String::new(), |mut acc, (i, line)| {
            use std::fmt::Write;
            let dy = if i == 0 { "0" } else { "1.4em" };
            let _ = write!(acc, r#"<tspan x="80" dy="{dy}">{line}</tspan>"#);
            acc
        });

        format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{bg}"/>
      <stop offset="100%" style="stop-color:#2d2d4a"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#b7410e"/>
      <stop offset="100%" style="stop-color:#e67e4d"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)"/>

  <!-- Accent bar -->
  <rect x="0" y="0" width="8" height="100%" fill="url(#accentGrad)"/>

  <!-- Logo circle -->
  <circle cx="120" cy="120" r="50" fill="url(#accentGrad)" opacity="0.9"/>
  <text x="120" y="135" text-anchor="middle" fill="{text_color}" font-size="40" font-weight="bold" font-family="system-ui, sans-serif">Ox</text>

  <!-- Site name -->
  <text x="190" y="125" fill="{text_color}" font-size="24" font-family="system-ui, sans-serif" opacity="0.7">{site_name}</text>

  <!-- Title -->
  <text x="80" y="280" fill="{text_color}" font-size="56" font-weight="bold" font-family="system-ui, sans-serif">{title}</text>

  <!-- Description -->
  <text x="80" y="380" fill="{text_color}" font-size="28" font-family="system-ui, sans-serif" opacity="0.8">{desc_svg}</text>

  <!-- Bottom decoration -->
  <rect x="80" y="540" width="200" height="4" rx="2" fill="url(#accentGrad)" opacity="0.6"/>
</svg>"#
        )
    }
}

/// Truncates text to a maximum length, adding ellipsis if needed.
fn truncate_text(text: &str, max_len: usize) -> String {
    if text.chars().count() <= max_len {
        text.to_string()
    } else {
        let truncated: String = text.chars().take(max_len - 3).collect();
        format!("{truncated}...")
    }
}

/// Wraps text into lines of approximately max_chars length.
fn wrap_text(text: &str, max_chars: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current_line = String::new();

    for word in text.split_whitespace() {
        if current_line.is_empty() {
            current_line = word.to_string();
        } else if current_line.len() + 1 + word.len() <= max_chars {
            current_line.push(' ');
            current_line.push_str(word);
        } else {
            lines.push(current_line);
            current_line = word.to_string();
        }
    }

    if !current_line.is_empty() {
        lines.push(current_line);
    }

    // Limit to 2 lines
    if lines.len() > 2 {
        lines.truncate(2);
        if let Some(last) = lines.last_mut() {
            if last.len() > 3 {
                last.truncate(last.len() - 3);
                last.push_str("...");
            }
        }
    }

    lines
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
