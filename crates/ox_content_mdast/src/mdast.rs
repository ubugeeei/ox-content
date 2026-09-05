use ox_content_ast::{
    BlockQuote, CodeBlock, Definition, DefinitionList, DefinitionListDefinition,
    DefinitionListTerm, Delete, Document, Emphasis, FootnoteDefinition, FootnoteReference, Heading,
    Html, Image, InlineCode, InlineMath, Link, List, ListItem, MathBlock, Node, Paragraph, Strong,
    Subscript, Superscript, Table, TableCell, TableRow, Text, ThematicBreak,
};

mod collections;
mod escape;
mod mdx;

pub(crate) use mdx::mdx_attributes_to_json;

pub fn to_mdast_json(document: &Document<'_>) -> String {
    // mdast JSON expands well past the source: every text run carries
    // `{"type":"text","value":...}` framing and structural nodes carry
    // their own objects. Real corpora land between 3× and 4.5× of the
    // source span; 5× keeps the buffer single-allocation (the old 2×
    // guaranteed two growth copies on markup-dense documents).
    let estimated_len = (document.span.len() as usize).saturating_mul(5).max(128);
    let mut serializer = MdastJsonSerializer { output: String::with_capacity(estimated_len) };
    serializer.write_document(document);
    serializer.output
}

struct MdastJsonSerializer {
    output: String,
}

impl MdastJsonSerializer {
    fn write_document(&mut self, document: &Document<'_>) {
        self.output.push_str("{\"type\":\"root\",\"children\":");
        self.write_nodes(&document.children);
        self.output.push('}');
    }

    fn write_node(&mut self, node: &Node<'_>) {
        match node {
            Node::Paragraph(node) => self.write_paragraph(node),
            Node::Heading(node) => self.write_heading(node),
            Node::ThematicBreak(node) => self.write_thematic_break(node),
            Node::BlockQuote(node) => self.write_block_quote(node),
            Node::List(node) => self.write_list(node),
            Node::ListItem(node) => self.write_list_item(node),
            Node::CodeBlock(node) => self.write_code_block(node),
            Node::MathBlock(node) => self.write_math_block(node),
            Node::Html(node) => self.write_html(node),
            Node::Table(node) => self.write_table(node),
            Node::DefinitionList(node) => self.write_definition_list(node),
            Node::DefinitionListTerm(node) => self.write_definition_list_term(node),
            Node::DefinitionListDefinition(node) => self.write_definition_list_definition(node),
            Node::Text(node) => self.write_text(node),
            Node::Emphasis(node) => self.write_emphasis(node),
            Node::Strong(node) => self.write_strong(node),
            Node::InlineCode(node) => self.write_inline_code(node),
            Node::InlineMath(node) => self.write_inline_math(node),
            Node::Break(_) => self.output.push_str("{\"type\":\"break\"}"),
            Node::Link(node) => self.write_link(node),
            Node::Image(node) => self.write_image(node),
            Node::Delete(node) => self.write_delete(node),
            Node::Superscript(node) => self.write_superscript(node),
            Node::Subscript(node) => self.write_subscript(node),
            Node::FootnoteReference(node) => self.write_footnote_reference(node),
            Node::Definition(node) => self.write_definition(node),
            Node::FootnoteDefinition(node) => self.write_footnote_definition(node),
            Node::MdxJsxFlowElement(node) => self.write_mdx_jsx_flow_element(node),
            Node::MdxJsxTextElement(node) => self.write_mdx_jsx_text_element(node),
            Node::MdxjsEsm(node) => self.write_mdxjs_esm(node),
            Node::MdxFlowExpression(node) => self.write_mdx_flow_expression(node),
            Node::MdxTextExpression(node) => self.write_mdx_text_expression(node),
        }
    }

    fn write_paragraph(&mut self, paragraph: &Paragraph<'_>) {
        self.output.push_str("{\"type\":\"paragraph\",\"children\":");
        self.write_nodes(&paragraph.children);
        self.output.push('}');
    }

    fn write_heading(&mut self, heading: &Heading<'_>) {
        self.output.push_str("{\"type\":\"heading\",\"depth\":");
        self.write_u32(u32::from(heading.depth));
        self.output.push_str(",\"children\":");
        self.write_nodes(&heading.children);
        self.output.push('}');
    }

    fn write_thematic_break(&mut self, _thematic_break: &ThematicBreak) {
        self.output.push_str("{\"type\":\"thematicBreak\"}");
    }

    fn write_block_quote(&mut self, block_quote: &BlockQuote<'_>) {
        self.output.push_str("{\"type\":\"blockquote\",\"children\":");
        self.write_nodes(&block_quote.children);
        self.output.push('}');
    }

    fn write_list(&mut self, list: &List<'_>) {
        self.output.push_str("{\"type\":\"list\",\"ordered\":");
        self.output.push_str(if list.ordered { "true" } else { "false" });
        self.output.push_str(",\"spread\":");
        self.output.push_str(if list.spread { "true" } else { "false" });
        if let Some(start) = list.start {
            self.output.push_str(",\"start\":");
            self.write_u32(start);
        }
        self.output.push_str(",\"children\":");
        self.write_list_items(&list.children);
        self.output.push('}');
    }

    fn write_list_item(&mut self, list_item: &ListItem<'_>) {
        self.output.push_str("{\"type\":\"listItem\",\"spread\":");
        self.output.push_str(if list_item.spread { "true" } else { "false" });
        if let Some(checked) = list_item.checked {
            self.output.push_str(",\"checked\":");
            self.output.push_str(if checked { "true" } else { "false" });
        }
        self.output.push_str(",\"children\":");
        self.write_nodes(&list_item.children);
        self.output.push('}');
    }

    fn write_code_block(&mut self, code_block: &CodeBlock<'_>) {
        self.output.push_str("{\"type\":\"code\"");
        if let Some(lang) = code_block.lang {
            self.output.push_str(",\"lang\":");
            self.write_string(lang);
        }
        if let Some(meta) = code_block.meta {
            self.output.push_str(",\"meta\":");
            self.write_string(meta);
        }
        self.output.push_str(",\"value\":");
        self.write_string(code_block.value);
        self.output.push('}');
    }

    fn write_math_block(&mut self, math: &MathBlock<'_>) {
        self.output.push_str("{\"type\":\"math\",\"value\":");
        self.write_string(math.value);
        self.output.push('}');
    }

    fn write_html(&mut self, html: &Html<'_>) {
        self.output.push_str("{\"type\":\"html\",\"value\":");
        self.write_string(html.value);
        self.output.push('}');
    }

    fn write_table(&mut self, table: &Table<'_>) {
        self.output.push_str("{\"type\":\"table\",\"align\":");
        self.write_align(&table.align);
        self.output.push_str(",\"children\":");
        self.write_table_rows(&table.children);
        self.output.push('}');
    }

    fn write_table_row(&mut self, row: &TableRow<'_>) {
        self.output.push_str("{\"type\":\"tableRow\",\"children\":");
        self.write_table_cells(&row.children);
        self.output.push('}');
    }

    fn write_table_cell(&mut self, cell: &TableCell<'_>) {
        self.output.push_str("{\"type\":\"tableCell\",\"children\":");
        self.write_nodes(&cell.children);
        self.output.push('}');
    }

    fn write_definition_list(&mut self, list: &DefinitionList<'_>) {
        self.output.push_str("{\"type\":\"definitionList\",\"children\":");
        self.write_nodes(&list.children);
        self.output.push('}');
    }

    fn write_definition_list_term(&mut self, term: &DefinitionListTerm<'_>) {
        self.output.push_str("{\"type\":\"definitionTerm\",\"children\":");
        self.write_nodes(&term.children);
        self.output.push('}');
    }

    fn write_definition_list_definition(&mut self, definition: &DefinitionListDefinition<'_>) {
        self.output.push_str("{\"type\":\"definitionDescription\",\"children\":");
        self.write_nodes(&definition.children);
        self.output.push('}');
    }

    fn write_text(&mut self, text: &Text<'_>) {
        self.output.push_str("{\"type\":\"text\",\"value\":");
        self.write_string(text.value);
        self.output.push('}');
    }

    fn write_emphasis(&mut self, emphasis: &Emphasis<'_>) {
        self.output.push_str("{\"type\":\"emphasis\",\"children\":");
        self.write_nodes(&emphasis.children);
        self.output.push('}');
    }

    fn write_strong(&mut self, strong: &Strong<'_>) {
        self.output.push_str("{\"type\":\"strong\",\"children\":");
        self.write_nodes(&strong.children);
        self.output.push('}');
    }

    fn write_inline_code(&mut self, inline_code: &InlineCode<'_>) {
        self.output.push_str("{\"type\":\"inlineCode\",\"value\":");
        self.write_string(inline_code.value);
        self.output.push('}');
    }

    fn write_inline_math(&mut self, inline_math: &InlineMath<'_>) {
        self.output.push_str("{\"type\":\"inlineMath\",\"value\":");
        self.write_string(inline_math.value);
        self.output.push('}');
    }

    fn write_link(&mut self, link: &Link<'_>) {
        self.output.push_str("{\"type\":\"link\",\"url\":");
        self.write_string(link.url);
        if let Some(title) = link.title {
            self.output.push_str(",\"title\":");
            self.write_string(title);
        }
        self.output.push_str(",\"children\":");
        self.write_nodes(&link.children);
        self.output.push('}');
    }

    fn write_image(&mut self, image: &Image<'_>) {
        self.output.push_str("{\"type\":\"image\",\"url\":");
        self.write_string(image.url);
        self.output.push_str(",\"alt\":");
        self.write_string(image.alt);
        if let Some(title) = image.title {
            self.output.push_str(",\"title\":");
            self.write_string(title);
        }
        self.output.push('}');
    }

    fn write_delete(&mut self, delete: &Delete<'_>) {
        self.output.push_str("{\"type\":\"delete\",\"children\":");
        self.write_nodes(&delete.children);
        self.output.push('}');
    }

    fn write_superscript(&mut self, superscript: &Superscript<'_>) {
        self.output.push_str("{\"type\":\"superscript\",\"children\":");
        self.write_nodes(&superscript.children);
        self.output.push('}');
    }

    fn write_subscript(&mut self, subscript: &Subscript<'_>) {
        self.output.push_str("{\"type\":\"subscript\",\"children\":");
        self.write_nodes(&subscript.children);
        self.output.push('}');
    }

    fn write_footnote_reference(&mut self, footnote_ref: &FootnoteReference<'_>) {
        self.output.push_str("{\"type\":\"footnoteReference\",\"identifier\":");
        self.write_string(footnote_ref.identifier);
        if let Some(label) = footnote_ref.label {
            self.output.push_str(",\"label\":");
            self.write_string(label);
        }
        self.output.push('}');
    }

    fn write_definition(&mut self, definition: &Definition<'_>) {
        self.output.push_str("{\"type\":\"definition\",\"identifier\":");
        self.write_string(definition.identifier);
        if let Some(label) = definition.label {
            self.output.push_str(",\"label\":");
            self.write_string(label);
        }
        self.output.push_str(",\"url\":");
        self.write_string(definition.url);
        if let Some(title) = definition.title {
            self.output.push_str(",\"title\":");
            self.write_string(title);
        }
        self.output.push('}');
    }

    fn write_footnote_definition(&mut self, footnote_definition: &FootnoteDefinition<'_>) {
        self.output.push_str("{\"type\":\"footnoteDefinition\",\"identifier\":");
        self.write_string(footnote_definition.identifier);
        if let Some(label) = footnote_definition.label {
            self.output.push_str(",\"label\":");
            self.write_string(label);
        }
        self.output.push_str(",\"children\":");
        self.write_nodes(&footnote_definition.children);
        self.output.push('}');
    }
}

#[cfg(test)]
mod tests;
