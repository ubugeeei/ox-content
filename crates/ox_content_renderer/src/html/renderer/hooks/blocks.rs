use ox_content_ast::{BlockQuote, Heading, List, ListItem, Node, Paragraph};

use super::{HtmlRenderContext, HtmlRenderControl, HtmlRenderHooks};
use crate::html::renderer::HtmlRenderer;
use crate::html::toc::is_toc_marker_paragraph;

impl HtmlRenderer {
    pub(in crate::html::renderer) fn render_paragraph_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        paragraph: &Paragraph<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span!("renderer::visit_paragraph");
        if self.document_has_toc_marker && is_toc_marker_paragraph(paragraph) {
            self.render_inline_toc();
            return;
        }

        self.write("<p");
        self.write_source_span_attr(paragraph.span);
        self.write(">");
        for child in &paragraph.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write("</p>\n");
    }

    pub(in crate::html::renderer) fn render_heading_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        heading: &Heading<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span!("renderer::visit_heading");
        let depth = heading.depth.clamp(1, 6);
        self.write("<h");
        self.output.push((b'0' + depth) as char);
        self.write(" id=\"");
        self.write_heading_id(heading);
        self.output.push('"');
        self.write_source_span_attr(heading.span);
        self.write(">");
        for child in &heading.children {
            self.render_inline_node_with_hooks(child, hooks);
        }
        self.write_heading_permalink_if_needed(heading);
        self.write("</h");
        self.output.push((b'0' + depth) as char);
        self.write(">\n");
    }

    pub(in crate::html::renderer) fn render_block_quote_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        block_quote: &BlockQuote<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span!("renderer::visit_block_quote");
        if self.render_callout_block_quote_with_hooks(block_quote, hooks) {
            return;
        }

        self.write("<blockquote");
        self.write_source_span_attr(block_quote.span);
        self.write(">\n");
        for child in &block_quote.children {
            self.render_node_with_hooks(child, hooks);
        }
        self.write("</blockquote>\n");
    }

    pub(in crate::html::renderer) fn render_list_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        list: &List<'_>,
        hooks: &mut H,
    ) {
        crate::profile_span!("renderer::visit_list");
        if list.ordered {
            if let Some(start) = list.start {
                if start != 1 {
                    self.write("<ol start=\"");
                    self.write_display(start);
                    self.write("\"");
                } else {
                    self.write("<ol");
                }
            } else {
                self.write("<ol");
            }
        } else {
            self.write("<ul");
        }
        self.write_source_span_attr(list.span);
        self.write(">\n");

        let tight = !list.spread;
        for child in &list.children {
            self.render_list_item_with_tightness_and_hooks(child, tight, hooks);
        }

        if list.ordered {
            self.write("</ol>\n");
        } else {
            self.write("</ul>\n");
        }
    }

    pub(in crate::html::renderer) fn render_list_item_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        list_item: &ListItem<'_>,
        hooks: &mut H,
    ) {
        self.render_list_item_with_tightness_and_hooks(list_item, false, hooks);
    }

    fn render_callout_block_quote_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        block_quote: &BlockQuote<'_>,
        hooks: &mut H,
    ) -> bool {
        let Some(Node::Paragraph(first_paragraph)) = block_quote.children.first() else {
            return false;
        };
        let Some((kind, consumed_chars)) = Self::detect_callout(first_paragraph) else {
            return false;
        };

        self.write("<blockquote class=\"ox-callout ox-callout--");
        self.write(kind.class_name());
        self.write("\"");
        self.write_source_span_attr(block_quote.span);
        self.write(">\n");
        self.write("<p class=\"ox-callout-title\">");
        self.write(kind.label());
        self.write("</p>\n");

        self.render_callout_paragraph_with_hooks(first_paragraph, consumed_chars, hooks);
        for child in block_quote.children.iter().skip(1) {
            self.render_node_with_hooks(child, hooks);
        }
        self.write("</blockquote>\n");
        true
    }

    fn render_callout_paragraph_with_hooks<H: HtmlRenderHooks>(
        &mut self,
        paragraph: &Paragraph<'_>,
        mut skip_chars: usize,
        hooks: &mut H,
    ) {
        let paragraph_start = self.output.len();
        self.write("<p");
        self.write_source_span_attr(paragraph.span);
        self.write(">");
        let body_start = self.output.len();
        let autolink_index = self.autolink_index.take();
        let mut before_body = true;

        for child in &paragraph.children {
            match child {
                Node::Text(text) if skip_chars > 0 || before_body => {
                    let mut value = text.value;
                    if skip_chars > 0 {
                        if skip_chars >= value.len() {
                            skip_chars -= value.len();
                            continue;
                        }
                        value = &value[skip_chars..];
                        skip_chars = 0;
                    }
                    value = value.trim_start();
                    if value.is_empty() {
                        continue;
                    }
                    before_body = false;
                    self.write_escaped(value);
                }
                _ => {
                    before_body = false;
                    self.render_inline_node_with_hooks(child, hooks);
                }
            }
        }
        self.autolink_index = autolink_index;

        if self.output[body_start..].trim().is_empty() {
            self.output.truncate(paragraph_start);
        } else {
            self.write("</p>\n");
        }
    }

    fn render_list_item_with_tightness_and_hooks<H: HtmlRenderHooks>(
        &mut self,
        list_item: &ListItem<'_>,
        tight: bool,
        hooks: &mut H,
    ) {
        crate::profile_span_detail!("renderer::visit_list_item");
        self.write("<li");
        self.write_source_span_attr(list_item.span);
        self.write(">");

        if let Some(checked) = list_item.checked {
            if checked {
                self.write("<input type=\"checkbox\" checked disabled> ");
            } else {
                self.write("<input type=\"checkbox\" disabled> ");
            }
        }

        for child in &list_item.children {
            if tight {
                if let Node::Paragraph(paragraph) = child {
                    let control = {
                        let mut cx = HtmlRenderContext { renderer: self, children_inline: true };
                        hooks.render_node(child, &mut cx)
                    };
                    if control == HtmlRenderControl::Default {
                        for inline in &paragraph.children {
                            self.render_inline_node_with_hooks(inline, hooks);
                        }
                    }
                    continue;
                }
                if !self.output.is_empty() && !self.output.ends_with('\n') {
                    self.write("\n");
                }
            }
            self.render_node_with_hooks(child, hooks);
        }

        self.write("</li>\n");
    }
}
