//! Opt-in per-node hooks for Rust HTML renderer consumers.
//!
//! The default [`HtmlRenderer::render`](super::HtmlRenderer::render) path does
//! not consult hooks. Hook dispatch lives behind explicit `render_with_hooks`
//! entry points so the common renderer path keeps its existing per-node cost.

use std::fmt::Display;

use ox_content_allocator::Vec as ArenaVec;
use ox_content_ast::{Document, Node};

use super::HtmlRenderer;

mod blocks;
mod inlines;
mod mdx;
mod tables;

/// How a render hook handles the node currently being rendered.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum HtmlRenderControl {
    /// Render the node with the built-in HTML renderer.
    Default,
    /// The hook wrote everything this node needs.
    Handled,
}

/// Per-node hooks for opt-in Rust consumers of the HTML renderer.
///
/// Implementors can match on [`Node`] variants to skip, replace, or wrap block
/// and inline node output. Hooks are invoked only by
/// [`HtmlRenderer::render_with_hooks`] and
/// [`HtmlRenderer::render_borrowed_with_hooks`].
pub trait HtmlRenderHooks {
    /// Writes custom output for `node`, or returns [`HtmlRenderControl::Default`]
    /// to let the built-in renderer handle it.
    fn render_node(
        &mut self,
        node: &Node<'_>,
        cx: &mut HtmlRenderContext<'_>,
    ) -> HtmlRenderControl {
        let _ = node;
        let _ = cx;
        HtmlRenderControl::Default
    }
}

/// Empty hook implementation for callers that want the hook entry point shape
/// without changing output.
#[derive(Default)]
pub struct NoHtmlRenderHooks;

impl HtmlRenderHooks for NoHtmlRenderHooks {}

/// Output context passed to [`HtmlRenderHooks`].
///
/// The methods intentionally mirror the renderer's escaping helpers so hook
/// implementors can emit safe HTML without depending on private internals.
pub struct HtmlRenderContext<'r> {
    renderer: &'r mut HtmlRenderer,
    children_inline: bool,
}

impl HtmlRenderContext<'_> {
    /// Writes raw HTML to the output buffer.
    pub fn write(&mut self, s: &str) {
        self.renderer.write(s);
    }

    /// Writes any displayable value without escaping.
    pub fn write_display(&mut self, value: impl Display) {
        self.renderer.write_display(value);
    }

    /// Writes text escaped for HTML text content.
    pub fn write_escaped(&mut self, s: &str) {
        self.renderer.write_escaped(s);
    }

    /// Writes text escaped for an HTML attribute value.
    pub fn write_attribute_escaped(&mut self, s: &str) {
        self.renderer.write_attribute_escaped(s);
    }

    /// Writes text escaped for a URL attribute.
    pub fn write_url_escaped(&mut self, s: &str) {
        self.renderer.write_url_escaped(s);
    }

    /// Renders child nodes through the same hook set.
    pub fn render_nodes<'a, H: HtmlRenderHooks>(
        &mut self,
        nodes: &ArenaVec<'a, Node<'a>>,
        hooks: &mut H,
    ) {
        for node in nodes {
            if self.children_inline {
                self.renderer.render_inline_node_with_hooks(node, hooks);
            } else {
                self.renderer.render_node_with_hooks(node, hooks);
            }
        }
    }
}

fn node_children_are_inline(node: &Node<'_>) -> bool {
    matches!(
        node,
        Node::Paragraph(_)
            | Node::Heading(_)
            | Node::DefinitionListTerm(_)
            | Node::Emphasis(_)
            | Node::Strong(_)
            | Node::Link(_)
            | Node::Delete(_)
            | Node::Superscript(_)
            | Node::Subscript(_)
            | Node::MdxJsxTextElement(_)
    )
}

impl HtmlRenderer {
    /// Renders a document with opt-in per-node hooks.
    ///
    /// Use [`Self::render`] for the default no-hook path.
    #[must_use]
    pub fn render_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        document: &Document<'_>,
        hooks: &mut H,
    ) -> String {
        crate::profile_span!("renderer::render_with_hooks");
        self.prepare_render(document);
        self.render_document_with_hooks(document, hooks);
        self.finish_render();
        std::mem::take(&mut self.output)
    }

    /// Renders a document with hooks and returns the renderer-owned buffer.
    ///
    /// The returned borrow lasts until the next render call.
    #[must_use]
    pub fn render_borrowed_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        document: &Document<'_>,
        hooks: &mut H,
    ) -> &str {
        crate::profile_span!("renderer::render_with_hooks");
        self.prepare_render(document);
        self.render_document_with_hooks(document, hooks);
        self.finish_render();
        &self.output
    }

    pub(in crate::html::renderer) fn render_document_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        document: &Document<'_>,
        hooks: &mut H,
    ) {
        for child in &document.children {
            self.render_node_with_hooks(child, hooks);
        }
    }

    pub(in crate::html::renderer) fn render_node_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        node: &Node<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::render_node_with_hooks");
        let control = {
            let mut cx = HtmlRenderContext {
                renderer: self,
                children_inline: node_children_are_inline(node),
            };
            hooks.render_node(node, &mut cx)
        };
        if control == HtmlRenderControl::Default {
            self.render_node_default_with_hooks(node, hooks);
        }
    }

    pub(in crate::html::renderer) fn render_inline_node_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        node: &Node<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_inline_with_hooks");
        let control = {
            let mut cx = HtmlRenderContext { renderer: self, children_inline: true };
            hooks.render_node(node, &mut cx)
        };
        if control == HtmlRenderControl::Default {
            self.render_inline_node_default_with_hooks(node, hooks);
        }
    }

    fn render_node_default_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        node: &Node<'_>,
        hooks: &mut H,
    ) {
        match node {
            Node::Paragraph(node) => self.render_paragraph_with_hooks(node, hooks),
            Node::Heading(node) => self.render_heading_with_hooks(node, hooks),
            Node::ThematicBreak(node) => self.render_thematic_break(node),
            Node::BlockQuote(node) => self.render_block_quote_with_hooks(node, hooks),
            Node::List(node) => self.render_list_with_hooks(node, hooks),
            Node::ListItem(node) => self.render_list_item_with_hooks(node, hooks),
            Node::CodeBlock(node) => self.render_code_block(node),
            Node::MathBlock(node) => self.render_math_block(node),
            Node::Html(node) => self.render_html(node),
            Node::Table(node) => self.render_table_with_hooks(node, hooks),
            Node::DefinitionList(node) => self.render_definition_list_with_hooks(node, hooks),
            Node::DefinitionListTerm(node) => {
                self.render_definition_list_term_with_hooks(node, hooks);
            }
            Node::DefinitionListDefinition(node) => {
                self.render_definition_list_definition_with_hooks(node, hooks);
            }
            Node::Text(node) => self.render_text(node),
            Node::Emphasis(node) => self.render_emphasis_with_hooks(node, hooks),
            Node::Strong(node) => self.render_strong_with_hooks(node, hooks),
            Node::InlineCode(node) => self.render_inline_code(node),
            Node::InlineMath(node) => self.render_inline_math(node),
            Node::Break(node) => self.render_break(node),
            Node::Link(node) => self.render_link_with_hooks(node, hooks),
            Node::Image(node) => self.render_image(node),
            Node::Delete(node) => self.render_delete_with_hooks(node, hooks),
            Node::Superscript(node) => self.render_superscript_with_hooks(node, hooks),
            Node::Subscript(node) => self.render_subscript_with_hooks(node, hooks),
            Node::FootnoteReference(node) => self.render_footnote_reference(node),
            Node::Definition(_) => {}
            Node::FootnoteDefinition(node) => self.render_footnote_definition(node),
            Node::MdxJsxFlowElement(node) => {
                self.render_mdx_jsx_flow_element_with_hooks(node, hooks);
            }
            Node::MdxJsxTextElement(node) => {
                self.render_mdx_jsx_text_element_with_hooks(node, hooks);
            }
            Node::MdxjsEsm(_) | Node::MdxFlowExpression(_) | Node::MdxTextExpression(_) => {}
        }
    }

    fn render_inline_node_default_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        node: &Node<'_>,
        hooks: &mut H,
    ) {
        match node {
            Node::Text(node) => self.render_text(node),
            Node::Html(node) => self.write_html_value(node.value),
            Node::Emphasis(node) => self.render_emphasis_with_hooks(node, hooks),
            Node::Strong(node) => self.render_strong_with_hooks(node, hooks),
            Node::InlineCode(node) => self.render_inline_code(node),
            Node::InlineMath(node) => self.render_inline_math(node),
            Node::Break(node) => self.render_break(node),
            Node::Link(node) => self.render_link_with_hooks(node, hooks),
            Node::Image(node) => self.render_image(node),
            Node::Delete(node) => self.render_delete_with_hooks(node, hooks),
            Node::Superscript(node) => self.render_superscript_with_hooks(node, hooks),
            Node::Subscript(node) => self.render_subscript_with_hooks(node, hooks),
            Node::FootnoteReference(node) => self.render_footnote_reference(node),
            Node::MdxJsxTextElement(node) => {
                self.render_mdx_jsx_text_element_with_hooks(node, hooks);
            }
            _ => self.render_node_default_with_hooks(node, hooks),
        }
    }
}
