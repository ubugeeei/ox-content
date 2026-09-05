//! AST visitor trait for traversing Markdown AST.

use crate::ast::*;
use crate::mdx::*;

mod walk;

pub use walk::*;

/// Visitor trait for traversing the Markdown AST.
pub trait Visit<'a> {
    /// Visits a document.
    fn visit_document(&mut self, document: &Document<'a>) {
        walk_document(self, document);
    }

    /// Visits a node.
    fn visit_node(&mut self, node: &Node<'a>) {
        walk_node(self, node);
    }

    /// Visits a paragraph.
    fn visit_paragraph(&mut self, paragraph: &Paragraph<'a>) {
        walk_paragraph(self, paragraph);
    }

    /// Visits a heading.
    fn visit_heading(&mut self, heading: &Heading<'a>) {
        walk_heading(self, heading);
    }

    /// Visits a thematic break.
    fn visit_thematic_break(&mut self, _thematic_break: &ThematicBreak) {}

    /// Visits a block quote.
    fn visit_block_quote(&mut self, block_quote: &BlockQuote<'a>) {
        walk_block_quote(self, block_quote);
    }

    /// Visits a list.
    fn visit_list(&mut self, list: &List<'a>) {
        walk_list(self, list);
    }

    /// Visits a list item.
    fn visit_list_item(&mut self, list_item: &ListItem<'a>) {
        walk_list_item(self, list_item);
    }

    /// Visits a code block.
    fn visit_code_block(&mut self, _code_block: &CodeBlock<'a>) {}

    /// Visits a display math block.
    fn visit_math_block(&mut self, _math_block: &MathBlock<'a>) {}

    /// Visits an HTML block.
    fn visit_html(&mut self, _html: &Html<'a>) {}

    /// Visits a table.
    fn visit_table(&mut self, table: &Table<'a>) {
        walk_table(self, table);
    }

    /// Visits a table row.
    fn visit_table_row(&mut self, table_row: &TableRow<'a>) {
        walk_table_row(self, table_row);
    }

    /// Visits a table cell.
    fn visit_table_cell(&mut self, table_cell: &TableCell<'a>) {
        walk_table_cell(self, table_cell);
    }

    /// Visits a definition list.
    fn visit_definition_list(&mut self, definition_list: &DefinitionList<'a>) {
        walk_definition_list(self, definition_list);
    }

    /// Visits a definition list term.
    fn visit_definition_list_term(&mut self, definition_list_term: &DefinitionListTerm<'a>) {
        walk_definition_list_term(self, definition_list_term);
    }

    /// Visits a definition list definition.
    fn visit_definition_list_definition(
        &mut self,
        definition_list_definition: &DefinitionListDefinition<'a>,
    ) {
        walk_definition_list_definition(self, definition_list_definition);
    }

    /// Visits text.
    fn visit_text(&mut self, _text: &Text<'a>) {}

    /// Visits emphasis.
    fn visit_emphasis(&mut self, emphasis: &Emphasis<'a>) {
        walk_emphasis(self, emphasis);
    }

    /// Visits strong emphasis.
    fn visit_strong(&mut self, strong: &Strong<'a>) {
        walk_strong(self, strong);
    }

    /// Visits inline code.
    fn visit_inline_code(&mut self, _inline_code: &InlineCode<'a>) {}

    /// Visits inline math.
    fn visit_inline_math(&mut self, _inline_math: &InlineMath<'a>) {}

    /// Visits a line break.
    fn visit_break(&mut self, _break_node: &Break) {}

    /// Visits a link.
    fn visit_link(&mut self, link: &Link<'a>) {
        walk_link(self, link);
    }

    /// Visits an image.
    fn visit_image(&mut self, _image: &Image<'a>) {}

    /// Visits strikethrough.
    fn visit_delete(&mut self, delete: &Delete<'a>) {
        walk_delete(self, delete);
    }

    /// Visits superscript.
    fn visit_superscript(&mut self, superscript: &Superscript<'a>) {
        walk_superscript(self, superscript);
    }

    /// Visits subscript.
    fn visit_subscript(&mut self, subscript: &Subscript<'a>) {
        walk_subscript(self, subscript);
    }

    /// Visits a footnote reference.
    fn visit_footnote_reference(&mut self, _footnote_ref: &FootnoteReference<'a>) {}

    /// Visits a definition.
    fn visit_definition(&mut self, _definition: &Definition<'a>) {}

    /// Visits a footnote definition.
    fn visit_footnote_definition(&mut self, footnote_def: &FootnoteDefinition<'a>) {
        walk_footnote_definition(self, footnote_def);
    }

    /// Visits a block JSX element.
    fn visit_mdx_jsx_flow_element(&mut self, node: &MdxJsxFlowElement<'a>) {
        walk_mdx_jsx_flow_element(self, node);
    }

    /// Visits an inline JSX element.
    fn visit_mdx_jsx_text_element(&mut self, node: &MdxJsxTextElement<'a>) {
        walk_mdx_jsx_text_element(self, node);
    }

    /// Visits an MDX ESM `import` / `export`.
    fn visit_mdxjs_esm(&mut self, _node: &MdxjsEsm<'a>) {}

    /// Visits a block MDX expression.
    fn visit_mdx_flow_expression(&mut self, _node: &MdxFlowExpression<'a>) {}

    /// Visits an inline MDX expression.
    fn visit_mdx_text_expression(&mut self, _node: &MdxTextExpression<'a>) {}
}
