#[path = "support/edge.rs"]
mod edge_support;

use edge_support::render;
use ox_content_parser::ParserOptions;
use ox_content_renderer::HtmlRendererOptions;
#[test]
fn external_links_get_security_attributes() {
    let html = render(
        "[site](https://example.com)",
        ParserOptions::default(),
        HtmlRendererOptions::default(),
    );

    insta::assert_snapshot!(html);
}

#[test]
fn parsed_links_can_skip_target_blank_security_attributes() {
    let html = render(
        "[site](https://example.com)",
        ParserOptions::default(),
        HtmlRendererOptions { link_target_blank: false, ..Default::default() },
    );

    assert_eq!(html, "<p><a href=\"https://example.com\">site</a></p>\n");
}

#[test]
fn link_target_blank_does_not_disable_renderer_autolink_attributes() {
    let html = render(
        "Visit https://example.com",
        ParserOptions::default(),
        HtmlRendererOptions { link_target_blank: false, ..Default::default() },
    );

    assert!(
        html.contains(
            "<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">"
        ),
        "{html}"
    );
}

#[test]
fn relative_links_do_not_get_external_attributes() {
    let html =
        render("[guide](./guide.md)", ParserOptions::default(), HtmlRendererOptions::default());

    insta::assert_snapshot!(html);
}

#[test]
fn base_prefixes_root_absolute_markdown_links() {
    let html = render(
        "[Guide](/guide) [Dir](/guide/) [Markdown](/api.md#types)",
        ParserOptions::default(),
        HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/docs/".to_string(),
            ..Default::default()
        },
    );

    insta::assert_snapshot!(html);
}

#[test]
fn base_prefixes_root_absolute_markdown_images() {
    let html = render(
        "![logo](/img/logo.png)",
        ParserOptions::default(),
        HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/docs/".to_string(),
            ..Default::default()
        },
    );

    assert_eq!(html, "<p><img src=\"/docs/img/logo.png\" alt=\"logo\"></p>\n");
}

#[test]
fn base_prefixes_root_absolute_raw_html_attrs() {
    let html = render(
        "<div>\n<a href=\"/guide\">Guide</a>\n<img src='/img/logo.png'>\n<script src=\"//cdn.example/app.js\"></script>\n</div>",
        ParserOptions::default(),
        HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/docs/".to_string(),
            ..Default::default()
        },
    );

    insta::assert_snapshot!(html);
}

#[test]
fn nested_parentheses_in_links_are_preserved_in_output() {
    let html = render(
        "[docs](https://example.com/a(b)c)",
        ParserOptions::default(),
        HtmlRendererOptions::default(),
    );
    insta::assert_snapshot!(html);
}

#[test]
fn xhtml_images_self_close() {
    let html = render(
        "![logo](/logo.svg)",
        ParserOptions::default(),
        HtmlRendererOptions { xhtml: true, ..Default::default() },
    );

    insta::assert_snapshot!(html);
}

#[test]
fn script_and_smart_punctuation_extensions_render_when_enabled() {
    let html = render(
        "\"Smart\" H~2~O x^2^",
        ParserOptions {
            smart_punctuation: true,
            subscript: true,
            superscript: true,
            ..ParserOptions::default()
        },
        HtmlRendererOptions::default(),
    );

    assert_eq!(html, "<p>“Smart” H<sub>2</sub>O x<sup>2</sup></p>\n");
}

#[test]
fn smart_punctuation_delimiters_stay_outside_gfm_autolink_rendering() {
    let parser_options =
        ParserOptions { autolinks: true, smart_punctuation: true, ..ParserOptions::default() };
    let renderer_options = HtmlRendererOptions { link_target_blank: false, ..Default::default() };

    for (source, expected) in [
        (
            r#"The URL "https://example.com" is valid."#,
            "<p>The URL “<a href=\"https://example.com\">https://example.com</a>” is valid.</p>\n",
        ),
        (
            "The URL 'https://example.com' is valid.",
            "<p>The URL ‘<a href=\"https://example.com\">https://example.com</a>’ is valid.</p>\n",
        ),
        (
            "See https://example.com...",
            "<p>See <a href=\"https://example.com\">https://example.com</a>…</p>\n",
        ),
    ] {
        let html = render(source, parser_options.clone(), renderer_options.clone());

        assert_eq!(html, expected, "source: {source}");
    }
}

#[test]
fn markdown_urls_on_another_origin_are_left_alone() {
    // A `.md` on another origin is not a page this build generates, so there
    // is no `index.html` route to rewrite it to. It must stay verbatim — and
    // stay recognizable as external, so it still gets the security attributes.
    let html = render(
        concat!(
            "[abs](https://ex.com/docs/guide.md)\n\n",
            "[proto](//cdn.example/docs/x.md)\n\n",
            "[mail](mailto:a@b.com/x.md)\n\n",
            "[upper](https://ex.com/docs/GUIDE.MD)\n\n",
            "![alt](https://ex.com/d/g.md)\n\n",
            "<a href=\"https://ex.com/docs/guide.md\">raw</a>\n",
        ),
        ParserOptions::default(),
        HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "content/blog/post.md".to_string(),
            ..Default::default()
        },
    );

    insta::assert_snapshot!(html);
}

#[test]
fn local_markdown_urls_convert_around_query_and_fragment() {
    // The extension lives in the path, not in the query string, so a local
    // link still routes to its generated page and carries its suffix along.
    let html = render(
        "[q](./other.md?tab=2) [both](./other.md?tab=2#anchor) [frag](./other.md#anchor)",
        ParserOptions::default(),
        HtmlRendererOptions {
            convert_md_links: true,
            base_url: "/".to_string(),
            source_path: "api/index.md".to_string(),
            ..Default::default()
        },
    );

    insta::assert_snapshot!(html);
}
