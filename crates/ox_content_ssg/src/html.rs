//! HTML page generation for SSG.

use serde::{Deserialize, Serialize};

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
}

/// CSS styles for SSG pages.
const SSG_CSS: &str = include_str!("ssg.css");

/// JavaScript for SSG pages.
const SSG_JS: &str = include_str!("ssg.js");

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
  <script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))</script>
</head>
<body>
  <header class="header">
    <button class="menu-toggle" aria-label="Toggle menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
    <a href="{base}index.html" class="header-title">
      <img src="{base}logo.svg" alt="" width="28" height="28" style="margin-right: 8px; vertical-align: middle;" />
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
      <nav>
{navigation}
      </nav>
    </aside>
    <main class="main">
      <article class="content">
{content}
      </article>
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
        css = SSG_CSS,
        navigation = nav_html,
        content = page_data.content,
        js = SSG_JS.replace("{{base}}", &config.base),
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
        };

        let html = generate_html(&page_data, &nav_groups, &config);

        assert!(html.contains("Test Page - Test Site"));
        assert!(html.contains("<h1>Hello</h1>"));
        assert!(html.contains("Guide"));
    }
}
