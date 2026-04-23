use std::borrow::Cow;

use askama::Template;
use serde::{Deserialize, Serialize};
use serde_json::{Map as JsonMap, Value as JsonValue};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ExtractedSlideComments {
    pub content: String,
    pub notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SlideSource {
    pub content: String,
    pub notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ParsedSlideDeck {
    pub frontmatter: JsonValue,
    pub slides: Vec<SlideSource>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SlideTheme {
    pub aspect_ratio: Option<String>,
    pub max_width: Option<String>,
    pub max_height: Option<String>,
    pub padding: Option<String>,
    pub canvas_background: Option<String>,
    pub surface_background: Option<String>,
    pub surface_border: Option<String>,
    pub surface_shadow: Option<String>,
    pub presenter_sidebar_background: Option<String>,
    pub font_sans: Option<String>,
    pub font_mono: Option<String>,
    pub color_text: Option<String>,
    pub color_text_muted: Option<String>,
    pub color_primary: Option<String>,
    pub color_border: Option<String>,
}

#[derive(Debug, Clone)]
struct ResolvedSlideTheme<'a> {
    aspect_ratio: Cow<'a, str>,
    max_width: Cow<'a, str>,
    max_height: Cow<'a, str>,
    padding: Cow<'a, str>,
    canvas_background: Cow<'a, str>,
    surface_background: Cow<'a, str>,
    surface_border: Cow<'a, str>,
    surface_shadow: Cow<'a, str>,
    presenter_sidebar_background: Cow<'a, str>,
    font_sans: Cow<'a, str>,
    font_mono: Cow<'a, str>,
    color_text: Cow<'a, str>,
    color_text_muted: Cow<'a, str>,
    color_primary: Cow<'a, str>,
    color_border: Cow<'a, str>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlideRenderData {
    pub deck_title: String,
    pub slide_title: String,
    pub slide_description: Option<String>,
    pub slide_content_html: String,
    pub slide_notes_html: Option<String>,
    pub slide_number: u32,
    pub slide_count: u32,
    pub home_href: String,
    pub slide_href: String,
    pub presenter_href: Option<String>,
    pub previous_href: Option<String>,
    pub next_href: Option<String>,
    pub next_slide_href: Option<String>,
}

#[derive(Template)]
#[template(path = "slide.html")]
struct SlideTemplate<'a> {
    page_title: &'a str,
    description: Option<&'a str>,
    deck_title: &'a str,
    slide_title: &'a str,
    slide_number: u32,
    slide_count: u32,
    home_href: &'a str,
    slide_content_html: &'a str,
    has_previous: bool,
    previous_href: &'a str,
    has_next: bool,
    next_href: &'a str,
    has_presenter: bool,
    presenter_href: &'a str,
    previous_href_js: String,
    next_href_js: String,
    presenter_href_js: String,
    theme: &'a ResolvedSlideTheme<'a>,
}

#[derive(Template)]
#[template(path = "presenter.html")]
struct PresenterTemplate<'a> {
    page_title: &'a str,
    deck_title: &'a str,
    slide_title: &'a str,
    slide_number: u32,
    slide_count: u32,
    slide_href: &'a str,
    has_previous: bool,
    previous_href: &'a str,
    has_next: bool,
    next_href: &'a str,
    has_notes: bool,
    notes_html: &'a str,
    has_next_preview: bool,
    next_slide_href: &'a str,
    storage_key_js: String,
    previous_href_js: String,
    next_href_js: String,
    theme: &'a ResolvedSlideTheme<'a>,
}

const DEFAULT_ASPECT_RATIO: &str = "16 / 9";
const DEFAULT_MAX_WIDTH: &str = "min(1200px, calc(100vw - 48px))";
const DEFAULT_MAX_HEIGHT: &str = "calc(100vh - 96px)";
const DEFAULT_PADDING: &str = "clamp(28px, 4vw, 56px)";
const DEFAULT_CANVAS_BACKGROUND: &str =
    "radial-gradient(circle at top, color-mix(in srgb, #4f6fae 14%, transparent), transparent 36%), linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%)";
const DEFAULT_SURFACE_BACKGROUND: &str = "rgba(255, 255, 255, 0.92)";
const DEFAULT_SURFACE_BORDER: &str = "rgba(79, 111, 174, 0.12)";
const DEFAULT_SURFACE_SHADOW: &str = "0 24px 80px rgba(19, 26, 48, 0.12)";
const DEFAULT_PRESENTER_SIDEBAR_BACKGROUND: &str = "rgba(255, 255, 255, 0.9)";
const DEFAULT_FONT_SANS: &str =
    "\"IBM Plex Sans\", \"Avenir Next\", \"Segoe UI Variable\", \"Segoe UI\", sans-serif";
const DEFAULT_FONT_MONO: &str = "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace";
const DEFAULT_COLOR_TEXT: &str = "#131a30";
const DEFAULT_COLOR_TEXT_MUTED: &str = "#4f607b";
const DEFAULT_COLOR_PRIMARY: &str = "#4f6fae";
const DEFAULT_COLOR_BORDER: &str = "#d2dbea";

fn default_theme() -> ResolvedSlideTheme<'static> {
    ResolvedSlideTheme {
        aspect_ratio: Cow::Borrowed(DEFAULT_ASPECT_RATIO),
        max_width: Cow::Borrowed(DEFAULT_MAX_WIDTH),
        max_height: Cow::Borrowed(DEFAULT_MAX_HEIGHT),
        padding: Cow::Borrowed(DEFAULT_PADDING),
        canvas_background: Cow::Borrowed(DEFAULT_CANVAS_BACKGROUND),
        surface_background: Cow::Borrowed(DEFAULT_SURFACE_BACKGROUND),
        surface_border: Cow::Borrowed(DEFAULT_SURFACE_BORDER),
        surface_shadow: Cow::Borrowed(DEFAULT_SURFACE_SHADOW),
        presenter_sidebar_background: Cow::Borrowed(DEFAULT_PRESENTER_SIDEBAR_BACKGROUND),
        font_sans: Cow::Borrowed(DEFAULT_FONT_SANS),
        font_mono: Cow::Borrowed(DEFAULT_FONT_MONO),
        color_text: Cow::Borrowed(DEFAULT_COLOR_TEXT),
        color_text_muted: Cow::Borrowed(DEFAULT_COLOR_TEXT_MUTED),
        color_primary: Cow::Borrowed(DEFAULT_COLOR_PRIMARY),
        color_border: Cow::Borrowed(DEFAULT_COLOR_BORDER),
    }
}

fn theme_value<'a>(value: Option<&'a String>, fallback: &'static str) -> Cow<'a, str> {
    value.map_or_else(|| Cow::Borrowed(fallback), |value| Cow::Borrowed(value.as_str()))
}

fn merge_theme<'a>(input: Option<&'a SlideTheme>) -> ResolvedSlideTheme<'a> {
    let Some(input) = input else {
        return default_theme();
    };

    ResolvedSlideTheme {
        aspect_ratio: theme_value(input.aspect_ratio.as_ref(), DEFAULT_ASPECT_RATIO),
        max_width: theme_value(input.max_width.as_ref(), DEFAULT_MAX_WIDTH),
        max_height: theme_value(input.max_height.as_ref(), DEFAULT_MAX_HEIGHT),
        padding: theme_value(input.padding.as_ref(), DEFAULT_PADDING),
        canvas_background: theme_value(input.canvas_background.as_ref(), DEFAULT_CANVAS_BACKGROUND),
        surface_background: theme_value(
            input.surface_background.as_ref(),
            DEFAULT_SURFACE_BACKGROUND,
        ),
        surface_border: theme_value(input.surface_border.as_ref(), DEFAULT_SURFACE_BORDER),
        surface_shadow: theme_value(input.surface_shadow.as_ref(), DEFAULT_SURFACE_SHADOW),
        presenter_sidebar_background: theme_value(
            input.presenter_sidebar_background.as_ref(),
            DEFAULT_PRESENTER_SIDEBAR_BACKGROUND,
        ),
        font_sans: theme_value(input.font_sans.as_ref(), DEFAULT_FONT_SANS),
        font_mono: theme_value(input.font_mono.as_ref(), DEFAULT_FONT_MONO),
        color_text: theme_value(input.color_text.as_ref(), DEFAULT_COLOR_TEXT),
        color_text_muted: theme_value(input.color_text_muted.as_ref(), DEFAULT_COLOR_TEXT_MUTED),
        color_primary: theme_value(input.color_primary.as_ref(), DEFAULT_COLOR_PRIMARY),
        color_border: theme_value(input.color_border.as_ref(), DEFAULT_COLOR_BORDER),
    }
}

pub fn extract_slide_comments(source: &str) -> ExtractedSlideComments {
    let mut notes = Vec::new();
    let mut content = String::with_capacity(source.len());
    let mut cursor = 0;

    while let Some(start_rel) = source[cursor..].find("<!--") {
        let start = cursor + start_rel;
        content.push_str(&source[cursor..start]);

        let comment_start = start + 4;
        if let Some(end_rel) = source[comment_start..].find("-->") {
            let end = comment_start + end_rel;
            let note = normalize_comment(&source[comment_start..end]);
            if !note.is_empty() {
                notes.push(note);
            }
            cursor = end + 3;
        } else {
            content.push_str(&source[start..]);
            cursor = source.len();
            break;
        }
    }

    if cursor < source.len() {
        content.push_str(&source[cursor..]);
    }

    ExtractedSlideComments { content, notes }
}

fn normalize_comment(input: &str) -> String {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    if let Some(stripped) = trimmed
        .strip_prefix("note:")
        .or_else(|| trimmed.strip_prefix("notes:"))
        .or_else(|| trimmed.strip_prefix("Note:"))
        .or_else(|| trimmed.strip_prefix("Notes:"))
    {
        return stripped.trim().to_string();
    }

    trimmed.to_string()
}

pub fn parse_markdown_slide_deck(source: &str, separator: &str) -> ParsedSlideDeck {
    let (content, frontmatter) = parse_frontmatter(source);
    let slides = split_slides(&content, separator)
        .into_iter()
        .map(|slide| {
            let extracted = extract_slide_comments(&slide);
            SlideSource { content: extracted.content.trim().to_string(), notes: extracted.notes }
        })
        .filter(|slide| !slide.content.is_empty())
        .collect();

    ParsedSlideDeck { frontmatter, slides }
}

fn parse_frontmatter(source: &str) -> (String, JsonValue) {
    if !source.starts_with("---") {
        return (source.to_string(), JsonValue::Object(JsonMap::new()));
    }

    let rest = &source[3..];
    let Some(end_index) = rest.find("\n---") else {
        return (source.to_string(), JsonValue::Object(JsonMap::new()));
    };

    let frontmatter_source = rest[..end_index].trim();
    let content = rest[end_index + 4..].trim_start().to_string();

    let frontmatter = serde_yaml::from_str::<serde_yaml::Value>(frontmatter_source)
        .ok()
        .and_then(|value| serde_json::to_value(value).ok())
        .unwrap_or_else(|| JsonValue::Object(JsonMap::new()));

    (content, frontmatter)
}

fn split_slides(content: &str, separator: &str) -> Vec<String> {
    let mut slides = Vec::new();
    let mut buffer = String::new();

    for line in content.lines() {
        if line.trim() == separator {
            slides.push(std::mem::take(&mut buffer));
        } else {
            if !buffer.is_empty() {
                buffer.push('\n');
            }
            buffer.push_str(line);
        }
    }

    if !buffer.is_empty() || slides.is_empty() {
        slides.push(buffer);
    }

    slides
}

fn js_string(input: &str) -> String {
    serde_json::to_string(input).unwrap_or_else(|_| "\"\"".to_string())
}

fn option_href_parts(value: Option<&String>) -> (bool, &str) {
    value.map_or((false, ""), |href| (true, href.as_str()))
}

pub fn generate_slide_html(data: &SlideRenderData, theme: Option<&SlideTheme>) -> String {
    let theme = merge_theme(theme);
    let (has_previous, previous_href) = option_href_parts(data.previous_href.as_ref());
    let (has_next, next_href) = option_href_parts(data.next_href.as_ref());
    let (has_presenter, presenter_href) = option_href_parts(data.presenter_href.as_ref());

    SlideTemplate {
        page_title: &data.slide_title,
        description: data.slide_description.as_deref(),
        deck_title: &data.deck_title,
        slide_title: &data.slide_title,
        slide_number: data.slide_number,
        slide_count: data.slide_count,
        home_href: &data.home_href,
        slide_content_html: &data.slide_content_html,
        has_previous,
        previous_href,
        has_next,
        next_href,
        has_presenter,
        presenter_href,
        previous_href_js: data
            .previous_href
            .as_deref()
            .map_or_else(|| "null".to_string(), js_string),
        next_href_js: data.next_href.as_deref().map_or_else(|| "null".to_string(), js_string),
        presenter_href_js: data
            .presenter_href
            .as_deref()
            .map_or_else(|| "null".to_string(), js_string),
        theme: &theme,
    }
    .render()
    .expect("slide template should render")
}

pub fn generate_presenter_html(data: &SlideRenderData, theme: Option<&SlideTheme>) -> String {
    let theme = merge_theme(theme);
    let (has_previous, previous_href) = option_href_parts(data.previous_href.as_ref());
    let (has_next, next_href) = option_href_parts(data.next_href.as_ref());
    let (has_next_preview, next_slide_href) = option_href_parts(data.next_slide_href.as_ref());
    let has_notes = data.slide_notes_html.is_some();
    let notes_html = data.slide_notes_html.as_deref().unwrap_or("");
    let page_title = [data.slide_title.as_str(), " Presenter"].concat();
    let storage_key = ["ox-content:slides:timer:", data.deck_title.as_str()].concat();

    PresenterTemplate {
        page_title: &page_title,
        deck_title: &data.deck_title,
        slide_title: &data.slide_title,
        slide_number: data.slide_number,
        slide_count: data.slide_count,
        slide_href: &data.slide_href,
        has_previous,
        previous_href,
        has_next,
        next_href,
        has_notes,
        notes_html,
        has_next_preview,
        next_slide_href,
        storage_key_js: js_string(&storage_key),
        previous_href_js: data
            .previous_href
            .as_deref()
            .map_or_else(|| "null".to_string(), js_string),
        next_href_js: data.next_href.as_deref().map_or_else(|| "null".to_string(), js_string),
        theme: &theme,
    }
    .render()
    .expect("presenter template should render")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_markdown_deck_frontmatter_and_splits_slides() {
        let source = r#"---
title: Deck Title
description: Demo
---

# One

<!-- notes: first note -->

---

# Two
"#;

        let result = parse_markdown_slide_deck(source, "---");
        assert_eq!(result.frontmatter["title"], JsonValue::String("Deck Title".to_string()));
        assert_eq!(result.slides.len(), 2);
        assert_eq!(result.slides[0].notes, vec!["first note".to_string()]);
        assert!(result.slides[0].content.contains("# One"));
    }

    #[test]
    fn extracts_html_comment_notes() {
        let source = "<h1>Hello</h1><!-- notes: talk track --><p>World</p>";
        let extracted = extract_slide_comments(source);
        assert_eq!(extracted.notes, vec!["talk track".to_string()]);
        assert!(!extracted.content.contains("notes:"));
    }
}
