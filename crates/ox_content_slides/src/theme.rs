use std::borrow::Cow;

use crate::SlideTheme;

pub(crate) const DEFAULT_ASPECT_RATIO: &str = "16 / 9";
pub(crate) const DEFAULT_MAX_WIDTH: &str = "min(1200px, calc(100vw - 48px))";
pub(crate) const DEFAULT_MAX_HEIGHT: &str = "calc(100vh - 96px)";
pub(crate) const DEFAULT_PADDING: &str = "clamp(28px, 4vw, 56px)";
pub(crate) const DEFAULT_CANVAS_BACKGROUND: &str =
    "radial-gradient(circle at top, color-mix(in srgb, #4f6fae 14%, transparent), transparent 36%), linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%)";
pub(crate) const DEFAULT_SURFACE_BACKGROUND: &str = "rgba(255, 255, 255, 0.92)";
pub(crate) const DEFAULT_SURFACE_BORDER: &str = "rgba(79, 111, 174, 0.12)";
pub(crate) const DEFAULT_SURFACE_SHADOW: &str = "0 24px 80px rgba(19, 26, 48, 0.12)";
pub(crate) const DEFAULT_PRESENTER_SIDEBAR_BACKGROUND: &str = "rgba(255, 255, 255, 0.9)";
pub(crate) const DEFAULT_FONT_SANS: &str =
    "\"IBM Plex Sans\", \"Avenir Next\", \"Segoe UI Variable\", \"Segoe UI\", sans-serif";
pub(crate) const DEFAULT_FONT_MONO: &str =
    "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace";
pub(crate) const DEFAULT_COLOR_TEXT: &str = "#131a30";
pub(crate) const DEFAULT_COLOR_TEXT_MUTED: &str = "#4f607b";
pub(crate) const DEFAULT_COLOR_PRIMARY: &str = "#4f6fae";
pub(crate) const DEFAULT_COLOR_BORDER: &str = "#d2dbea";

#[derive(Debug, Clone)]
pub(crate) struct ResolvedSlideTheme<'a> {
    pub(crate) aspect_ratio: Cow<'a, str>,
    pub(crate) max_width: Cow<'a, str>,
    pub(crate) max_height: Cow<'a, str>,
    pub(crate) padding: Cow<'a, str>,
    pub(crate) canvas_background: Cow<'a, str>,
    pub(crate) surface_background: Cow<'a, str>,
    pub(crate) surface_border: Cow<'a, str>,
    pub(crate) surface_shadow: Cow<'a, str>,
    pub(crate) presenter_sidebar_background: Cow<'a, str>,
    pub(crate) font_sans: Cow<'a, str>,
    pub(crate) font_mono: Cow<'a, str>,
    pub(crate) color_text: Cow<'a, str>,
    pub(crate) color_text_muted: Cow<'a, str>,
    pub(crate) color_primary: Cow<'a, str>,
    pub(crate) color_border: Cow<'a, str>,
}

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

pub(crate) fn merge_theme<'a>(input: Option<&'a SlideTheme>) -> ResolvedSlideTheme<'a> {
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
