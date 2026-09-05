use ox_content_ast::{Delete, Emphasis, Link, Strong, Subscript, Superscript};

use super::HtmlRenderHooks;
use crate::html::renderer::HtmlRenderer;

impl HtmlRenderer {
    pub(in crate::html::renderer) fn render_emphasis_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        emphasis: &Emphasis<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_emphasis");
        self.write("<em>");
        for child in &emphasis.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write("</em>");
    }

    pub(in crate::html::renderer) fn render_strong_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        strong: &Strong<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_strong");
        self.write("<strong>");
        for child in &strong.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write("</strong>");
    }

    pub(in crate::html::renderer) fn render_link_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        link: &Link<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span!("renderer::visit_link");
        self.write("<a href=\"");
        let converted_url =
            if self.options.convert_md_links { self.convert_markdown_url(link.url) } else { None };
        let href = self.sanitized_url(converted_url.as_deref().unwrap_or(link.url), "#");
        self.write_url_escaped(href);
        self.write("\"");
        if self.options.link_target_blank
            && (href.starts_with("http://") || href.starts_with("https://"))
        {
            self.write(" target=\"_blank\" rel=\"noopener noreferrer\"");
        }
        if let Some(title) = link.title {
            self.write(" title=\"");
            self.write_escaped(title);
            self.write("\"");
        }
        self.write(">");
        let prev_in_link = self.in_link;
        self.in_link = true;
        for child in &link.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.in_link = prev_in_link;
        self.write("</a>");
    }

    pub(in crate::html::renderer) fn render_delete_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        delete: &Delete<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_delete");
        self.write("<del>");
        for child in &delete.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write("</del>");
    }

    pub(in crate::html::renderer) fn render_superscript_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        superscript: &Superscript<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_superscript");
        self.write("<sup>");
        for child in &superscript.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write("</sup>");
    }

    pub(in crate::html::renderer) fn render_subscript_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        subscript: &Subscript<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_subscript");
        self.write("<sub>");
        for child in &subscript.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write("</sub>");
    }
}
