use ox_content_allocator::Vec as ArenaVec;
use ox_content_ast::{AlignKind, ListItem, Node, TableCell, TableRow};

use super::{MdastJsonSerializer, escape};

impl MdastJsonSerializer {
    pub(super) fn write_nodes<'a>(&mut self, nodes: &ArenaVec<'a, Node<'a>>) {
        self.output.push('[');
        for (idx, node) in nodes.iter().enumerate() {
            if idx > 0 {
                self.output.push(',');
            }
            self.write_node(node);
        }
        self.output.push(']');
    }

    pub(super) fn write_list_items<'a>(&mut self, items: &ArenaVec<'a, ListItem<'a>>) {
        self.output.push('[');
        for (idx, item) in items.iter().enumerate() {
            if idx > 0 {
                self.output.push(',');
            }
            self.write_list_item(item);
        }
        self.output.push(']');
    }

    pub(super) fn write_table_rows<'a>(&mut self, rows: &ArenaVec<'a, TableRow<'a>>) {
        self.output.push('[');
        for (idx, row) in rows.iter().enumerate() {
            if idx > 0 {
                self.output.push(',');
            }
            self.write_table_row(row);
        }
        self.output.push(']');
    }

    pub(super) fn write_table_cells<'a>(&mut self, cells: &ArenaVec<'a, TableCell<'a>>) {
        self.output.push('[');
        for (idx, cell) in cells.iter().enumerate() {
            if idx > 0 {
                self.output.push(',');
            }
            self.write_table_cell(cell);
        }
        self.output.push(']');
    }

    pub(super) fn write_align(&mut self, align: &ArenaVec<'_, AlignKind>) {
        self.output.push('[');
        for (idx, item) in align.iter().enumerate() {
            if idx > 0 {
                self.output.push(',');
            }
            match item {
                AlignKind::None => self.output.push_str("null"),
                AlignKind::Left => self.write_string("left"),
                AlignKind::Center => self.write_string("center"),
                AlignKind::Right => self.write_string("right"),
            }
        }
        self.output.push(']');
    }

    pub(super) fn write_string(&mut self, value: &str) {
        escape::write_json_string(&mut self.output, value);
    }

    pub(super) fn write_u32(&mut self, n: u32) {
        escape::write_u32(&mut self.output, n);
    }
}
