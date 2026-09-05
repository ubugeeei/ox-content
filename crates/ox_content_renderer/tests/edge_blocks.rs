#[path = "support/edge.rs"]
mod edge_support;

use edge_support::render;
use ox_content_parser::ParserOptions;
use ox_content_renderer::HtmlRendererOptions;
#[test]
fn ordered_lists_preserve_start_attribute() {
    let html =
        render("3. third\n4. fourth", ParserOptions::default(), HtmlRendererOptions::default());
    insta::assert_snapshot!(html);
}

#[test]
fn task_list_without_feature_renders_literal_text() {
    let html = render("- [x] done", ParserOptions::default(), HtmlRendererOptions::default());
    insta::assert_snapshot!(html);
}

#[test]
fn aligned_tables_render_align_attributes() {
    let html = render(
        "| a | b | c |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |",
        ParserOptions::gfm(),
        HtmlRendererOptions::default(),
    );

    insta::assert_snapshot!(html);
}

#[test]
fn code_block_meta_does_not_leak_into_class_name() {
    let html = render(
        "```ts file=main.ts\nconsole.log(1)\n```",
        ParserOptions::default(),
        HtmlRendererOptions::default(),
    );

    insta::assert_snapshot!(html);
}

#[test]
fn fenced_code_inside_list_item_renders_as_block_code() {
    let html = render(
        "1. text\n\n   ```ts\n   const a = 1;\n   ```",
        ParserOptions::default(),
        HtmlRendererOptions::default(),
    );

    insta::assert_snapshot!(html);
}

#[test]
fn hard_breaks_render_inside_paragraphs() {
    let html = render("line 1\\\nline 2", ParserOptions::default(), HtmlRendererOptions::default());
    assert_eq!(html, "<p>line 1<br>\nline 2</p>\n");
}

#[test]
fn inline_raw_html_renders_without_extra_newline() {
    let html = render(
        "- <input type=\"checkbox\"> task",
        ParserOptions::default(),
        HtmlRendererOptions::default(),
    );

    assert_eq!(html, "<ul>\n<li><input type=\"checkbox\"> task</li>\n</ul>\n");
}

#[test]
fn html_type6_details_allows_markdown_after_blank_line() {
    let html = render(
        "<details>\n\n<summary>Click to expand</summary>\n\n**bold should be markdown**\n\n- list\n\n```js\nconsole.log(\"code\");\n```\n\n</details>",
        ParserOptions::default(),
        HtmlRendererOptions::default(),
    );

    insta::assert_snapshot!(html);
}

#[test]
fn source_span_attributes_are_opt_in_for_block_elements() {
    let source = concat!(
        "# Title\n\n",
        "Text.\n\n",
        "- one\n",
        "- two\n\n",
        "| a | b |\n",
        "| - | - |\n",
        "| c | d |\n\n",
        "> quote\n",
    );

    let without_spans = render(source, ParserOptions::gfm(), HtmlRendererOptions::default());
    assert!(!without_spans.contains("data-source-span="), "{without_spans}");

    let html = render(
        source,
        ParserOptions::gfm(),
        HtmlRendererOptions { source_spans: true, ..Default::default() },
    );

    assert!(html.contains("<h1 id=\"title\" data-source-span=\"0-8\">Title</h1>"), "{html}");
    assert!(html.contains("<p data-source-span=\"9-15\">Text.</p>"), "{html}");
    assert!(html.contains("<ul data-source-span="), "{html}");
    assert!(html.contains("<li data-source-span="), "{html}");
    assert!(html.contains("<table data-source-span="), "{html}");
    assert!(html.contains("<tr data-source-span="), "{html}");
    assert!(html.contains("<td data-source-span="), "{html}");
    assert!(html.contains("<blockquote data-source-span="), "{html}");
}

#[test]
fn source_span_attributes_do_not_mutate_raw_html_blocks() {
    let html = render(
        "<div>\nraw\n</div>\n",
        ParserOptions::default(),
        HtmlRendererOptions { source_spans: true, ..Default::default() },
    );

    assert_eq!(html, "<div>\nraw\n</div>\n");
    assert!(!html.contains("data-source-span="), "{html}");
}

#[test]
fn math_nodes_render_transform_compatible_markup() {
    let html = render(
        "Energy: $E=mc^2$\n\n$$\na + b\n$$\n",
        ParserOptions { math: true, ..ParserOptions::default() },
        HtmlRendererOptions::default(),
    );

    assert_eq!(
        html,
        concat!(
            "<p>Energy: <span class=\"ox-math ox-math-inline\" data-ox-tex=\"E=mc^2\"><math><mtext>E=mc^2</mtext></math></span></p>\n",
            "<div class=\"ox-math ox-math-block\" data-ox-tex=\"&#10;a + b&#10;\"><math display=\"block\"><mtext>\na + b\n</mtext></math></div>\n",
        )
    );
}

#[test]
fn definition_lists_render_native_dl_nodes() {
    let html = render(
        "HTTP\n: Hypertext **Transfer** Protocol\n\nTCP\n: Transmission\n    - reliable\n",
        ParserOptions { definition_lists: true, ..ParserOptions::default() },
        HtmlRendererOptions::default(),
    );

    assert_eq!(
        html,
        concat!(
            "<dl class=\"ox-definition-list\">\n",
            "<dt>HTTP</dt>\n",
            "<dd>Hypertext <strong>Transfer</strong> Protocol</dd>\n",
            "<dt>TCP</dt>\n",
            "<dd>\n<p>Transmission</p>\n<ul>\n<li>reliable</li>\n</ul>\n</dd>\n",
            "</dl>\n",
        )
    );
}
