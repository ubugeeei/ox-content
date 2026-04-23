use std::borrow::Cow;

use crate::SlideTheme;

pub const DEFAULT_ASPECT_RATIO: &str = "4 / 3";
pub const DEFAULT_MAX_WIDTH: &str = "min(1740px, calc(100vw - 8px))";
pub const DEFAULT_MAX_HEIGHT: &str = "calc(100vh - 56px)";
pub const DEFAULT_PADDING: &str = "clamp(24px, 2.2vw, 38px)";
pub const DEFAULT_SURFACE_RADIUS: &str = "4px";
pub const DEFAULT_CODE_BACKGROUND: &str = "#f5f7fa";
pub const DEFAULT_BUILTIN_ANIMATIONS: bool = true;
pub const DEFAULT_CANVAS_BACKGROUND: &str = "#edf0f4";
pub const DEFAULT_SURFACE_BACKGROUND: &str = "#ffffff";
pub const DEFAULT_SURFACE_BORDER: &str = "#cfd6df";
pub const DEFAULT_PRESENTER_SIDEBAR_BACKGROUND: &str = "#f7f8fa";
pub const DEFAULT_FONT_SANS: &str =
    "\"IBM Plex Sans\", \"Avenir Next\", \"Segoe UI Variable\", \"Segoe UI\", sans-serif";
pub const DEFAULT_FONT_MONO: &str = "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace";
pub const DEFAULT_COLOR_TEXT: &str = "#111827";
pub const DEFAULT_COLOR_TEXT_MUTED: &str = "#667085";
pub const DEFAULT_COLOR_PRIMARY: &str = "#1f4b99";
pub const DEFAULT_COLOR_BORDER: &str = "#d4d9e1";
pub const DEFAULT_DARK_CANVAS_BACKGROUND: &str = "#0e1318";
pub const DEFAULT_DARK_SURFACE_BACKGROUND: &str = "#161d24";
pub const DEFAULT_DARK_SURFACE_BORDER: &str = "#2a3440";
pub const DEFAULT_DARK_PRESENTER_SIDEBAR_BACKGROUND: &str = "#121920";
pub const DEFAULT_DARK_CODE_BACKGROUND: &str = "#0f141a";
pub const DEFAULT_DARK_COLOR_TEXT: &str = "#eef2f6";
pub const DEFAULT_DARK_COLOR_TEXT_MUTED: &str = "#9ba8b6";
pub const DEFAULT_DARK_COLOR_PRIMARY: &str = "#9bbcff";
pub const DEFAULT_DARK_COLOR_BORDER: &str = "#313d4a";

#[derive(Debug, Clone)]
pub struct ResolvedSlideTheme<'a> {
    pub aspect_ratio: Cow<'a, str>,
    pub max_width: Cow<'a, str>,
    pub max_height: Cow<'a, str>,
    pub padding: Cow<'a, str>,
    pub surface_radius: Cow<'a, str>,
    pub code_background: Cow<'a, str>,
    pub builtin_animations: bool,
    pub canvas_background: Cow<'a, str>,
    pub surface_background: Cow<'a, str>,
    pub surface_border: Cow<'a, str>,
    pub presenter_sidebar_background: Cow<'a, str>,
    pub font_sans: Cow<'a, str>,
    pub font_mono: Cow<'a, str>,
    pub color_text: Cow<'a, str>,
    pub color_text_muted: Cow<'a, str>,
    pub color_primary: Cow<'a, str>,
    pub color_border: Cow<'a, str>,
    pub dark_canvas_background: Cow<'a, str>,
    pub dark_surface_background: Cow<'a, str>,
    pub dark_surface_border: Cow<'a, str>,
    pub dark_presenter_sidebar_background: Cow<'a, str>,
    pub dark_code_background: Cow<'a, str>,
    pub dark_color_text: Cow<'a, str>,
    pub dark_color_text_muted: Cow<'a, str>,
    pub dark_color_primary: Cow<'a, str>,
    pub dark_color_border: Cow<'a, str>,
}

fn default_theme() -> ResolvedSlideTheme<'static> {
    ResolvedSlideTheme {
        aspect_ratio: Cow::Borrowed(DEFAULT_ASPECT_RATIO),
        max_width: Cow::Borrowed(DEFAULT_MAX_WIDTH),
        max_height: Cow::Borrowed(DEFAULT_MAX_HEIGHT),
        padding: Cow::Borrowed(DEFAULT_PADDING),
        surface_radius: Cow::Borrowed(DEFAULT_SURFACE_RADIUS),
        code_background: Cow::Borrowed(DEFAULT_CODE_BACKGROUND),
        builtin_animations: DEFAULT_BUILTIN_ANIMATIONS,
        canvas_background: Cow::Borrowed(DEFAULT_CANVAS_BACKGROUND),
        surface_background: Cow::Borrowed(DEFAULT_SURFACE_BACKGROUND),
        surface_border: Cow::Borrowed(DEFAULT_SURFACE_BORDER),
        presenter_sidebar_background: Cow::Borrowed(DEFAULT_PRESENTER_SIDEBAR_BACKGROUND),
        font_sans: Cow::Borrowed(DEFAULT_FONT_SANS),
        font_mono: Cow::Borrowed(DEFAULT_FONT_MONO),
        color_text: Cow::Borrowed(DEFAULT_COLOR_TEXT),
        color_text_muted: Cow::Borrowed(DEFAULT_COLOR_TEXT_MUTED),
        color_primary: Cow::Borrowed(DEFAULT_COLOR_PRIMARY),
        color_border: Cow::Borrowed(DEFAULT_COLOR_BORDER),
        dark_canvas_background: Cow::Borrowed(DEFAULT_DARK_CANVAS_BACKGROUND),
        dark_surface_background: Cow::Borrowed(DEFAULT_DARK_SURFACE_BACKGROUND),
        dark_surface_border: Cow::Borrowed(DEFAULT_DARK_SURFACE_BORDER),
        dark_presenter_sidebar_background: Cow::Borrowed(DEFAULT_DARK_PRESENTER_SIDEBAR_BACKGROUND),
        dark_code_background: Cow::Borrowed(DEFAULT_DARK_CODE_BACKGROUND),
        dark_color_text: Cow::Borrowed(DEFAULT_DARK_COLOR_TEXT),
        dark_color_text_muted: Cow::Borrowed(DEFAULT_DARK_COLOR_TEXT_MUTED),
        dark_color_primary: Cow::Borrowed(DEFAULT_DARK_COLOR_PRIMARY),
        dark_color_border: Cow::Borrowed(DEFAULT_DARK_COLOR_BORDER),
    }
}

fn theme_value<'a>(value: Option<&'a String>, fallback: &'static str) -> Cow<'a, str> {
    value.map_or_else(|| Cow::Borrowed(fallback), |value| Cow::Borrowed(value.as_str()))
}

pub fn merge_theme<'a>(input: Option<&'a SlideTheme>) -> ResolvedSlideTheme<'a> {
    let Some(input) = input else {
        return default_theme();
    };

    ResolvedSlideTheme {
        aspect_ratio: theme_value(input.aspect_ratio.as_ref(), DEFAULT_ASPECT_RATIO),
        max_width: theme_value(input.max_width.as_ref(), DEFAULT_MAX_WIDTH),
        max_height: theme_value(input.max_height.as_ref(), DEFAULT_MAX_HEIGHT),
        padding: theme_value(input.padding.as_ref(), DEFAULT_PADDING),
        surface_radius: theme_value(input.surface_radius.as_ref(), DEFAULT_SURFACE_RADIUS),
        code_background: theme_value(input.code_background.as_ref(), DEFAULT_CODE_BACKGROUND),
        builtin_animations: input.builtin_animations.unwrap_or(DEFAULT_BUILTIN_ANIMATIONS),
        canvas_background: theme_value(input.canvas_background.as_ref(), DEFAULT_CANVAS_BACKGROUND),
        surface_background: theme_value(
            input.surface_background.as_ref(),
            DEFAULT_SURFACE_BACKGROUND,
        ),
        surface_border: theme_value(input.surface_border.as_ref(), DEFAULT_SURFACE_BORDER),
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
        dark_canvas_background: theme_value(
            input.dark_canvas_background.as_ref(),
            DEFAULT_DARK_CANVAS_BACKGROUND,
        ),
        dark_surface_background: theme_value(
            input.dark_surface_background.as_ref(),
            DEFAULT_DARK_SURFACE_BACKGROUND,
        ),
        dark_surface_border: theme_value(
            input.dark_surface_border.as_ref(),
            DEFAULT_DARK_SURFACE_BORDER,
        ),
        dark_presenter_sidebar_background: theme_value(
            input.dark_presenter_sidebar_background.as_ref(),
            DEFAULT_DARK_PRESENTER_SIDEBAR_BACKGROUND,
        ),
        dark_code_background: theme_value(
            input.dark_code_background.as_ref(),
            DEFAULT_DARK_CODE_BACKGROUND,
        ),
        dark_color_text: theme_value(input.dark_color_text.as_ref(), DEFAULT_DARK_COLOR_TEXT),
        dark_color_text_muted: theme_value(
            input.dark_color_text_muted.as_ref(),
            DEFAULT_DARK_COLOR_TEXT_MUTED,
        ),
        dark_color_primary: theme_value(
            input.dark_color_primary.as_ref(),
            DEFAULT_DARK_COLOR_PRIMARY,
        ),
        dark_color_border: theme_value(input.dark_color_border.as_ref(), DEFAULT_DARK_COLOR_BORDER),
    }
}
