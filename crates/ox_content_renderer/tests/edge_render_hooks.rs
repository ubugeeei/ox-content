use ox_content_allocator::Allocator;
use ox_content_ast::Node;
use ox_content_parser::{Parser, ParserOptions};
use ox_content_renderer::{
    HtmlRenderContext, HtmlRenderControl, HtmlRenderHooks, HtmlRenderer, HtmlRendererOptions,
    NoHtmlRenderHooks,
};

#[test]
fn render_hooks_can_skip_block_nodes() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            _cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Heading(_) => HtmlRenderControl::Handled,
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::new(&allocator, "# Hidden\n\nVisible").parse().unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert_eq!(html, "<p>Visible</p>\n");
}

#[test]
fn render_hooks_can_wrap_block_nodes() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Paragraph(paragraph) => {
                    cx.write("<section class=\"wrapped\"><p>");
                    cx.render_nodes(&paragraph.children, self);
                    cx.write("</p></section>\n");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::new(&allocator, "Wrapped <em>x</em>").parse().unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert_eq!(html, "<section class=\"wrapped\"><p>Wrapped <em>x</em></p></section>\n");
}

#[test]
fn render_hooks_can_replace_inline_nodes_with_escape_helpers() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Strong(strong) => {
                    cx.write("<mark title=\"");
                    cx.write_attribute_escaped("\"strong\"");
                    cx.write("\">");
                    cx.render_nodes(&strong.children, self);
                    cx.write("</mark>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::new(&allocator, "A **bold** word").parse().unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert_eq!(html, "<p>A <mark title=\"&quot;strong&quot;\">bold</mark> word</p>\n");
}

#[test]
fn render_hooks_preserve_inline_context_for_child_nodes() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Link(link) => {
                    cx.write("<span class=\"linked\">");
                    cx.render_nodes(&link.children, self);
                    cx.write("</span>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::new(&allocator, "Go [<em>x</em>](./x).").parse().unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert_eq!(html, "<p>Go <span class=\"linked\"><em>x</em></span>.</p>\n");
}

#[test]
fn render_hooks_reach_callout_child_nodes() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Strong(strong) => {
                    cx.write("<mark>");
                    cx.render_nodes(&strong.children, self);
                    cx.write("</mark>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::new(&allocator, "> [!NOTE]\n> **watch**").parse().unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert!(html.contains("<p><mark>watch</mark></p>"), "{html}");
    assert!(!html.contains("<strong>"), "{html}");
}

#[test]
fn render_hooks_reach_named_mdx_child_nodes() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Paragraph(paragraph) => {
                    cx.write("<section>");
                    cx.render_nodes(&paragraph.children, self);
                    cx.write("</section>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document =
        Parser::with_options(&allocator, "<Widget>\n\nchild\n\n</Widget>", ParserOptions::mdx())
            .parse()
            .unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert_eq!(
        html,
        "<div class=\"ox-island\" data-ox-island=\"Widget\"><section>child</section></div>\n"
    );
}

#[test]
fn render_hooks_reach_inline_math_inside_footnote_definitions() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::InlineMath(math) => {
                    cx.write("<span class=\"my-math\">");
                    cx.write_escaped(math.value);
                    cx.write("</span>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::with_options(
        &allocator,
        "text[^1]\n\n[^1]: footnote $x^2$ here\n",
        ParserOptions { math: true, ..ParserOptions::gfm() },
    )
    .parse()
    .unwrap();
    let html = HtmlRenderer::new().render_with_hooks(&document, &mut Hooks);

    assert!(html.contains("<p>footnote <span class=\"my-math\">x^2</span> here</p>"), "{html}");
    assert!(!html.contains("ox-math"), "{html}");
}

#[test]
fn render_hooks_reach_nested_blocks_inside_semantic_footnote_definitions() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Strong(strong) => {
                    cx.write("<mark>");
                    cx.render_nodes(&strong.children, self);
                    cx.write("</mark>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::with_options(
        &allocator,
        "note[^n]\n\n[^n]: > nested **value**\n",
        ParserOptions::gfm(),
    )
    .parse()
    .unwrap();
    let html = HtmlRenderer::with_options(HtmlRendererOptions {
        semantic_footnotes: true,
        ..HtmlRendererOptions::default()
    })
    .render_with_hooks(&document, &mut Hooks);

    assert!(
        html.contains("<blockquote>\n<p>nested <mark>value</mark></p>\n</blockquote>"),
        "{html}"
    );
    assert!(!html.contains("<strong>value</strong>"), "{html}");
}

#[test]
fn render_hooks_work_for_incremental_fragments() {
    struct Hooks;

    impl HtmlRenderHooks for Hooks {
        fn render_node(
            &mut self,
            node: &Node<'_>,
            cx: &mut HtmlRenderContext<'_>,
        ) -> HtmlRenderControl {
            match node {
                Node::Strong(strong) => {
                    cx.write("<mark>");
                    cx.render_nodes(&strong.children, self);
                    cx.write("</mark>");
                    HtmlRenderControl::Handled
                }
                _ => HtmlRenderControl::Default,
            }
        }
    }

    let allocator = Allocator::new();
    let document = Parser::new(&allocator, "**stream**").parse().unwrap();
    let mut renderer = HtmlRenderer::new();
    let html = renderer.render_incremental_fragment_with_hooks(&document, &mut Hooks);

    assert_eq!(html, "<p><mark>stream</mark></p>\n");
}

#[test]
fn empty_hooks_are_byte_identical_to_default_render() {
    let allocator = Allocator::new();
    let document =
        Parser::new(&allocator, "# Title\n\nA [link](https://example.com).").parse().unwrap();
    let mut default_renderer = HtmlRenderer::new();
    let expected = default_renderer.render(&document);

    let mut hooked_renderer = HtmlRenderer::new();
    let actual = hooked_renderer.render_with_hooks(&document, &mut NoHtmlRenderHooks);

    assert_eq!(actual, expected);
}
