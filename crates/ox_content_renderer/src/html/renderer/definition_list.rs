//! Definition-list HTML visitor helpers.

use ox_content_ast::{DefinitionList, DefinitionListDefinition, DefinitionListTerm, Node};

use super::HtmlRenderer;

impl HtmlRenderer {
    pub(in crate::html::renderer) fn render_definition_list(&mut self, list: &DefinitionList<'_>) {
        crate::profile_span!("renderer::visit_definition_list");
        self.write("<dl class=\"ox-definition-list\"");
        self.write_source_span_attr(list.span);
        self.write(">\n");
        for child in &list.children {
            match child {
                Node::DefinitionListTerm(term) => self.render_definition_list_term(term),
                Node::DefinitionListDefinition(definition) => {
                    self.render_definition_list_definition(definition);
                }
                _ => self.render_node(child),
            }
        }
        self.write("</dl>\n");
    }

    pub(in crate::html::renderer) fn render_definition_list_term(
        &mut self,
        term: &DefinitionListTerm<'_>,
    ) {
        crate::profile_span_detail!("renderer::visit_definition_list_term");
        self.write("<dt");
        self.write_source_span_attr(term.span);
        self.write(">");
        for child in &term.children {
            self.visit_inline_node(child);
        }
        self.write("</dt>\n");
    }

    pub(in crate::html::renderer) fn render_definition_list_definition(
        &mut self,
        definition: &DefinitionListDefinition<'_>,
    ) {
        crate::profile_span_detail!("renderer::visit_definition_list_definition");
        self.write("<dd");
        self.write_source_span_attr(definition.span);
        if definition.children.len() == 1
            && let Some(Node::Paragraph(paragraph)) = definition.children.first()
        {
            self.write(">");
            for child in &paragraph.children {
                self.visit_inline_node(child);
            }
            self.write("</dd>\n");
            return;
        }
        self.write(">\n");
        for child in &definition.children {
            self.render_node(child);
        }
        self.write("</dd>\n");
    }
}
