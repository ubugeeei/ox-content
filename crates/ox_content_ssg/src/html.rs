//! HTML page generation for SSG.

use serde::{Deserialize, Serialize};

// =============================================================================
// Theme Configuration Types
// =============================================================================

/// Theme color configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeColors {
    /// Primary accent color.
    pub primary: Option<String>,
    /// Primary color on hover.
    pub primary_hover: Option<String>,
    /// Background color.
    pub background: Option<String>,
    /// Alternative background color.
    pub background_alt: Option<String>,
    /// Main text color.
    pub text: Option<String>,
    /// Muted text color.
    pub text_muted: Option<String>,
    /// Border color.
    pub border: Option<String>,
    /// Code block background color.
    pub code_background: Option<String>,
    /// Code block text color.
    pub code_text: Option<String>,
}

/// Theme layout configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeLayout {
    /// Sidebar width (CSS value).
    pub sidebar_width: Option<String>,
    /// Header height (CSS value).
    pub header_height: Option<String>,
    /// Maximum content width (CSS value).
    pub max_content_width: Option<String>,
}

/// Theme font configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeFonts {
    /// Sans-serif font stack.
    pub sans: Option<String>,
    /// Monospace font stack.
    pub mono: Option<String>,
}

/// Theme header configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeHeader {
    /// Logo image URL.
    pub logo: Option<String>,
    /// Logo width in pixels.
    pub logo_width: Option<u32>,
    /// Logo height in pixels.
    pub logo_height: Option<u32>,
}

/// Theme footer configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeFooter {
    /// Footer message (supports HTML).
    pub message: Option<String>,
    /// Copyright text (supports HTML).
    pub copyright: Option<String>,
}

/// Theme slots for injecting custom HTML.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeSlots {
    /// Content to inject into <head>.
    pub head: Option<String>,
    /// Content before header.
    pub header_before: Option<String>,
    /// Content after header.
    pub header_after: Option<String>,
    /// Content before sidebar navigation.
    pub sidebar_before: Option<String>,
    /// Content after sidebar navigation.
    pub sidebar_after: Option<String>,
    /// Content before main content.
    pub content_before: Option<String>,
    /// Content after main content.
    pub content_after: Option<String>,
    /// Content before footer.
    pub footer_before: Option<String>,
    /// Custom footer content (replaces default footer).
    pub footer: Option<String>,
}

/// Complete theme configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeConfig {
    /// Light mode colors.
    pub colors: Option<ThemeColors>,
    /// Dark mode colors.
    pub dark_colors: Option<ThemeColors>,
    /// Font configuration.
    pub fonts: Option<ThemeFonts>,
    /// Layout configuration.
    pub layout: Option<ThemeLayout>,
    /// Header configuration.
    pub header: Option<ThemeHeader>,
    /// Footer configuration.
    pub footer: Option<ThemeFooter>,
    /// Custom slots for HTML injection.
    pub slots: Option<ThemeSlots>,
    /// Additional custom CSS.
    pub css: Option<String>,
    /// Additional custom JavaScript.
    pub js: Option<String>,
}

// =============================================================================
// Navigation and Page Types
// =============================================================================

/// Navigation item for SSG.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavItem {
    /// Display title.
    pub title: String,
    /// URL path.
    pub path: String,
    /// Full href.
    pub href: String,
}

/// Navigation group for SSG.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavGroup {
    /// Group title.
    pub title: String,
    /// Navigation items.
    pub items: Vec<NavItem>,
}

/// Table of contents entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TocEntry {
    /// Heading depth (1-6).
    pub depth: u8,
    /// Heading text.
    pub text: String,
    /// URL-friendly slug.
    pub slug: String,
}

/// Page data for SSG.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageData {
    /// Page title.
    pub title: String,
    /// Page description.
    pub description: Option<String>,
    /// Page content HTML.
    pub content: String,
    /// Table of contents entries.
    pub toc: Vec<TocEntry>,
    /// URL path.
    pub path: String,
}

/// SSG configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SsgConfig {
    /// Site name.
    pub site_name: String,
    /// Base URL path.
    pub base: String,
    /// OG image URL.
    pub og_image: Option<String>,
    /// Theme configuration.
    pub theme: Option<ThemeConfig>,
}

/// CSS styles for SSG pages.
const SSG_CSS: &str = include_str!("ssg.css");

/// JavaScript for SSG pages.
const SSG_JS: &str = include_str!("ssg.js");

/// Generates CSS variable overrides for theme colors.
fn generate_theme_css(theme: &ThemeConfig) -> String {
    let mut css = String::new();

    // Light mode colors
    if let Some(ref colors) = theme.colors {
        let mut vars = Vec::new();
        if let Some(ref v) = colors.primary {
            vars.push(format!("--color-primary: {v};"));
        }
        if let Some(ref v) = colors.primary_hover {
            vars.push(format!("--color-primary-hover: {v};"));
        }
        if let Some(ref v) = colors.background {
            vars.push(format!("--color-bg: {v};"));
        }
        if let Some(ref v) = colors.background_alt {
            vars.push(format!("--color-bg-alt: {v};"));
        }
        if let Some(ref v) = colors.text {
            vars.push(format!("--color-text: {v};"));
        }
        if let Some(ref v) = colors.text_muted {
            vars.push(format!("--color-text-muted: {v};"));
        }
        if let Some(ref v) = colors.border {
            vars.push(format!("--color-border: {v};"));
        }
        if let Some(ref v) = colors.code_background {
            vars.push(format!("--color-code-bg: {v};"));
        }
        if let Some(ref v) = colors.code_text {
            vars.push(format!("--color-code-text: {v};"));
        }
        if !vars.is_empty() {
            css.push_str(":root {\n  ");
            css.push_str(&vars.join("\n  "));
            css.push_str("\n}\n");
        }
    }

    // Dark mode colors
    if let Some(ref colors) = theme.dark_colors {
        let mut vars = Vec::new();
        if let Some(ref v) = colors.primary {
            vars.push(format!("--color-primary: {v};"));
        }
        if let Some(ref v) = colors.primary_hover {
            vars.push(format!("--color-primary-hover: {v};"));
        }
        if let Some(ref v) = colors.background {
            vars.push(format!("--color-bg: {v};"));
        }
        if let Some(ref v) = colors.background_alt {
            vars.push(format!("--color-bg-alt: {v};"));
        }
        if let Some(ref v) = colors.text {
            vars.push(format!("--color-text: {v};"));
        }
        if let Some(ref v) = colors.text_muted {
            vars.push(format!("--color-text-muted: {v};"));
        }
        if let Some(ref v) = colors.border {
            vars.push(format!("--color-border: {v};"));
        }
        if let Some(ref v) = colors.code_background {
            vars.push(format!("--color-code-bg: {v};"));
        }
        if let Some(ref v) = colors.code_text {
            vars.push(format!("--color-code-text: {v};"));
        }
        if !vars.is_empty() {
            css.push_str("[data-theme=\"dark\"] {\n  ");
            css.push_str(&vars.join("\n  "));
            css.push_str("\n}\n");
            css.push_str("@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) {\n    ");
            css.push_str(&vars.join("\n    "));
            css.push_str("\n  }\n}\n");
        }
    }

    // Layout overrides
    if let Some(ref layout) = theme.layout {
        let mut vars = Vec::new();
        if let Some(ref v) = layout.sidebar_width {
            vars.push(format!("--sidebar-width: {v};"));
        }
        if let Some(ref v) = layout.header_height {
            vars.push(format!("--header-height: {v};"));
        }
        if let Some(ref v) = layout.max_content_width {
            vars.push(format!("--max-content-width: {v};"));
        }
        if !vars.is_empty() {
            css.push_str(":root {\n  ");
            css.push_str(&vars.join("\n  "));
            css.push_str("\n}\n");
        }
    }

    // Font overrides
    if let Some(ref fonts) = theme.fonts {
        let mut vars = Vec::new();
        if let Some(ref v) = fonts.sans {
            vars.push(format!("--font-sans: {v};"));
        }
        if let Some(ref v) = fonts.mono {
            vars.push(format!("--font-mono: {v};"));
        }
        if !vars.is_empty() {
            css.push_str(":root {\n  ");
            css.push_str(&vars.join("\n  "));
            css.push_str("\n}\n");
        }
    }

    // Custom CSS
    if let Some(ref custom_css) = theme.css {
        css.push_str(custom_css);
    }

    css
}

/// Generates footer HTML from theme configuration.
fn generate_footer_html(theme: &ThemeConfig) -> String {
    let footer = match &theme.footer {
        Some(f) if f.message.is_some() || f.copyright.is_some() => f,
        _ => return String::new(),
    };

    let mut html = String::from("<footer class=\"site-footer\">\n");

    if let Some(ref message) = footer.message {
        html.push_str(&format!("  <p class=\"footer-message\">{message}</p>\n"));
    }

    if let Some(ref copyright) = footer.copyright {
        html.push_str(&format!("  <p class=\"footer-copyright\">{copyright}</p>\n"));
    }

    html.push_str("</footer>");
    html
}

/// Footer CSS styles (added when footer is used).
const FOOTER_CSS: &str = r#"
.site-footer {
  margin-top: 3rem;
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
.site-footer p {
  margin: 0.25rem 0;
}
.site-footer a {
  color: var(--color-primary);
}
.site-footer a:hover {
  color: var(--color-primary-hover);
}
"#;

/// Generates a complete HTML page for SSG.
///
/// This function creates a full HTML document with navigation sidebar,
/// content area, table of contents, search functionality, and theme toggle.
pub fn generate_html(page_data: &PageData, nav_groups: &[NavGroup], config: &SsgConfig) -> String {
    let nav_html = generate_nav_html(nav_groups, &page_data.path);

    let description_meta = page_data.description.as_ref().map_or(String::new(), |d| {
        format!(
            r#"<meta name="description" content="{}">
  <meta property="og:description" content="{}">
  <meta name="twitter:description" content="{}">"#,
            html_escape(d),
            html_escape(d),
            html_escape(d)
        )
    });

    let og_image_meta = config.og_image.as_ref().map_or(String::new(), |img| {
        format!(
            r#"<meta property="og:image" content="{img}">
  <meta name="twitter:image" content="{img}">"#
        )
    });

    // Theme configuration
    let theme = config.theme.as_ref();
    let slots = theme.and_then(|t| t.slots.as_ref());

    // Generate theme CSS overrides
    let theme_css = theme.map_or(String::new(), generate_theme_css);

    // Check if we have a footer
    let has_footer =
        theme.is_some_and(|t| t.footer.as_ref().is_some_and(|f| f.message.is_some() || f.copyright.is_some()));
    let footer_css = if has_footer { FOOTER_CSS } else { "" };

    // Combine all CSS
    let all_css = format!("{}{}{}", SSG_CSS, footer_css, theme_css);

    // Slots
    let head_slot = slots.and_then(|s| s.head.as_deref()).unwrap_or("");
    let header_before_slot = slots.and_then(|s| s.header_before.as_deref()).unwrap_or("");
    let header_after_slot = slots.and_then(|s| s.header_after.as_deref()).unwrap_or("");
    let sidebar_before_slot = slots.and_then(|s| s.sidebar_before.as_deref()).unwrap_or("");
    let sidebar_after_slot = slots.and_then(|s| s.sidebar_after.as_deref()).unwrap_or("");
    let content_before_slot = slots.and_then(|s| s.content_before.as_deref()).unwrap_or("");
    let content_after_slot = slots.and_then(|s| s.content_after.as_deref()).unwrap_or("");
    let footer_before_slot = slots.and_then(|s| s.footer_before.as_deref()).unwrap_or("");

    // Footer HTML
    let footer_html = if let Some(custom_footer) = slots.and_then(|s| s.footer.clone()) {
        custom_footer
    } else if let Some(t) = theme {
        generate_footer_html(t)
    } else {
        String::new()
    };

    // Header logo customization
    let header_config = theme.and_then(|t| t.header.as_ref());
    let logo_url = header_config
        .and_then(|h| h.logo.as_ref())
        .map(|l| l.as_str())
        .unwrap_or_else(|| "logo.svg");
    let logo_width = header_config.and_then(|h| h.logo_width).unwrap_or(28);
    let logo_height = header_config.and_then(|h| h.logo_height).unwrap_or(28);

    // Build logo src (prepend base if not absolute URL)
    let logo_src = if logo_url.starts_with("http://")
        || logo_url.starts_with("https://")
        || logo_url.starts_with('/')
    {
        logo_url.to_string()
    } else {
        format!("{}{}", config.base, logo_url)
    };

    // Custom JS
    let custom_js = theme.and_then(|t| t.js.as_deref()).unwrap_or("");
    let all_js = format!(
        "{}\n{}",
        SSG_JS.replace("{{base}}", &config.base),
        custom_js
    );

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - {site_name}</title>
  {description_meta}
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title} - {site_name}">
  {og_image_meta}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} - {site_name}">
  <style>{css}</style>
  {head_slot}
  <script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))</script>
</head>
<body>
{header_before_slot}
  <header class="header">
    <button class="menu-toggle" aria-label="Toggle menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
    <a href="{base}index.html" class="header-title">
      <img src="{logo_src}" alt="" width="{logo_width}" height="{logo_height}" style="margin-right: 8px; vertical-align: middle;" />
      {site_name}
    </a>
    <div class="header-actions">
      <button class="search-button" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      <button class="theme-toggle" aria-label="Toggle theme">
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </header>
{header_after_slot}
  <div class="search-modal-overlay">
    <div class="search-modal">
      <div class="search-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input type="text" class="search-input" placeholder="Search documentation..." />
        <button class="search-close">Esc</button>
      </div>
      <div class="search-results"></div>
      <div class="search-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
        <span><kbd>Enter</kbd> to select</span>
        <span><kbd>Esc</kbd> to close</span>
      </div>
    </div>
  </div>
  <div class="overlay"></div>
  <div class="layout">
    <aside class="sidebar">
{sidebar_before_slot}
      <nav>
{navigation}
      </nav>
{sidebar_after_slot}
    </aside>
    <main class="main">
{content_before_slot}
      <article class="content">
{content}
      </article>
{content_after_slot}
{footer_before_slot}
{footer_html}
    </main>
  </div>
  <script>{js}</script>
</body>
</html>"#,
        title = html_escape(&page_data.title),
        site_name = html_escape(&config.site_name),
        base = &config.base,
        description_meta = description_meta,
        og_image_meta = og_image_meta,
        css = all_css,
        head_slot = head_slot,
        header_before_slot = header_before_slot,
        header_after_slot = header_after_slot,
        logo_src = logo_src,
        logo_width = logo_width,
        logo_height = logo_height,
        sidebar_before_slot = sidebar_before_slot,
        navigation = nav_html,
        sidebar_after_slot = sidebar_after_slot,
        content_before_slot = content_before_slot,
        content = page_data.content,
        content_after_slot = content_after_slot,
        footer_before_slot = footer_before_slot,
        footer_html = footer_html,
        js = all_js,
    )
}

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

fn generate_nav_html(nav_groups: &[NavGroup], current_path: &str) -> String {
    nav_groups
        .iter()
        .map(|group| {
            let items = group
                .items
                .iter()
                .map(|item| {
                    let active = if item.path == current_path { " active" } else { "" };
                    format!(
                        r#"              <li class="nav-item"><a href="{}" class="nav-link{}">{}</a></li>"#,
                        item.href, active, html_escape(&item.title)
                    )
                })
                .collect::<Vec<_>>()
                .join("\n");

            format!(
                r#"          <div class="nav-section">
            <div class="nav-title">{}</div>
            <ul class="nav-list">
{}
            </ul>
          </div>"#,
                html_escape(&group.title),
                items
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_html_escape() {
        assert_eq!(html_escape("<script>"), "&lt;script&gt;");
        assert_eq!(html_escape("a & b"), "a &amp; b");
        assert_eq!(html_escape("\"quoted\""), "&quot;quoted&quot;");
    }

    #[test]
    fn test_generate_html() {
        let page_data = PageData {
            title: "Test Page".to_string(),
            description: Some("Test description".to_string()),
            content: "<h1>Hello</h1>".to_string(),
            toc: vec![TocEntry { depth: 1, text: "Hello".to_string(), slug: "hello".to_string() }],
            path: "test".to_string(),
        };

        let nav_groups = vec![NavGroup {
            title: "Guide".to_string(),
            items: vec![NavItem {
                title: "Test Page".to_string(),
                path: "test".to_string(),
                href: "/docs/test/index.html".to_string(),
            }],
        }];

        let config = SsgConfig {
            site_name: "Test Site".to_string(),
            base: "/docs/".to_string(),
            og_image: None,
            theme: None,
        };

        let html = generate_html(&page_data, &nav_groups, &config);

        assert!(html.contains("Test Page - Test Site"));
        assert!(html.contains("<h1>Hello</h1>"));
        assert!(html.contains("Guide"));
    }

    #[test]
    fn test_generate_html_with_theme() {
        let page_data = PageData {
            title: "Themed Page".to_string(),
            description: None,
            content: "<p>Content</p>".to_string(),
            toc: vec![],
            path: "themed".to_string(),
        };

        let nav_groups = vec![];

        let config = SsgConfig {
            site_name: "Themed Site".to_string(),
            base: "/".to_string(),
            og_image: None,
            theme: Some(ThemeConfig {
                colors: Some(ThemeColors {
                    primary: Some("#3498db".to_string()),
                    ..Default::default()
                }),
                footer: Some(ThemeFooter {
                    message: Some("Built with ox-content".to_string()),
                    copyright: Some("2025 Test".to_string()),
                }),
                ..Default::default()
            }),
        };

        let html = generate_html(&page_data, &nav_groups, &config);

        // Check theme CSS is applied
        assert!(html.contains("--color-primary: #3498db;"));
        // Check footer is present
        assert!(html.contains("Built with ox-content"));
        assert!(html.contains("2025 Test"));
    }

    #[test]
    fn test_generate_theme_css() {
        let theme = ThemeConfig {
            colors: Some(ThemeColors {
                primary: Some("#ff0000".to_string()),
                background: Some("#ffffff".to_string()),
                ..Default::default()
            }),
            dark_colors: Some(ThemeColors {
                primary: Some("#ff6666".to_string()),
                ..Default::default()
            }),
            layout: Some(ThemeLayout {
                sidebar_width: Some("300px".to_string()),
                ..Default::default()
            }),
            ..Default::default()
        };

        let css = generate_theme_css(&theme);

        assert!(css.contains("--color-primary: #ff0000;"));
        assert!(css.contains("--color-bg: #ffffff;"));
        assert!(css.contains("[data-theme=\"dark\"]"));
        assert!(css.contains("--sidebar-width: 300px;"));
    }

    #[test]
    fn test_generate_footer_html() {
        let theme = ThemeConfig {
            footer: Some(ThemeFooter {
                message: Some("Footer message".to_string()),
                copyright: Some("Copyright info".to_string()),
            }),
            ..Default::default()
        };

        let html = generate_footer_html(&theme);

        assert!(html.contains("site-footer"));
        assert!(html.contains("Footer message"));
        assert!(html.contains("Copyright info"));
    }
}
