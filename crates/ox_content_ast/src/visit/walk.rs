use crate::ast::*;
use crate::mdx::*;

use super::Visit;

/// Walks through a document's children.
pub fn walk_document<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, document: &Document<'a>) {
    for child in &document.children {
        visitor.visit_node(child);
    }
}

/// Walks through a node, dispatching to the appropriate visit method.
pub fn walk_node<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, node: &Node<'a>) {
    match node {
        Node::Paragraph(n) => visitor.visit_paragraph(n),
        Node::Heading(n) => visitor.visit_heading(n),
        Node::ThematicBreak(n) => visitor.visit_thematic_break(n),
        Node::BlockQuote(n) => visitor.visit_block_quote(n),
        Node::List(n) => visitor.visit_list(n),
        Node::ListItem(n) => visitor.visit_list_item(n),
        Node::CodeBlock(n) => visitor.visit_code_block(n),
        Node::MathBlock(n) => visitor.visit_math_block(n),
        Node::Html(n) => visitor.visit_html(n),
        Node::Table(n) => visitor.visit_table(n),
        Node::DefinitionList(n) => visitor.visit_definition_list(n),
        Node::DefinitionListTerm(n) => visitor.visit_definition_list_term(n),
        Node::DefinitionListDefinition(n) => visitor.visit_definition_list_definition(n),
        Node::Text(n) => visitor.visit_text(n),
        Node::Emphasis(n) => visitor.visit_emphasis(n),
        Node::Strong(n) => visitor.visit_strong(n),
        Node::InlineCode(n) => visitor.visit_inline_code(n),
        Node::InlineMath(n) => visitor.visit_inline_math(n),
        Node::Break(n) => visitor.visit_break(n),
        Node::Link(n) => visitor.visit_link(n),
        Node::Image(n) => visitor.visit_image(n),
        Node::Delete(n) => visitor.visit_delete(n),
        Node::Superscript(n) => visitor.visit_superscript(n),
        Node::Subscript(n) => visitor.visit_subscript(n),
        Node::FootnoteReference(n) => visitor.visit_footnote_reference(n),
        Node::Definition(n) => visitor.visit_definition(n),
        Node::FootnoteDefinition(n) => visitor.visit_footnote_definition(n),
        Node::MdxJsxFlowElement(n) => visitor.visit_mdx_jsx_flow_element(n),
        Node::MdxJsxTextElement(n) => visitor.visit_mdx_jsx_text_element(n),
        Node::MdxjsEsm(n) => visitor.visit_mdxjs_esm(n),
        Node::MdxFlowExpression(n) => visitor.visit_mdx_flow_expression(n),
        Node::MdxTextExpression(n) => visitor.visit_mdx_text_expression(n),
    }
}

/// Walks through a paragraph's children.
pub fn walk_paragraph<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, paragraph: &Paragraph<'a>) {
    for child in &paragraph.children {
        visitor.visit_node(child);
    }
}

/// Walks through a heading's children.
pub fn walk_heading<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, heading: &Heading<'a>) {
    for child in &heading.children {
        visitor.visit_node(child);
    }
}

/// Walks through a block quote's children.
pub fn walk_block_quote<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, block_quote: &BlockQuote<'a>) {
    for child in &block_quote.children {
        visitor.visit_node(child);
    }
}

/// Walks through a list's children.
pub fn walk_list<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, list: &List<'a>) {
    for child in &list.children {
        visitor.visit_list_item(child);
    }
}

/// Walks through a list item's children.
pub fn walk_list_item<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, list_item: &ListItem<'a>) {
    for child in &list_item.children {
        visitor.visit_node(child);
    }
}

/// Walks through a table's children.
pub fn walk_table<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, table: &Table<'a>) {
    for row in &table.children {
        visitor.visit_table_row(row);
    }
}

/// Walks through a table row's children.
pub fn walk_table_row<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, table_row: &TableRow<'a>) {
    for cell in &table_row.children {
        visitor.visit_table_cell(cell);
    }
}

/// Walks through a table cell's children.
pub fn walk_table_cell<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, table_cell: &TableCell<'a>) {
    for child in &table_cell.children {
        visitor.visit_node(child);
    }
}

/// Walks through a definition list's children.
pub fn walk_definition_list<'a, V: Visit<'a> + ?Sized>(
    visitor: &mut V,
    definition_list: &DefinitionList<'a>,
) {
    for child in &definition_list.children {
        visitor.visit_node(child);
    }
}

/// Walks through a definition list term's children.
pub fn walk_definition_list_term<'a, V: Visit<'a> + ?Sized>(
    visitor: &mut V,
    definition_list_term: &DefinitionListTerm<'a>,
) {
    for child in &definition_list_term.children {
        visitor.visit_node(child);
    }
}

/// Walks through a definition list definition's children.
pub fn walk_definition_list_definition<'a, V: Visit<'a> + ?Sized>(
    visitor: &mut V,
    definition_list_definition: &DefinitionListDefinition<'a>,
) {
    for child in &definition_list_definition.children {
        visitor.visit_node(child);
    }
}

/// Walks through emphasis children.
pub fn walk_emphasis<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, emphasis: &Emphasis<'a>) {
    for child in &emphasis.children {
        visitor.visit_node(child);
    }
}

/// Walks through strong emphasis children.
pub fn walk_strong<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, strong: &Strong<'a>) {
    for child in &strong.children {
        visitor.visit_node(child);
    }
}

/// Walks through a link's children.
pub fn walk_link<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, link: &Link<'a>) {
    for child in &link.children {
        visitor.visit_node(child);
    }
}

/// Walks through strikethrough children.
pub fn walk_delete<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, delete: &Delete<'a>) {
    for child in &delete.children {
        visitor.visit_node(child);
    }
}

/// Walks through superscript children.
pub fn walk_superscript<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, superscript: &Superscript<'a>) {
    for child in &superscript.children {
        visitor.visit_node(child);
    }
}

/// Walks through subscript children.
pub fn walk_subscript<'a, V: Visit<'a> + ?Sized>(visitor: &mut V, subscript: &Subscript<'a>) {
    for child in &subscript.children {
        visitor.visit_node(child);
    }
}

/// Walks through a footnote definition's children.
pub fn walk_footnote_definition<'a, V: Visit<'a> + ?Sized>(
    visitor: &mut V,
    footnote_def: &FootnoteDefinition<'a>,
) {
    for child in &footnote_def.children {
        visitor.visit_node(child);
    }
}

/// Walks a block JSX element's children. Attributes are not nodes.
pub fn walk_mdx_jsx_flow_element<'a, V: Visit<'a> + ?Sized>(
    visitor: &mut V,
    node: &MdxJsxFlowElement<'a>,
) {
    for child in &node.children {
        visitor.visit_node(child);
    }
}

/// Walks an inline JSX element's children. Attributes are not nodes.
pub fn walk_mdx_jsx_text_element<'a, V: Visit<'a> + ?Sized>(
    visitor: &mut V,
    node: &MdxJsxTextElement<'a>,
) {
    for child in &node.children {
        visitor.visit_node(child);
    }
}
