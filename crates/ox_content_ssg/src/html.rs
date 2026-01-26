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

/// Social links configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SocialLinks {
    /// GitHub URL.
    pub github: Option<String>,
    /// Twitter/X URL.
    pub twitter: Option<String>,
    /// Discord URL.
    pub discord: Option<String>,
}

/// Embedded HTML content for specific positions in the page layout.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeEmbed {
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
    /// Social links configuration.
    pub social_links: Option<SocialLinks>,
    /// Embedded HTML content at specific positions.
    pub embed: Option<ThemeEmbed>,
    /// Additional custom CSS.
    pub css: Option<String>,
    /// Additional custom JavaScript.
    pub js: Option<String>,
}

// =============================================================================
// Entry Page Types
// =============================================================================

/// Hero action button.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct HeroAction {
    /// Button theme: "brand" or "alt".
    pub theme: Option<String>,
    /// Button text.
    pub text: String,
    /// Link URL.
    pub link: String,
}

/// Hero image configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct HeroImage {
    /// Image source URL.
    pub src: String,
    /// Alt text.
    pub alt: Option<String>,
    /// Image width.
    pub width: Option<u32>,
    /// Image height.
    pub height: Option<u32>,
}

/// Hero section configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct HeroConfig {
    /// Main title (large, gradient text).
    pub name: Option<String>,
    /// Secondary text.
    pub text: Option<String>,
    /// Tagline.
    pub tagline: Option<String>,
    /// Hero image.
    pub image: Option<HeroImage>,
    /// Action buttons.
    pub actions: Option<Vec<HeroAction>>,
}

/// Feature card configuration.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FeatureConfig {
    /// Icon - supports: "mdi:icon-name" (Iconify), image URL, or emoji.
    pub icon: Option<String>,
    /// Feature title.
    pub title: String,
    /// Feature description.
    pub details: Option<String>,
    /// Optional link.
    pub link: Option<String>,
    /// Link text.
    pub link_text: Option<String>,
}

/// Entry page configuration (for landing pages with hero and features).
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EntryPageConfig {
    /// Hero section.
    pub hero: Option<HeroConfig>,
    /// Feature cards.
    pub features: Option<Vec<FeatureConfig>>,
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
    /// Entry page configuration (if layout: entry).
    pub entry_page: Option<EntryPageConfig>,
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

/// CSS styles for Entry pages (hero, features).
const ENTRY_CSS: &str = include_str!("entry.css");

/// CSS styles for Tabs plugin.
const TABS_CSS: &str = include_str!("plugins/tabs.css");

/// CSS styles for YouTube plugin.
const YOUTUBE_CSS: &str = include_str!("plugins/youtube.css");

/// CSS styles for GitHub plugin.
const GITHUB_CSS: &str = include_str!("plugins/github.css");

/// CSS styles for OGP plugin.
const OGP_CSS: &str = include_str!("plugins/ogp.css");

/// CSS styles for Mermaid plugin.
const MERMAID_CSS: &str = include_str!("plugins/mermaid.css");

/// CSS styles for Island plugin.
const ISLAND_CSS: &str = include_str!("plugins/island.css");

/// JavaScript for SSG pages.
const SSG_JS: &str = include_str!("ssg.js");

/// Generates CSS variable overrides for theme colors.
fn generate_theme_css(theme: &ThemeConfig) -> String {
    let mut css = String::new();

    // Light mode colors
    if let Some(ref colors) = theme.colors {
        let mut vars = Vec::new();
        if let Some(ref v) = colors.primary {
            vars.push(format!("--octc-color-primary: {v};"));
        }
        if let Some(ref v) = colors.primary_hover {
            vars.push(format!("--octc-color-primary-hover: {v};"));
        }
        if let Some(ref v) = colors.background {
            vars.push(format!("--octc-color-bg: {v};"));
        }
        if let Some(ref v) = colors.background_alt {
            vars.push(format!("--octc-color-bg-alt: {v};"));
        }
        if let Some(ref v) = colors.text {
            vars.push(format!("--octc-color-text: {v};"));
        }
        if let Some(ref v) = colors.text_muted {
            vars.push(format!("--octc-color-text-muted: {v};"));
        }
        if let Some(ref v) = colors.border {
            vars.push(format!("--octc-color-border: {v};"));
        }
        if let Some(ref v) = colors.code_background {
            vars.push(format!("--octc-color-code-bg: {v};"));
        }
        if let Some(ref v) = colors.code_text {
            vars.push(format!("--octc-color-code-text: {v};"));
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
            vars.push(format!("--octc-color-primary: {v};"));
        }
        if let Some(ref v) = colors.primary_hover {
            vars.push(format!("--octc-color-primary-hover: {v};"));
        }
        if let Some(ref v) = colors.background {
            vars.push(format!("--octc-color-bg: {v};"));
        }
        if let Some(ref v) = colors.background_alt {
            vars.push(format!("--octc-color-bg-alt: {v};"));
        }
        if let Some(ref v) = colors.text {
            vars.push(format!("--octc-color-text: {v};"));
        }
        if let Some(ref v) = colors.text_muted {
            vars.push(format!("--octc-color-text-muted: {v};"));
        }
        if let Some(ref v) = colors.border {
            vars.push(format!("--octc-color-border: {v};"));
        }
        if let Some(ref v) = colors.code_background {
            vars.push(format!("--octc-color-code-bg: {v};"));
        }
        if let Some(ref v) = colors.code_text {
            vars.push(format!("--octc-color-code-text: {v};"));
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
            vars.push(format!("--octc-sidebar-width: {v};"));
        }
        if let Some(ref v) = layout.header_height {
            vars.push(format!("--octc-header-height: {v};"));
        }
        if let Some(ref v) = layout.max_content_width {
            vars.push(format!("--octc-max-content-width: {v};"));
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
            vars.push(format!("--octc-font-sans: {v};"));
        }
        if let Some(ref v) = fonts.mono {
            vars.push(format!("--octc-font-mono: {v};"));
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

/// Generates the Entry page HTML (hero section and features).
fn generate_entry_html(entry: &EntryPageConfig, base: &str) -> String {
    let mut html = String::new();

    // Hero section
    if let Some(ref hero) = entry.hero {
        html.push_str("<section class=\"hero\">\n");
        html.push_str("  <div class=\"hero-content\">\n");

        // Badge (optional)
        // html.push_str("    <span class=\"hero-badge\">Documentation</span>\n");

        // Name (large gradient title)
        if let Some(ref name) = hero.name {
            html.push_str(&format!("    <h1 class=\"hero-name\">{}</h1>\n", html_escape(name)));
        }

        // Text (secondary heading)
        if let Some(ref text) = hero.text {
            html.push_str(&format!("    <p class=\"hero-text\">{}</p>\n", html_escape(text)));
        }

        // Tagline
        if let Some(ref tagline) = hero.tagline {
            html.push_str(&format!("    <p class=\"hero-tagline\">{}</p>\n", html_escape(tagline)));
        }

        // Hero image
        if let Some(ref image) = hero.image {
            let src = if image.src.starts_with("http://")
                || image.src.starts_with("https://")
                || image.src.starts_with('/')
            {
                image.src.clone()
            } else {
                format!("{}{}", base, image.src)
            };
            let alt = image.alt.as_deref().unwrap_or("");
            let width_attr = image.width.map(|w| format!(" width=\"{w}\"")).unwrap_or_default();
            let height_attr = image.height.map(|h| format!(" height=\"{h}\"")).unwrap_or_default();
            html.push_str(&format!(
                "    <div class=\"hero-image\">\n      <img src=\"{}\" alt=\"{}\"{}{} />\n    </div>\n",
                src, html_escape(alt), width_attr, height_attr
            ));
        }

        // Action buttons
        if let Some(ref actions) = hero.actions {
            if !actions.is_empty() {
                html.push_str("    <div class=\"hero-actions\">\n");
                for action in actions {
                    let theme_class = match action.theme.as_deref() {
                        Some("brand") | None => "hero-action-brand",
                        Some("alt") => "hero-action-alt",
                        _ => "hero-action-brand",
                    };
                    let href = if action.link.starts_with("http://")
                        || action.link.starts_with("https://")
                        || action.link.starts_with('/')
                    {
                        action.link.clone()
                    } else {
                        format!("{}{}", base, action.link)
                    };
                    html.push_str(&format!(
                        "      <a href=\"{}\" class=\"hero-action {}\">{}</a>\n",
                        href,
                        theme_class,
                        html_escape(&action.text)
                    ));
                }
                html.push_str("    </div>\n");
            }
        }

        html.push_str("  </div>\n");
        html.push_str("</section>\n");
    }

    // Features section
    if let Some(ref features) = entry.features {
        if !features.is_empty() {
            html.push_str("<section class=\"features\">\n");
            html.push_str("  <div class=\"features-grid\">\n");

            for feature in features {
                let has_link = feature.link.is_some();
                let tag = if has_link { "a" } else { "div" };
                let href_attr = feature
                    .link
                    .as_ref()
                    .map(|link| {
                        let href = if link.starts_with("http://")
                            || link.starts_with("https://")
                            || link.starts_with('/')
                        {
                            link.clone()
                        } else {
                            format!("{base}{link}")
                        };
                        format!(" href=\"{href}\"")
                    })
                    .unwrap_or_default();

                html.push_str(&format!("    <{tag} class=\"feature-card\"{href_attr}>\n"));

                // Icon
                if let Some(ref icon) = feature.icon {
                    let icon_html = render_icon(icon, base);
                    html.push_str(&format!(
                        "      <div class=\"feature-icon\">{icon_html}</div>\n"
                    ));
                }

                // Body (title + details)
                html.push_str("      <div class=\"feature-body\">\n");

                // Title
                html.push_str(&format!(
                    "        <h3 class=\"feature-title\">{}</h3>\n",
                    html_escape(&feature.title)
                ));

                // Details
                if let Some(ref details) = feature.details {
                    html.push_str(&format!(
                        "        <p class=\"feature-details\">{}</p>\n",
                        html_escape(details)
                    ));
                }

                html.push_str("      </div>\n");

                // Link arrow
                if has_link {
                    html.push_str("      <span class=\"feature-link\"></span>\n");
                }

                html.push_str(&format!("    </{tag}>\n"));
            }

            html.push_str("  </div>\n");
            html.push_str("</section>\n");
        }
    }

    html
}

/// Footer CSS styles (added when footer is used).
const FOOTER_CSS: &str = r"
.site-footer {
  margin-top: 3rem;
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--octc-color-border);
  text-align: center;
  color: var(--octc-color-text-muted);
  font-size: 0.875rem;
}
.site-footer p {
  margin: 0.25rem 0;
}
.site-footer a {
  color: var(--octc-color-primary);
}
.site-footer a:hover {
  color: var(--octc-color-primary-hover);
}
";

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
    let embed = theme.and_then(|t| t.embed.as_ref());

    // Generate theme CSS overrides
    let theme_css = theme.map_or(String::new(), generate_theme_css);

    // Check if we have a footer
    let has_footer = theme.is_some_and(|t| {
        t.footer.as_ref().is_some_and(|f| f.message.is_some() || f.copyright.is_some())
    });
    let footer_css = if has_footer { FOOTER_CSS } else { "" };

    // Check if this is an entry page
    let is_entry_page = page_data.entry_page.is_some();
    let entry_css = if is_entry_page { ENTRY_CSS } else { "" };

    // Combine all CSS (including plugins)
    let plugins_css = format!("{TABS_CSS}{YOUTUBE_CSS}{GITHUB_CSS}{OGP_CSS}{MERMAID_CSS}{ISLAND_CSS}");
    let all_css = format!("{SSG_CSS}{entry_css}{plugins_css}{footer_css}{theme_css}");

    // Embedded HTML for specific positions
    let embed_head = embed.and_then(|e| e.head.as_deref()).unwrap_or("");
    let embed_header_before = embed.and_then(|e| e.header_before.as_deref()).unwrap_or("");
    let embed_header_after = embed.and_then(|e| e.header_after.as_deref()).unwrap_or("");
    let embed_sidebar_before = embed.and_then(|e| e.sidebar_before.as_deref()).unwrap_or("");
    let embed_sidebar_after = embed.and_then(|e| e.sidebar_after.as_deref()).unwrap_or("");
    let embed_content_before = embed.and_then(|e| e.content_before.as_deref()).unwrap_or("");
    let embed_content_after = embed.and_then(|e| e.content_after.as_deref()).unwrap_or("");
    let embed_footer_before = embed.and_then(|e| e.footer_before.as_deref()).unwrap_or("");

    // Footer HTML
    let footer_html = if let Some(embed_footer) = embed.and_then(|e| e.footer.clone()) {
        embed_footer
    } else if let Some(t) = theme {
        generate_footer_html(t)
    } else {
        String::new()
    };

    // Header logo customization
    let header_config = theme.and_then(|t| t.header.as_ref());
    let logo_url = header_config
        .and_then(|h| h.logo.as_ref())
        .map_or_else(|| "logo.svg", std::string::String::as_str);
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
    let all_js = format!("{}\n{}", SSG_JS.replace("{{base}}", &config.base), custom_js);

    // Social links
    let social_links_html = theme
        .and_then(|t| t.social_links.as_ref())
        .map_or(String::new(), generate_social_links_html);

    // Mobile footer social links
    let mobile_social_links_html = theme
        .and_then(|t| t.social_links.as_ref())
        .map_or(String::new(), generate_mobile_social_links_html);

    // Generate entry page content if applicable
    let (page_class, main_content) = if let Some(ref entry) = page_data.entry_page {
        let entry_html = generate_entry_html(entry, &config.base);
        // Entry page: hero/features + optional markdown content
        let combined = if page_data.content.trim().is_empty() {
            entry_html
        } else {
            format!(
                "{}\n<div class=\"entry-content\">\n  <div class=\"content\">\n{}\n  </div>\n</div>",
                entry_html, page_data.content
            )
        };
        ("entry-page", combined)
    } else {
        ("", format!("<article class=\"content\">\n{}\n      </article>", page_data.content))
    };

    let body_class =
        if page_class.is_empty() { String::new() } else { format!(" class=\"{page_class}\"") };

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
  {embed_head}
  <script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))</script>
</head>
<body{body_class}>
{embed_header_before}
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
{social_links}      <button class="search-button" aria-label="Search">
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
{embed_header_after}
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
{embed_sidebar_before}
      <nav>
{navigation}
      </nav>
{embed_sidebar_after}
    </aside>
    <main class="main">
{embed_content_before}
{main_content}
{embed_content_after}
{embed_footer_before}
{footer_html}
    </main>
  </div>
  <footer class="mobile-footer">
    <button class="mobile-footer-btn" aria-label="Menu" data-mobile-menu>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
      <span class="mobile-footer-label">Menu</span>
    </button>
    <button class="mobile-footer-btn" aria-label="Search" data-mobile-search>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <span class="mobile-footer-label">Search</span>
    </button>
{mobile_social_links}    <button class="mobile-footer-btn" aria-label="Theme" data-mobile-theme>
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <span class="mobile-footer-label">Theme</span>
    </button>
  </footer>
  <script>{js}</script>
</body>
</html>"#,
        title = html_escape(&page_data.title),
        site_name = html_escape(&config.site_name),
        base = &config.base,
        description_meta = description_meta,
        og_image_meta = og_image_meta,
        css = all_css,
        embed_head = embed_head,
        body_class = body_class,
        embed_header_before = embed_header_before,
        embed_header_after = embed_header_after,
        logo_src = logo_src,
        logo_width = logo_width,
        logo_height = logo_height,
        embed_sidebar_before = embed_sidebar_before,
        navigation = nav_html,
        embed_sidebar_after = embed_sidebar_after,
        embed_content_before = embed_content_before,
        main_content = main_content,
        embed_content_after = embed_content_after,
        embed_footer_before = embed_footer_before,
        footer_html = footer_html,
        social_links = social_links_html,
        mobile_social_links = mobile_social_links_html,
        js = all_js,
    )
}

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

/// Renders an icon based on its format.
///
/// Supported formats:
/// - `mdi:icon-name` - Material Design Icons via Iconify CDN
/// - `lucide:icon-name` - Lucide icons via Iconify CDN
/// - `{prefix}:{name}` - Any Iconify icon set
/// - URL (http://, https://) - Direct image URL
/// - Path ending with .svg, .png - Local image path
/// - Other - Treated as emoji/text
fn render_icon(icon: &str, base: &str) -> String {
    // Check for Iconify format (prefix:name)
    if let Some((prefix, name)) = icon.split_once(':') {
        // Validate it looks like an icon reference (not a URL scheme)
        if !prefix.contains('/') && !name.starts_with("//") {
            // Convert to Iconify CDN URL
            let iconify_url = format!("https://api.iconify.design/{prefix}/{name}.svg");
            // Use span with mask-image for color control
            return format!(
                "<span class=\"iconify-icon\" style=\"-webkit-mask-image: url('{iconify_url}'); mask-image: url('{iconify_url}')\"></span>"
            );
        }
    }

    // Check if it's an image URL
    if icon.starts_with("http://") || icon.starts_with("https://") {
        return format!("<img src=\"{icon}\" alt=\"\" />");
    }

    // Check if it's a local image path
    if icon.ends_with(".svg") || icon.ends_with(".png") {
        let icon_src =
            if icon.starts_with('/') { icon.to_string() } else { format!("{base}{icon}") };
        return format!("<img src=\"{icon_src}\" alt=\"\" />");
    }

    // Treat as emoji/text
    icon.to_string()
}

fn generate_social_links_html(links: &SocialLinks) -> String {
    let mut html = String::new();

    if let Some(github) = &links.github {
        html.push_str(&format!(
            r#"      <a href="{github}" class="social-link" aria-label="GitHub" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
"#
        ));
    }

    if let Some(twitter) = &links.twitter {
        html.push_str(&format!(
            r#"      <a href="{twitter}" class="social-link" aria-label="Twitter" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
"#
        ));
    }

    if let Some(discord) = &links.discord {
        html.push_str(&format!(
            r#"      <a href="{discord}" class="social-link" aria-label="Discord" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
        </svg>
      </a>
"#
        ));
    }

    html
}

fn generate_mobile_social_links_html(links: &SocialLinks) -> String {
    let mut html = String::new();

    if let Some(github) = &links.github {
        html.push_str(&format!(
            r#"    <a href="{github}" class="mobile-footer-btn" aria-label="GitHub" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <span class="mobile-footer-label">GitHub</span>
    </a>
"#
        ));
    }

    if let Some(twitter) = &links.twitter {
        html.push_str(&format!(
            r#"    <a href="{twitter}" class="mobile-footer-btn" aria-label="Twitter" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      <span class="mobile-footer-label">Twitter</span>
    </a>
"#
        ));
    }

    if let Some(discord) = &links.discord {
        html.push_str(&format!(
            r#"    <a href="{discord}" class="mobile-footer-btn" aria-label="Discord" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
      </svg>
      <span class="mobile-footer-label">Discord</span>
    </a>
"#
        ));
    }

    html
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
            entry_page: None,
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
            entry_page: None,
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
        assert!(html.contains("--octc-color-primary: #3498db;"));
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

        assert!(css.contains("--octc-color-primary: #ff0000;"));
        assert!(css.contains("--octc-color-bg: #ffffff;"));
        assert!(css.contains("[data-theme=\"dark\"]"));
        assert!(css.contains("--octc-sidebar-width: 300px;"));
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
